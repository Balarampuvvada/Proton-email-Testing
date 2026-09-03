import { type Page } from '@playwright/test';
import { ProtonPage } from './proton-page';

export class LoginPage extends ProtonPage {
  private readonly usernameInput = this.page.locator('#username');
  private readonly passwordInput = this.page.locator('#password');
  private readonly submitButton = this.page.getByRole('button', { name: /sign in|log in/i });

  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto('https://account.proton.me/login');
    await this.waitForApp();
  }

  async login(email: string, password: string): Promise<void> {
    await this.usernameInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectLoggedIn(): Promise<void> {
    await this.page.waitForURL(/account\.proton\.me\/(u\/\d+\/)?apps/, {
      timeout: 20000,
      waitUntil: 'domcontentloaded'
    });
  }

  async goToMail(): Promise<void> {
    await this.page.goto('/mail');
    await this.page.waitForURL(/mail\.proton\.me/, { timeout: 15000 });
  }

  async loginAndGoToMail(email: string, password: string): Promise<void> {
    await this.login(email, password);
    await this.expectLoggedIn();
    await this.goToMail();
  }
}