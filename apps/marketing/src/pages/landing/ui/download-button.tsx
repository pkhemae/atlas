import type * as React from "react";
import { Button } from "@atlas/ui/components/button";
import { cn } from "@atlas/ui/lib/utils";
import { Download } from "lucide-react";

// red "relief" CTA: vertical gradient, light inset top edge, dark inset bottom
// edge, layered tinted drop shadows — brightness transitions instead of gradient
// stops because background-image cannot animate smoothly
const RELIEF =
  "group bg-red-600 bg-linear-to-b from-red-500 to-red-700 text-white text-shadow-[0_1px_1px_rgba(0,0,0,0.25)] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.3),inset_0_-1.5px_0_0_rgba(0,0,0,0.2),0_1px_2px_rgba(153,27,27,0.4),0_6px_16px_-4px_rgba(153,27,27,0.5)] transition-[color,background-color,border-color,box-shadow,opacity,scale,filter] hover:brightness-[1.08] hover:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.35),inset_0_-1.5px_0_0_rgba(0,0,0,0.2),0_2px_4px_rgba(153,27,27,0.4),0_10px_24px_-6px_rgba(153,27,27,0.55)] active:brightness-95";

type DownloadButtonProps = React.ComponentProps<typeof Button>;

export function DownloadButton({
  className,
  size,
  children,
  ...props
}: DownloadButtonProps) {
  return (
    <Button size={size} className={cn(RELIEF, className)} {...props}>
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
