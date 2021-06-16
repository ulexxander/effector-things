import { createRouter } from "./createRouter";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

describe("moving between routes", () => {
  const r = createRouter();
  r.listen();

  type Case = {
    action:
      | { t: "push"; p: string }
      | { t: "replace"; p: string }
      | { t: "back" }
      | { t: "next" }
      | { t: "delta"; p: number };
    expected: { path: string; length: number };
  };

  const tt: Case[] = [
    { action: { t: "back" }, expected: { path: "/", length: 1 } },
    { action: { t: "back" }, expected: { path: "/", length: 1 } },
    { action: { t: "delta", p: -5 }, expected: { path: "/", length: 1 } },
    { action: { t: "next" }, expected: { path: "/", length: 1 } },
    { action: { t: "replace", p: "/" }, expected: { path: "/", length: 1 } },
    { action: { t: "push", p: "/" }, expected: { path: "/", length: 2 } },
    { action: { t: "replace", p: "/" }, expected: { path: "/", length: 2 } },
    { action: { t: "next" }, expected: { path: "/", length: 2 } },
    { action: { t: "delta", p: 2 }, expected: { path: "/", length: 2 } },
    { action: { t: "back" }, expected: { path: "/", length: 2 } },

    {
      action: { t: "push", p: "/first" },
      expected: { path: "/first", length: 2 },
    },
    {
      action: { t: "push", p: "/second" },
      expected: { path: "/second", length: 3 },
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
      expected: { path: "/second", length: 3 },
    },
    {
      action: { t: "push", p: "/third" },
      expected: { path: "/third", length: 4 },
    },
    {
      action: { t: "push", p: "/forth" },
      expected: { path: "/forth", length: 5 },
    },
    {
      action: { t: "delta", p: -3 },
      expected: { path: "/first", length: 5 },
    },
    {
      action: { t: "next" },
      expected: { path: "/second", length: 5 },
    },
    {
      action: { t: "back" },
      expected: { path: "/first", length: 5 },
    },
    {
      action: { t: "replace", p: "/second" },
      expected: { path: "/second", length: 5 },
    },
    {
      action: { t: "next" },
      expected: { path: "/second", length: 5 },
    },
  ];

  for (const tc of tt) {
    const tn =
      "p" in tc.action ? `${tc.action.t} with ${tc.action.p}` : tc.action.t;

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
      expect(history.length).toBe(tc.expected.length);
    });
  }
});

test("restoring initial pathname", async () => {
  const r = createRouter();

  // depends on previous test
  const initial = "/second";
  const pushed = "/hello";

  expect(window.location.pathname).toBe(initial);
  expect(r.location.getState()).not.toBe(initial);

  r.listen();

  expect(window.location.pathname).toBe(initial);
  expect(r.location.getState()).toBe(initial);

  r.push(pushed);

  expect(window.location.pathname).toBe(pushed);
  expect(r.location.getState()).toBe(pushed);
});
