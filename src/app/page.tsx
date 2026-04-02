"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ParticleCanvas from "@/components/ParticleCanvas";
import KioskLayout from "@/components/KioskLayout";
import AIAssistant from "@/components/AIAssistant";
import {
  IdentificationCard, ChartLineUp, Robot, DeviceMobile,
  ShieldStar, Lock, Seal, CreditCard, Bank, PiggyBank, ArrowRight,
  CheckCircle,
} from "@phosphor-icons/react";

const FEATURES = [
  { Icon: IdentificationCard, title: "AI Account Opening", desc: "Emirates ID scan with instant auto-fill", time: "< 2 min", color: "#C8A84B", bg: "rgba(200,168,75,0.15)" },
  { Icon: ChartLineUp, title: "Smart Banking Services", desc: "Balance, statements, cards and more", time: "Instant", color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
  { Icon: Robot, title: "AI Banking Assistant", desc: "24/7 help in Arabic and English", time: "Always on", color: "#C084FC", bg: "rgba(192,132,252,0.12)" },
  { Icon: DeviceMobile, title: "WhatsApp Banking", desc: "Continue your journey on WhatsApp", time: "Real-time", color: "#34D399", bg: "rgba(52,211,153,0.12)" },
];

const TICKER_ITEMS = [
  "256-bit Encrypted", "UAE Central Bank Licensed", "Best Digital Bank UAE 2025",
  "24/7 Support: 800 MASRAF", "Arabic & English", "Account in Under 2 Minutes",
];

const CONCIERGE_SUGGESTIONS = [
  "Open an account for me",
  "Show my balance",
  "Print my statement",
  "Request a checkbook",
  "Continue on WhatsApp",
];

function resolveJourney(prompt: string) {
  const normalized = prompt.toLowerCase();

  if (/(open|onboard|kyc|account|emirates id)/.test(normalized)) {
    return { label: "AI concierge is starting account opening", path: "/onboarding" };
  }

  if (/(balance|funds|money)/.test(normalized)) {
    return { label: "AI concierge is opening your balance view", path: "/services?intent=balance" };
  }

  if (/(statement|transaction|history|print)/.test(normalized)) {
    return { label: "AI concierge is preparing your statement journey", path: "/services?intent=statement" };
  }

  if (/(checkbook|cheque)/.test(normalized)) {
    return { label: "AI concierge is preparing your checkbook request", path: "/services?intent=checkbook" };
  }

  if (/(debit)/.test(normalized)) {
    return { label: "AI concierge is preparing your debit card request", path: "/services?intent=debit_card" };
  }

  if (/(credit card|credit)/.test(normalized)) {
    return { label: "AI concierge is preparing your credit card request", path: "/services?intent=credit_card" };
  }

  return {
    label: "AI concierge is continuing this conversation on WhatsApp",
    path: `/whatsapp?autostart=1&prompt=${encodeURIComponent(prompt)}`,
  };
}

export default function WelcomePage() {
  const router = useRouter();
  const [activeFeature, setActiveFeature] = useState(0);
  const [conciergeInput, setConciergeInput] = useState("");
  const [journeyLabel, setJourneyLabel] = useState<string | null>(null);

  useEffect(() => {
    const iv = setInterval(() => setActiveFeature(p => (p + 1) % FEATURES.length), 3500);
    return () => clearInterval(iv);
  }, []);

  const startJourney = (prompt: string) => {
    const text = prompt.trim();
    if (!text) return;

    const journey = resolveJourney(text);
    setJourneyLabel(journey.label);
    setConciergeInput("");

    window.setTimeout(() => {
      router.push(journey.path);
    }, 350);
  };

  return (
    <KioskLayout showBack={false}>
      <ParticleCanvas />
      <div className="relative h-full flex flex-col" style={{ zIndex: 10 }}>

        {/* ── Ticker ── */}
        <div className="flex-shrink-0 overflow-hidden" style={{
          background: "rgba(200,168,75,0.08)",
          borderBottom: "1px solid rgba(200,168,75,0.2)",
          padding: "8px 0",
        }}>
          <div className="ticker-content flex items-center gap-10">
            {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
              <span key={i} className="flex items-center gap-2 flex-shrink-0 text-xs font-semibold whitespace-nowrap" style={{ color: "#D4A853" }}>
                <span style={{ color: "#D4A853", fontSize: 8 }}>◆</span>
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* ── Two Column Body ── */}
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: "54% 46%", overflow: "hidden" }}>

          {/* ══ LEFT ══ */}
          <div style={{
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "32px 48px",
            borderRight: "1px solid rgba(255,255,255,0.06)",
            transition: "all 0.5s ease",
          }}>
            {/* Status chips */}
            <div style={{ display: "flex", gap: 10, marginBottom: 24 }}>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 999,
                background: "rgba(200,168,75,0.12)", border: "1px solid rgba(200,168,75,0.35)",
              }}>
                <Robot size={12} weight="bold" style={{ color: "#D4A853" }} />
                <span style={{ color: "#D4A853", fontSize: 12, fontWeight: 700 }}>AI-Powered Digital Branch</span>
              </div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 14px", borderRadius: 999,
                background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.35)",
              }}>
                <CheckCircle size={12} weight="bold" style={{ color: "#34D399" }} />
                <span style={{ color: "#34D399", fontSize: 12, fontWeight: 700 }}>UAE Regulated</span>
              </div>
            </div>

            {/* Heading */}
            <h1 style={{ margin: "0 0 16px", lineHeight: 1.0, fontWeight: 900 }}>
              <span style={{ color: "#F1F5F9", fontSize: "clamp(50px,5.5vw,78px)", display: "block" }}>
                Your Bank.
              </span>
              <span style={{
                fontSize: "clamp(50px,5.5vw,78px)", display: "block",
                background: "linear-gradient(120deg, #C8A84B, #F5E27A, #C8A84B)",
                backgroundSize: "200% auto",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                animation: "goldShimmer 4s ease infinite",
              }}>
                Reimagined.
              </span>
            </h1>

            <p style={{ color: "#94A3B8", fontSize: 15, lineHeight: 1.65, marginBottom: 28, maxWidth: 500 }}>
              AI-powered account opening in under 2 minutes, smart banking services,
              and 24/7 WhatsApp support in Arabic and English.
            </p>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: 36, marginBottom: 32 }}>
              {[
                { value: "< 2 min", label: "Account Opening" },
                { value: "24/7", label: "AI Support" },
                { value: "AED 0", label: "No Hidden Fees" },
              ].map(s => (
                <div key={s.label}>
                  <div style={{
                    fontSize: 22, fontWeight: 900,
                    background: "linear-gradient(135deg, #C8A84B, #F5E27A)",
                    WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  }}>{s.value}</div>
                  <div style={{ fontSize: 11, color: "#64748B", marginTop: 2, fontWeight: 500 }}>{s.label}</div>
                </div>
                ))}
            </div>

            <div style={{
              borderRadius: 22,
              padding: 22,
              marginBottom: 24,
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: "#60A5FA", letterSpacing: "0.16em", textTransform: "uppercase" }}>
                    AI Concierge
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#F8FAFC", marginTop: 6 }}>
                    Tell the kiosk what you need
                  </div>
                </div>
                <div style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  background: "rgba(96,165,250,0.08)",
                  border: "1px solid rgba(96,165,250,0.2)",
                  fontSize: 11,
                  fontWeight: 700,
                  color: "#60A5FA",
                  whiteSpace: "nowrap",
                }}>
                  Intent-driven banking
                </div>
              </div>

              <p style={{ color: "#94A3B8", fontSize: 13, lineHeight: 1.6, marginBottom: 14 }}>
                Try natural requests like “print my statement”, “open an account”, or “continue on WhatsApp”.
              </p>

              <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
                <input
                  value={conciergeInput}
                  onChange={(e) => setConciergeInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && startJourney(conciergeInput)}
                  placeholder="I need a statement and want it on WhatsApp"
                  style={{
                    flex: 1,
                    padding: "16px 18px",
                    borderRadius: 14,
                    border: "1px solid rgba(255,255,255,0.12)",
                    background: "rgba(0,0,0,0.22)",
                    color: "#F8FAFC",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
                <button
                  onClick={() => startJourney(conciergeInput)}
                  style={{
                    padding: "0 20px",
                    borderRadius: 14,
                    border: "none",
                    cursor: "pointer",
                    background: "linear-gradient(135deg, #1A6EE0, #4D9FFF)",
                    color: "#fff",
                    fontWeight: 800,
                    fontSize: 14,
                    whiteSpace: "nowrap",
                  }}
                >
                  Start Journey
                </button>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {CONCIERGE_SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => startJourney(suggestion)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 999,
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(255,255,255,0.04)",
                      color: "#CBD5E1",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>

              {journeyLabel && (
                <div style={{
                  marginTop: 14,
                  padding: "10px 14px",
                  borderRadius: 12,
                  background: "rgba(52,211,153,0.08)",
                  border: "1px solid rgba(52,211,153,0.2)",
                  color: "#34D399",
                  fontSize: 12,
                  fontWeight: 700,
                }}>
                  {journeyLabel}
                </div>
              )}
            </div>

            {/* ── CTAs ── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {/* Primary */}
              <button
                onClick={() => router.push("/onboarding")}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "18px 24px", borderRadius: 18, border: "none", cursor: "pointer",
                  background: "linear-gradient(135deg, #8A6E1E, #C8A84B, #F5E27A, #C8A84B, #8A6E1E)",
                  backgroundSize: "300% 300%",
                  animation: "goldShimmer 4s ease infinite",
                  color: "#000",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{
                    width: 46, height: 46, borderRadius: 12, display: "flex",
                    alignItems: "center", justifyContent: "center",
                    background: "rgba(0,0,0,0.15)",
                  }}>
                    <IdentificationCard size={26} weight="thin" />
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 900, fontSize: 17, lineHeight: 1 }}>Open Account</div>
                    <div style={{ fontWeight: 400, fontSize: 12, opacity: 0.65, marginTop: 3 }}>فتح حساب مصرفي</div>
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ background: "rgba(0,0,0,0.18)", padding: "4px 12px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>&lt; 2 min</span>
                  <ArrowRight size={20} weight="bold" />
                </div>
              </button>

              {/* Secondary row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <button onClick={() => router.push("/services")} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "16px 22px", borderRadius: 16, cursor: "pointer", border: "none",
                  background: "linear-gradient(135deg, #1A3EBF, #2563EB, #3B82F6)",
                  color: "#fff",
                }}>
                  <ChartLineUp size={26} weight="duotone" />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>Services</div>
                    <div style={{ fontSize: 12, opacity: 0.6, marginTop: 2 }}>الخدمات</div>
                  </div>
                </button>
                <button onClick={() => router.push("/whatsapp")} style={{
                  display: "flex", alignItems: "center", gap: 14,
                  padding: "16px 22px", borderRadius: 16, cursor: "pointer",
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)",
                  color: "#fff",
                }}>
                  <DeviceMobile size={26} weight="duotone" style={{ color: "#34D399" }} />
                  <div style={{ textAlign: "left" }}>
                    <div style={{ fontWeight: 800, fontSize: 16 }}>WhatsApp</div>
                    <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>واتساب</div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* ══ RIGHT ══ */}
          <div style={{
            display: "flex", flexDirection: "column", justifyContent: "center",
            padding: "24px 36px", gap: 12,
            transition: "all 0.5s 0.1s ease",
          }}>

            {/* Feature items */}
            {FEATURES.map((feat, i) => {
              const { Icon } = feat;
              const active = i === activeFeature;
              return (
                <div
                  key={i}
                  onClick={() => setActiveFeature(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 16,
                    padding: "16px 20px", borderRadius: 16, cursor: "pointer",
                    background: active ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.03)",
                    border: active ? `1px solid ${feat.color}50` : "1px solid rgba(255,255,255,0.08)",
                    transition: "all 0.3s ease",
                    transform: active ? "translateX(-4px)" : "none",
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, display: "flex",
                    alignItems: "center", justifyContent: "center", flexShrink: 0,
                    background: active ? feat.bg : "rgba(255,255,255,0.04)",
                    color: active ? feat.color : "rgba(255,255,255,0.25)",
                    transition: "all 0.3s ease",
                  }}>
                    <Icon size={24} weight={active ? "duotone" : "thin"} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: active ? "#F1F5F9" : "#94A3B8" }}>{feat.title}</span>
                      <span style={{
                        fontSize: 11, padding: "3px 10px", borderRadius: 999, fontWeight: 600,
                        background: active ? feat.bg : "rgba(255,255,255,0.04)",
                        color: active ? feat.color : "#64748B",
                        border: active ? `1px solid ${feat.color}30` : "1px solid rgba(255,255,255,0.06)",
                      }}>{feat.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: active ? "#94A3B8" : "#64748B", marginTop: 3 }}>{feat.desc}</div>
                  </div>
                </div>
              );
            })}

            {/* Trust row */}
            <div style={{
              padding: "16px 20px", borderRadius: 16,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12 }}>
                Trusted & Regulated
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
                {[
                  { Icon: ShieldStar, label: "UAE Central Bank" },
                  { Icon: Lock, label: "PCI DSS" },
                  { Icon: Seal, label: "ISO 27001" },
                  { Icon: CreditCard, label: "VISA / MC" },
                ].map(({ Icon: I, label }) => (
                  <div key={label} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(200,168,75,0.08)", color: "rgba(200,168,75,0.7)" }}>
                      <I size={17} weight="thin" />
                    </div>
                    <span style={{ fontSize: 10, color: "#64748B", textAlign: "center", lineHeight: 1.3 }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recs */}
            <div style={{
              padding: "16px 20px", borderRadius: 16,
              background: "rgba(96,165,250,0.05)", border: "1px solid rgba(96,165,250,0.15)",
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#60A5FA", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <Robot size={12} weight="bold" /> AI Recommended for You
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                {[
                  { Icon: PiggyBank, label: "Savings Account", rate: "3.5% p.a." },
                  { Icon: CreditCard, label: "Platinum Card", rate: "5% Cashback" },
                  { Icon: Bank, label: "Personal Loan", rate: "From 3.49%" },
                ].map(({ Icon: I, label, rate }) => (
                  <div key={label} style={{
                    padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                    background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)",
                    transition: "transform 0.2s",
                  }}>
                    <I size={20} weight="thin" style={{ color: "#C8A84B" }} />
                    <div style={{ fontWeight: 600, fontSize: 12, color: "#CBD5E1", marginTop: 8, lineHeight: 1.3 }}>{label}</div>
                    <div style={{ fontWeight: 800, fontSize: 13, color: "#C8A84B", marginTop: 4 }}>{rate}</div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Bottom hint */}
        <div style={{
          flexShrink: 0, textAlign: "center", padding: "6px 0 4px",
          fontSize: 10, color: "#334155", letterSpacing: "0.18em", textTransform: "uppercase",
        }}>
          Touch anywhere to begin · المس أي مكان للبدء
        </div>
      </div>

      <AIAssistant />
    </KioskLayout>
  );
}
