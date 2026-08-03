import { Link } from "@tanstack/react-router";
import { DiscordIcon } from "@/pages/landing/ui/discord-icon";
import { GitHubIcon } from "@/pages/landing/ui/github-icon";
import { Reveal } from "@/pages/landing/ui/reveal";

interface FooterProps {
  githubUrl: string;
  communityUrl: string;
  discordUrl: string;
}

export function Footer({ githubUrl, communityUrl, discordUrl }: FooterProps) {
  const linkGroups = [
    {
      title: "Product",
      links: [
        { label: "Download", href: "#" },
        { label: "Changelog", href: "#" },
      ],
    },
    {
      title: "Resources",
      links: [
        { label: "Documentation", href: "#" },
        { label: "Community", href: communityUrl },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Terms", href: "#" },
        { label: "Privacy", href: "#" },
      ],
    },
  ];

  return (
    <footer className="border-border border-t">
      <Reveal className="mx-auto grid w-full max-w-5xl gap-12 px-6 py-16 md:grid-cols-2">
        <div className="flex flex-col items-start gap-4">
          <Link to="/" className="text-lg font-medium tracking-tight">
            Atlas
          </Link>
          <div className="flex items-center gap-4">
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="GitHub"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <GitHubIcon className="size-5" />
            </a>
            <a
              href={discordUrl}
              target="_blank"
              rel="noreferrer"
              aria-label="Discord"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <DiscordIcon className="size-5" />
            </a>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 Atlas.</p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
          {linkGroups.map((group) => (
            <div key={group.title} className="flex flex-col gap-3">
              <h3 className="text-base font-semibold">{group.title}</h3>
              {group.links.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-foreground hover:text-foreground/70 text-sm transition-colors"
                >
                  {link.label}
                </a>
              ))}
            </div>
          ))}
        </div>
      </Reveal>
    </footer>
  );
}
