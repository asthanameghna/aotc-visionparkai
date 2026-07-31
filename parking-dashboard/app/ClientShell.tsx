"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";

type ClientShellProps = {
  children: React.ReactNode;
};

export default function ClientShell({ children }: ClientShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: "var(--bg-deep)" }}>
      <div className="fixed inset-0 grid-bg pointer-events-none z-0" />

      <div
        className="fixed pointer-events-none z-0"
        style={{
          top: "-20%",
          left: "-10%",
          width: "600px",
          height: "600px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />
      <div
        className="fixed pointer-events-none z-0"
        style={{
          bottom: "-20%",
          right: "-10%",
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)",
          filter: "blur(40px)",
        }}
      />

      <Sidebar isSidebarOpen={isSidebarOpen} onToggleSidebar={() => setIsSidebarOpen((current) => !current)} />

      <main className="relative z-10 flex-1 overflow-y-auto transition-all duration-300 ease-in-out" style={{ minHeight: "100vh" }}>
        {children}
      </main>
    </div>
  );
}