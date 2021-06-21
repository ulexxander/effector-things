import { createEvent } from "effector";
import { debounce } from "./debounce";
import { sleep } from "./helpers";

test("bounces", async () => {
  const source = createEvent<string>();
  const target = createEvent<string>();

  debounce({
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

  const expectTargetCalledWith = (targetCalledWith: string) => {
    expect(targetFn).toBeCalledWith(targetCalledWith);
  };

  source("first");
  expectCalls(1, 0);

  await sleep(11);
  expectCalls(1, 1);
  expectTargetCalledWith("first");

  source("second");
  source("third");
  source("forth");
  await sleep(11);

  expectCalls(4, 2);
  expectTargetCalledWith("forth");

  source("5th");
  expectCalls(5, 2);
  await sleep(11);
  expectCalls(5, 3);
  expectTargetCalledWith("5th");
});
