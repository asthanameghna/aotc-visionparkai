import type { Metadata } from "next";
import "./globals.css";
import ClientShell from "./ClientShell";

export const metadata: Metadata = {
  title: "VisionPark AI — Intelligent Parking Management",
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
        <ClientShell>{children}</ClientShell>
      </body>
    </html>
  );
}
