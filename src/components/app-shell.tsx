"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  Dumbbell,
  CalendarDays,
  UserCircle,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

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

  return (
    <div className="flex h-svh flex-col">
      {/* Top Header */}
      <header className="fixed inset-x-0 top-0 z-50 flex items-center justify-between border-b border-zinc-800 bg-zinc-900/95 px-4 py-2 backdrop-blur supports-backdrop-filter:bg-zinc-900/80">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-header-cropped.png"
            alt="Fitness Coach"
            className="h-12 w-12 object-contain"
          />
          <span className="text-lg font-bold text-white">Fitness Coach</span>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/profile"
            className={`rounded-lg p-2 transition-colors ${
              pathname.startsWith("/profile")
                ? "text-blue-400"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <UserCircle className="h-6 w-6" />
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="rounded-lg p-2 text-zinc-400 transition-colors hover:text-red-400"
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
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-zinc-800 bg-zinc-900/95 backdrop-blur supports-backdrop-filter:bg-zinc-900/80">
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
                    ? "text-blue-400"
                    : "text-zinc-500 hover:text-zinc-300"
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
