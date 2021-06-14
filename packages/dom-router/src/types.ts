import { Event, Store } from "effector";

export type RouterModel = {
  location: Store<string>;
  push: Event<string>;
  replace: Event<string>;
  back: Event<void>;
  next: Event<void>;
  delta: Event<number>;
  listen: () => void;
};
