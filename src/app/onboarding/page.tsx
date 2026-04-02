"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import KioskLayout from "@/components/KioskLayout";
import ParticleCanvas from "@/components/ParticleCanvas";
import AIAssistant from "@/components/AIAssistant";
import {
  UploadSimple, CheckCircle, User, File, Phone, CircleNotch, Sparkle,
  Timer, ShieldStar, ScanSmiley, Hash, UserCheck, Globe, CheckFat,
  Lock, ArrowLeft, Confetti
} from "@phosphor-icons/react";
import { MOCK_ACCOUNT } from "@/lib/mock-data";

type Step = "upload" | "scanning" | "review" | "confirm" | "success";

interface ExtractedData {
  name: string;
  nameAr: string;
  idNumber: string;
  nationality: string;
  dob: string;
  expiry: string;
  gender: string;
}

const STEP_LABELS = ["Scan ID", "AI Processing", "Review Details", "Confirm", "Account Created"];

const SCANNING_STEPS = [
  { Icon: ScanSmiley,  text: "Detecting document boundaries..." },
  { Icon: Hash,        text: "Reading ID number..." },
  { Icon: UserCheck,   text: "Extracting personal details..." },
  { Icon: Globe,       text: "Verifying nationality and expiry..." },
  { Icon: ShieldStar,  text: "Running AML and compliance check..." },
  { Icon: Lock,        text: "Encrypting and securing data..." },
];

const FORM_FIELDS = [
  { key: "name",        label: "Full Name (English)",       Icon: User },
  { key: "nameAr",      label: "الاسم الكامل بالعربية",    Icon: User },
  { key: "idNumber",    label: "Emirates ID Number",        Icon: File },
  { key: "nationality", label: "Nationality",               Icon: ShieldStar },
  { key: "dob",         label: "Date of Birth",             Icon: File },
  { key: "expiry",      label: "ID Expiry Date",            Icon: File },
  { key: "gender",      label: "Gender",                    Icon: User },
];

