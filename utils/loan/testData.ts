import { PersonalInfo, ApplicationDetails } from './types';
import { generateThaiIdNumber } from './generateThaiId';

/**
 * SYNTHETIC PLACEHOLDER DATA — not a real person.
 * idNumber is randomly generated each run (passes the Thai national-ID mod-11 checksum, so
 * client-side format validation accepts it) and logged below. It will very likely fail the
 * real ID-verification/credit-check step, so the flow won't reach a genuine "success" result.
 * Replace with QA-approved values from your team to run the flow end-to-end for real.
 */
export const personalInfo: PersonalInfo = {
  titlePrefix: 'นาย',
  firstname: 'ทดสอบ',
  surname: 'ระบบ',
  dateOfBirth: '01/01/2540',
  idNumber: generateThaiIdNumber(),
  idLaserCode: 'AA2222222222',
  primaryPhone: '0812345678',
  secondaryPhone: '',
  monthlyIncome: '15000',
};

export const desiredCreditAmount = '10000';

export const applicationDetails: ApplicationDetails = {
  homeAddress: {
    provinceLabel: 'กรุงเทพมหานคร',
    houseNumber: '99',
  },
  monthlyDebtDeduction: '0',
  bankAccountNumber: '1234567890',
  bankBranch: 'สาขาทดสอบ',
  reference1: {
    firstname: 'อ้างอิง',
    lastname: 'หนึ่ง',
    phone: '0898765432',
  },
  reference2: {
    firstname: 'อ้างอิง',
    lastname: 'สอง',
    phone: '0898765433',
  },
  reference3: {
    firstname: 'อ้างอิง',
    lastname: 'สาม',
    phone: '0898765434',
  },
};
