import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";
import { sendTextMessage } from "@/lib/whatsapp";
import { MOCK_ACCOUNT } from "@/lib/mock-data";

const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "almasraf_kiosk_webhook_2024";

const WA_SYSTEM_PROMPT = `You are an AI banking assistant for AL Masraf bank, responding via WhatsApp.
The customer's account details:
- Name: ${MOCK_ACCOUNT.customer.name}
- Account: ${MOCK_ACCOUNT.accountNumber}
- Balance: AED ${MOCK_ACCOUNT.balance.toLocaleString()}
- Account Type: ${MOCK_ACCOUNT.accountType}
- Status: ${MOCK_ACCOUNT.status}

Recent transactions:
${MOCK_ACCOUNT.transactions
  .slice(0, 3)
  .map(
    (t) =>
      `• ${t.date}: ${t.description} (${t.type === "credit" ? "+" : "-"}AED ${Math.abs(t.amount).toLocaleString()})`
  )
  .join("\n")}

Guidelines:
- Be concise (max 3 sentences for WhatsApp)
- Professional and friendly
- Support Arabic phrases naturally
- For complex requests, suggest visiting the kiosk or branch
- Always end with a helpful offer`;

// GET — Webhook verification
export async function GET(req: NextRequest) {
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
    const body = await req.json();

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

    // Generate AI response
    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: WA_SYSTEM_PROMPT },
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
