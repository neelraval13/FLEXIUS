// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Inter, Outfit } from "next/font/google";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/theme-provider";
import SWRegister from "@/components/sw-register";
import InstallPrompt from "@/components/install-prompt";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

export const metadata: Metadata = {
  title: {
    default: "Flexius — AI Fitness Tracker",
    template: "%s | Flexius",
  },
  description: "Flexius — Your AI-powered personal fitness tracker and coach",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Flexius",
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1B6AC0" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1120" },
  ],
};

const RootLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/icons/apple-touch-icon.png"
        />
      </head>
      <body className="font-sans antialiased check_gok_chrome_installed">
        <ThemeProvider>
          <SessionProvider>
            <TooltipProvider>{children}</TooltipProvider>
            <SWRegister />
            <InstallPrompt />
          </SessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
};

export default RootLayout;
