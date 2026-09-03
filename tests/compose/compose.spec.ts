import { test, expect } from '@playwright/test';
import { ComposePage } from '../../pages/compose-page';
import { LoginPage } from '../../pages/login-page';
import { InboxPage } from '../../pages/inbox-page';
import { testData, hasAccountData, hasReceiverAccountData } from '../../fixtures/test-data';

test.describe('compose and send', () => {
  test.beforeEach(() => test.skip(!hasAccountData(), 'Enter Proton account values in .env.'));

  test('CMP-01 sends a message and verifies receiver inbox', async ({ page, browser }) => {
    test.setTimeout(60000);
    test.skip(!hasReceiverAccountData(), 'Enter sender and receiver values in .env.');
    const login = new LoginPage(page);
    await login.open();
    await login.loginAndGoToMail(testData.senderEmail, testData.senderPassword);

    const subject = testData.subject('compose');
    const compose = new ComposePage(page);
    await compose.open();
    await compose.fillMessage(testData.receiverEmail, subject, testData.body(subject));
    await compose.send();

    const receiverContext = await browser.newContext();
    try {
      const receiverPage = await receiverContext.newPage();
      const receiverLogin = new LoginPage(receiverPage);
      await receiverLogin.open();
      await receiverLogin.loginAndGoToMail(testData.receiverEmail, testData.receiverPassword);

      const receiverInbox = new InboxPage(receiverPage);
      await receiverInbox.expectLoaded();
      await receiverInbox.expectMessage(subject);
    } finally {
      await receiverContext.close();
    }
  });

  test('CMP-02 requires a recipient before sending', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.loginAndGoToMail(testData.senderEmail, testData.senderPassword);

    const compose = new ComposePage(page);
    await compose.open();
    await compose.send();
    await compose.expectRecipientValidation();
  });

  test('CMP-03 supports CC and BCC recipients', async ({ page }) => {
    const login = new LoginPage(page);
    await login.open();
    await login.loginAndGoToMail(testData.senderEmail, testData.senderPassword);

    const subject = testData.subject('cc-bcc');
    const compose = new ComposePage(page);
    await compose.open();
    await compose.fillMessage(testData.receiverEmail, subject, testData.body(subject));
    await compose.addCc(testData.receiverEmail);
    await compose.addBcc(testData.receiverEmail);
    await expect(page.getByText(testData.receiverEmail).first()).toBeVisible();
    await compose.send();
  });
});
