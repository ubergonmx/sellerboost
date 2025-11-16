import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SellerBoost - Your Entire Facebook Sales Process, in One Inbox",
  description: "See all messages from all your Facebook Pages in a single, unified view. Reply faster, close more sales, and never lose a customer in the chat chaos again.",
  keywords: ["Facebook", "sales", "inbox", "messaging", "order management", "social media"],
  authors: [{ name: "SellerBoost" }],
  openGraph: {
    title: "SellerBoost - Your Entire Facebook Sales Process, in One Inbox",
    description: "See all messages from all your Facebook Pages in a single, unified view. Reply faster, close more sales, and never lose a customer in the chat chaos again.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
