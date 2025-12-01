import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Party 聚合平台 - 發現身邊的精彩活動",
  description: "極簡的派對聚合平台，連接活動組織者和參與者，發現、創建和管理各種社交聚會活動",
  keywords: ["活動", "聚會", "meetup", "workshop", "社交", "派對"],
};

import { I18nProvider } from "@/lib/i18n";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "@/components/GoogleAnalytics";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`antialiased`}
      >
        <I18nProvider>
          {children}
          <Footer />
          <Analytics />
          <GoogleAnalytics />
        </I18nProvider>
      </body>
    </html>
  );
}
