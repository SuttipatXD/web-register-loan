import { Page, Locator } from '@playwright/test';
import { BasePage } from './basePage';

/** A loan product's menu page (/menu/<slug>); defaults to "สินเชื่อ แฮปปี้ ทวีคูณ" (sukjai). */
export class LoanMenuPage extends BasePage {
  readonly path: string;
  readonly applyBanner: Locator;

  constructor(page: Page, slug = 'sukjai') {
    super(page);
    this.path = `/menu/${slug}`;
    this.applyBanner = page.getByAltText(slug);
  }

  async goto(): Promise<void> {
    await this.page.goto(`${this.baseURL}${this.path}`, { waitUntil: 'networkidle' });
  }

  /** Clicks the "สมัครเลย" banner and waits for the eligibility/T&C screen (or `nextUrl`, e.g. โฉนดแลกเงิน's own consent page). */
  async clickApply(nextUrl = '**/eligibility'): Promise<void> {
    await this.applyBanner.click();
    await this.page.waitForURL(nextUrl);
  }
}
