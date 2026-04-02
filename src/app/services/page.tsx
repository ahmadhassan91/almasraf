"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import KioskLayout from "@/components/KioskLayout";
import ParticleCanvas from "@/components/ParticleCanvas";
import AIAssistant from "@/components/AIAssistant";
import { MOCK_ACCOUNT, Transaction } from "@/lib/mock-data";
import {
  Wallet, ChartLineUp, DownloadSimple, BookBookmark, CreditCard,
  Bank, CaretRight, CheckCircle, CircleNotch, ArrowUpRight,
  ArrowDownRight, PiggyBank, Robot
} from "@phosphor-icons/react";

type View = "home" | "balance" | "statement" | "request";
type Request = "checkbook" | "debit_card" | "credit_card" | null;

const SERVICES = [
  { Icon: Wallet,         title: "Account Balance",     titleAr: "رصيد الحساب",         desc: "View real-time balance",   color: "#C8A84B", bg: "rgba(200,168,75,0.12)",   border: "rgba(200,168,75,0.3)",  view: "balance" as View },
  { Icon: ChartLineUp,    title: "Mini Statement",      titleAr: "كشف مختصر",            desc: "Last 6 transactions",      color: "#4D9FFF", bg: "rgba(77,159,255,0.12)",   border: "rgba(77,159,255,0.3)",  view: "statement" as View },
  { Icon: DownloadSimple, title: "Download Statement",  titleAr: "تحميل الكشف",          desc: "Full PDF statement",       color: "#34D399", bg: "rgba(52,211,153,0.12)",   border: "rgba(52,211,153,0.3)",  view: "statement" as View },
  { Icon: BookBookmark,   title: "Request Checkbook",   titleAr: "طلب دفتر شيكات",      desc: "Delivered in 3-5 days",    color: "#A78BFA", bg: "rgba(167,139,250,0.12)",  border: "rgba(167,139,250,0.3)", view: "request" as View, reqType: "checkbook" as Request },
  { Icon: CreditCard,     title: "Request Debit Card",  titleAr: "طلب بطاقة الصراف",    desc: "Visa or Mastercard",       color: "#F87171", bg: "rgba(248,113,113,0.12)",  border: "rgba(248,113,113,0.3)", view: "request" as View, reqType: "debit_card" as Request },
  { Icon: Bank,           title: "Request Credit Card", titleAr: "طلب بطاقة الائتمان",  desc: "Premium Platinum Card",    color: "#FB923C", bg: "rgba(251,146,60,0.12)",   border: "rgba(251,146,60,0.3)",  view: "request" as View, reqType: "credit_card" as Request },
];

const RECS = [
  { Icon: PiggyBank,  title: "Savings Account",  desc: "Competitive returns",  rate: "3.5% p.a." },
  { Icon: CreditCard, title: "Platinum Card",     desc: "Exclusive rewards",    rate: "5% Cashback" },
  { Icon: Bank,       title: "Personal Finance",  desc: "Up to AED 500,000",    rate: "From 3.49%" },
];

