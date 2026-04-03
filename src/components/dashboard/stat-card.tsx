import type React from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  sub?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  label,
  value,
  sub,
}) => {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="bg-primary/10 rounded-lg p-2.5">
          <Icon className="text-primary h-5 w-5" />
        </div>
        <div className="min-w-0">
          <p className="text-muted-foreground text-xs">{label}</p>
          <p className="text-lg font-bold leading-tight">{value}</p>
          {sub && (
            <p className="text-muted-foreground truncate text-xs">{sub}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StatCard;
