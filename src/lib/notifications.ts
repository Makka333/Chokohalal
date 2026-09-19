import nodemailer from "nodemailer";
import type { CalculationResult } from "@/types";

export type ApplicationNotification = {
  name: string;
  phone: string;
  productName: string;
  calculation: CalculationResult;
};

export async function notifyNewApplication(input: ApplicationNotification): Promise<void> {
  const message = buildNotificationMessage(input);
  const jobs = [sendAdminEmail("Новая заявка на рассрочку", message), sendTelegramMessage(message)];
  const results = await Promise.allSettled(jobs);

  for (const result of results) {
    if (result.status === "rejected") {
      console.error("Notification failed", result.reason);
    }
  }
}

export function buildNotificationMessage(input: ApplicationNotification): string {
  return [
    "Новая заявка",
    "",
    `Имя: ${input.name}`,
    `Телефон: ${input.phone}`,
    `Товар: ${input.productName}`,
    "",
    `Цена товара: ${input.calculation.productPrice}`,
    `Наценка: ${input.calculation.markup}`,
    `Итоговая цена: ${input.calculation.totalPrice}`,
    `Первоначальный взнос: ${input.calculation.initialPayment}`,
    `Срок: ${input.calculation.term}`,
    `Платёж: ${input.calculation.periodicPayment}`,
  ].join("\n");
}

async function sendAdminEmail(subject: string, text: string): Promise<void> {
  const { ADMIN_EMAIL, EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASSWORD } = process.env;

  if (!ADMIN_EMAIL || !EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASSWORD) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD,
    },
  });

  await transporter.sendMail({
    from: EMAIL_USER,
    to: ADMIN_EMAIL,
    subject,
    text,
  });
}

async function sendTelegramMessage(text: string): Promise<void> {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;

  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    return;
  }

  const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: TELEGRAM_CHAT_ID,
      text: `🔔 ${text}`,
    }),
  });

  if (!response.ok) {
    throw new Error("Telegram notification failed");
  }
}
