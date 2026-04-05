"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  Dumbbell,
  CalendarDays,
  UserCircle,
  LogOut,
  Sun,
  Moon,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/chat", label: "Coach", icon: MessageSquare },
  { href: "/workout/today", label: "Workout", icon: Dumbbell },
  { href: "/history", label: "History", icon: CalendarDays },
];

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-svh flex-col bg-background text-foreground">
      {/* Top Header */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-border bg-card/95 px-4 py-2 backdrop-blur supports-backdrop-filter:bg-card/80">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo-144.webp"
            alt="Flexius"
            width={48}
            height={48}
            className="h-12 w-12 object-contain"
            priority
          />
          <span className="font-heading text-lg font-bold text-foreground">
            Flexius
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:text-foreground"
            title="Toggle theme"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute left-2 top-2 h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </button>
          <Link
            href="/profile"
            className={`rounded-lg p-2 transition-colors ${
              pathname.startsWith("/profile")
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <UserCircle className="h-6 w-6" />
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:text-destructive"
            title="Sign Out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col overflow-y-auto pt-16 pb-20">
        {children}
      </main>

      {/* Bottom Nav */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-backdrop-filter:bg-card/80">
        <div className="mx-auto flex max-w-lg items-center justify-around">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive =
              href === "/" ? pathname === "/" : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};

export default AppShell;
