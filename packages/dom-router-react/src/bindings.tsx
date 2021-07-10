import { createRouter } from "@effector-things/dom-router";
import { useStore } from "effector-react";
import React, {
  ComponentProps,
  ComponentType,
  createContext,
  createElement,
  FC,
  useContext,
} from "react";
import { ReactRouterModel, Route } from "./types";

function cn(...classes: (string | false | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

export function createReactRouter(): ReactRouterModel {
  const router = createRouter();
  const routesByPath = new Map<string, Route>();

  return {
    ...router,
    routes: routesByPath,
    addRoutes(routes) {
      for (const route of routes) {
        routesByPath.set(route.path, route);
      }
    },
  };
}

const routerContext = createContext<ReactRouterModel | null>(null);

export type RouterProviderProps = {
  router: ReactRouterModel;
};

export const RouterProvider: FC<RouterProviderProps> = ({
  router,
  children,
}) => {
  return (
    <routerContext.Provider value={router}>{children}</routerContext.Provider>
  );
};

export function useRouter() {
  const router = useContext(routerContext);
  if (!router) {
    throw new Error("Could not get router from context");
  }
  return router;
}

export function useLocation() {
  const router = useRouter();
  return useStore(router.location);
}

export function useRoutes() {
  const router = useRouter();
  return router.routes;
}

export function useQuery() {
  const router = useRouter();
  return useStore(router.query);
}

export type RouterViewProps = {
  fallback: ComponentType;
};

export const RouterView: FC<RouterViewProps> = ({ fallback }) => {
  const routes = useRoutes();
  const location = useLocation();

  const currentRoute = routes.get(location);

  return currentRoute
    ? createElement(currentRoute.view)
    : createElement(fallback);
};

export type LinkProps = ComponentProps<"a"> & {
  to: string;
};

export const Link: FC<LinkProps> = ({ to, ...props }) => {
  const router = useRouter();

  return createElement("a", {
    onClick: () => router.push({ path: to }),
    ...props,
  });
};

export type NavLinkProps = LinkProps & {
  activeClass: string;
};

export const NavLink: FC<NavLinkProps> = ({
  activeClass,
  className,
  ...props
}) => {
  const location = useLocation();

  return (
    <Link
      className={cn(location.startsWith(props.to) && activeClass, className)}
      {...props}
    />
  );
};
