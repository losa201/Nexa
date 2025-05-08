// api/src/alerts.ts
import fetch from 'node-fetch';
import Twilio from 'twilio';
import nodemailer from 'nodemailer';

// SMS via Twilio
const twilioClient = Twilio(
  process.env.TWILIO_SID!,
  process.env.TWILIO_TOKEN!
);

// Email via nodemailer
const mailer = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: !!process.env.SMTP_SECURE, // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * Send an SMS alert.
 * @param to    Recipient phone number (E.164 format).
 * @param body  Message body.
 */
export async function smsAlert(to: string, body: string): Promise<void> {
  try {
    await twilioClient.messages.create({
      from: process.env.TWILIO_FROM!,
      to,
      body
    });
  } catch (err) {
    console.error('SMS alert failed:', err);
  }
}

/**
 * Send an email alert.
 * @param to      Recipient email.
 * @param subject Email subject.
 * @param text    Email body.
 */
export async function emailAlert(
  to: string,
  subject: string,
  text: string
): Promise<void> {
  try {
    await mailer.sendMail({
      from: process.env.SMTP_FROM!,
      to,
      subject,
      text
    });
  } catch (err) {
    console.error('Email alert failed:', err);
  }
}
