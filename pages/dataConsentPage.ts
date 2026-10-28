import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * PDPA data-disclosure consent screen ("ความยินยอมเปิดเผยข้อมูล") shown after the personal-info
 * form. The "select all" radio (#select_consent_all) is styled so its native input is covered by
 * a custom visual, which fails Playwright's default actionability check — force:true is required.
 * Clicking it (after scrolling it into view) flips all four individual consent items and enables
 * the next button as a side effect (verified live).
 */
export class DataConsentPage extends BasePage {
  readonly acceptAllRadio: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    super(page);
    this.acceptAllRadio = page.locator('#select_consent_all');
    this.nextButton = page.getByRole('button', { name: /ถัดไป/ });
  }

  async acceptAllAndContinue(): Promise<void> {
    await this.acceptAllRadio.scrollIntoViewIfNeeded();
    for (let attempt = 0; attempt < 5; attempt++) {
      await this.acceptAllRadio.click({ force: true });
      if (await this.nextButton.isEnabled().catch(() => false)) {
        break;
      }
      await this.page.waitForTimeout(300);
    }
    await this.nextButton.click();
  }
}
