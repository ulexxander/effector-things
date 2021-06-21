import { createEvent, Event } from "effector";
import { delay } from "./delay";
import { sleep } from "./helpers";

test("source and target", async () => {
  const source = createEvent<void>();
  const target = createEvent<void>();

  delay({
    source,
    duration: 10,
    target,
  });

  const sourceFn = jest.fn();
  const targetFn = jest.fn();

  source.watch(sourceFn);
  target.watch(targetFn);

  source();

  expect(sourceFn).toBeCalledTimes(1);
  expect(targetFn).not.toBeCalled();

  await sleep(10);

  expect(sourceFn).toBeCalledTimes(1);
  expect(targetFn).toBeCalledTimes(1);
});

test("only source, target autocreated", async () => {
  const source = createEvent<void>();

  const target = delay({
    source,
    duration: 10,
  }) as Event<void>;

  const sourceFn = jest.fn();
  const targetFn = jest.fn();

  source.watch(sourceFn);
  target.watch(targetFn);

  source();

  expect(sourceFn).toBeCalledTimes(1);
  expect(targetFn).not.toBeCalled();

  await sleep(10);

  expect(sourceFn).toBeCalledTimes(1);
  expect(targetFn).toBeCalledTimes(1);
});

test("only target, source autocreated", async () => {
  const target = createEvent<void>();

  const source = delay({
    target,
    duration: 10,
  }) as Event<void>;

  const sourceFn = jest.fn();
  const targetFn = jest.fn();

  source.watch(sourceFn);
  target.watch(targetFn);

  source();

  expect(sourceFn).toBeCalledTimes(1);
  expect(targetFn).not.toBeCalled();

  await sleep(10);

  expect(sourceFn).toBeCalledTimes(1);
  expect(targetFn).toBeCalledTimes(1);
});

test("target receives params", async () => {
  const target = createEvent<number>();

  const source = delay({
    target,
    duration: 10,
  }) as Event<number>;

  const targetFn = jest.fn();

  target.watch(targetFn);

  source(999);

  expect(targetFn).not.toBeCalled();

  await sleep(10);

  expect(targetFn).toBeCalledWith(999);
});
