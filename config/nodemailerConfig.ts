import nodemailer from 'nodemailer';
import { config } from './config';

export type EmailPurpose = 'Order Received' | 'Payment Successful' | 'Discount Code Applied';

export const transporter = nodemailer.createTransport({
  service: config.EMAIL.SERVICE,
  auth: {
    user: config.EMAIL.USER,
    pass: config.EMAIL.PASS
  }
});

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