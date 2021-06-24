import { createEffect, Effect, forward, Store } from "effector";

type StringOrNull = string | null;

export interface PersistentStorage {
  getItem(key: string): StringOrNull | Promise<StringOrNull>;
  setItem(key: string, value: string): void | Promise<void>;
  removeItem(key: string): void | Promise<void>;
}

export interface PersistCodec<State> {
  marshal: (state: State) => string;
  unmarshal: (rawState: string) => State;
}

export type PersistConfig<State> = {
  storage: PersistentStorage;
  codec: PersistCodec<State>;
  autoRestore?: boolean;
};

export type PersistReference<State> = {
  update: Effect<State, void>;
  restore: Effect<void, State | null>;
};

export function persist<State>(
  key: string,
  store: Store<State>,
  config: PersistConfig<State>
): PersistReference<State> {
  const { codec, storage } = config;

  const updateFx = createEffect<State, void>((newState) => {
    if (newState === store.defaultState) {
      return storage.removeItem(key);
    }
    return storage.setItem(key, codec.marshal(newState));
  });

  const restoreFx = createEffect<void, State | null>(async () => {
    const storedItem = await storage.getItem(key);
    return storedItem ? codec.unmarshal(storedItem) : null;
  });

  store.on(restoreFx.doneData, (state, data) => (data !== null ? data : state));

  forward({
    from: store.updates,
    to: updateFx,
  });

  const autoRestore = config.autoRestore || true;
  if (autoRestore) {
    restoreFx();
  }

  return {
    update: updateFx,
    restore: restoreFx,
  };
}
