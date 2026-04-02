import { NextRequest, NextResponse } from "next/server";
import { sendAccountWelcome, sendTextMessage } from "@/lib/whatsapp";

const PHONE_NUMBER_REGEX = /^\d{10,15}$/;
const ALLOWED_RECIPIENTS = (process.env.WHATSAPP_ALLOWED_RECIPIENTS || "")
  .split(",")
  .map((value) => value.replace(/\D/g, ""))
  .filter(Boolean);

function normalizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

export async function POST(req: NextRequest) {
  try {
    const { to, type, customerName, accountNumber, message } = await req.json();

    if (!to) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    const normalizedTo = normalizePhoneNumber(to);
    if (!PHONE_NUMBER_REGEX.test(normalizedTo)) {
      return NextResponse.json({ error: "Invalid phone number format" }, { status: 400 });
    }

    if (ALLOWED_RECIPIENTS.length > 0 && !ALLOWED_RECIPIENTS.includes(normalizedTo)) {
      return NextResponse.json(
        { error: "Recipient is not allowlisted for this environment" },
        { status: 403 }
      );
    }

    let result;

    switch (type) {
      case "account_welcome":
        if (!customerName || !accountNumber) {
          return NextResponse.json(
            { error: "customerName and accountNumber are required for account_welcome" },
            { status: 400 }
          );
        }
        result = await sendAccountWelcome(normalizedTo, customerName, accountNumber);
        break;
      case "text":
        if (!message?.trim()) {
          return NextResponse.json({ error: "message is required for text sends" }, { status: 400 });
        }
        result = await sendTextMessage(normalizedTo, message);
        break;
      default:
        return NextResponse.json({ error: "Unsupported message type" }, { status: 400 });
    }

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (error: unknown) {
    console.error("WhatsApp send error:", error);
    const msg = error instanceof Error ? error.message : "Send failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
