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
    this.confirmButton = page.getByRole('button', { name: /ยืนยัน/ });
  }

  async enterCodeAndConfirm(code: string): Promise<void> {
    if (await this.singleCodeInput.count()) {
      await this.singleCodeInput.pressSequentially(code);
    } else {
      const digitCount = await this.perDigitInputs.count();
      for (let i = 0; i < Math.min(digitCount, code.length); i++) {
        await this.perDigitInputs.nth(i).pressSequentially(code[i]);
      }
    }
    await this.confirmButton.click();
  }
}
