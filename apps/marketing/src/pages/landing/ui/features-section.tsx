import { cn } from "@atlas/ui/lib/utils";
import { Reveal } from "@/pages/landing/ui/reveal";

interface Feature {
  eyebrow: string;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    eyebrow: "Focus sessions",
    title: "Deep work, on the clock",
    description:
      "Start a session and Atlas shrinks to a small always-on-top dock: a timer, a pause, ambient sounds — nothing else to look at until the work is done.",
  },
  {
    eyebrow: "Leaderboards",
    title: "Make focus a sport",
    description:
      "Daily, weekly and monthly rankings of pure focus time. Climb into the top 10, size up your rivals, and defend your spot week after week.",
  },
  {
    eyebrow: "Profile",
    title: "Progress you can actually see",
    description:
      "Every focused minute earns XP. Keep your streak alive, climb from Bronze to Diamond, and watch your activity graph fill up as the habit sticks.",
  },
];

export function FeaturesSection() {
  return (
    // scroll-mt clears the sticky navbar when the anchor jumps here
    <section
      id="features"
      className="mx-auto flex w-full max-w-5xl scroll-mt-20 flex-col gap-24 px-6 py-24"
    >
      {FEATURES.map((feature, index) => (
        <Reveal
          key={feature.eyebrow}
          className="grid items-center gap-10 md:grid-cols-2 md:gap-16"
        >
          {/* text first in the DOM (mobile stacks it on top); on md the
              order classes alternate which side the preview sits on */}
          <div
            className={cn(
              "flex flex-col items-start gap-3",
              index % 2 === 1 && "md:order-2",
            )}
          >
            <p className="text-primary font-mono text-xs font-semibold tracking-[0.25em] uppercase">
              {feature.eyebrow}
            </p>
            <h2 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
              {feature.title}
            </h2>
            <p className="text-muted-foreground text-lg text-pretty">
              {feature.description}
            </p>
          </div>
          {/* preview placeholder — each feature's visual lands here later */}
          <div
            aria-hidden="true"
            className={cn(
              "bg-muted aspect-[4/3] w-full rounded-sm",
              index % 2 === 1 && "md:order-1",
            )}
          />
        </Reveal>
      ))}
    </section>
  );
}
