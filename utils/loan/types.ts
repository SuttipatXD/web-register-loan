export interface PersonalInfo {
  titlePrefix: string;
  firstname: string;
  surname: string;
  /** 'DD/MM/YYYY' in Buddhist era. With `birthDateUnknown`, only the year is used. */
  dateOfBirth: string;
  /** The applicant doesn't know their day/month of birth — tick "ไม่ทราบวันที่ และ เดือนเกิด" and pick only the year. */
  birthDateUnknown?: boolean;
  idNumber: string;
  idLaserCode: string;
  primaryPhone: string;
  secondaryPhone?: string;
  monthlyIncome: string;
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
