import { createEvent, createStore } from "effector";
import { persist, PersistCodec, PersistReference } from "../src";
import { sleep } from "./helpers";
import { MemoryStorage, MemoryStorageAsync } from "./storage.memory";

const CodecString: PersistCodec<string> = {
  marshal(state) {
    return state;
  },
  unmarshal(rawState) {
    return rawState;
  },
};

function storeWithSetReset() {
  const setState = createEvent<string>();
  const resetState = createEvent();
  const $store = createStore<string>("initial")
    .on(setState, (_, state) => state)
    .reset(resetState);

  return [$store, setState, resetState] as const;
}

function updateFns<State>(ref: PersistReference<State>) {
  const updateFn = jest.fn();
  const updateDoneFn = jest.fn();
  const updateFailFn = jest.fn();

  ref.update.watch(updateFn);
  ref.update.done.watch(updateDoneFn);
  ref.update.fail.watch(updateFailFn);

  const updateFxCalled = (times: number) => {
    expect(updateFn).toBeCalledTimes(times);
    expect(updateDoneFn).toBeCalledTimes(times);
    expect(updateFailFn).not.toBeCalled();
  };

  return updateFxCalled;
}

test("sync storage updates with store", () => {
  const storageSync = new MemoryStorage();

  const [$store, setState, resetState] = storeWithSetReset();

  const persistRef = persist("sync_test", $store, {
    codec: CodecString,
    storage: storageSync,
  });

  const expectUpdateCalled = updateFns(persistRef);

  expect($store.getState()).toBe("initial");

  setState("new_state");
  expect($store.getState()).toBe("new_state");
  expect(storageSync.getItem("sync_test")).toBe("new_state");

  expectUpdateCalled(1);

  resetState();
  expect($store.getState()).toBe("initial");
  expect(storageSync.getItem("sync_test")).toBe(null);
});

test("async storage updates with store", async () => {
  const storageAsync = new MemoryStorageAsync();

  const [$store, setState, resetState] = storeWithSetReset();

  const persistRef = persist("async_test", $store, {
    codec: CodecString,
    storage: storageAsync,
  });

  const expectUpdateCalled = updateFns(persistRef);

  expect($store.getState()).toBe("initial");

  setState("new_state");
  expect($store.getState()).toBe("new_state");
  expect(await storageAsync.getItem("async_test")).toBe(null);

  await sleep(MemoryStorageAsync.SET_ITEM_DELAY);

  expect($store.getState()).toBe("new_state");
  expect(await storageAsync.getItem("async_test")).toBe("new_state");

  expectUpdateCalled(1);

  resetState();
  await sleep(MemoryStorageAsync.REMOVE_ITEM_DELAY);

  expect($store.getState()).toBe("initial");
  expect(await storageAsync.getItem("async_test")).toBe(null);

  expectUpdateCalled(2);
});

test("restores correctly", async () => {
  const storageSync = new MemoryStorage();

  function sessionFirst() {
    const [$store, setState] = storeWithSetReset();

    persist("restore_test", $store, {
      codec: CodecString,
      storage: storageSync,
    });

    setState("abc_state");
  }

  async function sessionSecond() {
    const [$store] = storeWithSetReset();

    persist("restore_test", $store, {
      codec: CodecString,
      storage: storageSync,
    });

    // fails if we do it immediately
    // probably effector forwards events on next eventloop iteration
    await sleep(0);

    expect($store.getState()).toBe("abc_state");
  }

  sessionFirst();
  await sessionSecond();
});
