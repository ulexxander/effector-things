import { RouterModel } from "@effector-things/dom-router";
import { ComponentType } from "react";

export type Route = {
  path: string;
  view: ComponentType;
};

export type ReactRouterModel = RouterModel & {
  routes: Map<string, Route>;
  addRoutes: (routes: Route[]) => void;
};
