import { Page, expect } from "@playwright/test";
import * as path from "path";
import { RegisterPage } from "../../pages/registerPage";
import { LoanMenuPage } from "../../pages/loanMenuPage";
import { MobileLoanCheckPage } from "../../pages/mobileLoanCheckPage";
import { DataConsentPage } from "../../pages/dataConsentPage";
import { ApplicationDetailsPage } from "../../pages/applicationDetailsPage";
import { DocumentUploadPage } from "../../pages/documentUploadPage";
import { OtpPage } from "../../pages/otpPage";
import { ContractPage } from "../../pages/contractPage";
import { ApplicationResultPage } from "../../pages/applicationResultPage";
import { PersonalInfo, ApplicationDetails } from "./types";

const IMAGES_DIR = path.join(__dirname, "..", "images");

export interface StorefrontFlowOptions {
  /** Where the flow starts: a banner on the group landing page, or a product menu page. */
  entry: { landingBannerAlt: string } | { menuSlug: string; bannerAlt: string };
  /** Pick a product on the storefront list; omit when the product is already fixed (tgf). */
  product?: { itemAlt: string; termLabel: RegExp };
  personalInfo: PersonalInfo;
  applicationDetails: ApplicationDetails;
}

/**
 * The "storefront" loan flow (installment purchase of a device): banner → storefront consent →
 * eligibility form → PDPA → [choose product + term] → application details → documents → OTP →
 * contract → result. There is no insurance step.
 */
export async function applyForStorefrontLoan(
  page: Page,
  options: StorefrontFlowOptions,
): Promise<void> {
  await page.context().clearPermissions();

  if ("landingBannerAlt" in options.entry) {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();
    await registerPage.waitForAppLoad();
    await page.getByAltText(options.entry.landingBannerAlt).click();
  } else {
    await new LoanMenuPage(page, options.entry.menuSlug).goto();
    await page.getByAltText(options.entry.bannerAlt).click();
  }
  await page.waitForURL("**/storefront/consent");
  await page.getByRole("button", { name: "ยินยอม", exact: true }).click();
  await page.waitForURL("**/check");

  const checkPage = new MobileLoanCheckPage(page);
  await checkPage.fillMobile({
    ...options.personalInfo,
    monthlyDebt: "0",
    workYearsLabel: "1ปี - 3ปี",
    sideJobLabel: "พนักงานบริษัท",
    provinceLabel: "กรุงเทพมหานคร",
    houseNumber: "99",
  });
  await checkPage.submitForm();
  await expect(page).not.toHaveURL(/\/check$/);
  await new DataConsentPage(page).acceptAllAndContinue();

  if (options.product) {
    await page
      .getByAltText(options.product.itemAlt)
      .waitFor({ timeout: 30000 });
    await page.getByAltText(options.product.itemAlt).click();
    await page.waitForURL("**/product-detail?product=*");
    // Phones have a colour choice; appliances don't.
    const colour = page.locator('input[name="color"]').first();
    if (await colour.count()) {
      await colour.check({ force: true });
    }
    await page.getByRole("button", { name: options.product.termLabel }).click();
    await page.getByRole("button", { name: "ถัดไป", exact: true }).click();
  }

  const group = (process.env.LOAN_GROUP || "moih").toLowerCase();
  await page.waitForURL(`**/register/${group}/form`);
  const detailsPage = new ApplicationDetailsPage(page);
  await detailsPage.fill(options.applicationDetails);
  await detailsPage.submitAndContinue();

  const documentUploadPage = new DocumentUploadPage(page);
  await documentUploadPage.triggerCameraAndExpectDenied();
  const attachedCount =
    await documentUploadPage.attachPhotosUntilQuotaReached(IMAGES_DIR);
  expect(attachedCount).toBeGreaterThan(0);
  await documentUploadPage.submit();

  // Sends a real SMS to personalInfo.primaryPhone. '123456' per QA's SIT-environment guidance.
  await new OtpPage(page).enterCodeAndConfirm("123456");
  await new ContractPage(page).continue();

  expect(await new ApplicationResultPage(page).isSuccess()).toBeTruthy();
}
