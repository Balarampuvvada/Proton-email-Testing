import { expect, type Locator, type Page } from '@playwright/test';
import { ProtonPage } from './proton-page';

export class InboxPage extends ProtonPage {
  readonly messageList: Locator;
  readonly composeButton: Locator;
  readonly selectAllCheckbox: Locator;

  constructor(page: Page) {
    super(page);
    this.messageList = page.getByTestId('message-list-loaded');
    this.composeButton = page.getByRole('button', { name: 'New message' });
    this.selectAllCheckbox = page.getByTestId('toolbar:select-all-checkbox');
  }

  async open(): Promise<void> {
    await this.page.goto('/u/0/inbox');
    await this.waitForApp();
  }

  async expectLoaded(): Promise<void> {
    await expect(this.messageList).toBeVisible({ timeout: 15000 });
  }

  message(subject: string): Locator {
    return this.messageList
      .locator('[data-testid^="message-item:"]')
      .filter({ hasText: subject });
  }

  starButton(subject: string): Locator {
    return this.message(subject).locator('[data-testid^="item-star-"]');
  }

  itemCheckbox(subject: string): Locator {
    return this.message(subject).getByTestId('item-checkbox');
  }

  async selectMessage(subject: string): Promise<void> {
    await this.itemCheckbox(subject).click();
  }

  async starMessage(subject: string): Promise<void> {
    const star = this.starButton(subject);
    await expect(star).toHaveAttribute('data-testid', 'item-star-false');
    await star.click();
  }

  async expectStarred(subject: string): Promise<void> {
    await expect(this.starButton(subject)).toHaveAttribute('data-testid', 'item-star-true', { timeout: 10000 });
  }

  async archiveSelected(): Promise<void> {
    await this.page.getByTestId('toolbar:movetoarchive').click();
  }

  async trashSelected(): Promise<void> {
    await this.page.getByTestId('toolbar:movetotrash').click();
  }

  async restoreSelected(): Promise<void> {
    await this.page.getByTestId('toolbar:movetoinbox').click();
  }

  async goToInbox(): Promise<void> {
    await this.page.getByTestId('navigation-link:inbox').click({ force: true });
    await this.expectLoaded();
  }

  async goToStarred(): Promise<void> {
    await this.page.getByTestId('navigation-link:starred').click({ force: true });
    await this.expectLoaded();
  }

  async goToArchive(): Promise<void> {
    await this.openMoreFolders();
    await this.page.getByTestId('navigation-link:archive').click({ force: true });
    await this.expectLoaded();
  }

  async goToTrash(): Promise<void> {
    await this.openMoreFolders();
    await this.page.getByTestId('navigation-link:trash').click({ force: true });
    await this.expectLoaded();
  }

  async expectMessageVisible(subject: string, timeout = 60000): Promise<void> {
    await expect(async () => {
      await this.page.reload();
      await expect(this.message(subject)).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout, intervals: [3000, 5000, 8000] });
  }

  async expectMessageAbsent(subject: string, timeout = 30000): Promise<void> {
    await expect(async () => {
      await this.page.reload();
      await expect(this.message(subject)).toHaveCount(0);
    }).toPass({ timeout, intervals: [2000, 4000] });
  }

  private async openMoreFolders(): Promise<void> {
    const trashLink = this.page.getByTestId('navigation-link:trash');
    if (await trashLink.count() === 0) {
      const moreButton = this.page.getByRole('button', { name: 'More' });
      await moreButton.click();
    }
  }

  async expectMessage(subject: string, timeout = 60000): Promise<void> {
    await expect(async () => {
      await this.page.reload();
      await expect(this.message(subject)).toBeVisible({ timeout: 5000 });
    }).toPass({ timeout, intervals: [3000, 5000, 8000] });
  }

  async openMessage(subject: string): Promise<void> {
    await this.message(subject).click();
  }
}
