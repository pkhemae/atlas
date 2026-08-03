import { DownloadButton } from "@/pages/landing/ui/download-button";
import { Reveal } from "@/pages/landing/ui/reveal";

export function CtaSection() {
  return (
    <section className="flex flex-col items-center gap-8 px-6 py-32 text-center">
      <Reveal>
        <h2 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          Try Atlas now.
        </h2>
      </Reveal>
      <Reveal className="delay-100">
        <DownloadButton size="xl" />
      </Reveal>
    </section>
  );
}
