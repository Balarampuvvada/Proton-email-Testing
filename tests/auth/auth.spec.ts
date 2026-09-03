import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';
import { testData, hasAccountData } from '../../fixtures/test-data';

test.describe('authentication', () => {
  test.beforeEach(() => test.skip(!hasAccountData(), 'Enter Proton account values in .env.'));

  test('AUTH-01 valid login reaches the mailbox', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.loginAndGoToMail(testData.senderEmail, testData.senderPassword);
    await expect(page).toHaveURL(/mail\.proton\.me/);
  });

  test('AUTH-02 invalid password is rejected', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.login(testData.senderEmail, `${testData.senderPassword}-invalid`);

    await expect(page).not.toHaveURL(/account\.proton\.me\/apps/);
    await expect(page.getByText('The password is not correct. Please try again with a different password.')).toBeVisible();
  });

  test('AUTH-03 session persists after reload', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.loginAndGoToMail(testData.senderEmail, testData.senderPassword);
    await page.reload();
    await expect(page).toHaveURL(/mail\.proton\.me/);
  });
});
