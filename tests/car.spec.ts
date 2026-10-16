import { test } from '@playwright/test';
import { getLoanTestData } from '../utils/loan/testData';
import { applyForLoan } from '../utils/loan/applyFlow';

test('apply for ทะเบียนรถแลกเงิน loan', async ({ page }) => {
  const data = getLoanTestData('carTitleLoan');
  test.skip(!data, 'Set QA-approved personal info in utils/loan/testData.ts first.');

  await applyForLoan(page, {
    menuSlug: 'rotleakngern',
    hasDebtBurdenPage: true,
    hasInsurance: true,
    data: data!,
  });
});
