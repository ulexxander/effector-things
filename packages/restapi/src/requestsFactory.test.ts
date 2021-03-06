import { createEvent, createStore } from "effector";
import { requestsFactory } from "./requestsFactory";
import { RequestHandler } from "./types";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type SomeListItem = { id: number; name: string; good: boolean };

type FirstMutationResult = {
  id: number;
  title: string;
  createdAt: string;
  now: number;
  friends: null;
};

type FakeEndpoint = {
  method: "GET" | "POST";
  data: unknown;
};

const mockEndpoints: Record<string, FakeEndpoint> = {
  "/some/list": {
    method: "GET",
    data: [
      { id: 1, name: "hello", good: true },
      { id: 2, name: "tests", good: false },
      { id: 3, name: "are", good: false },
      { id: 4, name: "quite", good: "da" },
      { id: 5, name: "fun", good: "nope" },
    ] as SomeListItem[],
  },

  "/first/mutation": {
    method: "POST",
    data: {
      id: 10,
      title: "Created thing",
      createdAt: "2day",
      now: Date.now(),
      friends: null,
    } as FirstMutationResult,
  },
};

const errNotFound = new Error("404 not found =)");
const errMethodNotAllowed = new Error("Method not allowed =)");
const errUnathorized = new Error("Unathorized token bad =)");

function mockHandler(): RequestHandler<null> {
  return async (url, _, fetchOptions) => {
    const endpoint = mockEndpoints[url];
    if (!endpoint) {
      throw errNotFound;
    }

    if (fetchOptions.method !== endpoint.method) {
      throw errMethodNotAllowed;
    }

    await sleep(10);
    return endpoint.data;
  };
}

type Auth = { authToken: string };

const oneTokenToRuleThemAll = "a8f2igviunp11n9d1973th9";

function mockHandlerWithAuth(): RequestHandler<Auth> {
  return async (url, { injected }, fetchOptions) => {
    if (injected.authToken !== oneTokenToRuleThemAll) {
      throw errUnathorized;
    }

    const endpoint = mockEndpoints[url];
    if (!endpoint) {
      throw errNotFound;
    }

    if (fetchOptions.method !== endpoint.method) {
      throw errMethodNotAllowed;
    }

    await sleep(10);
    return endpoint.data;
  };
}

test("successful requests", async () => {
  const rf = requestsFactory({
    handler: mockHandler(),
  });

  const req1 = rf<void, SomeListItem[]>("/some/list", { method: "GET" });

  expect(req1.data.getState()).toBeNull();
  expect(req1.error.getState()).toBeNull();
  expect(req1.loading.getState()).toBe(false);

  const fnReq = jest.fn();
  const fnDone = jest.fn();
  const fnFail = jest.fn();

  req1.request.watch(fnReq);
  req1.done.watch(fnDone);
  req1.fail.watch(fnFail);

  req1.run();
  expect(req1.data.getState()).toBeNull();
  expect(req1.error.getState()).toBeNull();
  expect(req1.loading.getState()).toBe(true);

  expect(fnReq).toBeCalledTimes(1);
  expect(fnDone).not.toBeCalled();
  expect(fnFail).not.toBeCalled();

  await sleep(10);

  expect(req1.data.getState()).toEqual(mockEndpoints["/some/list"]!.data);
  expect(req1.error.getState()).toBeNull();
  expect(req1.loading.getState()).toBe(false);

  expect(fnReq).toBeCalledTimes(1);
  expect(fnDone).toBeCalledTimes(1);
  expect(fnFail).not.toBeCalled();
});

