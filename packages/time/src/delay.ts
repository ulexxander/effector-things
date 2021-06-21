import { createEffect, createEvent, forward, sample, Unit } from "effector";
import { sleep } from "./helpers";

export type DelayConfig<T> =
  | {
      source: Unit<T>;
      duration: number;
      target?: Unit<T>;
    }
  | {
      source?: Unit<T>;
      duration: number;
      target: Unit<T>;
    };

export function delay<T>(config: DelayConfig<T>): Unit<T> {
  const target = config.target || createEvent<T>();
  const source = config.source || createEvent<T>();

  const delayFx = createEffect<void, void>(() => sleep(config.duration));

  forward({
    from: source,
    to: delayFx,
  });

  sample({
    clock: delayFx.done,
    source: source,
    target,
  });

  if (!config.source) {
    return source;
  }

  return target;
}
