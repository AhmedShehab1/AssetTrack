// playwright.config.js
import { defineConfig, devices } from '@playwright/test';
import process from 'process';

export default defineConfig({
  testDir: './src/e2e/tests',
  timeout: 30_000,
  retries: 1,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // ── Auth setup (must run first) ──────────────────────────────────────
    {
      name: 'admin-setup',
      testMatch: '**/setup/admin.setup.js',
    },
    {
      name: 'developer-setup',
      testMatch: '**/setup/developer.setup.js',
    },

    // ── Admin tests ──────────────────────────────────────────────────────
    {
      name: 'admin-chrome',
      testMatch: '**/tests/admin/**/*.spec.js',
      dependencies: ['admin-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
    },

    // ── Developer (RBAC) tests ───────────────────────────────────────────
    {
      name: 'developer-chrome',
      testMatch: '**/tests/developer/**/*.spec.js',
      dependencies: ['developer-setup'],
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/developer.json',
      },
    },
  ],
});