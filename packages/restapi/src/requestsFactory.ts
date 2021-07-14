import { createEvent, createStore, forward, guard } from "effector";
import { RequestEffect, RequestOptions, RequestsFactoryConfig } from "./types";

export function requestsFactory(config: RequestsFactoryConfig) {
  return <Payload, Result>(
    url: string,
    fetchOptions: RequestInit,
    options?: RequestOptions<Payload>
  ) => {
    const data = createStore<Result | null>(null);
    const error = createStore<Error | null>(null);
    const run = createEvent<Payload>();

    const requestFx = config.requestFx as RequestEffect<Payload, Result>;

    data.on(requestFx.doneData, (_, data) => data);
    error.on(requestFx.failData, (_, err) => err).reset(run);

    const runWithRequestContext = run.map((payload) => ({
      url,
      payload,
      fetchOptions,
    }));

    const concurrent = options?.concurrent || false;
    if (concurrent) {
      forward({
        from: runWithRequestContext,
        to: requestFx,
      });
    } else {
      guard({
        source: runWithRequestContext,
        filter: requestFx.pending.map((pending) => !pending),
        target: requestFx,
      });
    }

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
