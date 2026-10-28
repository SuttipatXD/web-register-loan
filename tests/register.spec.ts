import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/registerPage';
import { getLoanTestData } from '../utils/loan/testData';
import { applyForLoan } from '../utils/loan/applyFlow';

test('should open the registration page and load successfully', async ({ page }) => {
  const registerPage = new RegisterPage(page);

  const response = await registerPage.goto();
  expect(response?.ok()).toBeTruthy();

  await registerPage.waitForAppLoad();

  expect(await registerPage.isPageLoaded()).toBeTruthy();
});

test('apply for แฮปปี้ทวีคูณ loan: camera denied, gallery upload to quota, through to completed result', async ({
  page,
}) => {
  const data = getLoanTestData('happyTavikoon');
  test.skip(!data, 'Set QA-approved personal info in utils/loan/testData.ts first.');

  await applyForLoan(page, { menuSlug: 'sukjai', hasInsurance: true, data: data! });
});
