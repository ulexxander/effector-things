import { createRouter } from "./createRouter";
import { RoutePayload } from "./types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("moving between routes", () => {
  const r = createRouter();
  r.listen();

  type Case = {
    action:
      | { t: "push"; p: Partial<RoutePayload> }
      | { t: "replace"; p: Partial<RoutePayload> }
      | { t: "back" }
      | { t: "next" }
      | { t: "delta"; p: number };
    expected: { path: string; query?: Record<string, string>; length: number };
  };

  const tt: Case[] = [
    {
      action: { t: "back" },
      expected: { path: "/", length: 1 },
    },
    {
      action: { t: "back" },
      expected: { path: "/", length: 1 },
    },
    {
      action: { t: "delta", p: -5 },
      expected: { path: "/", length: 1 },
    },
    {
      action: { t: "next" },
      expected: { path: "/", length: 1 },
    },
    {
      action: { t: "replace", p: { path: "/" } },
      expected: { path: "/", length: 1 },
    },
    {
      action: { t: "push", p: { path: "/" } },
      expected: { path: "/", length: 2 },
    },
    {
      action: { t: "replace", p: { path: "/" } },
      expected: { path: "/", length: 2 },
    },
    {
      action: { t: "next" },
      expected: { path: "/", length: 2 },
    },
    {
      action: { t: "delta", p: 2 },
      expected: { path: "/", length: 2 },
    },
    {
      action: { t: "back" },
      expected: { path: "/", length: 2 },
    },
    {
      action: { t: "push", p: { path: "/first" } },
      expected: { path: "/first", length: 2 },
    },
    {
      action: { t: "push", p: { path: "/second", query: { a: "b" } } },
      expected: { path: "/second", query: { a: "b" }, length: 3 },
    },
    {
      action: { t: "back" },
      expected: { path: "/first", length: 3 },
    },
    {
      action: { t: "back" },
      expected: { path: "/", length: 3 },
    },
    {
      action: { t: "delta", p: 2 },
      expected: { path: "/second", query: { a: "b" }, length: 3 },
    },
    {
      action: { t: "push", p: { path: "/third" } },
      expected: { path: "/third", length: 4 },
    },
    {
      action: { t: "push", p: { path: "/forth" } },
      expected: { path: "/forth", length: 5 },
    },
    {
      action: { t: "delta", p: -3 },
      expected: { path: "/first", length: 5 },
    },
    {
      action: { t: "next" },
      expected: { path: "/second", query: { a: "b" }, length: 5 },
    },
    {
      action: { t: "back" },
      expected: { path: "/first", length: 5 },
    },
    {
      action: { t: "replace", p: { path: "/second" } },
      expected: { path: "/second", length: 5 },
    },
    {
      action: { t: "next" },
      expected: { path: "/second", query: { a: "b" }, length: 5 },
    },
  ];

  for (let i = 0; i < tt.length; i++) {
    const tc = tt[i]!;
    const tn =
      "p" in tc.action
        ? `${tc.action.t} with ${tc.action.p} (${i})`
        : `${tc.action.t} (${i})`;

    test(tn, async () => {
      switch (tc.action.t) {
        case "push":
          r.push(tc.action.p);
          break;
        case "replace":
          r.replace(tc.action.p);
          break;
        case "back":
          r.back();
          break;
        case "next":
          r.next();
          break;
        case "delta":
          r.delta(tc.action.p);
          break;
      }

      await sleep(5);

      expect(r.location.getState()).toBe(window.location.pathname);
      expect(r.location.getState()).toBe(tc.expected.path);
      expect(r.query.getState()).toEqual(tc.expected.query || {});
      expect(history.length).toBe(tc.expected.length);
    });
  }
});

test("restoring initial pathname", async () => {
  const r = createRouter();

  // depends on previous test
  const prevPath = "/second";
  const prevQuery = { a: "b" };
  const newPath = "/hello";
  const newQuery = { c: "100" };

  expect(window.location.pathname).toBe(prevPath);
  expect(window.location.search).toBe("?a=b");
  expect(r.location.getState()).not.toBe(prevPath);
  expect(r.query.getState()).not.toEqual(prevQuery);

  r.listen();

  expect(window.location.pathname).toBe(prevPath);
  expect(r.location.getState()).toBe(prevPath);
  expect(r.query.getState()).toEqual(prevQuery);

  r.push({ path: newPath, query: newQuery });

  expect(window.location.pathname).toBe(newPath);
  expect(r.location.getState()).toBe(newPath);
  expect(r.query.getState()).toEqual(newQuery);
});
