import { test, expect } from '@playwright/test';
import * as path from 'path';
import { RegisterPage } from '../pages/RegisterPage';
import { LoanMenuPage } from '../pages/LoanMenuPage';
import { EligibilityPage } from '../pages/EligibilityPage';
import { PersonalInfoPage } from '../pages/PersonalInfoPage';
import { DataConsentPage } from '../pages/DataConsentPage';
import { ApplicationDetailsPage } from '../pages/ApplicationDetailsPage';
import { DocumentUploadPage } from '../pages/DocumentUploadPage';
import { InsurancePage } from '../pages/InsurancePage';
import { OtpPage } from '../pages/OtpPage';
import { ApplicationResultPage } from '../pages/ApplicationResultPage';
import { getHappyTavikoonTestData } from '../utils/loan/happyTavikoon';

const IMAGES_DIR = path.join(__dirname, '..', 'utils', 'images');

test('should open the registration page and load successfully', async ({ page }) => {
  const registerPage = new RegisterPage(page);

  const response = await registerPage.goto();
  expect(response?.ok()).toBeTruthy();

  await registerPage.waitForAppLoad();

  expect(await registerPage.isPageLoaded()).toBeTruthy();
});

test('apply for แฮปปี้ทวีคูณ loan: camera denied, gallery upload to quota, through to completed result', async ({
  page,
  context,
}) => {
  const testData = getHappyTavikoonTestData();
  test.skip(
    !testData,
    'Set TEST_ID_NUMBER / TEST_ID_LASER_CODE / TEST_PHONE (QA-approved test data) before running this ' +
      'against the live identity/credit-check API — see utils/loan/personalInfo.ts.'
  );

  // Camera permission is intentionally never granted, so any getUserMedia() call
  // the app makes during document capture is auto-denied.
  await context.clearPermissions();

  const menuPage = new LoanMenuPage(page);
  await menuPage.goto();
  await menuPage.clickApply();

  const eligibilityPage = new EligibilityPage(page);
  await eligibilityPage.acceptTermsAndContinue();

  const personalInfoPage = new PersonalInfoPage(page);
  await personalInfoPage.fill({
    desiredCreditAmount: testData!.desiredCreditAmount,
    ...testData!.personalInfo,
  });
  await personalInfoPage.submitAndContinue();

  const dataConsentPage = new DataConsentPage(page);
  await dataConsentPage.acceptAllAndContinue();

  const applicationDetailsPage = new ApplicationDetailsPage(page);
  await applicationDetailsPage.fill(testData!.applicationDetails);
  await applicationDetailsPage.submitAndContinue();

  const documentUploadPage = new DocumentUploadPage(page);
  await documentUploadPage.triggerCameraAndExpectDenied();
  const attachedCount = await documentUploadPage.attachPhotosUntilQuotaReached(IMAGES_DIR);
  expect(attachedCount).toBeGreaterThan(0);
  await documentUploadPage.submit();

  const insurancePage = new InsurancePage(page);
  await insurancePage.declineAndContinue();

  // Sends a real SMS to testData.personalInfo.primaryPhone — only run this with a phone
  // number you can actually read the OTP from. '123456' per QA's SIT-environment guidance.
  const otpPage = new OtpPage(page);
  await otpPage.enterCodeAndConfirm('123456');

  const resultPage = new ApplicationResultPage(page);
  expect(await resultPage.isSuccess()).toBeTruthy();
});
