import { LoanApplicationData } from './types';
import { getPersonalInfo } from './personalInfo';
import { sharedInsuranceInfo } from './insurance';
import { desiredCreditAmount, applicationDetails } from './testData';

/** Test data for the "สินเชื่อ แฮปปี้ ทวีคูณ" product. Returns null until QA-approved
 * personal-info values are set in testData.ts — see personalInfo.ts. */
export function getHappyTavikoonTestData(): LoanApplicationData | null {
  const personalInfo = getPersonalInfo();
  if (!personalInfo) {
    return null;
  }

  return {
    desiredCreditAmount,
    personalInfo,
    insurance: sharedInsuranceInfo,
    applicationDetails,
  };
}
