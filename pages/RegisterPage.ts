import { Page, Locator, Response } from '@playwright/test';
import { BasePage } from './BasePage';

export class RegisterPage extends BasePage {
  readonly path = '/register/moih';

  readonly brandHeading: Locator;
  readonly loadingIndicator: Locator;
  readonly footerImage: Locator;

  constructor(page: Page) {
    super(page);
    this.brandHeading = page.getByText(/moih wallet|บุญเติม easy cash/i);
    this.loadingIndicator = page.getByText('กำลังโหลด...');
    this.footerImage = page.locator('img[src*="footer.png"]');
  }

  async goto(): Promise<Response | null> {
    return this.page.goto(`${this.baseURL}${this.path}`);
  }

  async waitForAppLoad(): Promise<void> {
    await this.waitForNetworkIdle();
    await this.loadingIndicator.waitFor({ state: 'detached', timeout: 15000 }).catch(() => {});
  }

  async isPageLoaded(): Promise<boolean> {
    const brandVisible = await this.brandHeading.first().isVisible().catch(() => false);
    const footerVisible = await this.footerImage.first().isVisible().catch(() => false);
    return brandVisible || footerVisible;
  }
}
