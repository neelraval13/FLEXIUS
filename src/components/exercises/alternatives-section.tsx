import type React from "react";
import { Repeat } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AlternativesSectionProps {
  alternatives: string[];
}

const AlternativesSection: React.FC<AlternativesSectionProps> = ({
  alternatives,
}) => {
  if (alternatives.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Repeat className="h-4 w-4" />
          Alternatives
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-1.5">
          {alternatives.map((alt) => (
            <Badge key={alt} variant="outline">
              {alt}
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AlternativesSection;
