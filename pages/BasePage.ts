import { Page } from '@playwright/test';

export class BasePage {
  readonly page: Page;
  // Full URL of the loan group landing page (e.g. https://host/register/moih).
  // LOAN_GROUP (moih, osm, ...) picks BASE_URL_<GROUP> from .env; falls back to BASE_URL.
  readonly baseURL =
    (process.env.LOAN_GROUP && process.env[`BASE_URL_${process.env.LOAN_GROUP.toUpperCase()}`]) ||
    process.env.BASE_URL ||
    'https://app-sit.boontermeasycash.com:8443/register/moih';

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
