import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Party - 探索身邊的精彩活動",
  description: "發現並參與台灣各地的聚會、工作坊、派對等活動",
  verification: {
    google: '58147ZZmtRggK8XRLJkVz7uLOpDJpu0v-Gwd7L2PIs4',
  },
  keywords: ["活動", "聚會", "meetup", "workshop", "社交", "派對"],
};

import { I18nProvider } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleOneTap from "@/components/GoogleOneTap";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW">
      <head>
        {/* Google Identity Services */}
        <Script
          src="https://accounts.google.com/gsi/client"
          strategy="afterInteractive"
        />
      </head>
      <body
        className={`antialiased`}
      >
        <I18nProvider>
          <Header />
          {children}
          <Footer />
          <Analytics />
          <GoogleAnalytics />
          <GoogleOneTap />
        </I18nProvider>
      </body>
    </html>
  );
}
