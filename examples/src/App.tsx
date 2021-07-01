import {
  NavLink,
  RouterProvider,
  RouterView,
} from "@effector-things/dom-router-react";
import React from "react";
import { NotFoundPage } from "./pages/NotFoundPage";
import { router } from "./router";

const Nav: React.FC = () => {
  return (
    <nav>
      <ol>
        <li>
          <NavLink to="/first" activeClass="active">
            First
          </NavLink>
        </li>
        <li>
          <NavLink to="/second" activeClass="active">
            Second
          </NavLink>
        </li>
        <li>
          <NavLink to="/abc" activeClass="active">
            Not found
          </NavLink>
        </li>
      </ol>
    </nav>
  );
};

export const App: React.FC = () => {
  return (
    <div className="App">
      <RouterProvider router={router}>
        <Nav />

        <RouterView fallback={NotFoundPage} />
      </RouterProvider>
    </div>
  );
};
