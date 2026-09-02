import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import "./desk-household.css";
import { RuntimeConfigProvider } from "@/components/config/runtime-config";
import { clerkEnabled, runtimeConfig } from "@/lib/config/env";
import { clerkAppearance } from "@/lib/auth/clerk-appearance";

// Variable Inter so the optical-size axis (14–32) is available to headings.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Leaseproof — Rental applications and screening",
  description:
    "Collect rental applications, documents, and screening reports in one place. Leaseproof is a working name.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const config = runtimeConfig();

  const tree = (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased">
        <RuntimeConfigProvider value={config}>{children}</RuntimeConfigProvider>
      </body>
    </html>
  );

  // ClerkProvider throws without a publishable key, so the unconfigured preview
  // renders the same tree without it.
  if (!clerkEnabled()) return tree;

  return <ClerkProvider appearance={clerkAppearance}>{tree}</ClerkProvider>;
}