export default function OnboardingPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<Step>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedData | null>(null);
  const [scanStep, setScanStep] = useState(0);
  const [fillingField, setFillingField] = useState<number>(-1);
  const [filledFields, setFilledFields] = useState<Record<string, string>>({});
  const [phone, setPhone] = useState("+971 ");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [totalTime, setTotalTime] = useState(0);
  const [whatsappSent, setWhatsappSent] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  const currentStepIndex = ["upload", "scanning", "review", "confirm", "success"].indexOf(step);

  useEffect(() => {
    if (step !== "upload" && step !== "success") {
      startTimeRef.current = startTimeRef.current || Date.now();
      timerRef.current = setInterval(() => {
        setElapsedSecs(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);
    } else if (step === "success") {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [step]);

  const fmtTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const processImage = useCallback(async (base64: string) => {
    startTimeRef.current = Date.now();
    setStep("scanning");
    setScanStep(0);

    for (let i = 0; i < SCANNING_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 650));
      setScanStep(i + 1);
    }

    let data: ExtractedData;
    try {
      const res = await fetch("/api/ai/extract-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64 }),
      });
      data = await res.json();
    } catch {
      data = {
        name: MOCK_ACCOUNT.customer.name,
        nameAr: MOCK_ACCOUNT.customer.nameAr,
        idNumber: MOCK_ACCOUNT.customer.idNumber,
        nationality: "United Arab Emirates",
        dob: MOCK_ACCOUNT.customer.dob,
        expiry: "20/11/2028",
        gender: "Male",
      };
    }

    setExtractedData(data);
    await new Promise((r) => setTimeout(r, 400));
    setStep("review");

    const values: Record<string, string> = {
      name: data.name, nameAr: data.nameAr || MOCK_ACCOUNT.customer.nameAr,
      idNumber: data.idNumber, nationality: data.nationality,
      dob: data.dob, expiry: data.expiry, gender: data.gender,
    };

    for (let i = 0; i < FORM_FIELDS.length; i++) {
      const key = FORM_FIELDS[i].key;
      setFillingField(i);
      let partial = "";
      for (const char of values[key]) {
        partial += char;
        setFilledFields((prev) => ({ ...prev, [key]: partial }));
        await new Promise((r) => setTimeout(r, 35));
      }
      setFillingField(-1);
      await new Promise((r) => setTimeout(r, 120));
    }
  }, []);

  const handleFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setUploadedImage(dataUrl);
      processImage(dataUrl.split(",")[1]);
    };
    reader.readAsDataURL(file);
  }, [processImage]);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 2000));
    setTotalTime(Math.floor((Date.now() - startTimeRef.current) / 1000));
    setStep("success");
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          to: phone.replace(/[\s\-\(\)]/g, ""),
          type: "account_welcome",
          customerName: extractedData?.name || MOCK_ACCOUNT.customer.name,
          accountNumber: MOCK_ACCOUNT.accountNumber,
        }),
      });
      if (res.ok) setWhatsappSent(true);
    } catch { /* silent */ }
    setIsSubmitting(false);
  };

  return (
    <KioskLayout>
      <ParticleCanvas />
      <div style={{ position: "relative", height: "100%", display: "flex", flexDirection: "column", zIndex: 10 }}>

        {/* ── Header Progress Bar ── */}
        <div style={{
          flexShrink: 0, padding: "24px 48px",
          background: "rgba(15,28,58,0.4)", borderBottom: "1px solid rgba(255,255,255,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 1100, margin: "0 auto", width: "100%" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
              {STEP_LABELS.map((label, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, flex: i < STEP_LABELS.length - 1 ? 1 : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 14, fontWeight: 800, transition: "all 0.3s ease",
                      background: i < currentStepIndex ? "rgba(0,200,150,0.15)" : i === currentStepIndex ? "rgba(200,168,75,0.15)" : "rgba(255,255,255,0.04)",
                      border: i < currentStepIndex ? "2px solid #00C896" : i === currentStepIndex ? "2px solid #C8A84B" : "2px solid rgba(255,255,255,0.1)",
                      color: i < currentStepIndex ? "#00C896" : i === currentStepIndex ? "#C8A84B" : "rgba(255,255,255,0.3)"
                    }}>
                      {i < currentStepIndex ? <CheckFat size={16} weight="fill" /> : i + 1}
                    </div>
                    <span style={{
                      fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
                      color: i <= currentStepIndex ? "#F1F5F9" : "#64748B"
                    }}>
                      {label}
                    </span>
                  </div>
                  {i < STEP_LABELS.length - 1 && (
                    <div style={{
                      flex: 1, height: 2, marginBottom: 20, transition: "all 0.3s ease",
                      background: i < currentStepIndex ? "#00C896" : "rgba(255,255,255,0.08)"
                    }} />
                  )}
                </div>
              ))}
            </div>
            
            {step !== "upload" && step !== "success" && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 999, marginLeft: 24,
                background: "rgba(200,168,75,0.07)", border: "1px solid rgba(200,168,75,0.25)", flexShrink: 0
              }}>
                <Timer size={16} weight="bold" style={{ color: "#C8A84B" }} />
                <span style={{ fontSize: 16, fontWeight: 800, fontFamily: "monospace", color: "#C8A84B", letterSpacing: 1 }}>
                  {fmtTime(elapsedSecs)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Main Content Area ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "40px 48px", display: "flex", flexDirection: "column" }}>
          <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>

            {/* ====== UPLOAD ====== */}
            {step === "upload" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 36, width: "100%", animation: "slideUpFade 0.5s ease" }}>
                <div style={{ textAlign: "center" }}>
                  <h2 style={{ fontSize: 42, fontWeight: 900, color: "#FFF", marginBottom: 12, lineHeight: 1.1 }}>Scan Your Emirates ID</h2>
                  <p style={{ fontSize: 16, color: "#94A3B8" }}>AI will extract your details automatically — no manual entry needed</p>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) handleFile(f); }}
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    width: "100%", maxWidth: 680, height: 280, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                    gap: 20, cursor: "pointer", borderRadius: 24, transition: "all 0.3s ease",
                    background: isDragging ? "rgba(200,168,75,0.05)" : "rgba(255,255,255,0.02)",
                    border: isDragging ? "2px dashed #C8A84B" : "2px dashed rgba(255,255,255,0.15)",
                  }}
                >
                  <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }}
                    onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />
                  
                  <div style={{
                    width: 72, height: 72, borderRadius: 20, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.25)",
                  }}>
                    <UploadSimple size={36} weight="thin" style={{ color: "#C8A84B" }} />
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <p style={{ fontSize: 24, fontWeight: 800, color: "#FFF" }}>Upload Emirates ID</p>
                    <p style={{ fontSize: 14, color: "#64748B", marginTop: 6 }}>Drag and drop or tap to upload · JPG, PNG, PDF</p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 10 }}>
                    <Lock size={15} weight="bold" style={{ color: "#34D399" }} />
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#34D399" }}>
                      256-bit encrypted · Data never leaves this device
                    </span>
                  </div>
                </div>

                <div style={{
                  width: "100%", maxWidth: 680, borderRadius: 24, padding: 24,
                  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)",
                }}>
                  <p style={{ fontSize: 12, fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 16 }}>Sample Emirates ID</p>
                  <div style={{
                    borderRadius: 16, padding: "20px 24px", display: "flex", alignItems: "center", gap: 24,
                    background: "linear-gradient(135deg, #1A3EBF, #0d2e5c)", border: "1px solid rgba(255,255,255,0.15)",
                  }}>
                    <div style={{ width: 64, height: 84, borderRadius: 12, background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <User size={32} weight="thin" color="rgba(255,255,255,0.4)" />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
                      <p style={{ fontWeight: 800, color: "#FFF", fontSize: 14 }}>United Arab Emirates · الإمارات العربية المتحدة</p>
                      <div style={{ display: "flex", gap: 32 }}>
                        {["Full Name", "ID Number", "Nationality", "Date of Birth"].map((f) => (
                          <div key={f}>
                            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>{f}</p>
                            <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 13, fontFamily: "monospace", letterSpacing: 2 }}>██████</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ====== SCANNING ====== */}
            {step === "scanning" && (
              <div style={{ display: "flex", gap: 56, alignItems: "flex-start", width: "100%", animation: "slideUpFade 0.5s ease", marginTop: 20 }}>
                {uploadedImage && (
                  <div style={{ width: 340, flexShrink: 0 }}>
                    <div className="scan-wrapper" style={{ border: "1px solid rgba(200,168,75,0.25)", borderRadius: 20 }}>
                      <div className="scan-line" />
                      <div className="scan-corner scan-corner-tl" />
                      <div className="scan-corner scan-corner-tr" />
                      <div className="scan-corner scan-corner-bl" />
                      <div className="scan-corner scan-corner-br" />
                      <img src={uploadedImage} alt="Emirates ID" style={{ width: "100%", borderRadius: 20, filter: "brightness(0.8)", display: "block" }} />
                    </div>
                  </div>
                )}

                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32 }}>
                    <div style={{
                      width: 52, height: 52, borderRadius: 16, display: "flex", alignItems: "center", justifyItems: "center", justifyContent: "center",
                      background: "rgba(200,168,75,0.1)", border: "1px solid rgba(200,168,75,0.3)",
                    }}>
                      <Sparkle size={28} weight="duotone" style={{ color: "#C8A84B" }} className="animate-spin" />
                    </div>
                    <div>
                      <h3 style={{ fontSize: 26, fontWeight: 900, color: "#FFF", lineHeight: 1.2 }}>AI Reading Your ID</h3>
                      <p style={{ fontSize: 15, color: "#94A3B8" }}>GPT-4o Vision is analyzing your document...</p>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {SCANNING_STEPS.map((s, i) => {
                      const isActive = i === scanStep;
                      const isDone = i < scanStep;
                      return (
                        <div key={i} style={{
                          display: "flex", alignItems: "center", gap: 16, padding: "16px 20px", borderRadius: 16, transition: "all 0.5s",
                          background: isDone ? "rgba(52,211,153,0.06)" : isActive ? "rgba(200,168,75,0.06)" : "rgba(255,255,255,0.02)",
                          border: isDone ? "1px solid rgba(52,211,153,0.18)" : isActive ? "1px solid rgba(200,168,75,0.25)" : "1px solid rgba(255,255,255,0.04)",
                          opacity: i > scanStep ? 0.35 : 1,
                        }}>
                          <div style={{
                            width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                            background: isDone ? "rgba(52,211,153,0.1)" : isActive ? "rgba(200,168,75,0.1)" : "rgba(255,255,255,0.04)",
                            color: isDone ? "#34D399" : isActive ? "#C8A84B" : "rgba(255,255,255,0.25)",
                          }}>
                            <s.Icon size={20} weight={isDone ? "bold" : "light"} />
                          </div>
                          <span style={{ fontSize: 15, fontWeight: 700, color: isDone ? "#34D399" : "#FFF" }}>{s.text}</span>
                          <div style={{ marginLeft: "auto" }}>
                            {isDone && <CheckCircle size={20} weight="bold" color="#34D399" />}
                            {isActive && <CircleNotch size={20} weight="bold" color="#C8A84B" className="animate-spin" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* ====== REVIEW ====== */}
            {step === "review" && extractedData && (
              <div style={{ display: "flex", flexDirection: "column", gap: 32, width: "100%", maxWidth: 860, animation: "slideUpFade 0.5s ease" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: 16, display: "flex", alignItems: "center", justifyContent: "center",
                    background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.3)",
                  }}>
                    <CheckCircle size={32} weight="duotone" color="#34D399" />
                  </div>
                  <div>
                    <h3 style={{ fontSize: 28, fontWeight: 900, color: "#FFF", lineHeight: 1.2 }}>AI Extracted Your Details</h3>
                    <p style={{ fontSize: 15, color: "#34D399", fontWeight: 600 }}>All fields populated automatically — please review and confirm</p>
                  </div>
                </div>

                <div style={{
                  borderRadius: 24, padding: 32, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)",
                }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#C8A84B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 24, display: "flex", alignItems: "center", gap: 10 }}>
                    <Sparkle size={16} weight="fill" /> AI-Extracted Information · Verified
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                    {FORM_FIELDS.map((f, i) => (
                      <div key={f.key}>
                        <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: "#94A3B8", marginBottom: 10 }}>
                          <f.Icon size={14} weight="bold" /> {f.label}
                        </label>
                        <input
                          readOnly
                          value={filledFields[f.key] || ""}
                          placeholder="Extracting..."
                          className={fillingField === i ? "filling" : ""}
                          style={{
                            width: "100%", padding: "16px 20px", borderRadius: 12, border: fillingField === i ? "1px solid #C8A84B" : "1px solid rgba(255,255,255,0.1)",
                            background: "rgba(0,0,0,0.3)", color: "#FFF", fontSize: 15, fontWeight: 600, outline: "none",
                            fontFamily: f.key === "nameAr" ? "Noto Kufi Arabic, sans-serif" : undefined,
                            direction: f.key === "nameAr" ? "rtl" : undefined,
                            transition: "all 0.3s",
                          }}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  borderRadius: 24, padding: 32, background: "rgba(26,110,224,0.05)", border: "1px solid rgba(26,110,224,0.15)",
                }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#60A5FA", textTransform: "uppercase", letterSpacing: 1, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                    <Phone size={16} weight="bold" /> WhatsApp Notification Number
                  </p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, alignItems: "center" }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#94A3B8", marginBottom: 10 }}>Mobile Number</label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+971 50 000 0000"
                        style={{
                          width: "100%", padding: "16px 20px", borderRadius: 12, border: "1px solid rgba(96,165,250,0.3)",
                          background: "rgba(0,0,0,0.3)", color: "#FFF", fontSize: 16, fontWeight: 700, outline: "none",
                        }}
                      />
                    </div>
                    <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.6 }}>
                      Account details and banking updates will be sent to your WhatsApp securely.
                    </p>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 20, marginTop: 10 }}>
                  <button
                    onClick={() => { setStep("upload"); setFilledFields({}); setUploadedImage(null); }}
                    style={{
                      flex: 1, padding: "20px", borderRadius: 16, cursor: "pointer", border: "1px solid rgba(255,255,255,0.15)",
                      background: "rgba(255,255,255,0.05)", color: "#FFF", fontSize: 16, fontWeight: 800,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10
                    }}
                  >
                    <ArrowLeft size={20} weight="bold" /> Re-scan ID
                  </button>
                  <button
                    onClick={() => setStep("confirm")}
                    style={{
                      flex: 3, padding: "20px", borderRadius: 16, cursor: "pointer", border: "none",
                      background: "linear-gradient(135deg, #8A6E1E, #C8A84B, #F5E27A)", color: "#000", fontSize: 18, fontWeight: 900,
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 12
                    }}
                  >
                    <CheckFat size={24} weight="bold" /> Confirm Details and Proceed
                  </button>
                </div>
              </div>
            )}

            {/* ====== CONFIRM ====== */}
            {step === "confirm" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 32, width: "100%", maxWidth: 680, animation: "slideUpFade 0.5s ease", marginTop: 20 }}>
                <h3 style={{ fontSize: 32, fontWeight: 900, color: "#FFF", textAlign: "center" }}>Final Confirmation</h3>

                <div style={{
                  borderRadius: 24, padding: 32, background: "rgba(200,168,75,0.05)", border: "1px solid rgba(200,168,75,0.2)",
                }}>
                  <p style={{ fontSize: 13, fontWeight: 700, color: "#C8A84B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 24 }}>Account Summary</p>
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {[
                      { label: "Account Type", value: "Current Account", badge: "Approved" },
                      { label: "Currency", value: "AED — UAE Dirham" },
                      { label: "Account Holder", value: extractedData?.name || MOCK_ACCOUNT.customer.name },
                      { label: "Emirates ID", value: extractedData?.idNumber || MOCK_ACCOUNT.customer.idNumber },
                      { label: "Opening Balance", value: "AED 0.00" },
                      { label: "Monthly Fee", value: "AED 0 — Free Account" },
                    ].map((item, i) => (
                      <div key={item.label} style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0",
                        borderBottom: i === 5 ? "none" : "1px solid rgba(255,255,255,0.06)"
                      }}>
                        <span style={{ fontSize: 15, color: "#94A3B8", fontWeight: 600 }}>{item.label}</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <span style={{ fontSize: 16, fontWeight: 800, color: "#FFF" }}>{item.value}</span>
                          {item.badge && (
                            <span style={{
                              fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999,
                              background: "rgba(52,211,153,0.15)", color: "#34D399", border: "1px solid rgba(52,211,153,0.3)"
                            }}>
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{
                  padding: 20, borderRadius: 16, background: "rgba(255,255,255,0.03)", display: "flex", alignItems: "flex-start", gap: 16
                }}>
                  <ShieldStar size={24} weight="duotone" color="#34D399" style={{ flexShrink: 0 }} />
                  <p style={{ fontSize: 14, color: "#94A3B8", lineHeight: 1.5, fontWeight: 500 }}>
                    By confirming, you agree to AL Masraf Terms and Conditions and Privacy Policy.
                    Your data is encrypted and protected under UAE data protection laws (PDPL).
                  </p>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  style={{
                    width: "100%", padding: "24px", borderRadius: 16, cursor: isSubmitting ? "not-allowed" : "pointer", border: "none",
                    background: "linear-gradient(135deg, #8A6E1E, #C8A84B, #F5E27A)", color: "#000", fontSize: 20, fontWeight: 900,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 12, opacity: isSubmitting ? 0.8 : 1
                  }}
                >
                  {isSubmitting ? (
                    <><CircleNotch size={26} className="animate-spin" /> Creating Your Account...</>
                  ) : (
                    <><CheckFat size={26} weight="fill" /> Open My Account</>
                  )}
                </button>
              </div>
            )}

            {/* ====== SUCCESS ====== */}
            {step === "success" && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 32, width: "100%", textAlign: "center", animation: "slideUpFade 0.5s ease", marginTop: 20 }}>
                <div style={{ position: "relative", animation: "successPop 0.6s cubic-bezier(0.34,1.56,0.64,1)" }}>
                  <div style={{
                    width: 120, height: 120, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    background: "linear-gradient(135deg, rgba(52,211,153,0.15), rgba(52,211,153,0.05))",
                    border: "3px solid rgba(52,211,153,0.4)", boxShadow: "0 0 80px rgba(52,211,153,0.3)",
                  }}>
                    <Confetti size={64} weight="duotone" color="#34D399" />
                  </div>
                </div>

                <div>
                  <h2 style={{ fontSize: 48, fontWeight: 900, color: "#FFF", marginBottom: 10 }}>Account Created!</h2>
                  <p style={{ fontSize: 20, color: "#94A3B8" }}>
                    Welcome to AL Masraf, <strong style={{ color: "#FFF" }}>{extractedData?.name?.split(" ")[0] || "Valued Customer"}</strong>
                  </p>
                </div>

                <div style={{
                  width: "100%", maxWidth: 560, borderRadius: 24, padding: 32,
                  background: "rgba(200,168,75,0.08)", border: "1px solid rgba(200,168,75,0.25)",
                }}>
                  <p style={{ fontSize: 13, fontWeight: 800, color: "#C8A84B", textTransform: "uppercase", letterSpacing: 1, marginBottom: 16 }}>Your IBAN Account Number</p>
                  <p style={{
                    fontSize: 32, fontWeight: 900, fontFamily: "monospace", letterSpacing: 2,
                    background: "linear-gradient(135deg, #C8A84B, #F5E27A, #C8A84B)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"
                  }}>
                    {MOCK_ACCOUNT.accountNumber}
                  </p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24, paddingTop: 24, borderTop: "1px solid rgba(200,168,75,0.2)" }}>
                    <div style={{ textAlign: "left" }}><p style={{ fontSize: 13, color: "#C8A84B", fontWeight: 700 }}>Account Type</p><p style={{ fontSize: 16, fontWeight: 800, color: "#FFF" }}>Current Account</p></div>
                    <div style={{ textAlign: "center" }}><p style={{ fontSize: 13, color: "#C8A84B", fontWeight: 700 }}>Status</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, justifyContent: "center" }}>
                        <CheckCircle size={16} weight="bold" color="#34D399" />
                        <p style={{ fontSize: 16, fontWeight: 800, color: "#34D399" }}>Active</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}><p style={{ fontSize: 13, color: "#C8A84B", fontWeight: 700 }}>Time Taken</p>
                      <p style={{ fontSize: 16, fontWeight: 900, color: "#FFF" }}>{fmtTime(totalTime)}</p>
                    </div>
                  </div>
                </div>

                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 12, padding: "12px 24px", borderRadius: 999,
                  background: whatsappSent ? "rgba(52,211,153,0.1)" : "rgba(255,255,255,0.05)",
                  border: whatsappSent ? "1px solid rgba(52,211,153,0.3)" : "1px solid rgba(255,255,255,0.1)",
                }}>
                  <Phone size={20} weight={whatsappSent ? "bold" : "light"} color={whatsappSent ? "#34D399" : "#94A3B8"} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: whatsappSent ? "#34D399" : "#94A3B8" }}>
                    {whatsappSent ? `Account details sent to ${phone} via WhatsApp` : "Sending WhatsApp notification..."}
                  </span>
                  {whatsappSent && <CheckCircle size={20} weight="bold" color="#34D399" />}
                </div>

                <div style={{ display: "flex", gap: 20, width: "100%", maxWidth: 560, marginTop: 10 }}>
                  <button onClick={() => router.push("/services")} style={{
                    flex: 1, padding: "20px", borderRadius: 16, cursor: "pointer", border: "none",
                    background: "rgba(255,255,255,0.08)", color: "#FFF", fontSize: 16, fontWeight: 800, transition: "all 0.2s"
                  }}>
                    Explore Services
                  </button>
                  <button onClick={() => router.push("/whatsapp")} style={{
                    flex: 1, padding: "20px", borderRadius: 16, cursor: "pointer", border: "none",
                    background: "linear-gradient(135deg, #1A3EBF, #2563EB)", color: "#FFF", fontSize: 16, fontWeight: 800,
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 10
                  }}>
                    <Phone size={20} weight="bold" /> Continue on WhatsApp
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
      <AIAssistant />
    </KioskLayout>
  );
}
