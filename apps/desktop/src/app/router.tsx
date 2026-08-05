import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppLayout } from "@/app/app-layout";
import { HomeFeature } from "@/pages/home/feature/home-feature";
import { LeaderboardsFeature } from "@/pages/leaderboards/feature/leaderboards-feature";
import { LevelsFeature } from "@/pages/levels/feature/levels-feature";
import { SessionsFeature } from "@/pages/sessions/feature/sessions-feature";
import { SettingsFeature } from "@/pages/settings/feature/settings-feature";

interface AppRouterContext {
  onLoggedOut: () => void;
}

const rootRoute = createRootRouteWithContext<AppRouterContext>()({
  component: AppLayout,
});

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomeFeature,
});

const leaderboardsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/leaderboards",
  component: LeaderboardsFeature,
});

const levelsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/levels",
  component: LevelsFeature,
});

const sessionsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/sessions",
  component: SessionsFeature,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/settings",
  component: SettingsFeature,
});

const routeTree = rootRoute.addChildren([
  homeRoute,
  leaderboardsRoute,
  levelsRoute,
  sessionsRoute,
  settingsRoute,
]);

// in-memory history: a desktop window has no URL bar to sync with
export const appRouter = createRouter({
  routeTree,
  history: createMemoryHistory({ initialEntries: ["/"] }),
  context: { onLoggedOut: () => {} },
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof appRouter;
  }
}
