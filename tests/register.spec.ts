import { test, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';

test('should open the registration page and load successfully', async ({ page }) => {
  const registerPage = new RegisterPage(page);

  const response = await registerPage.goto();
  expect(response?.ok()).toBeTruthy();

  await registerPage.waitForAppLoad();

  expect(await registerPage.isPageLoaded()).toBeTruthy();
});
