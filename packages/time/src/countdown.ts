import { createEvent, createStore, Event, guard, Store } from "effector";
import { createTicker, Ticker } from "./ticker";

export type CountdownConfig = {
  initial: number;
  interval: number;
};

export type Countdown = Ticker & {
  $current: Store<number>;
  end: Event<void>;
};

export function createCountdown({
  initial,
  interval,
}: CountdownConfig): Countdown {
  const ticker = createTicker({
    interval,
  });

  const $current = createStore<number>(initial).on(
    ticker.tick,
    (current) => current - 1
  );

  const end = createEvent();

  guard({
    source: ticker.tick,
    filter: $current.map((count) => count < 1),
    target: [end, ticker.stop],
  });

  return {
    ...ticker,
    $current,
    end,
  };
}
