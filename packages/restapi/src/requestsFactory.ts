import {
  attach,
  createEffect,
  createEvent,
  createStore,
  forward,
  guard,
  Store,
} from "effector";
import {
  RequestHandlerParams,
  RequestOptions,
  RequestsFactoryConfig,
} from "./types";

export function requestsFactory<Inject = null>(
  config: RequestsFactoryConfig<Inject>
) {
  return <Payload, Result>(
    path: string,
    fetchOptions: RequestInit,
    options?: RequestOptions<Payload>
  ) => {
    const data = createStore<Result | null>(null);
    const error = createStore<Error | null>(null);
    const run = createEvent<Payload>();

    const callerFx = createEffect<
      RequestHandlerParams<Payload, Inject>,
      Result
    >((params) => {
      return config.handler(path, params, fetchOptions) as Promise<Result>;
    });

    const inject = config.inject || createStore(null);

    const requestFx = attach<Payload, Store<Inject>, typeof callerFx>({
      effect: callerFx,
      source: inject as Store<Inject>,
      mapParams(payload, injected) {
        return { payload, injected };
      },
    });

    data.on(requestFx.doneData, (_, data) => data);
    error.on(requestFx.failData, (_, err) => err).reset(run);

    guard({
      source: run,
      filter: requestFx.pending.map((pending) => !pending),
      target: requestFx,
    });

    if (options?.reload) {
      forward({
        from: options.reload,
        to: run,
      });
    }

    return {
      data,
      error,
      run,
      loading: requestFx.pending,
      done: requestFx.done,
      doneData: requestFx.doneData,
      fail: requestFx.fail,
      failData: requestFx.failData,
      finally: requestFx.finally,
      request: requestFx,
    };
  };
}
