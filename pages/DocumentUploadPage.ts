import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Document upload flow, verified live against SIT:
 * 1. "เริ่มถ่ายภาพ" opens a live-camera ID-card capture view with NO gallery fallback — if the
 *    camera is inaccessible it shows a blocking "ไม่สามารถทำรายการได้" error (OK-only).
 * 2. Retrying once more after dismissing that error moves past the live-camera step entirely
 *    and lands on a document checklist page (ID card photo, selfie-with-ID, and optional/
 *    required supporting docs — bank passbook, certificate, payslip, 3-month bank statement).
 * 3. That checklist page's upload triggers are plain `<input type="file" accept="image/*">`
 *    elements (no `capture` attribute) — no camera involved, so they can be filled directly.
 */
export class DocumentUploadPage extends BasePage {
  readonly openCameraButton: Locator;
  readonly cameraErrorOkButton: Locator;
  readonly fileInputs: Locator;
  readonly submitButton: Locator;
  // File-input ids double as the backend's document "file_id" values (verified live by
  // intercepting the app's own upload calls: FormData carries `file_id=531` for the input
  // with id="531"). The checklist page itself fetches
  // GET /api/groups/moih/applications/{id}/documents on load, which returns
  // {"documents":[{"file_id":"531","required":true,...}, ...]} — the authoritative source for
  // which slots are required. Capturing it here (registered before navigation, so it's in
  // place before the checklist ever loads) replaces an earlier DOM-climbing approach that
  // parsed each row's "*" label text and mis-attributed labels across rows once the ancestor
  // search overreached past a row's own boundary into a sibling's.
  private readonly requiredFileIds = new Set<string>();

  constructor(page: Page) {
    super(page);
    // Exact match: a broad substring match here can accidentally hit a checklist row's
    // upload button, whose accessible name also contains "ถ่ายรูป" (e.g. "ถ่ายรูปบัตรประชาชน...").
    this.openCameraButton = page.getByRole('button', { name: 'เริ่มถ่ายภาพ', exact: true });
    this.cameraErrorOkButton = page.getByRole('button', { name: 'ตกลง' });
    this.fileInputs = page.locator('input[type="file"]');
    this.submitButton = page.getByRole('button', { name: /ยืนยัน|ส่งข้อมูล|ถัดไป/ });

    page.on('response', async (res) => {
      if (res.request().method() !== 'GET' || !/\/applications\/\d+\/documents$/.test(res.url())) {
        return;
      }
      const json = await res.json().catch(() => null);
      for (const doc of json?.documents ?? []) {
        if (doc?.required) {
          this.requiredFileIds.add(String(doc.file_id));
        }
      }
    });
  }

