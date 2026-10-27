export interface GuarantorInfo {
  idNumber: string;
  titlePrefix: string;
  firstname: string;
  surname: string;
  /** 'DD/MM/YYYY' in Buddhist era. */
  dateOfBirth: string;
  primaryPhone: string;
  secondaryPhone?: string;
}

export interface PersonalInfo {
  titlePrefix: string;
  firstname: string;
  surname: string;
  /** 'DD/MM/YYYY' in Buddhist era. With `birthDateUnknown`, only the year is used. */
  dateOfBirth: string;
  /** The applicant doesn't know their day of birth — tick "ไม่ทราบวันที่เกิด อย่างเดียว (โปรดเลือกเดือนและปีเกิด)" and pick month + year. */
  birthDateUnknown?: boolean;
  /** The applicant knows month and year but not the day — tick "ไม่ทราบวันที่เกิด อย่างเดียว (โปรดเลือกเดือนและปีเกิด)" and pick month + year. */
  birthDayUnknown?: boolean;
  idNumber: string;
  idLaserCode: string;
  primaryPhone: string;
  secondaryPhone?: string;
  monthlyIncome: string;
  /** Only filled when the group's form has a guarantor section. */
  guarantor?: GuarantorInfo;
}

export interface InsuranceInfo {
  wantInsurance: boolean;
  beneficiaryName?: string;
  beneficiaryRelationship?: string;
}

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
  /** Text of the "ท่านทราบการสมัครสินเชื่อนี้จากช่องทางใด" option to pick; defaults to the first real option. */
  referralSource?: string;
  homeAddress: Address;
  monthlyDebtDeduction: string;
  bankAccountNumber: string;
  bankBranch: string;
  reference1: ReferenceContact;
  reference2: ReferenceContact;
  reference3: ReferenceContact;
}

export interface LoanApplicationData {
  desiredCreditAmount: string;
  personalInfo: PersonalInfo;
  insurance: InsuranceInfo;
  applicationDetails: ApplicationDetails;
}
