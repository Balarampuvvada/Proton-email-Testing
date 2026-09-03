import { test, expect } from '@playwright/test';

test('Proton public site is reachable', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Proton/i);
});