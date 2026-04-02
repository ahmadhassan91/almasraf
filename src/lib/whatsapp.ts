const WA_BASE = "https://graph.facebook.com/v22.0";
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID!;
const ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN!;

export interface WASendResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

async function waPost(endpoint: string, body: object): Promise<WASendResult> {
  try {
    const res = await fetch(`${WA_BASE}/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) {
      console.error("WhatsApp API error:", data);
      return { success: false, error: data?.error?.message || "Unknown error" };
    }
    return { success: true, messageId: data?.messages?.[0]?.id };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Network error";
    return { success: false, error: msg };
  }
}

export async function sendTextMessage(to: string, text: string): Promise<WASendResult> {
  // Normalize phone number
  const normalized = to.replace(/[\s\-\(\)]/g, "");
  return waPost(`${PHONE_NUMBER_ID}/messages`, {
    messaging_product: "whatsapp",
    to: normalized,
    type: "text",
    text: { body: text },
  });
}

export async function sendAccountWelcome(
  to: string,
  customerName: string,
  accountNumber: string
): Promise<WASendResult> {
  const message =
    `🏦 *Welcome to AL Masraf!*\n\n` +
    `Assalamu Alaikum *${customerName}*,\n\n` +
    `Your account has been successfully created. Here are your details:\n\n` +
    `📋 *Account Number:*\n${accountNumber}\n\n` +
    `📊 *Account Type:* Current Account\n` +
    `✅ *Status:* Active\n` +
    `💰 *Currency:* AED\n\n` +
    `You can now reply to this message for instant banking assistance. I'm here 24/7 in Arabic and English.\n\n` +
    `_Try asking: "What is my balance?" or "I need a checkbook"_\n\n` +
    `━━━━━━━━━━━━━━━\n` +
    `_AL Masraf AI Banking Assistant_`;

  return sendTextMessage(to, message);
}

export async function sendServiceConfirmation(
  to: string,
  service: string
): Promise<WASendResult> {
  const message =
    `✅ *Service Request Confirmed*\n\n` +
    `Your request for *${service}* has been received and is being processed.\n\n` +
    `📅 *Expected delivery:* 3–5 business days\n` +
    `📬 It will be delivered to your registered address.\n\n` +
    `Reply to this message if you have any questions.\n\n` +
    `_AL Masraf AI Banking Assistant_`;

  return sendTextMessage(to, message);
}
