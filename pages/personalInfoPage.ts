import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface GuarantorInfo {
  idNumber: string;
  titlePrefix: string;
  firstname: string;
  surname: string;
  /** Buddhist-era date, format 'DD/MM/YYYY'. */
  dateOfBirth: string;
  primaryPhone: string;
  secondaryPhone?: string;
}

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
  /** Filled only when the group's form has a guarantor section ("ข้อมูลผู้ค้ำ"). */
  guarantor?: GuarantorInfo;
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
  readonly guarantorIdNumberInput: Locator;
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
    // Forms with a guarantor section have two "เลขบัตรประชาชน" labels, so target by name.
    this.idNumberInput = page.locator('input[name="cus_id_number"]');
    this.guarantorIdNumberInput = page.locator('input[name="guarantor_id_number"]');
    this.idLaserCodeInput = page.getByLabel('รหัสหลังบัตรประชาชน');
    this.titlePrefixSelect = page.locator('#cus_title');
    this.firstnameInput = page.locator('#cus_firstname');
    this.surnameInput = page.locator('#cus_lastname');
    this.birthdayInput = page.locator('#cus_birthday');
    this.primaryPhoneInput = page.locator('#cus_mobile');
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
  async fillBirthday(dateOfBirth: string, input: Locator = this.birthdayInput): Promise<void> {
    const [dayStr, monthStr, yearStr] = dateOfBirth.split('/');
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const targetYear = parseInt(yearStr, 10);

    await input.click();
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

  /**
   * "ไม่ทราบวันที่เกิด อย่างเดียว (โปรดเลือกเดือนและปีเกิด)": tick the checkbox (by its label), then
   * the calendar opens on a month grid for the current year; clicking the year in its header
   * switches to the decade-paged year picker, and picking a year returns to the month grid.
   */
  async fillBirthMonthYear(dateOfBirth: string): Promise<void> {
    const month = parseInt(dateOfBirth.split('/')[1], 10);

    await this.page.getByText('ไม่ทราบวันที่เกิด อย่างเดียว').click();
    const dialog = await this.pickBirthYear(dateOfBirth, true);
    await dialog.getByRole('button', { name: MONTH_ABBR_TH[month - 1], exact: true }).click();
  }

  /**
   * "ไม่ทราบวันที่ และ เดือนเกิด": tick the checkbox (by its label — the input ignores direct
   * clicks), then the calendar becomes a decade-paged year picker (value ends up '--/--/YYYY').
   */
  async fillBirthYearOnly(dateOfBirth: string): Promise<void> {
    await this.page.getByText('ไม่ทราบวันที่ และ เดือนเกิด').click();
    await this.pickBirthYear(dateOfBirth);
  }

  private async pickBirthYear(dateOfBirth: string, fromMonthView = false): Promise<Locator> {
    const targetYear = parseInt(dateOfBirth.split('/')[2], 10);

    await this.birthdayInput.click();
    const dialog = this.page.getByRole('dialog', { name: 'เลือกวันเกิด' });
    await dialog.waitFor({ state: 'visible' });

    if (fromMonthView) {
      await dialog.getByRole('button', { name: /^\d{4}$/ }).click();
    }

    const yearButton = dialog.getByRole('button', { name: String(targetYear), exact: true });
    const previous = dialog.getByRole('button', { name: 'ก่อนหน้า' });
    const next = dialog.getByRole('button', { name: 'ถัดไป' });
    for (let i = 0; i < 20 && !(await yearButton.isVisible()); i++) {
      const range = (await dialog.getByRole('button', { name: /^\d{4}-\d{4}$/ }).innerText()).split('-');
      await (targetYear < parseInt(range[0], 10) ? previous : next).click();
    }
    await yearButton.click();
    return dialog;
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
    await this.fillGuarantorIfPresent(info.guarantor);
  }

  /**
   * Groups differ in whether the form asks for a guarantor ("ข้อมูลผู้ค้ำ"), so this only fills
   * the section when it is on the page. Its labels repeat the applicant's, so the guarantor's
   * fields are the last match for each label.
   */
  async fillGuarantorIfPresent(guarantor?: GuarantorInfo): Promise<void> {
    if (!guarantor || !(await this.page.getByRole('heading', { name: 'ข้อมูลผู้ค้ำ' }).count())) {
      return;
    }
    const { page } = this;
    await this.guarantorIdNumberInput.pressSequentially(guarantor.idNumber);
    await page.getByRole('combobox', { name: /^คำนำหน้าชื่อ/ }).last().selectOption(guarantor.titlePrefix);
    await page.locator('#guarantor_firstname').pressSequentially(guarantor.firstname);
    await page.locator('#guarantor_lastname').pressSequentially(guarantor.surname);
    await this.fillBirthday(
      guarantor.dateOfBirth,
      page.getByRole('combobox', { name: /วัน\/เดือน\/ปี/ }).last(),
    );
    await page.getByRole('combobox', { name: /^จังหวัดตามบัตรประชาชน/ }).selectOption({ index: 1 });
    await page.getByRole('combobox', { name: /^อาชีพผู้ค้ำประกัน/ }).selectOption({ index: 1 });
    await page.locator('#guarantor_mobile').pressSequentially(guarantor.primaryPhone);
    if (guarantor.secondaryPhone) {
      await page.getByLabel('หมายเลขโทรศัพท์สำรอง').last().pressSequentially(guarantor.secondaryPhone);
    }
    await page.getByRole('combobox', { name: /^ปีที่แต่งตั้ง/ }).selectOption({ index: 1 });
    await page.getByRole('combobox', { name: /^เดือนที่แต่งตั้ง/ }).selectOption({ index: 1 });
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
