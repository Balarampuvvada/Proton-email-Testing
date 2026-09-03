import { test, type Browser, type BrowserContext } from '@playwright/test';
import { ComposePage } from '../../pages/compose-page';
import { InboxPage } from '../../pages/inbox-page';
import { LoginPage } from '../../pages/login-page';
import { testData, hasReceiverAccountData } from '../../fixtures/test-data';

test.describe('Inbox and organization', () => {
  test.beforeEach(() => {
    test.skip(!hasReceiverAccountData(), 'Enter sender and receiver values in .env.');
  });

  async function sendToReceiver(browser: Browser, subject: string): Promise<BrowserContext> {
    const senderContext = await browser.newContext();
    const senderPage = await senderContext.newPage();
    const login = new LoginPage(senderPage);
    await login.open();
    await login.loginAndGoToMail(testData.senderEmail, testData.senderPassword);

    const compose = new ComposePage(senderPage);
    await compose.open();
    await compose.fillMessage(testData.receiverEmail, subject, testData.body(subject));
    await compose.send();
    return senderContext;
  }

  test('INB-01 stars a received message and verifies it appears in Starred', async ({ browser }) => {
    test.setTimeout(90000);
    const subject = testData.subject('inbox-star');
    const senderContext = await sendToReceiver(browser, subject);

    const receiverContext = await browser.newContext();
    try {
      const receiverPage = await receiverContext.newPage();
      const login = new LoginPage(receiverPage);
      await login.open();
      await login.loginAndGoToMail(testData.receiverEmail, testData.receiverPassword);

      const inbox = new InboxPage(receiverPage);
      await inbox.expectMessageVisible(subject);
      await inbox.starMessage(subject);
      await inbox.expectStarred(subject);
      await inbox.goToStarred();
      await inbox.expectMessageVisible(subject);
    } finally {
      await receiverContext.close();
      await senderContext.close();
    }
  });

  test('INB-02 archives a received message and verifies it leaves Inbox', async ({ browser }) => {
    test.setTimeout(90000);
    const subject = testData.subject('inbox-archive');
    const senderContext = await sendToReceiver(browser, subject);

    const receiverContext = await browser.newContext();
    try {
      const receiverPage = await receiverContext.newPage();
      const login = new LoginPage(receiverPage);
      await login.open();
      await login.loginAndGoToMail(testData.receiverEmail, testData.receiverPassword);

      const inbox = new InboxPage(receiverPage);
      await inbox.expectMessageVisible(subject);
      await inbox.selectMessage(subject);
      await inbox.archiveSelected();
      await inbox.expectMessageAbsent(subject);
      await inbox.goToArchive();
      await inbox.expectMessageVisible(subject);
    } finally {
      await receiverContext.close();
      await senderContext.close();
    }
  });

  test('INB-03 moves a received message to Trash and restores it', async ({ browser }) => {
    test.setTimeout(90000);
    const subject = testData.subject('inbox-trash-restore');
    const senderContext = await sendToReceiver(browser, subject);

    const receiverContext = await browser.newContext();
    try {
      const receiverPage = await receiverContext.newPage();
      const login = new LoginPage(receiverPage);
      await login.open();
      await login.loginAndGoToMail(testData.receiverEmail, testData.receiverPassword);

      const inbox = new InboxPage(receiverPage);
      await inbox.expectMessageVisible(subject);
      await inbox.selectMessage(subject);
      await inbox.trashSelected();
      await inbox.expectMessageAbsent(subject);

      await inbox.goToTrash();
      await inbox.expectMessageVisible(subject);
      await inbox.selectMessage(subject);
      await inbox.restoreSelected();
      await inbox.expectMessageAbsent(subject);
      await inbox.goToInbox();
      await inbox.expectMessageVisible(subject);
    } finally {
      await receiverContext.close();
      await senderContext.close();
    }
  });
});
