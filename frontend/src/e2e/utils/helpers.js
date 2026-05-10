// e2e/utils/helpers.js

/**
 * Wait for network to go quiet after an action that triggers API calls.
 */
export async function waitForIdle(page, timeout = 5_000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Assert a toast / alert message containing the given text appears.
 */
export async function expectToast(page, text) {
  await page
    .locator('[role="alert"], [class*="toast"], [class*="alert"]')
    .filter({ hasText: text })
    .first()
    .waitFor({ state: 'visible', timeout: 6_000 });
}

/**
 * Dismiss any open modal by clicking the backdrop or close button.
 */
export async function closeModal(page) {
  const closeBtn = page
    .locator('button[aria-label="Close"], button:has-text("Cancel")')
    .first();
  if (await closeBtn.isVisible()) await closeBtn.click();
}
