import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

export interface Address {
  provinceLabel: string;
  houseNumber: string;
  moo?: string;
  soi?: string;
  road?: string;
}

export interface ReferenceContact {
  firstname: string;
  lastname: string;
  phone: string;
}

export interface ApplicationDetails {
  homeAddress: Address;
  monthlyDebtDeduction: string;
  bankAccountNumber: string;
  bankBranch: string;
  reference1: ReferenceContact;
  reference2: ReferenceContact;
  reference3: ReferenceContact;
}

/**
 * Large "additional application details" form shown after the PDPA consent page: referral
 * source, three addresses (home/current/work — current and work default to "same as home" via
 * their own checkboxes, verified live to auto-copy the home address, so the
 * province→district→subdistrict cascade only needs driving once), occupation (fixed to this
 * product's single real option), income/debt, employment start date, banking details, three
 * emergency-contact/reference blocks, and delivery preferences. Selects/inputs are targeted by
 * id (verified live) since several labels ("ชื่อ *", "นามสกุล *", etc.) repeat across sections.
 */
export class ApplicationDetailsPage extends BasePage {
  readonly referralSourceSelect: Locator;
  readonly provinceSelect: Locator;
  readonly amphurSelect: Locator;
  readonly districtSelect: Locator;
  readonly houseNumberInput: Locator;
  readonly mooInput: Locator;
  readonly soiInput: Locator;
  readonly roadInput: Locator;
  readonly sameAsHomeForCurrentCheckbox: Locator;
  readonly sameAsHomeForWorkCheckbox: Locator;
  readonly occupationSelect: Locator;
  readonly officeNameSelect: Locator;
  readonly positionSelect: Locator;
  readonly noMoreThanThreeInstitutionsRadio: Locator;
  readonly incomeBankSelect: Locator;
  readonly noSecondaryIncomeRadio: Locator;
  readonly affiliatedAgencySelect: Locator;
  readonly salaryRoundsSelect: Locator;
  readonly salaryPaymentDateInput: Locator;
  readonly salaryPaymentTimeInput: Locator;
  readonly monthlyDebtRangeSelect: Locator;
  readonly monthlyDebtDeductionInput: Locator;
  readonly appointmentYearSelect: Locator;
  readonly appointmentMonthSelect: Locator;
  readonly bankAccountNumberInput: Locator;
  readonly bankBranchInput: Locator;
  readonly reference1FirstnameInput: Locator;
  readonly reference1LastnameInput: Locator;
  readonly reference1PhoneInput: Locator;
  readonly reference1RelationshipSelect: Locator;
  readonly reference2FirstnameInput: Locator;
  readonly reference2LastnameInput: Locator;
  readonly reference2PhoneInput: Locator;
  readonly reference3FirstnameInput: Locator;
  readonly reference3LastnameInput: Locator;
  readonly reference3PhoneInput: Locator;
  readonly contactReferencesConsentCheckbox: Locator;
  readonly deliveryAddressSelect: Locator;
  readonly preferredContactTimeSelect: Locator;
  readonly ncbConsentCheckbox: Locator;
  readonly personalLoanTermsConsentCheckbox: Locator;
  readonly bankLoanDeductionConsentCheckbox: Locator;
  readonly nextButton: Locator;

  constructor(page: Page) {
    super(page);
    this.referralSourceSelect = page.locator('#recommend_channel');
    this.provinceSelect = page.locator('#cus_province');
    this.amphurSelect = page.locator('#cus_amphur');
    this.districtSelect = page.locator('#cus_district');
    this.houseNumberInput = page.locator('#cus_address');
    this.mooInput = page.locator('#cus_moo');
    this.soiInput = page.locator('#cus_soi');
    this.roadInput = page.locator('#cus_road');
    this.sameAsHomeForCurrentCheckbox = page.locator('#address_check');
    this.sameAsHomeForWorkCheckbox = page.locator('#address_cus');
    this.occupationSelect = page.locator('#cus_occupation');
    this.officeNameSelect = page.locator('#cus_office_name');
    this.positionSelect = page.locator('#cus_position');
    this.noMoreThanThreeInstitutionsRadio = page.locator('#check_financial_nomore');
    this.incomeBankSelect = page.locator('#bank_id_income');
    this.noSecondaryIncomeRadio = page.locator('#check_sub_income_N');
    this.affiliatedAgencySelect = page.locator('#institution');
    this.salaryRoundsSelect = page.locator('#round_income');
    this.salaryPaymentDateInput = page.locator('#income_round1');
    this.salaryPaymentTimeInput = page.locator('#income_time1');
    this.monthlyDebtRangeSelect = page.locator('#amount_dsr');
    this.monthlyDebtDeductionInput = page.locator('#amount_deduct');
    this.appointmentYearSelect = page.locator('#cus_office_year');
    this.appointmentMonthSelect = page.locator('#cus_office_month');
    this.bankAccountNumberInput = page.locator('#payee_number');
    this.bankBranchInput = page.locator('#payee_branch');
    this.reference1FirstnameInput = page.locator('#refer_firstname');
    this.reference1LastnameInput = page.locator('#refer_lastname');
    this.reference1PhoneInput = page.locator('#refer_mobile');
    this.reference1RelationshipSelect = page.locator('#refer_relationship');
    this.reference2FirstnameInput = page.locator('#refer2_firstname');
    this.reference2LastnameInput = page.locator('#refer2_lastname');
    this.reference2PhoneInput = page.locator('#refer2_mobile');
    this.reference3FirstnameInput = page.locator('#refer3_firstname');
    this.reference3LastnameInput = page.locator('#refer3_lastname');
    this.reference3PhoneInput = page.locator('#refer3_mobile');
    this.contactReferencesConsentCheckbox = page.locator('#is_consent_refer2');
    this.deliveryAddressSelect = page.locator('#cus_receivingnews');
    this.preferredContactTimeSelect = page.locator('#contact_time');
    this.ncbConsentCheckbox = page.locator('#is_consent_ncb');
    this.personalLoanTermsConsentCheckbox = page.locator('#is_consent_approved_personalloan');
    this.bankLoanDeductionConsentCheckbox = page.locator('#is_consent_approved_bankloan');
    this.nextButton = page.getByRole('button', { name: /ถัดไป/ });
  }

