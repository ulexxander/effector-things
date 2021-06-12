import { createEffect, createEvent, createStore, forward } from "effector";
import { Route, RouterModel, RoutesMap } from "./types";

export function createRouter(): RouterModel {
  const location = createStore<string>("/");
  const routes = createStore<RoutesMap>(new Map());

  const push = createEvent<string>();
  const addRoutes = createEvent<Route[]>();
  const updateLocation = createEvent<string>();

  const pushRouteFx = createEffect<string, void>((path) => {
    history.pushState({ path }, "", path);
  });

  forward({
    from: push,
    to: [pushRouteFx, updateLocation],
  });

  location.on(updateLocation, (_, path) => path);
  routes.on(
    addRoutes,
    (_, routes) => new Map(routes.map((route) => [route.path, route]))
  );

  return {
    location,
    push,
    routes,
    addRoutes,
    listen() {
      push(window.location.pathname);

      const listener = (e: { state: { path: string } }) => {
        if (e.state) {
          updateLocation(e.state.path);
        }
      };

      window.addEventListener("popstate", listener);
      return () => window.removeEventListener("popstate", listener);
    },
  };
}
