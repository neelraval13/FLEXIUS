import type React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const BackButton: React.FC = () => {
  return (
    <Link
      href="/exercises"
      className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
    >
      <ArrowLeft className="mr-1 h-4 w-4" />
      Back to Exercises
    </Link>
  );
};

export default BackButton;