  /**
   * Setting round_income to "1" reveals a required "รอบที่ 1" salary payday date+time pair.
   * The date field reuses the same calendar dialog component as the birthday picker on the
   * personal-info page (mislabeled "เลือกวันเกิด" here too) — since it opens on the current
   * month, any real (non-faded, i.e. not bleeding from the adjacent month) day button works,
   * no year/month navigation needed.
   */
  async fillSalaryPaymentRound1(): Promise<void> {
    await this.salaryPaymentDateInput.click();
    const dialog = this.page.getByRole('dialog', { name: 'เลือกวันเกิด' });
    await dialog.waitFor({ state: 'visible' });
    await dialog
      .locator('button:not([class*="text-faint"])')
      .filter({ hasText: /^\d+$/ })
      .first()
      .click();
    await this.salaryPaymentTimeInput.fill('12:00');
  }

  async fill(info: ApplicationDetails): Promise<void> {
    await this.referralSourceSelect.selectOption({ index: 1 });

    await this.provinceSelect.selectOption({ label: info.homeAddress.provinceLabel });
    await this.amphurSelect.selectOption({ index: 1 });
    await this.districtSelect.selectOption({ index: 1 });
    await this.houseNumberInput.pressSequentially(info.homeAddress.houseNumber);
    if (info.homeAddress.moo) {
      await this.mooInput.pressSequentially(info.homeAddress.moo);
    }
    if (info.homeAddress.soi) {
      await this.soiInput.pressSequentially(info.homeAddress.soi);
    }
    if (info.homeAddress.road) {
      await this.roadInput.pressSequentially(info.homeAddress.road);
    }

    // Verified live: checking these auto-copies the home address into current/work sections.
    await this.sameAsHomeForCurrentCheckbox.check();
    await this.sameAsHomeForWorkCheckbox.check();

    await this.occupationSelect.selectOption({ index: 1 });
    await this.officeNameSelect.selectOption({ label: 'สถานที่ทำการ' });
    await this.positionSelect.selectOption({ label: 'ผู้ใหญ่บ้าน' });

    await this.noMoreThanThreeInstitutionsRadio.check();
    await this.incomeBankSelect.selectOption({ index: 1 });
    await this.noSecondaryIncomeRadio.check();
    await this.affiliatedAgencySelect.selectOption({ index: 1 });
    await this.salaryRoundsSelect.selectOption({ index: 1 });
    await this.fillSalaryPaymentRound1();
    await this.monthlyDebtRangeSelect.selectOption({ index: 1 });
    await this.monthlyDebtDeductionInput.pressSequentially(info.monthlyDebtDeduction);

    await this.appointmentYearSelect.selectOption({ index: 1 });
    await this.appointmentMonthSelect.selectOption({ index: 1 });

    await this.bankAccountNumberInput.pressSequentially(info.bankAccountNumber);
    await this.bankBranchInput.pressSequentially(info.bankBranch);

    await this.reference1FirstnameInput.pressSequentially(info.reference1.firstname);
    await this.reference1LastnameInput.pressSequentially(info.reference1.lastname);
    await this.reference1PhoneInput.pressSequentially(info.reference1.phone);
    await this.reference1RelationshipSelect.selectOption({ index: 1 });

    await this.reference2FirstnameInput.pressSequentially(info.reference2.firstname);
    await this.reference2LastnameInput.pressSequentially(info.reference2.lastname);
    await this.reference2PhoneInput.pressSequentially(info.reference2.phone);

    await this.reference3FirstnameInput.pressSequentially(info.reference3.firstname);
    await this.reference3LastnameInput.pressSequentially(info.reference3.lastname);
    await this.reference3PhoneInput.pressSequentially(info.reference3.phone);

    await this.contactReferencesConsentCheckbox.check();

    await this.deliveryAddressSelect.selectOption({ index: 1 });
    await this.preferredContactTimeSelect.selectOption({ label: 'สะดวกให้ติดต่อทุกช่วงเวลา' });

    await this.ncbConsentCheckbox.check();
    await this.personalLoanTermsConsentCheckbox.check();
    await this.bankLoanDeductionConsentCheckbox.check();
  }

  /**
   * The "ถัดไป" button can still read as disabled for a moment after the last field's fill,
   * since React's validation state doesn't update perfectly synchronously with ~40 fields —
   * clicking immediately sometimes lands on the stale disabled state and silently no-ops,
   * leaving the test stuck looking like the form was never submitted. Poll instead of a
   * fixed wait, since the settle time isn't consistent.
   *
   * Verified live: even after the poll, the click can still fail to actually navigate away
   * (observed staying on this exact form, button disabled again, with every field still
   * showing correctly filled values) — most likely a server-side validation bounce-back on
   * an intermittent field rather than a client-side timing issue. Confirming the URL actually
   * changed, and retrying the whole poll-then-click if it didn't, recovers from that case.
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
    throw new Error(
      'ApplicationDetailsPage: "ถัดไป" click did not navigate away after 3 attempts.'
    );
  }
}
