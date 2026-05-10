// e2e/setup/admin.setup.js
import { test as setup, expect } from '@playwright/test';
import { ADMIN, STORAGE } from '../utils/credentials.js';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel(/email/i).fill(ADMIN.email);
  await page.getByLabel(/password/i).fill(ADMIN.password);
  await page.getByRole('button', { name: /log in|sign in/i }).click();

  await expect(page).not.toHaveURL(/login/, { timeout: 10_000 });

  await page.context().storageState({ path: STORAGE.admin });
});