export default function ServicesPage() {
  const router = useRouter();
  const [view, setView] = useState<View>("home");
  const [activeReq, setActiveReq] = useState<Request>(null);
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadDone, setDownloadDone] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestDone, setRequestDone] = useState(false);
  const [txVisible, setTxVisible] = useState(0);

  useEffect(() => {
    if (view === "balance") {
      const t = setTimeout(() => setBalanceVisible(true), 600);
      return () => clearTimeout(t);
    }
    if (view === "statement") {
      let i = 0;
      const iv = setInterval(() => {
        i++; setTxVisible(i);
        if (i >= MOCK_ACCOUNT.transactions.length) clearInterval(iv);
      }, 200);
      return () => clearInterval(iv);
    }
  }, [view]);

  const handleServiceClick = (svc: typeof SERVICES[0]) => {
    if (svc.reqType) { setActiveReq(svc.reqType); setView("request"); setRequestDone(false); }
    else setView(svc.view);
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    await new Promise(r => setTimeout(r, 2000));
    setIsDownloading(false);
    setDownloadDone(true);
    const a = document.createElement("a");
    a.href = "data:application/pdf;base64,JVBERi0xLjQ=";
    a.download = "AL_Masraf_Statement_April_2026.pdf";
    a.click();
  };

  const handleRequest = async () => {
    setIsRequesting(true);
    await new Promise(r => setTimeout(r, 2500));
    setIsRequesting(false);
    setRequestDone(true);
  };

  const reqLabels: Record<string, string> = { checkbook: "Checkbook", debit_card: "Debit Card", credit_card: "Credit Card" };
  const fmt = (n: number) => Math.abs(n).toLocaleString("en-AE", { minimumFractionDigits: 2 });
  const goHome = () => { setView("home"); setBalanceVisible(false); setTxVisible(0); setDownloadDone(false); setRequestDone(false); };

  return (
    <KioskLayout>
      <ParticleCanvas />
      <div className="relative h-full flex flex-col" style={{ zIndex: 10 }}>

        {/* ── Account Hero Bar ── */}
        <div style={{
          flexShrink: 0,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 32px",
          background: "linear-gradient(135deg, rgba(20,35,70,0.98), rgba(15,28,58,0.98))",
          borderBottom: "1px solid rgba(200,168,75,0.2)",
        }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: "0.15em", textTransform: "uppercase" }}>Current Account</div>
            <div style={{ fontSize: 16, fontWeight: 800, color: "#F1F5F9", fontFamily: "monospace", marginTop: 2 }}>{MOCK_ACCOUNT.accountNumber}</div>
            <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }} dir="rtl">{MOCK_ACCOUNT.customer.nameAr}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#64748B", letterSpacing: "0.12em", textTransform: "uppercase" }}>Available Balance</div>
            <div style={{
              fontSize: 32, fontWeight: 900, marginTop: 2,
              background: "linear-gradient(135deg, #C8A84B, #F5E27A)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            }}>
              AED {MOCK_ACCOUNT.balance.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "flex-end", marginTop: 4 }}>
              <CheckCircle size={12} weight="bold" style={{ color: "#34D399" }} />
              <span style={{ fontSize: 11, color: "#34D399", fontWeight: 600 }}>Account Active</span>
            </div>
          </div>
        </div>

        {/* ── Sub nav (non-home) ── */}
        {view !== "home" && (
          <div style={{
            flexShrink: 0, display: "flex", alignItems: "center", gap: 8,
            padding: "10px 32px", borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>
            <button onClick={goHome} style={{
              display: "flex", alignItems: "center", gap: 6,
              color: "#94A3B8", fontSize: 13, background: "none", border: "none", cursor: "pointer", padding: 0,
            }}>
              ← Services
            </button>
            <span style={{ color: "#334155" }}>/</span>
            <span style={{ color: "#F1F5F9", fontSize: 13, fontWeight: 600 }}>
              {view === "request" ? reqLabels[activeReq!] : view === "balance" ? "Account Balance" : "Mini Statement"}
            </span>
          </div>
        )}

        {/* ── Content Area ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "20px 32px" }}
          className="scroll-area">

          {/* ════ HOME ════ */}
          {view === "home" && (
            <>
              {/* Service Grid */}
              <div style={{ fontSize: 18, fontWeight: 900, color: "#F1F5F9", marginBottom: 14 }}>Banking Services</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 20 }}>
                {SERVICES.map((svc) => {
                  const { Icon: SvcIcon } = svc;
                  return (
                    <button
                      key={svc.title}
                      onClick={() => handleServiceClick(svc)}
                      style={{
                        display: "flex", flexDirection: "column", gap: 14,
                        padding: "22px 20px", borderRadius: 18, cursor: "pointer",
                        background: "rgba(15,30,60,0.9)",
                        border: `1px solid ${svc.border}`,
                        textAlign: "left", transition: "all 0.25s ease",
                      }}
                      onMouseEnter={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(25,45,85,0.95)";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)";
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLElement).style.background = "rgba(15,30,60,0.9)";
                        (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      }}
                    >
                      <div style={{
                        width: 52, height: 52, borderRadius: 14, display: "flex",
                        alignItems: "center", justifyContent: "center",
                        background: svc.bg, color: svc.color,
                      }}>
                        <SvcIcon size={28} weight="thin" />
                      </div>
                      <div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: "#F1F5F9" }}>{svc.title}</div>
                        <div style={{ fontSize: 12, color: "#64748B", marginTop: 3 }}>{svc.titleAr}</div>
                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 10, fontSize: 12, color: svc.color, fontWeight: 600 }}>
                          {svc.desc} <CaretRight size={11} weight="bold" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* AI Recommendations */}
              <div style={{ marginBottom: 8 }}>
                <div style={{
                  display: "flex", alignItems: "center", gap: 8, marginBottom: 12,
                  fontSize: 12, fontWeight: 700, color: "#60A5FA",
                  letterSpacing: "0.1em", textTransform: "uppercase",
                }}>
                  <Robot size={14} weight="bold" />
                  AI Recommended for You
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {RECS.map(({ Icon: I, title, desc, rate }) => (
                    <div key={title} style={{
                      padding: "18px 18px", borderRadius: 16, cursor: "pointer",
                      background: "rgba(15,28,58,0.85)", border: "1px solid rgba(200,168,75,0.2)",
                      transition: "transform 0.2s",
                    }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 12, display: "flex",
                        alignItems: "center", justifyContent: "center", marginBottom: 12,
                        background: "rgba(200,168,75,0.1)", color: "#C8A84B",
                      }}>
                        <I size={20} weight="thin" />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#F1F5F9" }}>{title}</div>
                      <div style={{ fontSize: 12, color: "#64748B", marginTop: 3 }}>{desc}</div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#C8A84B", marginTop: 6 }}>{rate}</div>
                      <button style={{
                        display: "flex", alignItems: "center", gap: 4, marginTop: 10,
                        fontSize: 11, fontWeight: 600, color: "#60A5FA",
                        background: "none", border: "none", cursor: "pointer", padding: 0,
                      }}>
                        Learn More <ArrowUpRight size={11} weight="bold" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ════ BALANCE ════ */}
          {view === "balance" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 28, paddingTop: 20, animation: "slideUpFade 0.5s ease" }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 12, color: "#64748B", letterSpacing: "0.15em", textTransform: "uppercase", marginBottom: 12 }}>Available Balance</div>
                <div style={{
                  fontWeight: 900, fontSize: "clamp(52px,7vw,84px)",
                  background: "linear-gradient(135deg, #C8A84B, #F5E27A, #C8A84B)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                  filter: balanceVisible ? "none" : "blur(16px)",
                  transform: balanceVisible ? "scale(1)" : "scale(0.95)",
                  transition: "all 1s ease",
                }}>
                  AED {MOCK_ACCOUNT.balance.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
                </div>
                <div style={{ color: "#64748B", marginTop: 8, fontFamily: "monospace", fontSize: 14 }}>{MOCK_ACCOUNT.accountNumber}</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, width: "100%", maxWidth: 700 }}>
                {[
                  { label: "Account Type", value: MOCK_ACCOUNT.accountType },
                  { label: "Currency", value: MOCK_ACCOUNT.currency },
                  { label: "Status", value: "Active" },
                  { label: "Opening Date", value: MOCK_ACCOUNT.openedDate },
                  { label: "Account Holder", value: MOCK_ACCOUNT.customer.name },
                  { label: "Branch", value: "Abu Dhabi Main" },
                ].map(item => (
                  <div key={item.label} style={{
                    padding: "14px 16px", borderRadius: 14,
                    background: "rgba(15,28,58,0.85)", border: "1px solid rgba(255,255,255,0.08)",
                  }}>
                    <div style={{ fontSize: 11, color: "#64748B", marginBottom: 4 }}>{item.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9" }}>{item.value}</div>
                  </div>
                ))}
              </div>

              <button onClick={() => setView("statement")} style={{
                padding: "14px 40px", borderRadius: 14, cursor: "pointer", border: "none",
                background: "linear-gradient(135deg, #8A6E1E, #C8A84B, #F5E27A, #C8A84B)",
                color: "#000", fontWeight: 800, fontSize: 16, display: "flex", alignItems: "center", gap: 8,
              }}>
                View Statement <CaretRight size={18} weight="bold" />
              </button>
            </div>
          )}

          {/* ════ STATEMENT ════ */}
          {view === "statement" && (
            <div style={{ animation: "slideUpFade 0.5s ease" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 900, color: "#F1F5F9" }}>Mini Statement</div>
                  <div style={{ fontSize: 13, color: "#64748B", marginTop: 3 }}>Last {MOCK_ACCOUNT.transactions.length} transactions</div>
                </div>
                <button onClick={handleDownload} disabled={isDownloading} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 22px", borderRadius: 12, cursor: "pointer", border: "none",
                  background: downloadDone ? "rgba(255,255,255,0.06)" : "linear-gradient(135deg, #8A6E1E, #C8A84B, #F5E27A)",
                  color: downloadDone ? "#34D399" : "#000", fontWeight: 700, fontSize: 13,
                }}>
                  {isDownloading ? <><CircleNotch size={15} className="animate-spin" /> Generating...</>
                    : downloadDone ? <><CheckCircle size={15} weight="bold" /> Downloaded</>
                    : <><DownloadSimple size={15} weight="bold" /> Download PDF</>}
                </button>
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "14px 20px", borderRadius: 14, marginBottom: 14,
                background: "rgba(200,168,75,0.06)", border: "1px solid rgba(200,168,75,0.2)",
              }}>
                <div>
                  <div style={{ fontSize: 11, color: "#64748B" }}>Account</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "#F1F5F9", fontFamily: "monospace" }}>{MOCK_ACCOUNT.accountNumber}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, color: "#64748B" }}>Current Balance</div>
                  <div style={{ fontSize: 20, fontWeight: 900, color: "#C8A84B" }}>
                    AED {MOCK_ACCOUNT.balance.toLocaleString("en-AE", { minimumFractionDigits: 2 })}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {MOCK_ACCOUNT.transactions.map((tx: Transaction, i: number) => (
                  <div key={tx.id} style={{
                    display: "flex", alignItems: "center",
                    padding: "14px 18px", borderRadius: 14,
                    background: "rgba(15,28,58,0.85)", border: "1px solid rgba(255,255,255,0.07)",
                    opacity: i < txVisible ? 1 : 0,
                    transform: i < txVisible ? "translateX(0)" : "translateX(-12px)",
                    transition: "all 0.4s ease",
                  }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: "50%", display: "flex",
                      alignItems: "center", justifyContent: "center", flexShrink: 0, marginRight: 14,
                      background: tx.type === "credit" ? "rgba(52,211,153,0.1)" : "rgba(248,113,113,0.1)",
                    }}>
                      {tx.type === "credit"
                        ? <ArrowUpRight size={18} weight="bold" style={{ color: "#34D399" }} />
                        : <ArrowDownRight size={18} weight="bold" style={{ color: "#F87171" }} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "#F1F5F9" }}>{tx.description}</div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>{tx.date} · {tx.category}</div>
                    </div>
                    <div style={{ textAlign: "right", marginLeft: 14 }}>
                      <div style={{ fontSize: 15, fontWeight: 800, color: tx.type === "credit" ? "#34D399" : "#F87171" }}>
                        {tx.type === "credit" ? "+" : "-"}AED {fmt(tx.amount)}
                      </div>
                      <div style={{ fontSize: 11, color: "#64748B", marginTop: 2 }}>Bal: AED {fmt(tx.balance)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ════ REQUEST ════ */}
          {view === "request" && activeReq && (
            <div style={{ maxWidth: 560, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", gap: 24, paddingTop: 20, animation: "slideUpFade 0.5s ease" }}>
              {requestDone ? (
                <>
                  <div style={{
                    width: 96, height: 96, borderRadius: "50%", display: "flex",
                    alignItems: "center", justifyContent: "center",
                    background: "rgba(52,211,153,0.1)", border: "2px solid rgba(52,211,153,0.4)",
                    boxShadow: "0 0 40px rgba(52,211,153,0.2)", animation: "successPop 0.6s ease",
                  }}>
                    <CheckCircle size={44} weight="duotone" style={{ color: "#34D399" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 28, fontWeight: 900, color: "#F1F5F9" }}>Request Submitted</div>
                    <div style={{ fontSize: 14, color: "#64748B", marginTop: 6 }}>Your {reqLabels[activeReq]} has been processed.</div>
                  </div>
                  <div style={{
                    width: "100%", padding: "20px 24px", borderRadius: 18,
                    background: "rgba(52,211,153,0.05)", border: "1px solid rgba(52,211,153,0.2)",
                  }}>
                    {[
                      { label: "Reference", value: `REF-${Date.now().toString().slice(-8)}` },
                      { label: "Estimated Delivery", value: "3 – 5 business days" },
                      { label: "Delivery Address", value: MOCK_ACCOUNT.customer.address },
                      { label: "Notification", value: "SMS and WhatsApp" },
                    ].map(item => (
                      <div key={item.label} style={{
                        display: "flex", justifyContent: "space-between", padding: "10px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                      }}>
                        <span style={{ fontSize: 13, color: "#64748B" }}>{item.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => router.push("/")} style={{
                    width: "100%", padding: "16px", borderRadius: 14, cursor: "pointer", border: "none",
                    background: "linear-gradient(135deg, #8A6E1E, #C8A84B, #F5E27A)",
                    color: "#000", fontWeight: 800, fontSize: 16,
                  }}>
                    Back to Home
                  </button>
                </>
              ) : (
                <>
                  <div style={{ fontSize: 24, fontWeight: 900, color: "#F1F5F9" }}>Request {reqLabels[activeReq]}</div>
                  <div style={{
                    width: "100%", padding: "20px 24px", borderRadius: 18,
                    background: "rgba(15,28,58,0.9)", border: "1px solid rgba(255,255,255,0.08)",
                  }}>
                    {[
                      { key: "Account", val: MOCK_ACCOUNT.accountNumber },
                      { key: "Name", val: MOCK_ACCOUNT.customer.name },
                      { key: "Delivery Address", val: MOCK_ACCOUNT.customer.address },
                      { key: "Expected Delivery", val: "3 – 5 business days" },
                      { key: "Fee", val: "AED 0 (Waived)" },
                    ].map(item => (
                      <div key={item.key} style={{
                        display: "flex", justifyContent: "space-between", padding: "10px 0",
                        borderBottom: "1px solid rgba(255,255,255,0.05)",
                      }}>
                        <span style={{ fontSize: 13, color: "#64748B" }}>{item.key}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#F1F5F9" }}>{item.val}</span>
                      </div>
                    ))}
                  </div>
                  <button onClick={handleRequest} disabled={isRequesting} style={{
                    width: "100%", padding: "18px", borderRadius: 14, cursor: "pointer", border: "none",
                    background: "linear-gradient(135deg, #8A6E1E, #C8A84B, #F5E27A)",
                    color: "#000", fontWeight: 900, fontSize: 17,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  }}>
                    {isRequesting
                      ? <><CircleNotch size={22} className="animate-spin" /> Processing...</>
                      : <>Confirm Request <CaretRight size={22} weight="bold" /></>}
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>
      <AIAssistant />
    </KioskLayout>
  );
}
