import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Financial Advisor",
  description:
    "An intelligent AI financial advisor providing personalized guidance on investments, market trends, portfolio management, and financial planning.",
  keywords: [
    "AI",
    "financial advisor",
    "investment",
    "portfolio management",
    "market trends",
    "financial planning",
    "wealth management",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-full`}
      >
        {children}
      </body>
    </html>
  );
}
