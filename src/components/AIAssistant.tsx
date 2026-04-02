"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, PaperPlaneRight, Microphone, Sparkle, CaretRight } from "@phosphor-icons/react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const QUICK_COMMANDS = [
  { label: "Open Account", value: "I want to open a new account" },
  { label: "My Balance", value: "What is my account balance?" },
  { label: "Statement", value: "Show me my statement" },
  { label: "WhatsApp Support", value: "Connect me on WhatsApp" },
];

export default function AIAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Assalamu Alaikum! 👋 I'm your AL Masraf AI assistant. I can help you open an account, check your balance, request services, or answer any banking questions. How can I help you today?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleNavigate = useCallback(
    (text: string) => {
      const navMatch = text.match(/NAVIGATE_TO:([^\s]+)/);
      if (navMatch) {
        const path = navMatch[1];
        setTimeout(() => {
          setIsOpen(false);
          router.push(path);
        }, 1500);
        return text.replace(/NAVIGATE_TO:[^\s]+/, "").trim();
      }
      return text;
    },
    [router]
  );

  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || isLoading) return;
      setInput("");
      const userMsg: Message = { role: "user", content: text, timestamp: new Date() };
      setMessages((prev) => [...prev, userMsg]);
      setIsLoading(true);
      setStreamingText("");

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [...messages, userMsg].map((m) => ({
              role: m.role,
              content: m.content,
            })),
          }),
        });

        if (!res.ok) throw new Error("AI request failed");

        const reader = res.body!.getReader();
        const decoder = new TextDecoder();
        let fullText = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          fullText += chunk;
          const cleaned = handleNavigate(fullText);
          setStreamingText(cleaned);
        }

        const finalText = handleNavigate(fullText);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: finalText, timestamp: new Date() },
        ]);
        setStreamingText("");
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: "I apologize, I'm having trouble connecting. Please try again.",
            timestamp: new Date(),
          },
        ]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages, isLoading, handleNavigate]
  );

  const formatTime = (d: Date) =>
    d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true });

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="ai-float"
          onClick={() => setIsOpen(true)}
          title="AI Assistant"
        >
          <Sparkle size={28} weight="duotone" className="text-white" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div
          className="fixed inset-0 flex items-end justify-end p-6"
          style={{ zIndex: 1000 }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }}
            onClick={() => setIsOpen(false)}
          />

          {/* Chat window */}
          <div
            className="relative flex flex-col rounded-2xl overflow-hidden"
            style={{
              width: "480px",
              height: "680px",
              background: "rgba(7,14,33,0.97)",
              border: "1px solid rgba(200,168,75,0.3)",
              boxShadow: "0 40px 80px rgba(0,0,0,0.7), 0 0 60px rgba(200,168,75,0.1)",
            }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(26,110,224,0.2), rgba(200,168,75,0.1))",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: "linear-gradient(135deg, #1A6EE0, #4D9FFF)" }}
                >
                  <Sparkle size={18} weight="duotone" className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">AL Masraf AI</p>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-[11px] text-green-400">Online · GPT-4o</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "rgba(255,255,255,0.08)" }}
              >
                <X size={16} className="text-gray-300" />
              </button>
            </div>

            {/* Quick Commands */}
            <div className="flex gap-2 px-4 py-3 flex-shrink-0 overflow-x-auto scroll-area"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
              {QUICK_COMMANDS.map((cmd) => (
                <button
                  key={cmd.value}
                  onClick={() => sendMessage(cmd.value)}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                  style={{
                    background: "rgba(200,168,75,0.08)",
                    border: "1px solid rgba(200,168,75,0.25)",
                    color: "#C8A84B",
                    whiteSpace: "nowrap",
                  }}
                >
                  <CaretRight size={10} weight="bold" />
                  {cmd.label}
                </button>
              ))}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 scroll-area">
              {messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className="max-w-[85%]"
                    style={{ animationDelay: `${i * 0.05}s`, animation: "slideUpFade 0.3s ease both" }}
                  >
                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-2 mb-1.5">
                        <div
                          className="w-5 h-5 rounded-full flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, #1A6EE0, #4D9FFF)" }}
                        >
                          <Sparkle size={10} weight="duotone" className="text-white" />
                        </div>
                        <span className="text-[10px] text-gray-500">
                          AL Masraf AI · {formatTime(msg.timestamp)}
                        </span>
                      </div>
                    )}
                    <div
                      className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap"
                      style={
                        msg.role === "user"
                          ? {
                              background: "linear-gradient(135deg, #1A6EE0, #4D9FFF)",
                              color: "#fff",
                              borderRadius: "18px 18px 4px 18px",
                            }
                          : {
                              background: "rgba(255,255,255,0.05)",
                              border: "1px solid rgba(255,255,255,0.08)",
                              color: "#E2E8F0",
                              borderRadius: "4px 18px 18px 18px",
                            }
                      }
                    >
                      {msg.content}
                    </div>
                    {msg.role === "user" && (
                      <p className="text-[10px] text-gray-500 text-right mt-1">
                        {formatTime(msg.timestamp)}
                      </p>
                    )}
                  </div>
                </div>
              ))}

              {/* Streaming */}
              {streamingText && (
                <div className="flex justify-start">
                  <div
                    className="max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(200,168,75,0.2)",
                      color: "#E2E8F0",
                      borderRadius: "4px 18px 18px 18px",
                    }}
                  >
                    {streamingText}
                    <span
                      className="inline-block w-0.5 h-4 ml-1 align-middle"
                      style={{ background: "var(--gold-primary)", animation: "blink 0.7s infinite" }}
                    />
                  </div>
                </div>
              )}

              {/* Typing indicator */}
              {isLoading && !streamingText && (
                <div className="flex justify-start">
                  <div
                    className="px-4 py-3 rounded-2xl flex items-center gap-1.5"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full"
                        style={{
                          background: "var(--gold-primary)",
                          animation: `blink 1.2s ${i * 0.2}s infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div
              className="flex items-center gap-3 px-4 py-4 flex-shrink-0"
              style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
            >
              <button className="w-10 h-10 rounded-full flex items-center justify-center transition-all btn-glass flex-shrink-0">
                <Microphone size={16} weight="light" className="text-gray-300" />
              </button>
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
                placeholder="Ask me anything..."
                className="flex-1 bg-transparent outline-none text-sm text-white placeholder-gray-500"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0"
                style={{
                  background:
                    input.trim()
                      ? "linear-gradient(135deg, #1A6EE0, #4D9FFF)"
                      : "rgba(255,255,255,0.08)",
                  opacity: !input.trim() || isLoading ? 0.5 : 1,
                }}
              >
                <PaperPlaneRight size={16} weight="bold" className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