test("request errors", async () => {
  const rf = requestsFactory({
    handler: mockHandler(),
  });

  const req2 = rf<void, SomeListItem[]>("/404err", { method: "GET" });

  const fnReq = jest.fn();
  const fnDone = jest.fn();
  const fnFail = jest.fn();

  req2.request.watch(fnReq);
  req2.done.watch(fnDone);
  req2.fail.watch(fnFail);

  req2.run();
  await sleep(10);

  expect(req2.data.getState()).toBeNull();
  expect(req2.error.getState()).toBe(errNotFound);
  expect(req2.loading.getState()).toBe(false);

  expect(fnReq).toBeCalledTimes(1);
  expect(fnDone).not.toBeCalled();
  expect(fnFail).toBeCalledTimes(1);

  req2.run();
  expect(req2.data.getState()).toBeNull();
  expect(req2.error.getState()).toBeNull();
  expect(req2.loading.getState()).toBe(true);

  await sleep(10);

  expect(req2.data.getState()).toBeNull();
  expect(req2.error.getState()).toBe(errNotFound);
  expect(req2.loading.getState()).toBe(false);

  expect(fnReq).toBeCalledTimes(2);
  expect(fnDone).not.toBeCalled();
  expect(fnFail).toBeCalledTimes(2);
});

test("with inject", async () => {
  const badToken = "198bg9qeqr49";
  const anotherBadToken = "kkkkkkkk";

  const setAuthToken = createEvent<string>();
  const injected = createStore({ authToken: badToken }).on(
    setAuthToken,
    (_, authToken) => ({ authToken })
  );

  const rf = requestsFactory({
    inject: injected,
    handler: mockHandlerWithAuth(),
  });

  const req3 = rf<void, SomeListItem[]>("/some/list", { method: "GET" });

  req3.run();
  await sleep(10);

  expect(req3.data.getState()).toBeNull();
  expect(req3.error.getState()).toBe(errUnathorized);

  setAuthToken(oneTokenToRuleThemAll);

  req3.run();
  await sleep(10);

  expect(req3.data.getState()).toBe(mockEndpoints["/some/list"]!.data);
  expect(req3.error.getState()).toBeNull();

  setAuthToken(anotherBadToken);

  req3.run();
  await sleep(10);

  // data is not reset when making request, even if err returned
  expect(req3.data.getState()).toBe(mockEndpoints["/some/list"]!.data);
  expect(req3.error.getState()).toBe(errUnathorized);
});

describe("concurrent request option", () => {
  const rf = requestsFactory({
    handler: mockHandler(),
  });

  const testConcurrent = async (concurrent: boolean) => {
    const req4 = rf<void, SomeListItem[]>(
      "/some/list",
      { method: "GET" },
      { concurrent }
    );

    const fnReq = jest.fn();
    const fnDone = jest.fn();

    req4.request.watch(fnReq);
    req4.done.watch(fnDone);

    req4.run();
    req4.run();
    req4.run();
    req4.run();

    if (concurrent) {
      expect(fnReq).toBeCalledTimes(4);
    } else {
      expect(fnReq).toBeCalledTimes(1);
    }

    expect(fnDone).not.toBeCalled();

    await sleep(10);

    if (concurrent) {
      expect(fnReq).toBeCalledTimes(4);
      expect(fnDone).toBeCalledTimes(4);
    } else {
      expect(fnReq).toBeCalledTimes(1);
      expect(fnDone).toBeCalledTimes(1);
    }
  };

  test("disabled (default)", async () => {
    await testConcurrent(false);
  });

  test("enabled", async () => {
    await testConcurrent(true);
  });
});

test("with reload option", async () => {
  const rf = requestsFactory({
    handler: mockHandler(),
  });

  const reloadRequest = createEvent();

  const req5 = rf<void, SomeListItem[]>(
    "/some/list",
    { method: "GET" },
    { reload: reloadRequest }
  );

  const fnReq = jest.fn();
  const fnDone = jest.fn();

  req5.request.watch(fnReq);
  req5.done.watch(fnDone);

  req5.run();

  expect(fnReq).toBeCalledTimes(1);
  expect(fnDone).not.toBeCalled();

  await sleep(10);

  expect(fnReq).toBeCalledTimes(1);
  expect(fnDone).toBeCalledTimes(1);

  reloadRequest();
  await sleep(10);

  expect(fnReq).toBeCalledTimes(2);
  expect(fnDone).toBeCalledTimes(2);
});
