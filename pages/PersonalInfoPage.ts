import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface PersonalInfo {
  desiredCreditAmount: string;
  idNumber: string;
  idLaserCode: string;
  titlePrefix: string;
  firstname: string;
  surname: string;
  /** Buddhist-era date, format 'DD/MM/YYYY', e.g. '15/06/2540'. */
  dateOfBirth: string;
  primaryPhone: string;
  secondaryPhone?: string;
  monthlyIncome: string;
}

const MONTH_ABBR_TH = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
const MONTH_FULL_TH = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม',
];

/**
 * Personal info / underwriting form (/register/moih/check).
 * Locators for the title/firstname pair use ids (#cus_title, #cus_firstname) instead of
 * getByLabel, because the firstname field's accessible name ("ชื่อ * (ไม่ต้องใส่คำนำหน้าชื่อ)")
 * contains "คำนำหน้าชื่อ" as a substring and collides with the title select's label.
 */
export class PersonalInfoPage extends BasePage {
  readonly creditAmountSelect: Locator;
  readonly idNumberInput: Locator;
  readonly idLaserCodeInput: Locator;
  readonly titlePrefixSelect: Locator;
  readonly firstnameInput: Locator;
  readonly surnameInput: Locator;
  readonly birthdayInput: Locator;
  readonly primaryPhoneInput: Locator;
  readonly secondaryPhoneInput: Locator;
  readonly monthlyIncomeInput: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    super(page);
    this.creditAmountSelect = page.getByLabel('วงเงินที่ท่านต้องการ');
    this.idNumberInput = page.getByLabel('เลขบัตรประชาชน');
    this.idLaserCodeInput = page.getByLabel('รหัสหลังบัตรประชาชน');
    this.titlePrefixSelect = page.locator('#cus_title');
    this.firstnameInput = page.locator('#cus_firstname');
    this.surnameInput = page.getByLabel('นามสกุล');
    this.birthdayInput = page.locator('#cus_birthday');
    this.primaryPhoneInput = page.getByLabel('หมายเลขโทรศัพท์หลัก');
    this.secondaryPhoneInput = page.getByLabel('หมายเลขโทรศัพท์สำรอง');
    this.monthlyIncomeInput = page.getByLabel('รายได้ต่อเดือน');
    this.nextButton = page.getByRole('button', { name: /ถัดไป/ });
  }

  /**
   * The birthday field opens a calendar dialog (Buddhist-era years) instead of accepting
   * typed input. Clicking its header switches from day-view to a faster month/year-view,
   * where the prev/next arrows step by year — that's used to jump to a distant birth year
   * instead of paging day-by-day.
   */
  async fillBirthday(dateOfBirth: string): Promise<void> {
    const [dayStr, monthStr, yearStr] = dateOfBirth.split('/');
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const targetYear = parseInt(yearStr, 10);

    await this.birthdayInput.click();
    const dialog = this.page.getByRole('dialog', { name: 'เลือกวันเกิด' });
    await dialog.waitFor({ state: 'visible' });

    const header = dialog.locator('[aria-live="polite"]');
    await header.click();

    let currentYear = parseInt((await header.textContent())!.trim(), 10);
    const prevButton = dialog.getByRole('button', { name: 'ก่อนหน้า' });
    const nextButton = dialog.getByRole('button', { name: 'ถัดไป' });

    while (currentYear > targetYear) {
      await prevButton.click();
      currentYear--;
    }
    while (currentYear < targetYear) {
      await nextButton.click();
      currentYear++;
    }

    await dialog.getByRole('button', { name: MONTH_ABBR_TH[month - 1], exact: true }).click();

    const dayLabel = `${day} ${MONTH_FULL_TH[month - 1]} ${targetYear}`;
    await dialog.getByRole('button', { name: dayLabel, exact: true }).click();
  }

  async fill(info: PersonalInfo): Promise<void> {
    await this.creditAmountSelect.selectOption(info.desiredCreditAmount);
    await this.idNumberInput.pressSequentially(info.idNumber);
    await this.idLaserCodeInput.pressSequentially(info.idLaserCode);
    await this.titlePrefixSelect.selectOption(info.titlePrefix);
    await this.firstnameInput.pressSequentially(info.firstname);
    await this.surnameInput.pressSequentially(info.surname);
    await this.fillBirthday(info.dateOfBirth);
    await this.primaryPhoneInput.pressSequentially(info.primaryPhone);
    if (info.secondaryPhone) {
      await this.secondaryPhoneInput.pressSequentially(info.secondaryPhone);
    }
    await this.monthlyIncomeInput.pressSequentially(info.monthlyIncome);
  }

  /**
   * Poll instead of a fixed wait, and confirm the click actually navigated away, retrying if
   * not — see ApplicationDetailsPage.submitAndContinue for why (verified live there; applying
   * the same defensive pattern here since it uses an identical poll-then-click shape).
   */
  async submitAndContinue(): Promise<void> {
    const startUrl = this.page.url();
    for (let attempt = 0; attempt < 3; attempt++) {
      const deadline = Date.now() + 10000;
      while (Date.now() < deadline && !(await this.nextButton.isEnabled())) {
        await this.page.waitForTimeout(300);
      }
      await this.nextButton.click();
      const navigated = await this.page
        .waitForURL((url) => url.toString() !== startUrl, { timeout: 5000 })
        .then(() => true)
        .catch(() => false);
      if (navigated) return;
    }
    throw new Error('PersonalInfoPage: "ถัดไป" click did not navigate away after 3 attempts.');
  }
}
