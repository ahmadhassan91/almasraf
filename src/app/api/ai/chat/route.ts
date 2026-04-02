import { NextRequest, NextResponse } from "next/server";
import openai from "@/lib/openai";

const SYSTEM_PROMPT = `You are an elite AI banking assistant for AL Masraf, a premium UAE bank. 
You assist customers at a smart kiosk terminal.

Your capabilities:
- Answer banking queries about accounts, services, loans, cards
- Help navigate the kiosk (account opening, services, statements)
- Provide product recommendations based on customer needs
- Support Arabic and English

Guidelines:
- Be concise, professional, and warm
- Use proper UAE banking terminology
- If user says "open account" → say: NAVIGATE_TO:/onboarding
- If user says "services" or "statement" or "balance" → say: NAVIGATE_TO:/services
- If user says "whatsapp" or "send message" → say: NAVIGATE_TO:/whatsapp
- For navigation commands, start your response with NAVIGATE_TO: then the path, then continue with a brief explanation
- Always end with a helpful follow-up question or suggestion
- Keep responses under 120 words for kiosk readability`;

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    const stream = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
      stream: true,
      max_tokens: 200,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const text = chunk.choices[0]?.delta?.content || "";
          if (text) controller.enqueue(encoder.encode(text));
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error: unknown) {
    console.error("AI Chat error:", error);
    const msg = error instanceof Error ? error.message : "AI service error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
