import { NextRequest, NextResponse } from "next/server";
import { sendAccountWelcome, sendTextMessage } from "@/lib/whatsapp";

export async function POST(req: NextRequest) {
  try {
    const { to, type, customerName, accountNumber, message } = await req.json();

    if (!to) {
      return NextResponse.json({ error: "Phone number required" }, { status: 400 });
    }

    let result;

    switch (type) {
      case "account_welcome":
        result = await sendAccountWelcome(to, customerName, accountNumber);
        break;
      case "text":
        result = await sendTextMessage(to, message);
        break;
      default:
        result = await sendAccountWelcome(to, customerName || "Valued Customer", accountNumber || "AE07 0331 XXXX");
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
