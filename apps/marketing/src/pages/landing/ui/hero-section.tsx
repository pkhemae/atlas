import { Button } from "@atlas/ui/components/button";
import { Typewriter } from "@atlas/ui/components/typewriter";
import { AppPreview } from "@/pages/landing/ui/app-preview";
import { AsciiBoidsBackground } from "@/pages/landing/ui/ascii-boids-background";
import { DownloadButton } from "@/pages/landing/ui/download-button";
import { GitHubIcon } from "@/pages/landing/ui/github-icon";

interface HeroSectionProps {
  githubUrl: string;
}

export function HeroSection({ githubUrl }: HeroSectionProps) {
  return (
    <section className="relative flex min-h-[calc(100svh-3.5rem)] flex-col items-center justify-center gap-6 overflow-hidden px-6 py-16 text-center">
      <AsciiBoidsBackground />
      <h1 className="relative max-w-3xl text-6xl font-light tracking-tight sm:text-7xl">
        <Typewriter text="Find your focus." startDelay={250} />
      </h1>
      <p className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards delay-100 text-muted-foreground relative max-w-xl text-pretty text-lg font-light duration-700">
        Atlas helps students study without distractions — focused sessions,
        healthy breaks, and progress you can actually see.
      </p>
      <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards delay-200 relative mt-2 flex flex-col items-center gap-3 duration-700 sm:flex-row">
        <DownloadButton size="xl" />
        <Button asChild size="xl" variant="secondary">
          <a href={githubUrl} target="_blank" rel="noreferrer">
            View on GitHub
            <GitHubIcon />
          </a>
        </Button>
      </div>
      <div className="animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards delay-300 relative mt-12 w-full max-w-6xl duration-700">
        <AppPreview />
      </div>
    </section>
  );
}
