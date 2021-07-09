import { Event, Store } from "effector";

export type RoutePayload = {
  path: string;
  query?: Record<string, string>;
};

export type RoutePayloadFull = Required<RoutePayload>;

export type RouterModel = {
  location: Store<string>;
  query: Store<Record<string, string>>;
  push: Event<RoutePayload>;
  replace: Event<RoutePayload>;
  back: Event<void>;
  next: Event<void>;
  delta: Event<number>;
  listen: () => void;
};
