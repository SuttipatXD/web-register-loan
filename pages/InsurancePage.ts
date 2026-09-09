import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Credit-protection insurance opt-in page (/register/moih/insurance) shown after document
 * upload. Declining ("ไม่ยินยอม") skips the beneficiary-designation fields that only apply
 * when opting in.
 */
export class InsurancePage extends BasePage {
  readonly acceptRadio: Locator;
  readonly declineRadio: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    super(page);
    this.acceptRadio = page.locator('input[name="consent"][value="Y"]');
    this.declineRadio = page.locator('input[name="consent"][value="N"]');
    this.nextButton = page.getByRole('button', { name: /ถัดไป/ });
  }

  async declineAndContinue(): Promise<void> {
    await this.declineRadio.check();
    await this.nextButton.click();
  }
}
