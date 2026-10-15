import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * SMS OTP verification page (/register/moih/otp) shown after declining/accepting insurance.
 * Sends a real SMS to the primary phone number — only use with a phone number you can actually
 * read the OTP from. Structure not fully confirmed live yet: tries a single combined-code input
 * first (common pattern: maxlength=6, numeric), falling back to one input per digit.
 */
export class OtpPage extends BasePage {
  readonly singleCodeInput: Locator;
  readonly perDigitInputs: Locator;
  readonly confirmButton: Locator;

  constructor(page: Page) {
    super(page);
    this.singleCodeInput = page.locator('input[maxlength="6"], input[maxlength="6"][inputmode="numeric"]').first();
    this.perDigitInputs = page.locator('input[maxlength="1"]');
    this.confirmButton = page.getByRole('button', { name: /ยืนยัน OTP/ });
  }

  async enterCodeAndConfirm(code: string): Promise<void> {
    // Verified live: a single "ใส่รหัส OTP" textbox, and the "ยืนยัน OTP" button stays disabled
    // until it has a value.
    const input = this.page.getByRole('textbox', { name: 'ใส่รหัส OTP' });
    await input.waitFor({ state: 'visible', timeout: 30000 });
    await input.pressSequentially(code);
    await this.confirmButton.click();
  }
}
