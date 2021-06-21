import { createEffect, createEvent, forward, sample, Unit } from "effector";

export type DebounceConfig<T> =
  | {
      source?: Unit<T>;
      interval: number;
      target: Unit<T>;
    }
  | {
      source: Unit<T>;
      interval: number;
      target?: Unit<T>;
    };

export function debounce<T>(config: DebounceConfig<T>) {
  const source = config.source || createEvent<T>();
  const target = config.target || createEvent<T>();

  let timeout: any;
  const timeoutFx = createEffect(() => {
    clearTimeout(timeout);

    return new Promise((resolve) => {
      timeout = setTimeout(resolve, config.interval);
    });
  });

  forward({
    from: source,
    to: timeoutFx,
  });

  sample({
    clock: timeoutFx.done,
    source,
    target,
  });

  if (!config.source) {
    return source;
  }

  return target;
}
