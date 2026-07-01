import type { Metadata } from "next";
import "./globals.css";
import { ViewTransitions } from "next-view-transitions";
import { MobileTransitionGuard } from "@/components/ui/MobileTransitionGuard";

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
        <head>
          {/* Runs synchronously before first paint — sets data-view-mode so CSS
              can highlight the correct toggle button without waiting for JS/hydration. */}
          <script dangerouslySetInnerHTML={{ __html: `(function(){try{var v=localStorage.getItem('portfolio-view-mode'),ok={'masonry':1,'archive':1,'archive-sharp':1,'list':1,'list-text':1,'list-sharp-crop':1};document.documentElement.dataset.viewMode=(v&&ok[v])?v:'archive';}catch(e){}})();` }} />
        </head>
        <body>
          <MobileTransitionGuard />
          {children}
        </body>
      </html>
    </ViewTransitions>
  );
}
