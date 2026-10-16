# web-register-loan

ชุดทดสอบอัตโนมัติ (Playwright + TypeScript) สำหรับขั้นตอนสมัครสินเชื่อผ่านเว็บ "บุญเติม เงินพร้อมใช้"
บนสภาพแวดล้อม **SIT** (`app-sit.boontermeasycash.com`) รันบนอุปกรณ์มือถือจำลอง (Pixel 5 / Mobile Chrome)

## เทสที่มี

| ไฟล์ | เทส | ขั้นตอน |
|---|---|---|
| [tests/register.spec.ts](tests/register.spec.ts) | เปิดหน้าลงทะเบียน | หน้าโหลดสำเร็จ |
| | สมัครสินเชื่อ **แฮปปี้ทวีคูณ** | เมนู sukjai → เงื่อนไข → ตรวจสอบคุณสมบัติ → PDPA → รายละเอียดใบสมัคร → เอกสาร → ประกัน → OTP → สัญญา → ผลลัพธ์ |
| [tests/mobile.spec.ts](tests/mobile.spec.ts) | สมัครสินเชื่อ **มือถือผ่อนสินค้า** | storefront → ตรวจสอบคุณสมบัติ → PDPA → เลือกสินค้า (Galaxy A17, ผ่อน 24 เดือน) → รายละเอียดใบสมัคร → เอกสาร → OTP → สัญญา → ผลลัพธ์ (ไม่มีขั้นประกัน) |

## ติดตั้ง

```bash
npm install
npx playwright install chromium
cp .env.example .env     # แล้วกรอก URL ของแต่ละกลุ่มสินเชื่อ
```

## ตั้งค่า `.env`

URL แยกตาม **กลุ่มสินเชื่อ** (ตัว URL รวม path ของกลุ่มไว้แล้ว):

```
BASE_URL_MOIH=https://app-sit.boontermeasycash.com:8443/register/moih
BASE_URL_OSM=https://app-sit.boontermeasycash.com:8443/register/osm
```

ตัวแปร `LOAN_GROUP` (`moih` / `osm`) เป็นตัวเลือกว่าใช้ `BASE_URL_<กลุ่ม>` ตัวไหน ถ้าไม่ตั้งจะใช้ `BASE_URL` และถ้าไม่มีอีกจะใช้ค่า default ของ moih
การเลือกทำใน [pages/BasePage.ts](pages/BasePage.ts) เพิ่มกลุ่มใหม่ได้โดยเพิ่ม `BASE_URL_<ชื่อ>` แล้วเพิ่ม script

## คำสั่งรันเทส

| คำสั่ง | ความหมาย |
|---|---|
| `npm run test:moih` | เทสทั้งหมดของกลุ่ม moih |
| `npm run test:osm` | เทสทั้งหมดของกลุ่ม osm |
| `npm run test:register:moih` / `test:register:osm` | เฉพาะแฮปปี้ทวีคูณ + เปิดหน้าลงทะเบียน |
| `npm run test:mobile:moih` | เฉพาะมือถือผ่อนสินค้า (moih) |
| `npm test` | ทั้งหมด ใช้ `BASE_URL` / ค่า default |
| `npm run test:headed` | เปิดเบราว์เซอร์ให้เห็นระหว่างรัน |
| `npm run report` | เปิดรายงาน HTML |

ตัวอย่างรันเทสเดียวแบบเห็นหน้าจอ: `LOAN_GROUP=moih npx playwright test tests/mobile.spec.ts --headed`
(คำสั่งตั้งตัวแปรนำหน้าแบบนี้ใช้ได้บน macOS/Linux; บน Windows ต้องใช้ `cross-env`)

## ข้อมูลทดสอบ

อยู่ที่ [utils/loan/testData.ts](utils/loan/testData.ts) ที่เดียว

