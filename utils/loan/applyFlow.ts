import { Page, expect } from '@playwright/test';
import * as path from 'path';
import { LoanMenuPage } from '../../pages/LoanMenuPage';
import { EligibilityPage } from '../../pages/EligibilityPage';
import { PersonalInfoPage } from '../../pages/PersonalInfoPage';
import { DataConsentPage } from '../../pages/DataConsentPage';
import { ApplicationDetailsPage } from '../../pages/ApplicationDetailsPage';
import { DocumentUploadPage } from '../../pages/DocumentUploadPage';
import { InsurancePage } from '../../pages/InsurancePage';
import { OtpPage } from '../../pages/OtpPage';
import { ContractPage } from '../../pages/ContractPage';
import { ApplicationResultPage } from '../../pages/ApplicationResultPage';
import { LoanApplicationData } from './types';

const IMAGES_DIR = path.join(__dirname, '..', 'images');

export interface ApplyFlowOptions {
  /** Menu page slug: /menu/<slug>, also the alt text of its "สมัครเลย" banner. */
  menuSlug: string;
  /**
   * Products whose menu goes to their own consent page instead of /eligibility
   * (โฉนดแลกเงิน: /<slug>/consent with #condition + #continue).
   */
  ownConsentPage?: boolean;
  /** Products with an extra "ภาระหนี้" payment-table page before the eligibility form. */
  hasDebtBurdenPage?: boolean;
  /** Whether the flow shows the credit-protection insurance step after the documents. */
  hasInsurance: boolean;
  data: LoanApplicationData;
}

/**
 * The shared "ผู้กำนัน" loan application flow (menu → T&C → eligibility form → PDPA →
 * application details → documents → [insurance] → OTP → contract → result). Per-product
 * differences are the options above plus what the page objects detect on their own.
 */
export async function applyForLoan(page: Page, options: ApplyFlowOptions): Promise<void> {
  const { menuSlug, data } = options;

  // Camera permission is intentionally never granted (and prompts are denied by the config),
  // so any getUserMedia() call during document capture is denied.
  await page.context().clearPermissions();

  const menuPage = new LoanMenuPage(page, menuSlug);
  await menuPage.goto();

  if (options.ownConsentPage) {
    await menuPage.clickApply(`**/${menuSlug}/consent`);
    await page.locator('#condition').check({ force: true });
    await page.locator('#continue').click();
  } else {
    await menuPage.clickApply();
    await new EligibilityPage(page).acceptTermsAndContinue(
      options.hasDebtBurdenPage ? `**/${menuSlug}/debt-burden` : '**/check'
    );
  }

  if (options.hasDebtBurdenPage) {
    await page.waitForURL(`**/${menuSlug}/debt-burden`);
    await page.getByRole('button', { name: /ถัดไป/ }).click();
    await page.waitForURL('**/check');
  }

  const personalInfoPage = new PersonalInfoPage(page);
  await personalInfoPage.fill({
    desiredCreditAmount: data.desiredCreditAmount,
    ...data.personalInfo,
  });
  await personalInfoPage.submitAndContinue();

  await new DataConsentPage(page).acceptAllAndContinue();

  await page.waitForURL('**/form');
  const detailsPage = new ApplicationDetailsPage(page);
  await detailsPage.fill(data.applicationDetails);
  await detailsPage.submitAndContinue();

  const documentUploadPage = new DocumentUploadPage(page);
  await documentUploadPage.triggerCameraAndExpectDenied();
  const attachedCount = await documentUploadPage.attachPhotosUntilQuotaReached(IMAGES_DIR);
  expect(attachedCount).toBeGreaterThan(0);
  await documentUploadPage.submit();
  await documentUploadPage.attachAdditionalDocumentsIfAsked(IMAGES_DIR);

  if (options.hasInsurance) {
    await new InsurancePage(page).confirmInsurance();
  }

  // Sends a real SMS to data.personalInfo.primaryPhone — only run this with a phone number you
  // can actually read the OTP from. '123456' per QA's SIT-environment guidance.
  await new OtpPage(page).enterCodeAndConfirm('123456');
  await new ContractPage(page).continue();

  expect(await new ApplicationResultPage(page).isSuccess()).toBeTruthy();
}
