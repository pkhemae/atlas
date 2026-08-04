import {
  Outlet,
  createMemoryHistory,
  createRootRouteWithContext,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { AppNavbar } from "@/components/app-navbar";
import { HomeFeature } from "@/pages/home/feature/home-feature";
import { UserMenuFeature } from "@/pages/profile/feature/user-menu-feature";

interface AppRouterContext {
  onLoggedOut: () => void;
}

const rootRoute = createRootRouteWithContext<AppRouterContext>()({
  component: AppLayout,
});

function AppLayout() {
  return (
    <>
      <Outlet />
      <AppNavbar />
      <UserMenuFeature />
    </>
  );
}

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
