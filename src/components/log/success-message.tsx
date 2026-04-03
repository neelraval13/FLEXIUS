// src/components/log/success-message.tsx
"use client";

import type React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";

interface SuccessMessageProps {
  exerciseName: string;
  onLogAnother: () => void;
  returnTo?: string;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({
  exerciseName,
  onLogAnother,
  returnTo,
}) => {
  return (
    <Card className="border-emerald-500/30 bg-emerald-500/5">
      <CardContent className="pt-6 text-center">
        <CheckCircle2 className="mx-auto mb-3 h-12 w-12 text-emerald-500" />
        <h3 className="text-lg font-semibold">Workout Logged!</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {exerciseName} has been recorded.
        </p>
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {returnTo && (
          <Link
            href={returnTo}
            className={buttonVariants({ className: "w-full" })}
          >
            Back to Today&apos;s Workout
          </Link>
        )}
        <div className="flex w-full gap-2">
          <Button variant="outline" className="flex-1" onClick={onLogAnother}>
            Log Another
          </Button>
          <Link
            href="/history"
            className={buttonVariants({
              variant: returnTo ? "outline" : "default",
              className: "flex-1",
            })}
          >
            View History
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
};

export default SuccessMessage;
