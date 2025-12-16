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
  title: "Party - 城市活動行事曆 | Events Today in Town",
  description: "隨時隨地，精彩相聚。連接、慶祝、創造難忘回憶。發現並參與台灣各地的聚會、工作坊、活動。",
  verification: {
    google: 'i_EmyVmvDbIuam9GMvkbgQAxQ-mwGgtVSLipHurhAuo',
  },
  keywords: ["活動", "聚會", "meetup", "workshop", "社交", "城市活動", "events"],
  icons: {
    icon: "/1202-Party-Logo-v1.png",
    apple: "/1202-Party-Logo-v1.png",
  },
};

import { I18nProvider } from "@/lib/i18n";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MobileNav from "@/components/MobileNav";
import { Analytics } from "@vercel/analytics/react";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleOneTap from "@/components/GoogleOneTap";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";

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
          <div className="pb-[60px] md:pb-0">
            {children}
          </div>
          <Footer />
          <MobileNav />
          <Analytics />
          <GoogleAnalytics />
          <GoogleOneTap />
          <PWAInstallPrompt />
        </I18nProvider>
      </body>
    </html>
  );
}
