import { Page, expect } from '@playwright/test';
import { BasePage } from './basePage';

/**
 * Credit-protection insurance page shown after document upload. The form is now an insurer's
 * page (redirects to the TQM pre-order summary, "ใกล้เสร็จแล้ว") instead of the old accept/decline radios: the health
 * questionnaire must be answered (all "no"), the consent checkbox ticked, and then
 * "ยืนยันทำประกัน" becomes enabled. Beneficiary 2's relationship is preselected.
 */
export class InsurancePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async confirmInsurance(): Promise<void> {
    const frame = this.page;
    await frame.getByText('แบบสอบถามสุขภาพ').waitFor({ timeout: 30000 });

    for (const answer of ['ไม่มี', 'ไม่เคย', 'ไม่มี']) {
      // Same label ("ไม่มี") appears for questions 1 and 3, so pick by position among unchecked.
      const radio = frame.getByRole('radio', { name: answer, exact: true });
      const count = await radio.count();
      for (let i = 0; i < count; i++) {
        if (!(await radio.nth(i).isChecked())) {
          await radio.nth(i).check({ force: true });
          break;
        }
      }
    }

    // MUI checkbox: the hidden input ignores forced clicks, so click its visible wrapper.
    const consent = frame.getByRole('checkbox');
    await consent.locator('xpath=..').click();
    // Ticking it opens a TQM data-consent document; accepting it completes the tick.
    await frame.getByRole('button', { name: 'ยินยอม', exact: true }).click();
    await expect(consent).toBeChecked();
    await frame.getByRole('button', { name: 'ยืนยันทำประกัน' }).click();
  }
}
