import { expect, test } from '@playwright/test';
import { ComposePage } from '../../pages/compose-page';
import { DraftsPage } from '../../pages/drafts-page';
import { LoginPage } from '../../pages/login-page';
import { testData, hasAccountData, hasReceiverAccountData } from '../../fixtures/test-data';

test.describe('Drafts', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!hasAccountData(), 'Enter Proton account values in .env.');
    const login = new LoginPage(page);
    await login.open();
    await login.loginAndGoToMail(testData.senderEmail, testData.senderPassword);
  });

  test('DFT-01 draft autosaves and persists after reopening', async ({ page }) => {
    const compose = new ComposePage(page);
    const drafts = new DraftsPage(page);
    const subject = testData.subject('DRAFT autosave');

    await compose.open();
    await compose.subjectInput.fill(subject);
    await compose.editor.fill('This draft should persist after closing.');
    await compose.closeAndSaveDraft();

    await drafts.open();
    await drafts.expectDraftVisible(subject);
    await drafts.openDraft(subject);
    await expect(compose.subjectInput).toHaveValue(subject);
  });

  test('DFT-02 draft can be discarded and no longer appears in Drafts', async ({ page }) => {
    const compose = new ComposePage(page);
    const drafts = new DraftsPage(page);
    const subject = testData.subject('DRAFT discard');

    await compose.open();
    await compose.subjectInput.fill(subject);
    await compose.closeAndSaveDraft();
    await drafts.open();
    await drafts.expectDraftVisible(subject);
    await drafts.openDraft(subject);
    await compose.discardDraft();
    await drafts.expectDraftAbsent(subject);
  });

  test('DFT-03 draft transitions to Sent when sent', async ({ page }) => {
    test.skip(!hasReceiverAccountData(), 'Enter sender and receiver values in .env.');
    const compose = new ComposePage(page);
    const drafts = new DraftsPage(page);
    const subject = testData.subject('DRAFT to sent');

    await compose.open();
    await compose.fillRecipient(testData.receiverEmail);
    await compose.subjectInput.fill(subject);
    await compose.closeAndSaveDraft();
    await drafts.open();
    await drafts.expectDraftVisible(subject);
    await drafts.openDraft(subject);
    await compose.send();
    await drafts.expectDraftAbsent(subject);
  });
});
