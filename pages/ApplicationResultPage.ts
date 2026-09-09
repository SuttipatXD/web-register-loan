import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/** Final screen showing the outcome of the loan application. Locators unverified — see DocumentUploadPage note. */
export class ApplicationResultPage extends BasePage {
  readonly resultHeading: Locator;

  constructor(page: Page) {
    super(page);
    this.resultHeading = page.getByText(/สำเร็จ|อนุมัติ|ผลการสมัคร/);
  }

  async waitForResult(timeout = 60000): Promise<string> {
    await this.resultHeading.first().waitFor({ state: 'visible', timeout });
    return (await this.resultHeading.first().innerText()).trim();
  }

  async isSuccess(): Promise<boolean> {
    const text = await this.waitForResult();
    return /สำเร็จ|อนุมัติ/.test(text);
  }
}
