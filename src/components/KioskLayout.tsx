"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ArrowLeft, WifiHigh } from "@phosphor-icons/react";

interface Props {
  children: React.ReactNode;
  showBack?: boolean;
}

export default function KioskLayout({ children, showBack = true }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");
  const [lang, setLang] = useState<"en" | "ar">("en");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: true,
        })
      );
      setDate(
        now.toLocaleDateString("en-AE", {
          weekday: "long",
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  const isHome = pathname === "/";

  return (
    <div className="kiosk-screen flex flex-col" style={{ background: "var(--bg-primary)" }}>
      {/* Top Header Bar */}
      <header
        className="flex items-center justify-between px-10 py-4 flex-shrink-0"
        style={{
          background: "rgba(10,22,40,0.97)",
          borderBottom: "1px solid rgba(200,168,75,0.18)",
          backdropFilter: "blur(20px)",
          position: "relative",
          zIndex: 100,
        }}
      >
        {/* Left — Time & Date */}
        <div className="flex flex-col min-w-[200px]">
          <span className="text-2xl font-bold text-white tracking-wider">{time}</span>
          <span className="text-xs text-gray-400 mt-0.5">{date}</span>
        </div>

        {/* Center — Logo */}
        <button
          onClick={() => router.push("/")}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <AlMasrafLogo />
        </button>

        {/* Right — Controls */}
        <div className="flex items-center gap-5 min-w-[200px] justify-end">
          {/* WiFi status */}
          <div className="flex items-center gap-1.5">
            <WifiHigh size={14} className="text-green-400" />
            <span className="text-xs text-green-400 font-medium">Online</span>
          </div>

          {/* Language toggle */}
          <button
            onClick={() => setLang((l) => (l === "en" ? "ar" : "en"))}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all"
            style={{
              background: "rgba(200,168,75,0.1)",
              border: "1px solid rgba(200,168,75,0.3)",
              color: "var(--gold-primary)",
            }}
          >
            <span className="text-xs font-bold">{lang === "en" ? "ع" : "EN"}</span>
            {lang === "en" ? "عربي" : "English"}
          </button>

          {/* Back button */}
          {showBack && !isHome && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all btn-glass"
            >
              <ArrowLeft size={14} weight="bold" />
              Back
            </button>
          )}
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 overflow-hidden relative" style={{ zIndex: 10 }}>
        {children}
      </main>

      {/* Bottom Status Bar */}
      <footer
        className="flex items-center justify-between px-10 py-3 flex-shrink-0"
        style={{
          background: "rgba(10,22,40,0.97)",
          borderTop: "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span className="text-xs text-gray-500">System Operational</span>
        </div>
        <span className="text-xs text-gray-600">AL Masraf AI Kiosk v2.0 • Secure Connection</span>
        <span className="text-xs text-gray-600">© 2026 AL Masraf Bank</span>
      </footer>
    </div>
  );
}

function AlMasrafLogo() {
  return (
    <div className="flex items-center gap-3">
      <img src="/al-masraf-logo.png" alt="AL MASRAF" style={{ height: "48px", objectFit: "contain", filter: "drop-shadow(0 0 10px rgba(255,255,255,0.1))" }} />
      {/* AI text tag */}
      <div className="flex flex-col justify-center border-l border-[rgba(200,168,75,0.3)] pl-3 ml-2">
        <span className="text-[10px] text-gray-400 tracking-[0.2em] uppercase whitespace-nowrap">
          AI Banking Branch
        </span>
      </div>
    </div>
  );
}
