import {
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppLayout } from "@/app/app-layout";
import { HomeFeature } from "@/pages/home/feature/home-feature";

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

const routeTree = rootRoute.addChildren([homeRoute]);

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
