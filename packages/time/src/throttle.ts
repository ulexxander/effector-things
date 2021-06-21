import { createEffect, createEvent, forward, guard, Unit } from "effector";
import { sleep } from "./helpers";

export type ThrottleConfig<T> =
  | {
      source: Unit<T>;
      interval: number;
      target?: Unit<T>;
    }
  | {
      source?: Unit<T>;
      interval: number;
      target: Unit<T>;
    };

export function throttle<T>(config: ThrottleConfig<T>): Unit<T> {
  const source = config.source || createEvent<T>();
  const target = config.target || createEvent<T>();

  const unlockFx = createEffect(() => sleep(config.interval));

  guard({
    source: source,
    filter: unlockFx.pending.map((pending) => !pending),
    target: target,
  });

  forward({
    from: target,
    to: unlockFx,
  });

  if (!config.source) {
    return source;
  }

  return target;
}
