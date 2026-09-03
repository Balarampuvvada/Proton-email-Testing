import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';

export const testData = {
  senderEmail: process.env.PROTON_TEST_EMAIL ?? '',
  senderPassword: process.env.PROTON_TEST_PASSWORD ?? '',
  receiverEmail: process.env.PROTON_RECEIVER_EMAIL ?? '',
  receiverPassword: process.env.PROTON_RECEIVER_PASSWORD ?? '',
  attachmentPath: resolve(__dirname, 'sample-attachment.txt'),
  subject: (label = 'mail') => `QA ${label} ${randomUUID().slice(0, 8)}`,
  body: (subject: string) => `Automated Proton Mail QA message: ${subject}`
};

export function hasAccountData(): boolean {
  return Boolean(testData.senderEmail && testData.senderPassword && testData.receiverEmail);
}

export function hasReceiverAccountData(): boolean {
  return Boolean(hasAccountData() && testData.receiverPassword);
}