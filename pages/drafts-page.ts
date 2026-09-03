import { expect, type Locator, type Page } from '@playwright/test';

export class DraftsPage {
  readonly draftsLink: Locator;
  readonly draftList: Locator;

  constructor(private readonly page: Page) {
    this.draftsLink = page.getByTestId('navigation-link:all-drafts');
    this.draftList = page.getByTestId('message-list-loaded');
  }

  async open(): Promise<void> {
    await this.draftsLink.click();
    await expect(this.draftList).toBeVisible();
  }

  draftBySubject(subject: string): Locator {
    return this.draftList.getByText(subject);
  }

  async expectDraftVisible(subject: string, timeout = 30000): Promise<void> {
    await expect(async () => {
      await this.page.reload();
      await expect(this.draftBySubject(subject)).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout, intervals: [2000, 4000] });
  }

  async expectDraftAbsent(subject: string, timeout = 15000): Promise<void> {
    await expect(async () => {
      await this.page.reload();
      await expect(this.draftBySubject(subject)).toHaveCount(0);
    }).toPass({ timeout, intervals: [2000, 4000] });
  }

  async openDraft(subject: string): Promise<void> {
    await this.draftBySubject(subject).click();
  }
}
