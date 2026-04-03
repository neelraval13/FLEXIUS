// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import SWRegister from "@/components/sw-register";

export const metadata: Metadata = {
  title: {
    default: "Fitness Coach",
    template: "%s | Fitness Coach",
  },
  description: "Personal AI-powered fitness tracker and coach",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FitCoach",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0a0a0a",
};

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <SessionProvider>
          {children}
          <SWRegister />
        </SessionProvider>
      </body>
    </html>
  );
};

export default RootLayout;
