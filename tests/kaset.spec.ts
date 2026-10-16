import { test } from '@playwright/test';
import { getLoanTestData } from '../utils/loan/testData';
import { applyForLoan } from '../utils/loan/applyFlow';

test('apply for เกษตรสุขใจ loan', async ({ page }) => {
  const data = getLoanTestData('kasetSukjai');
  test.skip(!data, 'Set QA-approved personal info in utils/loan/testData.ts first.');

  await applyForLoan(page, {
    menuSlug: 'kasetsukjai',
    hasInsurance: true,
    data: data!,
  });
});
