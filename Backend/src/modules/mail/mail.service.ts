import { Injectable } from '@nestjs/common';
import nodemailer from 'nodemailer';

// ✅ Emailga kod yuborish servisi (signup/forgot/delete)
@Injectable()
export class MailService {
  private readonly transporter: nodemailer.Transporter;

  constructor() {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT ?? 587);
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass)
      throw new Error('SMTP env sozlamalari to‘liq emas');

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
      auth: { user, pass },
    });
  }

  async sendCode(to: string, subject: string, code: string): Promise<void> {
    const from =
      process.env.SMTP_FROM ?? 'Student System <no-reply@example.com>';

    await this.transporter.sendMail({
      from,
      to,
      subject,
      text: `Tasdiqlash kodi: ${code}\nKod 10 daqiqa amal qiladi.`,
    });
  }
}
