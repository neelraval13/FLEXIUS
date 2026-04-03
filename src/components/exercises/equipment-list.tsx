import type React from "react";
import { Badge } from "@/components/ui/badge";

interface EquipmentListProps {
  equipment: string[];
}

const EquipmentList: React.FC<EquipmentListProps> = ({ equipment }) => {
  if (equipment.length === 0) {
    return (
      <span className="text-muted-foreground text-sm">No equipment needed</span>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {equipment.map((item) => (
        <Badge key={item} variant="secondary">
          {item}
        </Badge>
      ))}
    </div>
  );
};

export default EquipmentList;
