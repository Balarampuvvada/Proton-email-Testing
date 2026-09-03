import { expect, type Page } from '@playwright/test';
import { ProtonPage } from './proton-page';

export class FiltersPage extends ProtonPage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.getByRole('button', { name: 'Toggle settings' }).click();
    await this.page.getByTestId('drawer-quick-settings:all-settings-button').click();
    await this.page.getByText('Filters', { exact: true }).first().click();
    await expect(this.page).toHaveURL(/account\.proton\.me\/.*\/mail\/filters/);
  }

  async createSubjectArchiveFilter(name: string, subject: string): Promise<void> {
    await this.page.getByRole('button', { name: 'Add filter', exact: true }).click();
    await this.page.getByTestId('filter-modal:name-input').fill(name);
    await this.page.getByTestId('filter-modal:next-button').click();

    await this.page.getByPlaceholder('Type text or keyword').fill(subject);
    await this.page.getByRole('button', { name: 'Insert', exact: true }).click();
    await this.page.getByTestId('filter-modal:next-button').click();

    const moveTo = this.page.getByRole('button', { name: 'Do not move', exact: true });
    await moveTo.click();
    await this.page.getByText('Archive', { exact: true }).last().click();
    await this.page.getByTestId('filter-modal:next-button').click();

    await expect(this.page.getByRole('button', { name: 'Save', exact: true })).toBeEnabled();
    await this.page.getByRole('button', { name: 'Save', exact: true }).click();
    await expect(this.page.getByRole('button', { name: 'Add filter', exact: true })).toBeVisible();
  }
}
