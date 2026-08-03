import * as React from "react";
import { cn } from "@atlas/ui/lib/utils";

type RevealProps = React.ComponentProps<"div">;

// scroll-triggered entrance: hidden until the element approaches the viewport,
// then transitions in — CSS transitions so the motion is interruptible, and
// motion-reduce overrides keep content visible without any JS branch
export function Reveal({ className, children, ...props }: RevealProps) {
  const ref = React.useRef<HTMLDivElement>(null);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "transition-[opacity,translate] duration-700 ease-out",
        visible
          ? "translate-y-0 opacity-100"
          : "motion-reduce:translate-y-0 motion-reduce:opacity-100 translate-y-6 opacity-0",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
