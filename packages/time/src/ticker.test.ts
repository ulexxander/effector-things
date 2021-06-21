import { sleep } from "./helpers";
import { createTicker, Ticker } from "./ticker";

function expectRunning(t: Ticker, running: boolean) {
  expect(t.$running.getState()).toBe(running);
}

test("starts, ticks, stops", async () => {
  const t = createTicker({
    interval: 10,
  });

  expectRunning(t, false);

  t.start();

  expectRunning(t, true);

  const tickFn = jest.fn();
  t.tick.watch(tickFn);

  expect(tickFn).not.toBeCalled();

  await sleep(10);

  expect(tickFn).toBeCalledTimes(1);

  await sleep(10);

  expect(tickFn).toBeCalledTimes(2);

  t.stop();

  expectRunning(t, false);
});

test("cant be started multiple times", async () => {
  const t = createTicker({
    interval: 10,
  });

  const tickFn = jest.fn();
  t.tick.watch(tickFn);

  for (let i = 0; i < 10; i++) {
    t.start();
  }

  await sleep(10);

  expect(tickFn).toBeCalledTimes(1);

  t.stop();
});

test("not ticking when stopped", async () => {
  const t = createTicker({
    interval: 10,
  });

  const tickFn = jest.fn();
  t.tick.watch(tickFn);

  t.start();

  await sleep(10);

  expect(tickFn).toBeCalledTimes(1);

  t.stop();

  await sleep(10);

  expect(tickFn).toBeCalledTimes(1);
});
