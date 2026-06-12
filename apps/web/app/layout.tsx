import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Design reads as SF Pro (iOS-native), which can't be self-hosted for
// web. Inter is the closest licensed stand-in; swap here if a brand
// face is chosen.
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: { default: "Panorama", template: "%s" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}
