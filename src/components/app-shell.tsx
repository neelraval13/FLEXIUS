"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  MessageSquare,
  Dumbbell,
  CalendarDays,
  UserCircle,
  LogOut,
  Sun,
  Moon,
  Monitor,
  Settings,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { useTheme } from "next-themes";

import NotificationBell from "@/components/notification-bell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const handleSignOut = () => {
    try {
      window.localStorage.removeItem("flexius-chat-history");
      window.localStorage.removeItem("flexius-mini-chat-history");
    } catch {
      // ignore
    }
    signOut({ callbackUrl: "/login" });
  };

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
          {/* Theme toggle — quick flip */}
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  aria-label="Toggle theme"
                />
              }
            >
              <Sun className="size-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>

          <NotificationBell />

          {/* User menu — consolidates profile + settings + sign out */}
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="User menu"
                  className={cn(
                    pathname.startsWith("/profile") &&
                      "text-primary hover:text-primary",
                  )}
                />
              }
            >
              <UserCircle className="size-5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="bottom">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => router.push("/profile")}
                render={<button type="button" />}
              >
                <UserCircle className="size-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push("/settings")}
                render={<button type="button" />}
              >
                <Settings className="size-4" />
                Settings
              </DropdownMenuItem>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Theme</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenuRadioItem value="light">
                  <Sun className="size-4" />
                  Light
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="dark">
                  <Moon className="size-4" />
                  Dark
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="system">
                  <Monitor className="size-4" />
                  System
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>

              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={handleSignOut}
                render={<button type="button" />}
              >
                <LogOut className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
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
                className={cn(
                  "flex flex-1 flex-col items-center gap-0.5 py-2 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
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
