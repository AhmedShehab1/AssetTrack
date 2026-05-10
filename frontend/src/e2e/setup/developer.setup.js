// e2e/setup/developer.setup.js
import { test as setup, expect } from '@playwright/test';
import { DEVELOPER, STORAGE } from '../utils/credentials.js';

setup('authenticate as developer', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/email/i).fill(DEVELOPER.email);
  await page.getByLabel(/password/i).fill(DEVELOPER.password);
  await page.getByRole('button', { name: /log in|sign in/i }).click();

  await expect(page).not.toHaveURL(/login/, { timeout: 10_000 });

  await page.context().storageState({ path: STORAGE.developer });
});