- **ผู้สมัคร:** ชื่อ = ชื่อสินเชื่อ (`loanApplicantNames`) นามสกุล = "ทดสอบ" เช่น "แฮปปี้ทวีคูณ ทดสอบ"
- **เลขบัตรประชาชน:** สุ่มใหม่ทุกครั้งที่รัน (ผ่าน checksum ฝั่งหน้าเว็บ) จาก [utils/loan/generateThaiId.ts](utils/loan/generateThaiId.ts)
- **เบอร์โทร / รหัสหลังบัตร / รายได้ / ที่อยู่ / ผู้อ้างอิง:** แก้ได้ในไฟล์เดียวกัน
- **รูปเอกสาร:** [utils/images/](utils/images/) (`id_card.png`, `face.png`, `other.png`)
- ฟังก์ชัน `getPersonalInfo(product)` และ `getHappyTavikoonTestData()` คืน `null` ถ้าข้อมูลผู้สมัครไม่ครบ เทสจะ skip เอง

เพิ่มสินเชื่อใหม่: เพิ่มชื่อใน `LoanProduct` และ `loanApplicantNames` แล้วเรียก `getPersonalInfo('<ชื่อ>')` ในเทส

## โครงสร้างโปรเจกต์

```
tests/                  เทส (register.spec.ts, mobile.spec.ts)
pages/                  Page Object ของแต่ละหน้า
  BasePage.ts             เลือก base URL ตาม LOAN_GROUP
  MobileLoanCheckPage.ts  ฟอร์มตรวจสอบคุณสมบัติของมือถือผ่อนสินค้า
  ApplicationDetailsPage.ts  ฟอร์มรายละเอียดใบสมัคร (ใช้ร่วมกันทั้งสองสินเชื่อ)
  DocumentUploadPage.ts   อัปโหลดเอกสาร
  InsurancePage.ts / OtpPage.ts / ContractPage.ts / ApplicationResultPage.ts ...
utils/loan/             ข้อมูลทดสอบ + ตัวสร้างเลขบัตร
utils/images/           รูปสำหรับอัปโหลด
playwright.config.ts    timeout 120 วินาที, วิดีโอเปิดตลอด, deny สิทธิ์กล้อง
```

## ข้อควรรู้

- **ส่ง SMS OTP จริง** ไปที่เบอร์ใน `primaryPhone` ทุกครั้งที่รันเทสจนถึงขั้น OTP ใช้เบอร์ที่คุณควบคุมได้เท่านั้น เทสกรอกรหัส `123456` ตามแนวทาง QA ของ SIT
- **สร้างใบสมัครจริงบน SIT** ทุกครั้งที่รัน ใบสมัครทดสอบจะสะสมเพิ่มขึ้น
- **กล้อง:** เทสตั้งใจไม่ให้สิทธิ์กล้อง (`--deny-permission-prompts` ใน config) เพราะแอปมีหน้าถ่ายภาพสดที่ต้องถูกปฏิเสธก่อน จึงจะเข้าหน้าเลือกรูปจากเครื่องได้ ถ้าไม่ปฏิเสธ โหมด headed จะค้างรอผู้ใช้กดสิทธิ์
- **อัปโหลดเอกสาร:** ช่องแรกใช้รูปบัตร ช่องสองรูปเซลฟี่ ที่เหลือรูปอื่น นับว่าสำเร็จเมื่อเห็นปุ่ม "เปลี่ยนรูปภาพ" (preview) ถ้าถูกปฏิเสธจะลองรูปอื่นในช่องเดิม
- **ขั้นหน้า consent/ฟอร์มบน SIT เปลี่ยนได้:** ถ้าเทสค้างที่ปุ่ม "ถัดไป" ไม่เปิด ให้ดูวิดีโอและ `error-context.md` ใน `test-results/` ว่ามี consent หรือฟิลด์ใหม่ที่ยังไม่ถูกกรอก
- เทสกับกลุ่ม **osm** ยังไม่เคยรันยืนยัน
