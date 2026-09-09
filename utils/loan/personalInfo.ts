import { PersonalInfo } from './types';
import { personalInfo } from './testData';

/**
 * Personal info calls a real ID-verification/credit-check API (SIT and production alike).
 * Values come from testData.ts (gitignored — see testData.example.ts). Never commit real
 * personal data; fill testData.ts with QA-approved / whitelisted values only.
 */
export function getPersonalInfo(): PersonalInfo | null {
  if (!personalInfo.idNumber || !personalInfo.idLaserCode || !personalInfo.primaryPhone) {
    return null;
  }

  return personalInfo;
}
