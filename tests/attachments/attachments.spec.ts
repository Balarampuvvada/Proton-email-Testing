import path from 'node:path';
import { test, expect } from '@playwright/test';
import { ComposePage } from '../../pages/compose-page';
import { InboxPage } from '../../pages/inbox-page';
import { LoginPage } from '../../pages/login-page';
import { testData, hasReceiverAccountData } from '../../fixtures/test-data';

test.describe('Attachments', () => {
  test('ATT-01 attaches, removes, resends, and verifies a received attachment', async ({ browser }) => {
    test.setTimeout(120000);
    test.skip(!hasReceiverAccountData(), 'Enter sender and receiver values in .env.');

    const subject = testData.subject('attach-send-receive');
    const fileName = 'sample-attachment.txt';
    const filePath = path.resolve(__dirname, '../../fixtures', fileName);
    const senderContext = await browser.newContext();

    try {
      const senderPage = await senderContext.newPage();
      const senderLogin = new LoginPage(senderPage);
      const compose = new ComposePage(senderPage);

      await senderLogin.open();
      await senderLogin.loginAndGoToMail(testData.senderEmail, testData.senderPassword);
      await compose.open();
      await compose.fillRecipient(testData.receiverEmail);
      await compose.subjectInput.fill(subject);

      await compose.attachFile(filePath);
      await compose.expectAttachmentVisible(fileName);
      await compose.removeAttachment(fileName);
      await expect(senderPage.getByTestId(`attachment-item:${fileName}--primary-action`)).toHaveCount(0);

      await compose.attachFile(filePath);
      await compose.expectAttachmentVisible(fileName);
      await compose.send();

      const receiverContext = await browser.newContext();
      try {
        const receiverPage = await receiverContext.newPage();
        const receiverLogin = new LoginPage(receiverPage);
        const inbox = new InboxPage(receiverPage);

        await receiverLogin.open();
        await receiverLogin.loginAndGoToMail(testData.receiverEmail, testData.receiverPassword);
        await inbox.expectMessageVisible(subject);
        await inbox.message(subject).click();
        await expect(receiverPage.getByTestId('file-preview:file-name').first()).toHaveText(fileName, { timeout: 15000 });
      } finally {
        await receiverContext.close();
      }
    } finally {
      await senderContext.close();
    }
  });
});
