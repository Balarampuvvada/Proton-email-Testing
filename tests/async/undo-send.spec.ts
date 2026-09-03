import { test, type Browser } from '@playwright/test';
import { ComposePage } from '../../pages/compose-page';
import { InboxPage } from '../../pages/inbox-page';
import { LoginPage } from '../../pages/login-page';
import { testData, hasReceiverAccountData } from '../../fixtures/test-data';

test('ASY-01 Undo Send cancels a recently sent message', async ({ browser }: { browser: Browser }) => {
  test.skip(!hasReceiverAccountData(), 'Enter sender and receiver values in .env.');
  test.setTimeout(90000);

  const subject = testData.subject('undo-send');
  const senderContext = await browser.newContext();
  const receiverContext = await browser.newContext();
  try {
    const senderPage = await senderContext.newPage();
    const senderLogin = new LoginPage(senderPage);
    await senderLogin.open();
    await senderLogin.loginAndGoToMail(testData.senderEmail, testData.senderPassword);

    const compose = new ComposePage(senderPage);
    await compose.open();
    await compose.fillMessage(testData.receiverEmail, subject, testData.body(subject));
    await compose.send();
    await compose.undoSend();

    const receiverPage = await receiverContext.newPage();
    const receiverLogin = new LoginPage(receiverPage);
    await receiverLogin.open();
    await receiverLogin.loginAndGoToMail(testData.receiverEmail, testData.receiverPassword);
    const inbox = new InboxPage(receiverPage);
    await inbox.expectMessageAbsent(subject, 30000);
  } finally {
    await receiverContext.close();
    await senderContext.close();
  }
});
