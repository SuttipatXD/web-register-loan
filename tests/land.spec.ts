import { test } from '@playwright/test';
import { getLoanTestData } from '../utils/loan/testData';
import { applyForLoan } from '../utils/loan/applyFlow';

test('apply for โฉนดแลกเงิน loan', async ({ page }) => {
  const data = getLoanTestData('landTitleLoan');
  test.skip(!data, 'Set QA-approved personal info in utils/loan/testData.ts first.');

  await applyForLoan(page, {
    menuSlug: 'landforcash',
    ownConsentPage: true,
    hasDebtBurdenPage: true,
    hasInsurance: false,
    data: data!,
  });
});
