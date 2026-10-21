import { test } from '@playwright/test';
import { applicationDetails, getPersonalInfo } from '../utils/loan/testData';
import { applyForStorefrontLoan } from '../utils/loan/storefrontFlow';

test('apply for สินเชื่อเครื่องใช้ไฟฟ้า loan', async ({ page }) => {
  const personalInfo = getPersonalInfo('applianceLoan');
  test.skip(!personalInfo, 'Set QA-approved personal info in utils/loan/testData.ts first.');

  await applyForStorefrontLoan(page, {
    entry: { landingBannerAlt: 'bnpl' },
    product: { itemAlt: 'LED Smart TV Aconatic 32 นิ้ว', termLabel: /ผ่อนชำระ 24 เดือน/ },
    personalInfo: personalInfo!,
    applicationDetails,
  });
});
