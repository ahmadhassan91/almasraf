import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { sendTextMessage } from "@/lib/whatsapp";
import {
  CustomerAccount,
  getSessionAccount,
  getSessionPhone,
} from "@/lib/mock-data";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN;
const APP_SECRET = process.env.WHATSAPP_APP_SECRET;

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

function getLinkedAccount(from: string): CustomerAccount | null {
  const sessionPhone = getSessionPhone();
  if (!sessionPhone) return null;

  return normalizePhoneNumber(sessionPhone) === normalizePhoneNumber(from)
    ? getSessionAccount()
    : null;
}

function buildSystemPrompt(account: CustomerAccount | null) {
  const basePrompt = `You are an AI banking assistant for AL Masraf bank, responding via WhatsApp.

Guidelines:
- Be concise (max 3 sentences for WhatsApp)
- Professional and friendly
- Support Arabic phrases naturally
- Never claim to know account balances, transactions, or personal details unless they are provided in the system context
- If the user's account is not linked, explain that account-specific actions require linking through the kiosk or a secure channel
- For complex requests, suggest visiting the kiosk or branch
- Always end with a helpful offer`;

  if (!account) {
    return `${basePrompt}

This WhatsApp user is not linked to a banking profile in the current session.
Do not invent balances, account numbers, transactions, or service confirmations.`;
  }

  const recentTransactions = account.transactions
    .slice(0, 3)
    .map(
      (transaction) =>
        `• ${transaction.date}: ${transaction.description} (${transaction.type === "credit" ? "+" : "-"}AED ${Math.abs(transaction.amount).toLocaleString()})`
    )
    .join("\n");

  return `${basePrompt}

The customer's linked account details:
- Name: ${account.customer.name}
- Account: ${account.accountNumber}
- Balance: AED ${account.balance.toLocaleString()}
- Account Type: ${account.accountType}
- Status: ${account.status}

Recent transactions:
${recentTransactions}`;
}

function hasValidSignature(rawBody: string, signature: string | null) {
  if (!APP_SECRET) return true;
  if (!signature) return false;

  const expectedSignature = crypto
    .createHmac("sha256", APP_SECRET)
    .update(rawBody)
    .digest("hex");

  return signature === `sha256=${expectedSignature}`;
}

// GET — Webhook verification
export async function GET(req: NextRequest) {
  if (!VERIFY_TOKEN) {
    return NextResponse.json({ error: "Webhook verify token is not configured" }, { status: 500 });
  }

  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WhatsApp webhook verified");
    return new Response(challenge, { status: 200 });
  }
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// POST — Receive incoming messages
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-hub-signature-256");
    if (!hasValidSignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      // Status update — acknowledge and return
      return NextResponse.json({ status: "ok" });
    }

    const incomingMsg = messages[0];
    const from = incomingMsg.from;
    const text = incomingMsg?.text?.body || "";

    if (!text || !from) {
      return NextResponse.json({ status: "ok" });
    }

    console.log(`WhatsApp message from ${from}: ${text}`);

    const linkedAccount = getLinkedAccount(from);

    // Generate AI response
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: buildSystemPrompt(linkedAccount) },
        { role: "user", content: text },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    const replyText =
      aiResponse.choices[0]?.message?.content ||
      "Thank you for contacting AL Masraf. A representative will assist you shortly.";

    // Send the reply
    await sendTextMessage(from, replyText);

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Webhook error:", error);
    // Always return 200 to WhatsApp to avoid retries
    return NextResponse.json({ status: "ok" });
  }
}
