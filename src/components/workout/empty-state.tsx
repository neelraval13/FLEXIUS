"use client";

import type React from "react";
import Link from "next/link";
import { Dumbbell, MessageSquare } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

const WorkoutEmptyState: React.FC = () => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="rounded-full bg-muted p-4">
        <Dumbbell className="h-10 w-10 text-muted-foreground" />
      </div>
      <div className="space-y-1">
        <h2 className="font-heading text-lg font-semibold">
          No Plan for Today
        </h2>
        <p className="text-sm text-muted-foreground">
          Chat with your Flexius AI Coach to build today&apos;s workout plan.
        </p>
      </div>
      <Link
        href="/chat"
        className={buttonVariants({ variant: "default", size: "lg" })}
      >
        <MessageSquare className="mr-2 h-4 w-4" />
        Chat with Coach
      </Link>
    </div>
  );
};

export default WorkoutEmptyState;
