import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

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
    // Some groups (e.g. subdistrict) render the contract page without the PDF link, so it is
    // only given a chance to show up rather than required.
    await this.downloadLink.waitFor({ state: 'visible', timeout: 10000 }).catch(() => {});
    await this.nextButton.click();
  }
}
