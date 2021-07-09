import {
  createEffect,
  createEvent,
  createStore,
  Event,
  forward,
} from "effector";
import { RoutePayload, RoutePayloadFull, RouterModel } from "./types";

function urlFromPathAndQuery(path: string, query: Record<string, string>) {
  let url = path;
  if (Object.keys(query).length > 0) {
    url += "?" + new URLSearchParams(query).toString();
  }
  return url;
}

function withDefaultRoutePayload(
  event: Event<RoutePayload>
): Event<RoutePayloadFull> {
  return event.map(({ path, query }) => ({
    path: path.startsWith("/") ? path : "/" + path,
    query: query || {},
  }));
}

export function createRouter(): RouterModel {
  const location = createStore<string>("/");
  const query = createStore<Record<string, string>>({});

  const push = createEvent<RoutePayload>();
  const pushFx = createEffect<RoutePayloadFull, void>(({ path, query }) => {
    history.pushState({ path, query }, "", urlFromPathAndQuery(path, query));
  });

  const replace = createEvent<RoutePayload>();
  const replaceFx = createEffect<RoutePayloadFull, void>(({ path, query }) => {
    history.replaceState({ path, query }, "", urlFromPathAndQuery(path, query));
  });

  const back = createEvent<void>();
  const backRouteFx = createEffect<void, void>(() => {
    history.back();
  });

  const next = createEvent<void>();
  const nextFx = createEffect<void, void>(() => {
    history.forward();
  });

  const delta = createEvent<number>();
  const deltaFx = createEffect<number, void>((go) => {
    history.go(go);
  });

  const setLocation = createEvent<string>();
  const resetLocation = createEvent<void>();
  location.on(setLocation, (_, path) => path).reset(resetLocation);

  const setQuery = createEvent<Record<string, string>>();
  const resetQuery = createEvent<void>();
  query.on(setQuery, (_, query) => query).reset(resetQuery);

  forward({
    from: withDefaultRoutePayload(push),
    to: [
      pushFx,
      setLocation.prepend((p) => p.path),
      setQuery.prepend((p) => p.query || {}),
    ],
  });
  forward({
    from: withDefaultRoutePayload(replace),
    to: [
      replaceFx,
      setLocation.prepend((p) => p.path),
      setQuery.prepend((p) => p.query || {}),
    ],
  });
  forward({
    from: back,
    to: backRouteFx,
  });
  forward({
    from: next,
    to: nextFx,
  });
  forward({
    from: delta,
    to: deltaFx,
  });

  return {
    location,
    query,
    push,
    replace,
    back,
    next,
    delta,
    listen() {
      const pathnameWithSearch =
        window.location.pathname + window.location.search;

      if (pathnameWithSearch !== location.defaultState) {
        const searchParams = new URLSearchParams(window.location.search);

        const query: Record<string, string> = {};
        searchParams.forEach((val, key) => (query[key] = val));

        push({ path: window.location.pathname, query });
      }

      const listener = (e: {
        state?: { path?: string; query?: Record<string, string> };
      }) => {
        if (e.state && e.state.path && e.state.query) {
          setLocation(e.state.path);
          setQuery(e.state.query);
        } else {
          resetLocation();
          resetQuery();
        }
      };

      window.addEventListener("popstate", listener);
      return () => window.removeEventListener("popstate", listener);
    },
  };
}
