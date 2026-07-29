import { Resend } from 'resend';
import { config } from './config';

export type EmailPurpose = 'Order Received' | 'Payment Successful' | 'Discount Code Applied';

export const resend = new Resend(config.EMAIL.RESEND_API_KEY);

export const mailConfig = {
  from: config.EMAIL.FROM,
  subjectPrefix: config.EMAIL.SUBJECT_PREFIX,
  subjects: {
    'Order Received': 'Order Received',
    'Payment Successful': 'Payment Successful',
    'Discount Code Applied': 'Discount Code Applied'
  } as Record<EmailPurpose, string>
};

export function getEmailSubject(purpose: EmailPurpose): string {
  const subject = mailConfig.subjects[purpose];
  return `${mailConfig.subjectPrefix}${subject}`.trim();
}