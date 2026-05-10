// e2e/tests/admin/conditionReports.spec.js
// Covers:
//   FR 2.3.2 Asset Condition Reporting — submit, list, status progression
//   FR 2.2.3 Expiration Tracking — suggested actions visible
//   FR 2.4.2 Usage Statistics — condition reports visible to admin/manager
import { test, expect } from '@playwright/test';
import { waitForIdle } from '../../utils/helpers.js';

// ── Helper: navigate to the global condition-reports list and click View ───
async function gotoFirstAssetReportPage(page) {
  await page.goto('/condition-reports');
  await waitForIdle(page);
  const rowCount = await page.locator('table tbody tr').count();
  if (rowCount === 0) return false;
  await page.locator('button').filter({ hasText: /view/i }).first().click();
  await waitForIdle(page);
  return true;
}

// ════════════════════════════════════════════════════════════════════════════
// Global Condition Reports List (FR 2.3.2, 2.4.2)
// ════════════════════════════════════════════════════════════════════════════
test.describe('Condition Reports — Global List (FR 2.3.2, 2.4.2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/condition-reports');
    await waitForIdle(page);
  });

  test('global condition-reports page loads a table', async ({ page }) => {
    await expect(page.locator('table')).toBeVisible({ timeout: 8_000 });
  });

  test('severity badges (CRITICAL, HIGH, MEDIUM, LOW) appear in the list', async ({ page }) => {
    const rowCount = await page.locator('table tbody tr').count();
    if (rowCount > 0) {
      await expect(
        page.locator('text=/CRITICAL|HIGH|MEDIUM|LOW/i').first()
      ).toBeVisible({ timeout: 6_000 });
    }
  });

  test('View button navigates to the asset-specific reports page', async ({ page }) => {
    const rowCount = await page.locator('table tbody tr').count();
    if (rowCount > 0) {
      await page.locator('button').filter({ hasText: /view/i }).first().click();
      await expect(page).toHaveURL(/\/assets\/.+\/reports/, { timeout: 8_000 });
    }
  });

  test('reports table shows description and reporter columns', async ({ page }) => {
    const header = page.locator('table thead');
    await expect(header).toBeVisible();
    const headerText = await header.innerText();
    expect(headerText).toMatch(/description|severity|status|reported/i);
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Asset-Level Reports — Status Progression (FR 2.3.2)
// ════════════════════════════════════════════════════════════════════════════
test.describe('Condition Reports — Status Progression (FR 2.3.2)', () => {

  test('report cards render description and severity on the asset reports page', async ({ page }) => {
    const hasReports = await gotoFirstAssetReportPage(page);
    if (!hasReports) return;

    await expect(
      page.locator('[class*="card"], [class*="Card"]').first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('In Progress button advances an OPEN report to IN_PROGRESS', async ({ page }) => {
    const hasReports = await gotoFirstAssetReportPage(page);
    if (!hasReports) return;

    const btn = page.locator('button').filter({ hasText: /in progress/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await waitForIdle(page);
      await expect(page.locator('text=/IN_PROGRESS/i').first()).toBeVisible({ timeout: 6_000 });
    }
  });

  test('Mark Resolved button resolves a report immediately without a modal', async ({ page }) => {
    const hasReports = await gotoFirstAssetReportPage(page);
    if (!hasReports) return;

    const btn = page.locator('button').filter({ hasText: /mark resolved/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await waitForIdle(page);

      // Must NOT open a modal — resolves inline
      await expect(page.locator('[role="dialog"]')).toHaveCount(0, { timeout: 3_000 });
      await expect(page.locator('text=/RESOLVED/i').first()).toBeVisible({ timeout: 6_000 });
    }
  });

  test('Close Case button closes a RESOLVED report', async ({ page }) => {
    const hasReports = await gotoFirstAssetReportPage(page);
    if (!hasReports) return;

    const btn = page.locator('button').filter({ hasText: /close case/i }).first();
    if (await btn.isVisible()) {
      await btn.click();
      await waitForIdle(page);
      await expect(page.locator('text=/CLOSED/i').first()).toBeVisible({ timeout: 6_000 });
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
// New Report Modal (FR 2.3.2)
// ════════════════════════════════════════════════════════════════════════════
test.describe('Condition Reports — New Report Modal (FR 2.3.2)', () => {

  test('New Report modal opens from the asset reports page', async ({ page }) => {
    const hasReports = await gotoFirstAssetReportPage(page);
    if (!hasReports) {
      await page.goto('/assets');
      await waitForIdle(page);
      const rows = await page.locator('table tbody tr').count();
      if (rows === 0) return;
      await page.locator('table tbody tr').first().click();
      await waitForIdle(page);
    }

    const newReportBtn = page.locator('button').filter({ hasText: /new report/i }).first();
    if (await newReportBtn.isVisible()) {
      await newReportBtn.click();
      const modal = page.locator('[role="dialog"], [class*="modal"]').first();
      await expect(modal).toBeVisible({ timeout: 5_000 });
    }
  });

  test('New Report modal contains a description textarea and severity selector', async ({ page }) => {
    const hasReports = await gotoFirstAssetReportPage(page);
    if (!hasReports) return;

    const newReportBtn = page.locator('button').filter({ hasText: /new report/i }).first();
    if (!(await newReportBtn.isVisible())) return;
    await newReportBtn.click();

    const modal = page.locator('[role="dialog"], [class*="modal"]').first();
    await expect(modal).toBeVisible({ timeout: 5_000 });
    await expect(modal.locator('textarea').first()).toBeVisible();
    // Severity field: select or radio
    const severityField = modal.locator('select, input[type="radio"]').first();
    await expect(severityField).toBeVisible();
  });

  test('New Report modal can be cancelled', async ({ page }) => {
    const hasReports = await gotoFirstAssetReportPage(page);
    if (!hasReports) return;

    const newReportBtn = page.locator('button').filter({ hasText: /new report/i }).first();
    if (!(await newReportBtn.isVisible())) return;
    await newReportBtn.click();

    const modal = page.locator('[role="dialog"], [class*="modal"]').first();
    await expect(modal).toBeVisible({ timeout: 5_000 });
    await page.locator('button').filter({ hasText: /cancel/i }).first().click();
    await expect(modal).not.toBeVisible({ timeout: 5_000 });
  });

  test('submitting a valid new report closes the modal (admin)', async ({ page }) => {
    const hasReports = await gotoFirstAssetReportPage(page);
    if (!hasReports) return;

    const newReportBtn = page.locator('button').filter({ hasText: /new report/i }).first();
    if (!(await newReportBtn.isVisible())) return;
    await newReportBtn.click();

    const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
    await expect(modal).toBeVisible({ timeout: 5_000 });

    await page.locator('textarea').first().fill('Screen flickering occasionally during video calls.');

    const severitySelect = page.locator('select').first();
    if (await severitySelect.isVisible()) {
      await severitySelect.selectOption('HIGH');
    }

    await page.locator('button[type="submit"], button').filter({ hasText: /submit/i }).first().click();
    await waitForIdle(page);

    await expect(modal).not.toBeVisible({ timeout: 6_000 });
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Suggested Actions on Expired Assets (FR 2.2.3)
// ════════════════════════════════════════════════════════════════════════════
test.describe('Expiring Warranties — Suggested Actions (FR 2.2.3)', () => {
  test('expiring-warranties dashboard section shows suggested actions', async ({ page }) => {
    await page.goto('/');
    await waitForIdle(page);

    // If there is a dedicated route for expiring warranties
    const warrantyLink = page.locator('a, button').filter({ hasText: /expir|warranty/i }).first();
    if (await warrantyLink.isVisible()) {
      await warrantyLink.click();
      await waitForIdle(page);
    }

    const suggestion = page.locator(
      'text=/reassign|decommission|renew|review/i'
    ).first();
    const count = await suggestion.count();
    // Only assert if the section has data
    if (count > 0) {
      await expect(suggestion).toBeVisible();
    }
  });
});
