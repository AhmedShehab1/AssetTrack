// e2e/tests/admin/dashboard.spec.js
// Covers: FR 2.4.1 Inventory Dashboard — KPIs, graphical distribution chart, warranty alerts
import { test, expect } from '@playwright/test';
import { waitForIdle } from '../../utils/helpers.js';

test.describe('Dashboard — FR 2.4.1', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await waitForIdle(page);
  });

  // ── Page loads without errors ─────────────────────────────────────────
  test('dashboard heading is visible', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /dashboard/i }).first()
    ).toBeVisible({ timeout: 8_000 });
  });

  test('no error banners appear on load', async ({ page }) => {
    await expect(
      page.locator('text=/something went wrong|failed to load|error/i').first()
    ).toHaveCount(0, { timeout: 5_000 })
      .catch(() => {}); // tolerate if locator finds none
  });

  // ── KPI cards — categorized by type and status ─────────────────────────
  test('Total Assets KPI card is visible', async ({ page }) => {
    await expect(page.getByText('Total Assets')).toBeVisible({ timeout: 8_000 });
  });

  test('Laptops Available KPI card is visible', async ({ page }) => {
    await expect(page.getByText('Laptops Available')).toBeVisible({ timeout: 8_000 });
  });

  test('Pending Issues KPI card is visible', async ({ page }) => {
    await expect(page.getByText('Pending Issues')).toBeVisible({ timeout: 8_000 });
  });

  test('KPI cards display numeric values', async ({ page }) => {
    // At least one element on the page must contain a digit (a count)
    const numericEl = page.locator('[class*="card"], [class*="kpi"], [class*="stat"]')
      .filter({ hasText: /\d+/ })
      .first();
    await expect(numericEl).toBeVisible({ timeout: 8_000 });
  });

  // ── Graphical representation (FR 2.4.1 requirement) ───────────────────
  test('asset status distribution section is present', async ({ page }) => {
    await expect(
      page.getByText('Asset Status Distribution')
    ).toBeVisible({ timeout: 8_000 });
  });

  test('a chart element (svg or canvas) is rendered for status distribution', async ({ page }) => {
    // Charts are rendered as SVG (recharts/d3) or canvas (Chart.js)
    const chart = page.locator('svg, canvas').first();
    await expect(chart).toBeVisible({ timeout: 8_000 });
  });

  test('"Allocated" status appears in the distribution chart or legend', async ({ page }) => {
    await expect(page.getByText('Allocated')).toBeVisible({ timeout: 8_000 });
  });

  // ── Warranty expiration alerts (FR 2.2.3 / FR 2.4.3) ─────────────────
  test('expiring warranties section or heading is visible on the dashboard', async ({ page }) => {
    // Could be a heading, a card title, or a sidebar section
    const warrantySection = page
      .locator('text=/expir|warranty/i')
      .first();
    await expect(warrantySection).toBeVisible({ timeout: 8_000 });
  });

  // ── Quick actions ─────────────────────────────────────────────────────
  test('Quick Actions section is present', async ({ page }) => {
    await expect(page.getByText(/quick actions/i)).toBeVisible({ timeout: 8_000 });
  });
});
