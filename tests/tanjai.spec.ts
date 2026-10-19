import { test } from '@playwright/test';
import { applicationDetails, getPersonalInfo } from '../utils/loan/testData';
import { applyForStorefrontLoan } from '../utils/loan/storefrontFlow';

test('apply for มือถือทันใจ loan', async ({ page }) => {
  const personalInfo = getPersonalInfo('mobileTanjai');
  test.skip(!personalInfo, 'Set QA-approved personal info in utils/loan/testData.ts first.');

  // The product is fixed for this menu, so there is no product-selection step.
  await applyForStorefrontLoan(page, {
    entry: { menuSlug: 'tgf', bannerAlt: 'tgf' },
    personalInfo: personalInfo!,
    applicationDetails,
  });
});
