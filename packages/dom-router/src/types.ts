import { Event, Store } from "effector";

export type RoutePayload = {
  path: string;
  query: Record<string, string>;
};

export type RouterModel = {
  location: Store<string>;
  query: Store<Record<string, string>>;
  push: Event<Partial<RoutePayload>>;
  replace: Event<Partial<RoutePayload>>;
  back: Event<void>;
  next: Event<void>;
  delta: Event<number>;
  listen: () => void;
};
