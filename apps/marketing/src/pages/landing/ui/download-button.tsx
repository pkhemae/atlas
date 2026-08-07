import type * as React from "react";
import { Button } from "@atlas/ui/components/button";
import { cn } from "@atlas/ui/lib/utils";
import { Download } from "lucide-react";

type DownloadButtonProps = React.ComponentProps<typeof Button>;

export function DownloadButton({
  className,
  size,
  children,
  ...props
}: DownloadButtonProps) {
  return (
    <Button size={size} className={cn("group", className)} {...props}>
      {children ?? "Download"}
      <span
        className={cn(
          "relative overflow-hidden",
          size === "xl" ? "size-5" : "size-4",
        )}
      >
        <Download className="absolute inset-0 transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-y-full" />
        <Download className="absolute inset-0 -translate-y-full transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] group-hover:translate-y-0" />
      </span>
    </Button>
  );
}
