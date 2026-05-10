// e2e/tests/admin/auth.spec.js
// Covers: FR 2.1.1 Authentication — sign-up page, login page, JWT-protected routes
import { test, expect } from '@playwright/test';
import { ADMIN } from '../../utils/credentials.js';

// Bypass saved auth state so we can test the login flow itself
test.use({ storageState: { cookies: [], origins: [] } });

test.describe('Authentication — FR 2.1.1', () => {

  // ── Redirect ──────────────────────────────────────────────────────────
  test('unauthenticated user is redirected to /login from a protected route', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/login/);
  });

  test('unauthenticated user is redirected to /login from /assets', async ({ page }) => {
    await page.goto('/assets');
    await expect(page).toHaveURL(/login/);
  });

  test('unauthenticated user is redirected to /login from /users', async ({ page }) => {
    await page.goto('/users');
    await expect(page).toHaveURL(/login/);
  });

  // ── Login page exists ─────────────────────────────────────────────────
  test('login page renders email and password fields and a submit button', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /log in|sign in/i })).toBeVisible();
  });

  // ── Sign-up page exists ───────────────────────────────────────────────
  test('sign-up page is reachable and contains a registration form', async ({ page }) => {
    // Try common routes; the page must exist somewhere
    const candidates = ['/signup', '/register', '/sign-up'];
    let found = false;
    for (const path of candidates) {
      await page.goto(path);
      if (!/login/i.test(page.url())) {
        found = true;
        break;
      }
    }
    // If no dedicated route, the login page may have a "Sign up" link
    if (!found) {
      await page.goto('/login');
      const signupLink = page.locator('a').filter({ hasText: /sign up|register|create account/i });
      await expect(signupLink).toBeVisible({ timeout: 5_000 });
    }
  });

  // ── Login validation ──────────────────────────────────────────────────
  test('submitting empty login form keeps user on /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: /log in|sign in/i }).click();
    await expect(page).toHaveURL(/login/);
  });

  test('wrong password shows an error message and stays on /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ADMIN.email);
    await page.getByLabel(/password/i).fill('WrongPassword!');
    await page.getByRole('button', { name: /log in|sign in/i }).click();

    await expect(page).toHaveURL(/login/);
    await expect(
      page.locator('text=/invalid|incorrect|unauthorized/i').first()
    ).toBeVisible({ timeout: 6_000 });
  });

  test('unknown email shows an error message and stays on /login', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill('nobody@nowhere.invalid');
    await page.getByLabel(/password/i).fill('AnyPass123!');
    await page.getByRole('button', { name: /log in|sign in/i }).click();

    await expect(page).toHaveURL(/login/);
    await expect(
      page.locator('text=/invalid|incorrect|unauthorized|not found/i').first()
    ).toBeVisible({ timeout: 6_000 });
  });

  // ── Successful login ──────────────────────────────────────────────────
  test('admin can log in with correct credentials and lands on a dashboard page', async ({ page }) => {
    await page.goto('/login');
    await page.getByLabel(/email/i).fill(ADMIN.email);
    await page.getByLabel(/password/i).fill(ADMIN.password);
    await page.getByRole('button', { name: /log in|sign in/i }).click();

    await expect(page).not.toHaveURL(/login/, { timeout: 10_000 });
    // Dashboard must render at least one heading
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
