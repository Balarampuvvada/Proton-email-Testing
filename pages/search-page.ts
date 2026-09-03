import { expect, type Locator, type Page } from '@playwright/test';

export class SearchPage {
  readonly page: Page;
  readonly searchLauncher: Locator;
  readonly keywordInput: Locator;
  readonly showMoreButton: Locator;
  readonly submitButton: Locator;
  readonly clearButton: Locator;
  readonly startDateInput: Locator;
  readonly endDateInput: Locator;
  readonly senderInput: Locator;
  readonly recipientInput: Locator;
  readonly noResultsTitle: Locator;

  constructor(page: Page) {
    this.page = page;
    this.searchLauncher = page.getByTestId('search-keyword');
    this.keywordInput = page.getByTestId('input-input-element');
    this.showMoreButton = page.getByTestId('advanced-search:show-more');
    this.submitButton = page.getByTestId('advanced-search:submit');
    this.clearButton = page.getByTestId('clear-button');
    this.startDateInput = page.getByTestId('advanced-search:start-date');
    this.endDateInput = page.getByTestId('advanced-search:end-date');
    this.senderInput = page.getByTestId('advanced-search:sender');
    this.recipientInput = page.getByTestId('advanced-search:recipient');
    this.noResultsTitle = page.getByTestId('empty-view-placeholder--empty-title');
  }

  async open(): Promise<void> {
    await this.searchLauncher.click();
  }

  async searchKeyword(term: string): Promise<void> {
    await this.open();
    await this.keywordInput.fill(term);
    await this.submitButton.click();
  }

  async openAdvanced(): Promise<void> {
    await this.open();
    await this.showMoreButton.click();
  }

  async searchAdvanced(options: {
    keyword?: string;
    sender?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<void> {
    await this.openAdvanced();
    if (options.keyword) await this.keywordInput.fill(options.keyword);
    if (options.sender) await this.senderInput.fill(options.sender);
    if (options.startDate) await this.startDateInput.fill(options.startDate);
    if (options.endDate) await this.endDateInput.fill(options.endDate);
    await this.submitButton.click();
  }

  resultBySubject(subject: string): Locator {
    return this.page.getByRole('main').getByText(subject);
  }

  async expectResultVisible(subject: string, timeout = 15000): Promise<void> {
    await expect(this.resultBySubject(subject)).toBeVisible({ timeout });
  }

  async expectNoResults(): Promise<void> {
    await expect(this.noResultsTitle).toBeVisible();
    await expect(this.noResultsTitle).toHaveText('No results found');
  }

  async clearSearch(): Promise<void> {
    await this.clearButton.click();
  }
}
