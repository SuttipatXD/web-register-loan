import { test } from '@playwright/test';
import { getLoanTestData } from '../utils/loan/testData';
import { applyForLoan } from '../utils/loan/applyFlow';

const referralSources = [
  'พนักงานสินเชื่อในพื้นที่',
  'ผู้ช่วยพนักงานสินเชื่อ',
  'ตัวแทนอสม., กำนัน, ผู้ใหญ่บ้าน, ภาคีเครือข่าย',
  'พนักงานติดตามหนี้',
  'สื่อออนไลน์ เช่น แอปสมาร์ท อสม., เฟสบุ๊ค, ไลน์, Tiktok',
  'เพื่อนแนะนำ',
];

for (const referralSource of referralSources) {
  test(`apply for แฮปปี้ทวีคูณ loan with referral source: ${referralSource}`, async ({ page }) => {
    const data = getLoanTestData('happyTavikoon');
    test.skip(!data, 'Set QA-approved personal info in utils/loan/testData.ts first.');

    await applyForLoan(page, {
      menuSlug: 'sukjai',
      hasInsurance: true,
      data: { ...data!, applicationDetails: { ...data!.applicationDetails, referralSource } },
    });
  });
}
