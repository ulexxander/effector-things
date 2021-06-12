import { Event, Store } from "effector";
import { ComponentType } from "react";

export type Route = {
  path: string;
  view: ComponentType;
};

export type RoutesMap = Map<string, Route>;

export type RouterModel = {
  location: Store<string>;
  push: Event<string>;
  routes: Store<RoutesMap>;
  addRoutes: Event<Route[]>;
  listen: () => void;
};
