import {
  createEffect,
  createEvent,
  createStore,
  Event,
  guard,
  Store,
} from "effector";
import { sleep } from "./helpers";

export type TickerConfig = {
  interval: number;
};

export type Ticker = {
  $running: Store<boolean>;
  start: Event<void>;
  stop: Event<void>;
  tick: Event<void>;
};

export function createTicker(config: TickerConfig): Ticker {
  const start = createEvent();
  const started = createEvent();
  const stop = createEvent();
  const tick = createEvent();

  const $running = createStore(false)
    .on(started, () => true)
    .reset(stop);

  const tickFx = createEffect(() => sleep(config.interval));

  guard({
    source: start,
    filter: $running.map((running) => !running),
    target: [tickFx, started],
  });

  guard({
    source: tickFx.done,
    filter: $running,
    target: [tickFx, tick],
  });

  return {
    $running,
    start,
    stop,
    tick,
  };
}
