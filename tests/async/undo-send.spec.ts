import { test } from '@playwright/test';
import { testData, hasAccountData } from '../../fixtures/test-data';

test('ASY-01 Undo Send cancels a recently sent message', async ({ page }) => {
  test.skip(!hasAccountData(), 'Enter Proton account values in .env.');
  test.fixme(true, 'Complete after manual exploration confirms the Undo Send notification locator.');
  await page.goto('/u/0/inbox');
  await page.getByText(testData.subject('undo-send')).waitFor();
});
