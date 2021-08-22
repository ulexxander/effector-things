import { persist } from "@effector-things/persist";
import { createEvent, createStore } from "effector";
import { useStore } from "effector-react";
import React from "react";

const $counter = createStore(0);
persist("counter", $counter, {
  codec: {
    marshal(state) {
      return state.toString();
    },
    unmarshal(rawState) {
      return Number(rawState);
    },
  },
  storage: localStorage,
});

const increment = createEvent();
const decrement = createEvent();
const reset = createEvent();

$counter
  .on(increment, (state) => state + 1)
  .on(decrement, (state) => state - 1)
  .reset(reset);

export const FirstPage: React.FC = () => {
  const counter = useStore($counter);

  return (
    <div>
      <h3>First page</h3>
      <p>Persist example</p>
      <code>Counter: {counter}</code>

      <button onClick={() => increment()}>Increment</button>
      <button onClick={() => decrement()}>Decrement</button>
      <button onClick={() => reset()}>Reset</button>
    </div>
  );
};
