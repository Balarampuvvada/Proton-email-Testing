import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login-page';
import { SearchPage } from '../../pages/search-page';
import { testData, hasAccountData } from '../../fixtures/test-data';

test.describe('Search', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasAccountData(), 'Enter Proton account values in .env.');
    const login = new LoginPage(page);
    await login.open();
    await login.loginAndGoToMail(testData.senderEmail, testData.senderPassword);
  });

  test('SRC-01 finds known messages by keyword', async ({ page }) => {
    const search = new SearchPage(page);
    await search.searchKeyword('QA');
    await expect(page.getByRole('main')).toContainText('QA', { timeout: 15000 });
  });

  test('SRC-02 shows an empty state when no messages match', async ({ page }) => {
    const search = new SearchPage(page);
    await search.searchKeyword('zzz-nonexistent-subject-9999xyz');
    await search.expectNoResults();
  });

  test('SRC-03 narrows results with advanced keyword and sender search', async ({ page }) => {
    const search = new SearchPage(page);
    await search.searchAdvanced({
      keyword: 'QA',
      sender: testData.senderEmail
    });
    await expect(page.getByRole('main')).toContainText('QA', { timeout: 15000 });
  });
});
