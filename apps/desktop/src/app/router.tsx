import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppLayout } from "@/app/app-layout";
import { HomeFeature } from "@/pages/home/feature/home-feature";
import { ProfileFeature } from "@/pages/profile/feature/profile-feature";

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

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfileFeature,
});

const routeTree = rootRoute.addChildren([homeRoute, profileRoute]);

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
