import { Page, Locator } from '@playwright/test';
import { PersonalInfoPage, PersonalInfo } from './PersonalInfoPage';

export interface MobileLoanCheckInfo extends Omit<PersonalInfo, 'desiredCreditAmount'> {
  /** See PersonalInfoPage.fillBirthYearOnly. */
  birthDateUnknown?: boolean;
  monthlyDebt: string;
  workYearsLabel: string;
  sideJobLabel: string;
  provinceLabel: string;
  houseNumber: string;
}

/**
 * Eligibility form of the "มือถือผ่อนสินค้า" product (/register/moih/check, reached via the storefront
 * consent). Same as the standard personal-info form minus the credit-amount select, plus
 * other-loans radio, monthly debt, work years, side job and a current-address block.
 */
export class MobileLoanCheckPage extends PersonalInfoPage {
  readonly otherLoansNotOverRadio: Locator;
  readonly monthlyDebtInput: Locator;
  readonly workYearsSelect: Locator;
  readonly sideJobSelect: Locator;
  readonly provinceSelect: Locator;
  readonly amphurSelect: Locator;
  readonly districtSelect: Locator;
  readonly houseNumberInput: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.otherLoansNotOverRadio = page.locator('#check_financial_nomore');
    this.monthlyDebtInput = page.locator('#amount_dsr');
    this.workYearsSelect = page.locator('#current_work_years');
    this.sideJobSelect = page.locator('#side_job');
    this.provinceSelect = page.locator('#cus_province');
    this.amphurSelect = page.locator('#cus_amphur');
    this.districtSelect = page.locator('#cus_district');
    this.houseNumberInput = page.locator('#cus_address');
    this.submitButton = page.getByRole('button', { name: /ส่งข้อมูล/ });
  }

  async fillMobile(info: MobileLoanCheckInfo): Promise<void> {
    await this.idNumberInput.pressSequentially(info.idNumber);
    await this.idLaserCodeInput.pressSequentially(info.idLaserCode);
    await this.titlePrefixSelect.selectOption(info.titlePrefix);
    await this.firstnameInput.pressSequentially(info.firstname);
    await this.surnameInput.pressSequentially(info.surname);
    if (info.birthDateUnknown) {
      await this.fillBirthYearOnly(info.dateOfBirth);
    } else {
      await this.fillBirthday(info.dateOfBirth);
    }
    await this.primaryPhoneInput.pressSequentially(info.primaryPhone);
    if (info.secondaryPhone) {
      await this.secondaryPhoneInput.pressSequentially(info.secondaryPhone);
    }
    await this.otherLoansNotOverRadio.check({ force: true });
    await this.monthlyIncomeInput.pressSequentially(info.monthlyIncome);
    await this.monthlyDebtInput.pressSequentially(info.monthlyDebt);
    await this.workYearsSelect.selectOption({ label: info.workYearsLabel });
    await this.sideJobSelect.selectOption({ label: info.sideJobLabel });
    await this.provinceSelect.selectOption({ label: info.provinceLabel });
    // District lists load per selection; index 1 skips the "โปรดระบุ" placeholder.
    await this.amphurSelect.selectOption({ index: 1 });
    await this.districtSelect.selectOption({ index: 1 });
    await this.houseNumberInput.pressSequentially(info.houseNumber);
  }

  /** Submits via "ส่งข้อมูล" and waits for the app to leave the form. */
  async submitForm(): Promise<void> {
    const startUrl = this.page.url();
    await this.submitButton.click();
    await this.page.waitForURL((url) => url.toString() !== startUrl, { timeout: 30000 });
  }
}
