import { createEvent, Event } from "effector";
import { sleep } from "./helpers";
import { throttle } from "./throttle";

test("locks and unlocks", async () => {
  const source = createEvent();
  const target = createEvent();

  throttle({
    source,
    interval: 10,
    target,
  });

  const sourceFn = jest.fn();
  source.watch(sourceFn);

  const targetFn = jest.fn();
  target.watch(targetFn);

  const expectCalls = (sourceTimes: number, targetTimes: number) => {
    expect(sourceFn).toBeCalledTimes(sourceTimes);
    expect(targetFn).toBeCalledTimes(targetTimes);
  };

  source();
  expectCalls(1, 1);

  await sleep(11);
  expectCalls(1, 1);

  source();
  source();
  source();
  expectCalls(4, 2);

  await sleep(11);
  source();
  expectCalls(5, 3);
});

test("only source, autocreated target", async () => {
  const source = createEvent<string>();

  const target = throttle({
    source,
    interval: 10,
  }) as Event<string>;

  const sourceFn = jest.fn();
  source.watch(sourceFn);

  const targetFn = jest.fn();
  target.watch(targetFn);

  source("hello");
  source("privet");
  source("yo");
  expect(targetFn).toBeCalledWith("hello");
});

test("only target, autocreated source", async () => {
  const target = createEvent<number>();

  const source = throttle({
    target,
    interval: 10,
  }) as Event<number>;

  const sourceFn = jest.fn();
  source.watch(sourceFn);

  const targetFn = jest.fn();
  target.watch(targetFn);

  source(1);
  source(2);
  source(3);
  expect(targetFn).toBeCalledWith(1);
});
