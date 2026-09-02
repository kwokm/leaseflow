import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "./desk-household.css";

// Variable Inter so the optical-size axis (14–32) is available to headings.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Leaseproof — Rental applications and screening",
  description:
    "Collect rental applications, documents, and screening reports in one place. Demo prototype. Leaseproof is a working name.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
