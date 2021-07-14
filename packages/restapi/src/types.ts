import { Effect, Event } from "effector";

export type RequestContext<Payload> = {
  url: string;
  payload: Payload;
  fetchOptions: RequestInit;
};

export type RequestEffect<Payload = unknown, Result = unknown> = Effect<
  RequestContext<Payload>,
  Result
>;

export type RequestsFactoryConfig = {
  requestFx: RequestEffect;
};

export type RequestOptions<Payload> = {
  concurrent?: boolean;
  reload?: Event<Payload>;
};
