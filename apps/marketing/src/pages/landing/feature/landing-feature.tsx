import { getRouteApi } from "@tanstack/react-router";
import {
  COMMUNITY_URL,
  DISCORD_URL,
  GITHUB_URL,
} from "@/pages/landing/feature/github";
import { CtaSection } from "@/pages/landing/ui/cta-section";
import { FaqSection } from "@/pages/landing/ui/faq-section";
import { Footer } from "@/pages/landing/ui/footer";
import { HeroSection } from "@/pages/landing/ui/hero-section";
import { Navbar } from "@/pages/landing/ui/navbar";

const routeApi = getRouteApi("/");

export function LandingFeature() {
  const stars = routeApi.useLoaderData();

  return (
    <>
      <Navbar
        githubUrl={GITHUB_URL}
        communityUrl={COMMUNITY_URL}
        stars={stars}
      />
      <HeroSection githubUrl={GITHUB_URL} />
      <FaqSection />
      <CtaSection />
      <Footer
        githubUrl={GITHUB_URL}
        communityUrl={COMMUNITY_URL}
        discordUrl={DISCORD_URL}
      />
    </>
  );
}
