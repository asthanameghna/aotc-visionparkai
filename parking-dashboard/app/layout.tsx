import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "SmartPark AI — Intelligent Parking Management",
  description: "Real-time AI-powered parking management system with polygon slot detection, live occupancy monitoring, and smart driver navigation.",
  keywords: "smart parking, AI, YOLO, real-time, parking management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-deep)' }}>
          {/* Animated grid background */}
          <div className="fixed inset-0 grid-bg pointer-events-none z-0" />

          {/* Radial glow orbs */}
          <div
            className="fixed pointer-events-none z-0"
            style={{
              top: '-20%',
              left: '-10%',
              width: '600px',
              height: '600px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(0,212,255,0.06) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />
          <div
            className="fixed pointer-events-none z-0"
            style={{
              bottom: '-20%',
              right: '-10%',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
              filter: 'blur(40px)',
            }}
          />

          {/* Sidebar */}
          <Sidebar />

          {/* Main content area */}
          <main
            className="flex-1 overflow-y-auto relative z-10"
            style={{ minHeight: '100vh' }}
          >
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
