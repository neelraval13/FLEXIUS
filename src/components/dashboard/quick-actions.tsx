"use client";

import type React from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { MessageCircle, PenLine, ClipboardList, Dumbbell } from "lucide-react";

const actions = [
  { href: "/chat", icon: MessageCircle, label: "AI Coach" },
  { href: "/log", icon: PenLine, label: "Log" },
  { href: "/workout/today", icon: ClipboardList, label: "Plan" },
  { href: "/exercises", icon: Dumbbell, label: "Exercises" },
];

const QuickActions: React.FC = () => {
  return (
    <div className="grid grid-cols-4 gap-2">
      {actions.map(({ href, icon: Icon, label }) => (
        <Link
          key={href}
          href={href}
          className={buttonVariants({
            variant: "outline",
            className: "flex h-auto flex-col gap-1 py-3 text-xs font-medium",
          })}
        >
          <Icon className="h-5 w-5" />
          {label}
        </Link>
      ))}
    </div>
  );
};

export default QuickActions;
