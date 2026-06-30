import type { Metadata } from "next";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";

export const metadata: Metadata = {
  title: { default: "Panorama", template: "%s" },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ViewTransitions>
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}
