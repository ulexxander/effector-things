import { createEffect, createEvent, createStore, forward } from "effector";
import { RouterModel } from "./types";

export function createRouter(): RouterModel {
  const location = createStore<string>("/");

  const push = createEvent<string>();
  const pushFx = createEffect<string, void>((path) => {
    history.pushState({ path }, "", path);
  });

  const replace = createEvent<string>();
  const replaceFx = createEffect<string, void>((path) => {
    history.replaceState({ path }, "", path);
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

  forward({ from: push, to: [pushFx, setLocation] });
  forward({ from: replace, to: [replaceFx, setLocation] });
  forward({ from: back, to: backRouteFx });
  forward({ from: next, to: nextFx });
  forward({ from: delta, to: deltaFx });

  return {
    location,
    push,
    replace,
    back,
    next,
    delta,
    listen() {
      if (window.location.pathname !== location.defaultState) {
        push(window.location.pathname);
      }

      const listener = (e: { state?: { path?: string } }) => {
        if (e.state?.path) {
          setLocation(e.state.path);
        } else {
          resetLocation();
        }
      };

      window.addEventListener("popstate", listener);
      return () => window.removeEventListener("popstate", listener);
    },
  };
}
