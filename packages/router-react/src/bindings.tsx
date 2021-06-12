import { useStore } from "effector-react";
import React, {
  ComponentType,
  createContext,
  createElement,
  FC,
  LinkHTMLAttributes,
  useContext,
} from "react";
import { RouterModel } from "./types";

const routerContext = createContext<RouterModel | null>(null);

export type RouterProviderProps = {
  router: RouterModel;
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
    throw new Error("Could no find effector router in context");
  }
  return router;
}

export function useLocation() {
  const router = useRouter();
  return useStore(router.location);
}

export function useRoutes() {
  const router = useRouter();
  return useStore(router.routes);
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

export type LinkProps = LinkHTMLAttributes<HTMLInputElement> & {
  to: string;
};

export const Link: FC<LinkProps> = ({ to, ...props }) => {
  const router = useRouter();

  return createElement("a", {
    onClick: () => router.push(to),
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

  const fullClass = location.startsWith(props.to)
    ? `${activeClass} ${className}`
    : className;

  return <Link className={fullClass} {...props} />;
};
