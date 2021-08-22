import {
  NavLink,
  RouterProvider,
  RouterView,
  useLocation,
  useQuery,
} from "@effector-things/dom-router-react";
import React, { useState } from "react";
import { FirstPage } from "./pages/FirstPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import { SecondPage } from "./pages/SecondPage";
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

const QueryTest: React.FC = () => {
  const [path, setPath] = useState("");

  return (
    <div>
      <h3>Query test</h3>

      <input
        type="text"
        placeholder="Path"
        value={path}
        onChange={(e) => setPath(e.target.value)}
      />

      <button
        onClick={() => {
          router.push({ path, query: { a: "b" } });
        }}
      >
        Push with a=b
      </button>

      <button
        onClick={() => {
          router.push({ path, query: { hello: "123" } });
        }}
      >
        Push with hello=123
      </button>

      <button
        onClick={() => {
          router.push({ path, query: {} });
        }}
      >
        Push without empty query
      </button>

      <button
        onClick={() => {
          router.push({ path });
        }}
      >
        Push without query
      </button>
    </div>
  );
};

const Bottom: React.FC = () => {
  const location = useLocation();
  const query = useQuery();

  return (
    <div>
      <h3>Location</h3>
      <pre>{location}</pre>
      <h3>Query</h3>
      <pre>{JSON.stringify(query)}</pre>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <div className="App">
      <RouterProvider router={router}>
        <Nav />
        <RouterView fallback={NotFoundPage} />
        <QueryTest />
        <Bottom />
      </RouterProvider>
    </div>
  );
};

router.addRoutes([
  {
    path: "/first",
    view: FirstPage,
  },
  {
    path: "/second",
    view: SecondPage,
  },
]);
