import { type Page } from '@playwright/test';

export abstract class ProtonPage {
  protected constructor(protected readonly page: Page) {}

  async waitForApp(): Promise<void> {
    await this.page.waitForLoadState('domcontentloaded');
  }
}