import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  readonly baseURL = process.env.BASE_URL ?? 'https://app-sit.boontermeasycash.com:8443';

  constructor(page: Page) {
    this.page = page;
  }

  async waitForNetworkIdle(): Promise<void> {
    await this.page.waitForLoadState('networkidle');
  }

  async getTitle(): Promise<string> {
    return this.page.title();
  }
}
