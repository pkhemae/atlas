import * as React from "react";
import { Eye, EyeOff } from "lucide-react";

import { Input } from "@atlas/ui/components/input";
import { cn } from "@atlas/ui/lib/utils";

const ICON_TRANSITION =
  "absolute inset-0 size-4 transition-[opacity,scale,filter] duration-200 ease-[cubic-bezier(0.2,0,0,1)]";

type PasswordInputProps = Omit<React.ComponentProps<typeof Input>, "type"> & {
  /** Accessible labels for the visibility toggle — override to localize. */
  showLabel?: string;
  hideLabel?: string;
};

function PasswordInput({
  className,
  showLabel = "Show password",
  hideLabel = "Hide password",
  ...props
}: PasswordInputProps) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div className="relative">
      <Input
        data-slot="password-input"
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
        {...props}
      />
      <button
        type="button"
        onClick={() => setVisible((current) => !current)}
        aria-label={visible ? hideLabel : showLabel}
        aria-pressed={visible}
        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 flex w-10 items-center justify-center transition-colors"
      >
        {/* both icons stay mounted and cross-fade with scale + blur */}
        <span aria-hidden="true" className="relative size-4">
          <Eye
            className={cn(
              ICON_TRANSITION,
              visible
                ? "scale-25 opacity-0 blur-[4px]"
                : "scale-100 opacity-100 blur-none",
            )}
          />
          <EyeOff
            className={cn(
              ICON_TRANSITION,
              visible
                ? "scale-100 opacity-100 blur-none"
                : "scale-25 opacity-0 blur-[4px]",
            )}
          />
        </span>
      </button>
    </div>
  );
}

export { PasswordInput };
