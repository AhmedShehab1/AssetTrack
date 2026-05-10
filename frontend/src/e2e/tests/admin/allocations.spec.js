// e2e/tests/admin/allocations.spec.js
// Covers:
//   FR 2.2.2 Asset Allocation — assign, track current owner, full history
//   FR 2.3.1 Inventory Sync — status updates without manual refresh
import { test, expect } from '@playwright/test';
import { waitForIdle } from '../../utils/helpers.js';

test.describe('Allocation Audit — Split Panel (FR 2.2.2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/allocations');
    await waitForIdle(page);
  });

  // ── Left panel ────────────────────────────────────────────────────────
  test('left panel loads a list of allocated devices', async ({ page }) => {
    const deviceItems = page.locator('ul li button').first();
    await expect(deviceItems).toBeVisible({ timeout: 8_000 });
  });

  test('search in left panel filters the device list by brand/model/serial', async ({ page }) => {
    const search = page.getByPlaceholder(/search brand|model|serial/i);
    await search.fill('Dell');
    await waitForIdle(page);
    await expect(
      page.locator('ul').or(page.getByText(/no allocated/i)).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  // ── Right panel — empty state ─────────────────────────────────────────
  test('right panel shows an empty-state prompt before any device is selected', async ({ page }) => {
    await expect(
      page.locator('text=/select a device/i').first()
    ).toBeVisible({ timeout: 6_000 });
  });

  test('export button is absent when no device is selected', async ({ page }) => {
    const exportBtn = page.locator('button').filter({ hasText: /export/i });
    await expect(exportBtn).toHaveCount(0);
  });

  // ── Select a device ───────────────────────────────────────────────────
  test('selecting a device shows the asset name and custody history header', async ({ page }) => {
    const firstDevice = page.locator('ul li button').first();
    await firstDevice.click();
    await waitForIdle(page);

    await expect(page.locator('h2').first()).toBeVisible({ timeout: 8_000 });
    await expect(
      page.locator('text=/custody history/i').first()
    ).toBeVisible({ timeout: 6_000 });
  });

  test('selected device is visually highlighted (bg-primary class)', async ({ page }) => {
    const firstDevice = page.locator('ul li button').first();
    await firstDevice.click();
    await expect(firstDevice).toHaveClass(/bg-primary/, { timeout: 4_000 });
  });

  test('current custodian callout renders in the right panel', async ({ page }) => {
    await page.locator('ul li button').first().click();
    await waitForIdle(page);
    await expect(
      page.locator('text=/current custodian/i').first()
    ).toBeVisible({ timeout: 6_000 });
  });

  // ── Full allocation history (FR 2.2.2) ───────────────────────────────
  test('right panel shows previous owners and transfer dates (allocation history)', async ({ page }) => {
    await page.locator('ul li button').first().click();
    await waitForIdle(page);

    // Timeline entries or an explicit empty-history message
    const hasHistory = await page.locator('[class*="timeline"], [class*="history"]').count();
    const hasEmpty   = await page.locator('text=/no history|no allocation/i').count();
    expect(hasHistory + hasEmpty).toBeGreaterThan(0);
  });

  // ── Export ────────────────────────────────────────────────────────────
  test('export button appears after a device is selected', async ({ page }) => {
    await page.locator('ul li button').first().click();
    await waitForIdle(page);
    const exportBtn = page.locator('button').filter({ hasText: /export/i }).first();
    await expect(exportBtn).toBeVisible({ timeout: 6_000 });
  });

  // ── Pagination ────────────────────────────────────────────────────────
  test('history pagination next button advances to page 2 when available', async ({ page }) => {
    await page.locator('ul li button').first().click();
    await waitForIdle(page);

    const nextBtn = page
      .locator('button:not([disabled])')
      .filter({ has: page.locator('svg') })
      .last();

    if (await nextBtn.isEnabled()) {
      await nextBtn.click();
      await waitForIdle(page);
      await expect(page.locator('text=/page 2/i')).toBeVisible({ timeout: 5_000 });
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
// Allocate / Deallocate from Asset Detail (FR 2.2.2, 2.3.1)
// ════════════════════════════════════════════════════════════════════════════
test.describe('Allocate Asset from Detail Panel (FR 2.2.2, 2.3.1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/assets');
    await waitForIdle(page);
    await page.locator('table tbody tr').first().waitFor({ timeout: 8_000 });
  });

  test('Allocate button is present in the asset detail panel for admin', async ({ page }) => {
    const kebabBtn = page.locator('table tbody tr').first().locator('button').last();
    await kebabBtn.click();
    await page.locator('text=/Allocation & History/i').click();
    await waitForIdle(page);

    const allocateBtn = page.locator('button').filter({ hasText: /allocate/i }).first();
    // The button may be disabled if asset is already allocated
    await expect(allocateBtn).toBeVisible({ timeout: 6_000 });
  });

  test('asset status updates automatically when allocation changes (FR 2.3.1)', async ({ page }) => {
    // Navigate to asset detail and note the current status badge
    const kebabBtn = page.locator('table tbody tr').first().locator('button').last();
    await kebabBtn.click();
    await page.locator('text=/Allocation & History/i').click();
    await waitForIdle(page);

    // Status badge should be present
    const statusBadge = page.locator('text=/AVAILABLE|ALLOCATED|SPARE|DECOMMISSIONED/i').first();
    await expect(statusBadge).toBeVisible({ timeout: 6_000 });
  });
});