  /**
   * Clicks the live-camera capture trigger with no camera permission granted and dismisses the
   * resulting error, repeating until the document checklist (file inputs) actually appears.
   * Verified live: this usually takes two attempts (the second error explicitly invites
   * picking a photo instead), but the exact count isn't fully reliable, so this retries up to
   * `maxAttempts` rather than assuming a fixed number.
   */
  async triggerCameraAndExpectDenied(maxAttempts = 5): Promise<void> {
    await this.page.context().clearPermissions();
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      if (await this.fileInputs.count()) {
        return;
      }
      // isVisible() is an instant, non-waiting check — calling it right at the top of the loop
      // can catch the button mid-transition (still rendering after the previous dismiss) and
      // read as false even though it appears a moment later. waitFor() here gives it a real
      // chance instead of bailing out of the whole retry loop on a one-off timing miss.
      const cameraButtonAppeared = await this.openCameraButton
        .waitFor({ state: 'visible', timeout: 5000 })
        .then(() => true)
        .catch(() => false);
      if (!cameraButtonAppeared) {
        break;
      }

      // The button can flicker between visible/detached across a re-render right after it
      // appears (verified live: a click can get stuck retrying against a detaching element
      // for minutes straight, burning the whole test timeout on one click). Bound each click
      // attempt short and fall back to the outer retry loop — which re-waits for a fresh,
      // stable instance of the button — instead of letting one click attempt eat the budget.
      let clicked = false;
      for (let clickTry = 0; clickTry < 3 && !clicked; clickTry++) {
        try {
          await this.openCameraButton.click({ timeout: 5000 });
          clicked = true;
        } catch {
          await this.page.waitForTimeout(500);
        }
      }
      if (!clicked) {
        continue;
      }

      // After clicking, either the blocking camera-error dialog appears (dismiss it and
      // retry) or the app has already moved straight to the document checklist with no
      // dialog at all — clicking cameraErrorOkButton unconditionally in that second case
      // hangs forever waiting for a dialog that was never going to appear.
      const outcome = await Promise.race([
        this.cameraErrorOkButton.waitFor({ state: 'visible', timeout: 10000 }).then(() => 'dialog' as const),
        this.fileInputs.first().waitFor({ state: 'attached', timeout: 10000 }).then(() => 'checklist' as const),
      ]).catch(() => 'neither' as const);

      if (outcome === 'dialog') {
        await this.cameraErrorOkButton.click();
      } else if (outcome === 'checklist') {
        return;
      }
      await this.page.waitForLoadState('networkidle');
    }
    if (!(await this.fileInputs.count())) {
      throw new Error(`Document checklist never appeared after ${maxAttempts} camera-dismiss attempts.`);
    }
  }

  /**
   * Fills only the checklist rows marked required (their label ends in "*") with images from
   * `imagesDir`, skipping the optional supporting-document rows entirely. Verified live: the
   * checklist exposes 8 file inputs — 6 map to visible labeled rows (3 required, 3 optional)
   * and 2 are unlabeled optional "extra document" slots with no row text at all.
   *
   * KNOWN SIT-ENVIRONMENT ISSUE (not fixable from this test): every upload to
   * POST /api/groups/moih/applications/{id}/documents currently returns
   * 422 {"message":"ไฟล์แนบผิดพลาด"} ("attached file invalid"), regardless of file content.
   * Confirmed by direct investigation — ruled out, in order: byte-identical files reused
   * across document-type slots; file corruption (valid PNG signature); file size/dimensions
   * (a trivial ~2KB placeholder fails identically to a 1.4MB real photo); wrong multipart
   * shape (intercepted the app's own `fetch`/XHR calls and confirmed the FormData is exactly
   * `file_id=<slot id>` + `file=<valid image/png File>`, matching what a real browser upload
   * would send); and semantic mismatch (the actual id_card.png sent to the ID-card slot still
   * fails). Since a correctly-shaped request with a genuine ID card photo is rejected
   * identically to a 2KB placeholder, the fault is server-side in this SIT environment, not in
   * how this page constructs the upload. Left as best-effort per QA direction — this method
   * still attempts the uploads and will succeed automatically once the SIT backend is fixed.
   */
  async attachPhotosUntilQuotaReached(imagesDir: string): Promise<number> {
    const files = fs
      .readdirSync(imagesDir)
      .filter((f) => /\.(png|jpe?g)$/i.test(f))
      .map((f) => path.join(imagesDir, f));

    if (files.length === 0) {
      throw new Error(`No images found in ${imagesDir}`);
    }

    await this.fileInputs.first().waitFor({ state: 'attached' });
    // The checklist's file inputs mount progressively; give them a moment to settle so
    // `count()` reflects the full set instead of only the first one or two rendered so far.
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(1000);

    // The documents-list response the checklist page fetches on load should have already
    // arrived by now; a short extra wait covers the rare case it's still in flight.
    if (this.requiredFileIds.size === 0) {
      await this.page.waitForTimeout(1000);
    }

    const inputIds = await this.fileInputs.evaluateAll((inputs) =>
      inputs.map((el) => (el as HTMLInputElement).id)
    );

    let filled = 0;
    for (let i = 0; i < inputIds.length; i++) {
      if (!this.requiredFileIds.has(inputIds[i])) continue;
      const file = files[filled % files.length];
      await this.fileInputs.nth(i).setInputFiles(file);
      filled++;
      // Each selection kicks off an async upload to the server; the "ถัดไป" button only
      // enables once it completes, so let the network settle before moving to the next one.
      await this.page.waitForLoadState('networkidle');
    }
    await this.waitUntilReadyToSubmit();
    return filled;
  }

  /**
   * Polls the submit button instead of a fixed wait, since the checklist's async per-file
   * uploads (verified live: identical placeholder thumbnails appear immediately regardless of
   * upload state, so that's not a usable signal) take a variable amount of time to register.
   */
  private async waitUntilReadyToSubmit(timeout = 30000): Promise<void> {
    const deadline = Date.now() + timeout;
    while (Date.now() < deadline) {
      if (await this.submitButton.isEnabled()) {
        return;
      }
      await this.page.waitForTimeout(500);
    }
    throw new Error(
      'Document checklist "ถัดไป" button never became enabled — a required upload likely failed to register.'
    );
  }

  async submit(): Promise<void> {
    await this.submitButton.click();
  }
}
