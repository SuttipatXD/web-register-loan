import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/** The "สินเชื่อ แฮปปี้ ทวีคูณ" product lives on the /menu/sukjai page. */
export class LoanMenuPage extends BasePage {
  readonly path = '/register/moih/menu/sukjai';
  readonly applyBanner: Locator;

  constructor(page: Page) {
    super(page);
    this.applyBanner = page.getByAltText('sukjai');
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseURL}${this.path}`, { waitUntil: 'networkidle' });
  }

  /** Clicks the "สมัครเลย" banner and waits for the eligibility/T&C screen. */
  async clickApply(): Promise<void> {
    await this.applyBanner.click();
    await this.page.waitForURL('**/eligibility');
  }
}
