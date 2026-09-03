import { expect, type Locator, type Page } from '@playwright/test';
import { ProtonPage } from './proton-page';

export class ComposePage extends ProtonPage {
  private readonly composer = this.page
    .getByRole('region')
    .filter({ has: this.page.getByTestId('rooster-iframe') });
  private readonly composeButton = this.page.getByRole('button', { name: 'New message' });
  private readonly recipientInput = this.composer.getByRole('textbox', { name: 'To' });
  private readonly ccButton = this.composer.getByTestId('composer:recipients:cc-button');
  private readonly bccButton = this.composer.getByTestId('composer:recipients:bcc-button');
  private readonly ccInput = this.composer.getByTestId('composer:to-cc');
  private readonly bccInput = this.composer.getByTestId('composer:to-bcc');
  readonly subjectInput = this.composer.getByRole('textbox', { name: 'Subject' });
  private readonly sendButton = this.composer.getByTestId('composer:send-button');
  readonly editor = this.composer.getByTestId('rooster-iframe').contentFrame().locator('#rooster-editor');
  private readonly closeButton = this.composer.getByTestId('composer:close-button');
  private readonly deleteDraftButton = this.composer.getByTestId('composer:delete-draft-button');
  private readonly attachmentInput = this.composer.getByTestId('composer-attachments-button');

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.composeButton.click();
    await expect(this.subjectInput).toBeVisible();
  }

  async fillRecipient(recipient: string): Promise<void> {
    await this.recipientInput.fill(recipient);
    await this.page.keyboard.press('Enter');
  }

  async addCc(recipient: string): Promise<void> {
    if (await this.ccInput.count() === 0) {
      await this.ccButton.click();
    }
    await this.ccInput.fill(recipient);
    await this.ccInput.press('Enter');
  }

  async addBcc(recipient: string): Promise<void> {
    if (await this.bccInput.count() === 0) {
      await this.bccButton.click();
    }
    await this.bccInput.fill(recipient);
    await this.bccInput.press('Enter');
  }

  async fillMessage(recipient: string, subject: string, body: string): Promise<void> {
    await this.fillRecipient(recipient);
    await this.subjectInput.fill(subject);
    await this.editor.fill(body);
  }

  async attach(filePath: string): Promise<void> {
    await this.page.locator('input[type="file"]').setInputFiles(filePath);
  }

  async attachFile(filePath: string): Promise<void> {
    await this.attachmentInput.setInputFiles(filePath);
  }

  async expectAttachmentVisible(fileName: string): Promise<void> {
    await expect(this.composer.getByTestId(`attachment-item:${fileName}--primary-action`)).toBeVisible();
  }

  async removeAttachment(fileName: string): Promise<void> {
    await this.composer.getByTestId(`attachment-item:${fileName}--secondary-action`).click();
  }

  async send(): Promise<void> {
    await expect(this.sendButton).toBeEnabled({ timeout: 20000 });
    await this.sendButton.click();
  }

  async closeAndSaveDraft(): Promise<void> {
    await this.closeButton.click();
  }

  async discardDraft(): Promise<void> {
    await this.deleteDraftButton.click();
  }

  async expectRecipientValidation(): Promise<void> {
    await expect(this.composer.getByRole('heading', { name: 'Recipient missing' })).toBeVisible();
  }
}
