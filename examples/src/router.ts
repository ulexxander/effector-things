import { createReactRouter } from "@effector-things/dom-router-react";
import { FirstPage } from "./pages/FirstPage";
import { SecondPage } from "./pages/SecondPage";

export const router = createReactRouter([
  {
    path: "/first",
    view: FirstPage,
  },
  {
    path: "/second",
    view: SecondPage,
  },
]);
