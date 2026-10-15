import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/** Loan contract preview shown after OTP confirmation (PDF download link + "ถัดไป"). */
export class ContractPage extends BasePage {
  readonly downloadLink: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    super(page);
    this.downloadLink = page.getByRole('link', { name: 'ดาวน์โหลด PDF' });
    this.nextButton = page.getByRole('button', { name: /ถัดไป/ });
  }

  async continue(): Promise<void> {
    await this.downloadLink.waitFor({ state: 'visible', timeout: 30000 });
    await this.nextButton.click();
  }
}
