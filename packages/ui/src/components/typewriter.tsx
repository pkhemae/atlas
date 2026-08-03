import * as React from "react";

import { cn } from "@atlas/ui/lib/utils";

interface TypewriterProps extends React.ComponentProps<"span"> {
  text: string;
  /** Milliseconds per character. */
  speed?: number;
  /** Milliseconds before typing starts. */
  startDelay?: number;
}

function Typewriter({ text, speed = 55, startDelay = 0, className, ...props }: TypewriterProps) {
  const [typed, setTyped] = React.useState({ text, count: 0 });
  const count = typed.text === text ? typed.count : 0;
  const done = count >= text.length;

  React.useEffect(() => {
    if (done) return;
    const id = setTimeout(
      () => {
        const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        setTyped({ text, count: reduceMotion ? text.length : count + 1 });
      },
      count === 0 ? startDelay : speed,
    );
    return () => clearTimeout(id);
  }, [count, done, text, speed, startDelay]);

  return (
    <span data-slot="typewriter" className={cn("whitespace-pre-wrap", className)} {...props}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      <span
        aria-hidden="true"
        className={cn(
          "ml-[0.08em] inline-block h-[0.85em] w-[0.05em] translate-y-[0.1em] rounded-full bg-current motion-reduce:hidden",
          done && "animate-caret-blink",
        )}
      />
    </span>
  );
}

export { Typewriter };
