import type React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({ imageUrl, onRemove }) => {
  return (
    <div className="relative inline-block">
      <Image
        src={imageUrl}
        alt="Upload preview"
        width={80}
        height={80}
        className="size-20 rounded-lg border border-border object-cover"
        unoptimized
      />
      <Button
        size="icon"
        variant="secondary"
        className="absolute -right-2 -top-2 size-5 rounded-full"
        onClick={onRemove}
      >
        <X className="size-3" />
      </Button>
    </div>
  );
};

export default ImagePreview;
