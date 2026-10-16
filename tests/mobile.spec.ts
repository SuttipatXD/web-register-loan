import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { MobileLoanCheckPage } from '../pages/MobileLoanCheckPage';
import { DataConsentPage } from '../pages/DataConsentPage';
import { ApplicationDetailsPage } from '../pages/ApplicationDetailsPage';
import { applicationDetails, getPersonalInfo } from '../utils/loan/testData';
import { DocumentUploadPage } from '../pages/DocumentUploadPage';
import { OtpPage } from '../pages/OtpPage';
import { ContractPage } from '../pages/ContractPage';
import { ApplicationResultPage } from '../pages/ApplicationResultPage';
import * as path from 'path';

const IMAGES_DIR = path.join(__dirname, '..', 'utils', 'images');

test('apply for มือถือผ่อนสินค้า loan', async ({ page, context }) => {
  const personalInfo = getPersonalInfo('mobileInstallment');
  test.skip(!personalInfo, 'Set QA-approved personal info in utils/loan/testData.ts first.');

  await context.clearPermissions();

  const registerPage = new RegisterPage(page);
  await registerPage.goto();
  await registerPage.waitForAppLoad();
  await page.getByAltText('mobile').click();
  await page.waitForURL('**/storefront/consent');
  await page.getByRole('button', { name: 'ยินยอม', exact: true }).click();
  await page.waitForURL('**/check');

  const checkPage = new MobileLoanCheckPage(page);
  await checkPage.fillMobile({
    ...personalInfo!,
    monthlyDebt: '0',
    workYearsLabel: '1ปี - 3ปี',
    sideJobLabel: 'พนักงานบริษัท',
    provinceLabel: 'กรุงเทพมหานคร',
    houseNumber: '99',
  });
  await checkPage.submitForm();
  await expect(page).not.toHaveURL(/\/check$/);
  await new DataConsentPage(page).acceptAllAndContinue();
  await page.getByAltText('Galaxy A17 8/128').waitFor({ timeout: 30000 });
  await page.getByAltText('Galaxy A17 8/128').click();
  await page.waitForURL('**/product-detail?product=*');
  await page.locator('input[name="color"]').first().check({ force: true });
  await page.getByRole('button', { name: /ผ่อนชำระ 24 เดือน/ }).click();
  await page.getByRole('button', { name: 'ถัดไป', exact: true }).click();
  await page.waitForURL('**/register/moih/form');
  const detailsPage = new ApplicationDetailsPage(page);
  await detailsPage.fill(applicationDetails);
  await detailsPage.submitAndContinue();

  const documentUploadPage = new DocumentUploadPage(page);
  await documentUploadPage.triggerCameraAndExpectDenied();
  const attachedCount = await documentUploadPage.attachPhotosUntilQuotaReached(IMAGES_DIR);
  expect(attachedCount).toBeGreaterThan(0);
  await documentUploadPage.submit();

  // No insurance step for this product: the documents page goes straight to OTP.
  await new OtpPage(page).enterCodeAndConfirm('123456');
  await new ContractPage(page).continue();

  expect(await new ApplicationResultPage(page).isSuccess()).toBeTruthy();
});
