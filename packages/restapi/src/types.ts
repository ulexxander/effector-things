import { Event, Store } from "effector";

export type RequestHandlerParams<Payload, Inject> = {
  payload: Payload;
  injected: Inject;
};

export type RequestHandler<Inject> = (
  url: string,
  params: RequestHandlerParams<unknown, Inject>,
  fetchOptions: RequestInit
) => Promise<unknown>;

export type RequestsFactoryConfig<Inject> = {
  inject?: Store<Inject>;
  handler: RequestHandler<Inject>;
};

export type RequestOptions<Payload> = {
  concurrent?: boolean;
  reload?: Event<Payload>;
};
