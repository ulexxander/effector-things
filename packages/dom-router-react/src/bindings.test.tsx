import "@testing-library/jest-dom/extend-expect";
import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import {
  createReactRouter,
  NavLink,
  RouterProvider,
  RouterView,
} from "./bindings";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const Nav: React.FC = () => {
  return (
    <nav>
      <NavLink to="/first" activeClass="active">
        Link to First
      </NavLink>
      <NavLink to="/second" activeClass="active">
        Link to Second
      </NavLink>
      <NavLink to="/third" activeClass="active">
        Link to Third
      </NavLink>
    </nav>
  );
};

const PageFallback: React.FC = () => {
  return (
    <div>
      <Nav />
      <p>Page Fallback</p>
    </div>
  );
};
const PageFirst: React.FC = () => {
  return (
    <div>
      <Nav />
      <p>Page First</p>
    </div>
  );
};
const PageSecond: React.FC = () => {
  return (
    <div>
      <Nav />
      <p>Page Second</p>
    </div>
  );
};
const PageThird: React.FC = () => {
  return (
    <div>
      <Nav />
      <p>Page Third</p>
    </div>
  );
};

describe("rendering routes and links", () => {
  const rr = createReactRouter([
    {
      path: "/first",
      view: PageFirst,
    },
    {
      path: "/second",
      view: PageSecond,
    },
    {
      path: "/third",
      view: PageThird,
    },
  ]);

  type Case = {
    action:
      | { t: "push"; p: string }
      | { t: "replace"; p: string }
      | { t: "back" }
      | { t: "next" }
      | { t: "delta"; p: number };
    expected: { content: string };
  };

  const tt: Case[] = [
    {
      action: { t: "push", p: "/first" },
      expected: { content: "First" },
    },
    {
      action: { t: "push", p: "/second" },
      expected: { content: "Second" },
    },
    {
      action: { t: "push", p: "/third" },
      expected: { content: "Third" },
    },
    {
      action: { t: "back" },
      expected: { content: "Second" },
    },
    {
      action: { t: "next" },
      expected: { content: "Third" },
    },
    {
      action: { t: "delta", p: -2 },
      expected: { content: "First" },
    },
    {
      action: { t: "replace", p: "/third" },
      expected: { content: "Third" },
    },

    // we replaced current page (first) with third
    // when we go back, state is null and location store is reset
    {
      action: { t: "back" },
      expected: { content: "Fallback" },
    },
    {
      action: { t: "back" },
      expected: { content: "Fallback" },
    },
    {
      action: { t: "push", p: "/doesntexist" },
      expected: { content: "Fallback" },
    },
    {
      action: { t: "push", p: "/first" },
      expected: { content: "First" },
    },
    {
      action: { t: "next" },
      expected: { content: "First" },
    },
  ];

  rr.listen();

  for (let i = 0; i < tt.length; i++) {
    const tc = tt[i]!;
    const tn =
      "p" in tc.action
        ? `${tc.action.t} with ${tc.action.p} (${i})`
        : `${tc.action.t} (${i})`;

    test(tn, async () => {
      render(
        <RouterProvider router={rr}>
          <RouterView fallback={PageFallback} />
        </RouterProvider>
      );

      let a: () => void;
      switch (tc.action.t) {
        case "push":
          a = () => rr.push({ path: (tc.action as any).p });
          break;
        case "replace":
          a = () => rr.replace({ path: (tc.action as any).p });
          break;
        case "back":
          a = () => rr.back();
          break;
        case "next":
          a = () => rr.next();
          break;
        case "delta":
          a = () => rr.delta((tc.action as any).p);
          break;
      }

      await act(async () => {
        a();
        await sleep(10);
      });

      await waitFor(() => {
        expect(
          screen.queryByText("Page " + tc.expected.content)
        ).toBeInTheDocument();

        if (tc.expected.content !== "Fallback") {
          expect(
            screen.queryByText("Link to " + tc.expected.content)
          ).toHaveClass("active");
        }
      });
    });
  }
});
