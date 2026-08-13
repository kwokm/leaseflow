import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { RevealRoot } from "@/components/motion/reveal-root";
import "./globals.css";

// Variable Inter so the optical-size axis (14–32) is available to headings.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "LeaseFlow — Rental applications and screening",
  description:
    "Collect rental applications, documents, and screening reports in one place. Demo prototype.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <RevealRoot />
        {children}
      </body>
    </html>
  );
}
