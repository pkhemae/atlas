import { createFileRoute } from "@tanstack/react-router";
import { fetchGithubStars } from "@/pages/landing/feature/github";
import { LandingFeature } from "@/pages/landing/feature/landing-feature";

export const Route = createFileRoute("/")({
  loader: () => fetchGithubStars(),
  component: LandingFeature,
});
