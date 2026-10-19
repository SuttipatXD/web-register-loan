import { test } from '@playwright/test';
import { applicationDetails, getPersonalInfo } from '../utils/loan/testData';
import { applyForStorefrontLoan } from '../utils/loan/storefrontFlow';

test('apply for มือถือผ่อนสินค้า loan', async ({ page }) => {
  const personalInfo = getPersonalInfo('mobileInstallment');
  test.skip(!personalInfo, 'Set QA-approved personal info in utils/loan/testData.ts first.');

  await applyForStorefrontLoan(page, {
    entry: { landingBannerAlt: 'mobile' },
    product: { itemAlt: 'Galaxy A17 8/128', termLabel: /ผ่อนชำระ 24 เดือน/ },
    personalInfo: personalInfo!,
    applicationDetails,
  });
});
