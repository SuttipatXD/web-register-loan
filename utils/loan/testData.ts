import { PersonalInfo, ApplicationDetails, LoanApplicationData } from "./types";
import { sharedInsuranceInfo } from "./insurance";
import { generateThaiIdNumber } from "./generateThaiId";

/**
 * SYNTHETIC PLACEHOLDER DATA — not a real person.
 * idNumber is randomly generated each run (passes the Thai national-ID mod-11 checksum, so
 * client-side format validation accepts it) and logged below. It will very likely fail the
 * real ID-verification/credit-check step, so the flow won't reach a genuine "success" result.
 * Replace with QA-approved values from your team to run the flow end-to-end for real.
 */
export const personalInfo: PersonalInfo = {
  titlePrefix: "นาย",
  // Overridden per loan product — see loanApplicantNames / getPersonalInfo().
  firstname: "ทดสอบ",
  surname: "ทดสอบ",
  dateOfBirth: "01/01/2540",
  idNumber: generateThaiIdNumber(),
  idLaserCode: "AA2222222222",
  primaryPhone: "0993928695",
  secondaryPhone: "",
  monthlyIncome: "15000",
};

/**
 * Each loan test applies under its product's name (firstname) with surname "ทดสอบ", so test
 * applications are easy to tell apart on SIT.
 */
export type LoanProduct =
  | "happyTavikoon"
  | "mobileInstallment"
  | "mobileTanjai"
  | "applianceLoan"
  | "kasetSukjai"
  | "carTitleLoan"
  | "landTitleLoan";

export const loanApplicantNames: Record<LoanProduct, string> = {
  happyTavikoon: "แฮปปี้ทวีคูณ",
  mobileInstallment: "มือถือผ่อนสินค้า",
  mobileTanjai: "มือถือทันใจ",
  applianceLoan: "เครื่องใช้ไฟฟ้า",
  kasetSukjai: "เกษตรสุขใจ",
  carTitleLoan: "ทะเบียนรถแลกเงิน",
  landTitleLoan: "โฉนดแลกเงิน",
};

/**
 * Products tested with a specific, provided applicant instead of the generated one (the identity
 * check on SIT accepts only certain people). Overrides the name/ID fields from `personalInfo`.
 */
const applicantOverrides: Partial<Record<LoanProduct, Partial<PersonalInfo>>> = {
  applianceLoan: {
    firstname: "เอคือ",
    surname: "อาศิระกุล",
    idNumber: "8710876010426",
    idLaserCode: "JC4187585306",
    // Born 1990-04-01 (พ.ศ. 2533), but the day/month are entered as unknown.
    dateOfBirth: "01/04/2533",
    birthDateUnknown: true,
    monthlyIncome: "50000",
  },
};

export const desiredCreditAmount = "10000";

export const applicationDetails: ApplicationDetails = {
  homeAddress: {
    provinceLabel: "กรุงเทพมหานคร",
    houseNumber: "99",
  },
  monthlyDebtDeduction: "0",
  bankAccountNumber: "1234567890",
  bankBranch: "สาขาทดสอบ",
  reference1: {
    firstname: "อ้างอิง",
    lastname: "หนึ่ง",
    phone: "0898765432",
  },
  reference2: {
    firstname: "อ้างอิง",
    lastname: "สอง",
    phone: "0898765433",
  },
  reference3: {
    firstname: "อ้างอิง",
    lastname: "สาม",
    phone: "0898765434",
  },
};

/**
 * Personal info calls a real ID-verification/credit-check API (SIT and production alike), so
 * this returns null (tests skip) until the identity fields are filled with QA-approved values.
 */
export function getPersonalInfo(product: LoanProduct): PersonalInfo | null {
  if (!personalInfo.idNumber || !personalInfo.idLaserCode || !personalInfo.primaryPhone) {
    return null;
  }

  return {
    ...personalInfo,
    // A fresh ID per call: tests in the same worker share this module, and SIT rejects a second
    // application for an ID that already applied ("ไม่ผ่านการตรวจสอบ").
    idNumber: generateThaiIdNumber(),
    firstname: loanApplicantNames[product],
    surname: "ทดสอบ",
    ...applicantOverrides[product],
  };
}

/**
 * Credit amount per product — the options differ (e.g. โฉนดแลกเงิน starts at 30,000), so the
 * default 10,000 isn't valid everywhere.
 */
const creditAmountFor: Record<LoanProduct, string> = {
  happyTavikoon: desiredCreditAmount,
  mobileInstallment: desiredCreditAmount,
  mobileTanjai: desiredCreditAmount,
  applianceLoan: desiredCreditAmount,
  kasetSukjai: desiredCreditAmount,
  carTitleLoan: desiredCreditAmount,
  landTitleLoan: "30000",
};

/** Full test data for any loan product using the shared flow; null until personal info is set. */
export function getLoanTestData(product: LoanProduct): LoanApplicationData | null {
  const info = getPersonalInfo(product);
  if (!info) {
    return null;
  }

  return {
    desiredCreditAmount: creditAmountFor[product],
    personalInfo: info,
    insurance: sharedInsuranceInfo,
    applicationDetails,
  };
}
