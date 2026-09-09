import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/** T&C / eligibility criteria screen shown before the application form (/register/moih/eligibility). */
export class EligibilityPage extends BasePage {
  readonly acceptCheckbox: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    super(page);
    this.acceptCheckbox = page.getByText('ยอมรับ');
    this.nextButton = page.getByRole('button', { name: /ถัดไป/ });
  }

  async acceptTermsAndContinue(): Promise<void> {
    await this.acceptCheckbox.scrollIntoViewIfNeeded();
    await this.acceptCheckbox.click();
    await this.nextButton.click();
    await this.page.waitForURL('**/check');
  }
}
