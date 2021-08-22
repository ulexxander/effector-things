import { PersistCodec } from "./persist";

export function CodecString(): PersistCodec<string> {
  return {
    marshal(state) {
      return state;
    },
    unmarshal(rawState) {
      return rawState;
    },
  };
}

export function CodecNumber(): PersistCodec<number> {
  return {
    marshal(state) {
      return state.toString();
    },
    unmarshal(rawState) {
      return Number(rawState);
    },
  };
}

export function CodecBoolean(): PersistCodec<boolean> {
  return {
    marshal(state) {
      return state.toString();
    },
    unmarshal(rawState) {
      return rawState === "true";
    },
  };
}

export function CodecJSON(): PersistCodec<any> {
  return {
    marshal(state) {
      return JSON.stringify(state);
    },
    unmarshal(rawState) {
      return JSON.parse(rawState);
    },
  };
}
