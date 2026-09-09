export interface PersonalInfo {
  titlePrefix: string;
  firstname: string;
  surname: string;
  dateOfBirth: string;
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
