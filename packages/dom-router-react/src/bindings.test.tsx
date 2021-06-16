import "@testing-library/jest-dom/extend-expect";
import { act, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { createReactRouter, RouterProvider, RouterView } from "./bindings";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const PageFallback: React.FC = () => {
  return <p>Fallback</p>;
};
const PageFirst: React.FC = () => {
  return <p>First</p>;
};
const PageSecond: React.FC = () => {
  return <p>Second</p>;
};
const PageThird: React.FC = () => {
  return <p>Third</p>;
};

describe("rendering routes", () => {
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

  for (const tc of tt) {
    const tn =
      "p" in tc.action ? `${tc.action.t} with ${tc.action.p}` : tc.action.t;

    test(tn, async () => {
      render(
        <RouterProvider router={rr}>
          <RouterView fallback={PageFallback} />
        </RouterProvider>
      );

      let a: () => void;
      switch (tc.action.t) {
        case "push":
          a = () => rr.push((tc.action as any).p);
          break;
        case "replace":
          a = () => rr.replace((tc.action as any).p);
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
        expect(screen.queryByText(tc.expected.content)).toBeInTheDocument();
      });
    });
  }
});
