import type { Metadata } from "next";
import "./globals.css";
import { PageTransitionManager } from "@/components/ui/PageTransitionManager";

export const metadata: Metadata = {
  title: { default: "Panorama", template: "%s" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <PageTransitionManager />
        {children}
      </body>
    </html>
  );
}
