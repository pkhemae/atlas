import { Link } from "@tanstack/react-router";
import { DownloadButton } from "@/pages/landing/ui/download-button";
import { GitHubIcon } from "@/pages/landing/ui/github-icon";

interface NavbarProps {
  githubUrl: string;
  communityUrl: string;
  stars: number | null;
}

function formatStars(count: number): string {
  if (count >= 1000) return `${(count / 1000).toFixed(1).replace(/\.0$/, "")}k`;
  return String(count);
}

export function Navbar({ githubUrl, communityUrl, stars }: NavbarProps) {
  return (
    <header className="bg-background/70 sticky top-0 z-50 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
        <Link to="/" className="text-lg font-medium tracking-tight">
          Atlas
        </Link>
        <nav className="flex items-center gap-1 sm:gap-2">
          <a
            href={communityUrl}
            target="_blank"
            rel="noreferrer"
            className="text-foreground hover:text-foreground/70 hidden px-3 py-2.5 text-sm font-medium transition-colors sm:block"
          >
            Community
          </a>
          <a
            href={githubUrl}
            target="_blank"
            rel="noreferrer"
            className="text-foreground hover:text-foreground/70 flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium transition-colors"
          >
            <GitHubIcon className="size-4" />
            {stars ? (
              <span className="tabular-nums">{formatStars(stars)}</span>
            ) : null}
            <span className="sr-only">GitHub</span>
          </a>
          <DownloadButton className="relative ml-1 after:absolute after:-inset-1" />
        </nav>
      </div>
    </header>
  );
}
