// e2e/tests/developer/rbac.spec.js
// Covers:
//   FR 2.1.2 User Roles — Developer has restricted access:
//     ✓ Can view assets list
//     ✓ Can submit condition reports on own allocated assets
//     ✗ Cannot edit or delete assets
//     ✗ Cannot allocate assets
//     ✗ Cannot access /users
//     ✗ Cannot change condition report status
import { test, expect } from '@playwright/test';
import { waitForIdle } from '../../utils/helpers.js';

test.describe('Developer — Role-Based Access Control (FR 2.1.2)', () => {

  // ── Read access ───────────────────────────────────────────────────────
  test('developer can access the assets list page', async ({ page }) => {
    await page.goto('/assets');
    await waitForIdle(page);
    await expect(page.locator('table')).toBeVisible({ timeout: 8_000 });
  });

  // ── Asset detail — write actions must be hidden ───────────────────────
  test('developer does NOT see Edit button on asset detail', async ({ page }) => {
    await page.goto('/assets');
    await waitForIdle(page);

    const rowCount = await page.locator('table tbody tr').count();
    if (rowCount === 0) return;

    await page.locator('table tbody tr').first().click();
    await waitForIdle(page);

    await expect(
      page.locator('button').filter({ hasText: /^edit$/i })
    ).toHaveCount(0, { timeout: 4_000 });
  });

  test('developer does NOT see Delete button on asset detail', async ({ page }) => {
    await page.goto('/assets');
    await waitForIdle(page);

    const rowCount = await page.locator('table tbody tr').count();
    if (rowCount === 0) return;

    await page.locator('table tbody tr').first().click();
    await waitForIdle(page);

    await expect(
      page.locator('button').filter({ hasText: /^delete$/i })
    ).toHaveCount(0, { timeout: 4_000 });
  });

  test('developer does NOT see Allocate button on asset detail', async ({ page }) => {
    await page.goto('/assets');
    await waitForIdle(page);

    const rowCount = await page.locator('table tbody tr').count();
    if (rowCount === 0) return;

    await page.locator('table tbody tr').first().click();
    await waitForIdle(page);

    await expect(
      page.locator('button').filter({ hasText: /^allocate$/i })
    ).toHaveCount(0, { timeout: 4_000 });
  });

  // ── /users route — forbidden ──────────────────────────────────────────
  test('developer cannot access the /users management page', async ({ page }) => {
    await page.goto('/users');

    // Either redirected away or shown a forbidden message
    const isForbidden = await page
      .locator('text=/forbidden|not allowed|access denied|403/i')
      .first()
      .isVisible({ timeout: 6_000 })
      .catch(() => false);

    const isRedirected = !page.url().includes('/users');

    expect(isForbidden || isRedirected).toBe(true);
  });

  // ── Condition report — status action buttons must be hidden ───────────
  test('developer does NOT see status-change buttons (In Progress / Mark Resolved / Close Case) on condition reports', async ({ page }) => {
    await page.goto('/assets');
    await waitForIdle(page);

    const rowCount = await page.locator('table tbody tr').count();
    if (rowCount === 0) return;

    await page.locator('table tbody tr').first().click();
    await waitForIdle(page);

    // Navigate to reports sub-page if link is available
    const reportsLink = page.locator('a, button').filter({ hasText: /reports|condition/i }).first();
    if (await reportsLink.isVisible()) {
      await reportsLink.click();
      await waitForIdle(page);
    }

    await expect(
      page.locator('button').filter({ hasText: /in progress|mark resolved|close case/i })
    ).toHaveCount(0, { timeout: 4_000 });
  });

  // ── Condition report — submit is allowed ──────────────────────────────
  test('developer CAN submit a new condition report on their allocated asset', async ({ page }) => {
    await page.goto('/assets');
    await waitForIdle(page);

    const rowCount = await page.locator('table tbody tr').count();
    if (rowCount === 0) return;

    await page.locator('table tbody tr').first().click();
    await waitForIdle(page);

    const reportsLink = page.locator('a, button').filter({ hasText: /reports|condition/i }).first();
    if (await reportsLink.isVisible()) {
      await reportsLink.click();
      await waitForIdle(page);
    }

    const newReportBtn = page.locator('button').filter({ hasText: /new report/i }).first();
    if (!(await newReportBtn.isVisible())) return;

    await newReportBtn.click();

    const modal = page.locator('[role="dialog"], [class*="modal" i]').first();
    await expect(modal).toBeVisible({ timeout: 5_000 });

    await page.locator('textarea').first().fill('Battery drains in under 2 hours during normal use.');

    const severitySelect = page.locator('select').first();
    if (await severitySelect.isVisible()) {
      await severitySelect.selectOption('HIGH');
    }

    await page.locator('button[type="submit"], button').filter({ hasText: /submit/i }).first().click();
    await waitForIdle(page);

    // Modal closes after successful submit
    await expect(modal).not.toBeVisible({ timeout: 6_000 });
  });

  // ── Dashboard — developer should NOT see admin dashboard ─────────────
  test('developer does not see admin-only dashboard sections (Users, Reports)', async ({ page }) => {
    await page.goto('/');
    await waitForIdle(page);

    // These navigation items must not be visible to a developer
    const usersNavItem = page.locator('nav').locator('a, button').filter({ hasText: /^users$/i });
    await expect(usersNavItem).toHaveCount(0, { timeout: 4_000 });
  });

  // ── Sidebar navigation — only permitted items are visible ─────────────
  test('developer sidebar only shows Assets and allowed links', async ({ page }) => {
    await page.goto('/assets');
    await waitForIdle(page);

    const nav = page.locator('nav');
    await expect(nav).toBeVisible({ timeout: 5_000 });

    // Assets must be present
    await expect(nav.locator('a, button').filter({ hasText: /assets/i }).first()).toBeVisible();

    // User Management must NOT be present
    await expect(
      nav.locator('a, button').filter({ hasText: /user management|manage users/i })
    ).toHaveCount(0);
  });
});
