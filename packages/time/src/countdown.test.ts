import { Countdown, createCountdown } from "./countdown";
import { sleep } from "./helpers";

function expectCurrent(c: Countdown, current: number) {
  expect(c.$current.getState()).toBe(current);
}

test("counts and ends", async () => {
  const c = createCountdown({
    initial: 3,
    interval: 10,
  });

  expectCurrent(c, 3);

  const endFn = jest.fn();
  c.end.watch(endFn);

  c.start();

  expectCurrent(c, 3);
  expect(endFn).not.toBeCalled();

  await sleep(11);
  expectCurrent(c, 2);

  await sleep(22);
  expectCurrent(c, 0);

  expect(endFn).toBeCalledTimes(1);

  c.stop();

  expect(endFn).toBeCalledTimes(1);
});
