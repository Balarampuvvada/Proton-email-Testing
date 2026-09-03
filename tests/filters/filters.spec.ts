import { test, type Browser } from '@playwright/test';
import { FiltersPage } from '../../pages/filters-page';
import { ComposePage } from '../../pages/compose-page';
import { InboxPage } from '../../pages/inbox-page';
import { LoginPage } from '../../pages/login-page';
import { testData, hasReceiverAccountData } from '../../fixtures/test-data';

test.describe('Filters', () => {
  test.beforeEach(() => {
    test.skip(!hasReceiverAccountData(), 'Enter sender and receiver values in .env.');
  });

  test('FLT-01 archives a matching incoming message', async ({ browser }: { browser: Browser }) => {
    test.setTimeout(120000);
    const subject = testData.subject('filter-archive');
    const filterName = testData.subject('filter');

    const receiverContext = await browser.newContext();
    const senderContext = await browser.newContext();
    try {
      const receiverPage = await receiverContext.newPage();
      const receiverLogin = new LoginPage(receiverPage);
      await receiverLogin.open();
      await receiverLogin.loginAndGoToMail(testData.receiverEmail, testData.receiverPassword);

      const filters = new FiltersPage(receiverPage);
      await filters.open();
      await filters.createSubjectArchiveFilter(filterName, subject);

      const senderPage = await senderContext.newPage();
      const senderLogin = new LoginPage(senderPage);
      await senderLogin.open();
      await senderLogin.loginAndGoToMail(testData.senderEmail, testData.senderPassword);

      const compose = new ComposePage(senderPage);
      await compose.open();
      await compose.fillMessage(testData.receiverEmail, subject, testData.body(subject));
      await compose.send();

      const inbox = new InboxPage(receiverPage);
      await inbox.goToArchive();
      await inbox.expectMessageVisible(subject);
    } finally {
      await receiverContext.close();
      await senderContext.close();
    }
  });
});
