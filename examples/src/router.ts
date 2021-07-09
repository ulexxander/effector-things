import { createReactRouter } from "../../packages/dom-router-react/src";
import {} from "../../packages/dom-router/src";
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
