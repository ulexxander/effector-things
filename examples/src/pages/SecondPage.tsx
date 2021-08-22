import { createForm } from "@effector-things/forms";
import { field, FieldProps } from "@effector-things/forms-react";
import { createEffect, createStore, Event, forward } from "effector";
import { useStore } from "effector-react";
import React, { ComponentProps } from "react";

type SomeForm = {
  email: string;
  password: string;
};

const form = createForm<keyof SomeForm>({
  fields: {
    email: {
      default: "",
      validator(val) {
        if (!val.toString().includes("@")) {
          return "missing @";
        }
        return "";
      },
    },
    password: {
      default: "",
      validator(val) {
        if (val.toString().length < 4) {
          return "at least 4 char long";
        }
        return "";
      },
    },
  },
});

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const submitFx = createEffect<SomeForm, void>(async (form) => {
  await sleep(500);
  if (form.email === "alex@alex.com") {
    throw new Error("that email already exists (no)");
  }
});

forward({
  from: form.validated as Event<SomeForm>,
  to: submitFx,
});

const $status = createStore("");
$status
  .on(submitFx, () => "loading...")
  .on(submitFx.done, () => "done!")
  .on(submitFx.failData, (_, err) => "err: " + err.message);

const WithoutBindings: React.FC = () => {
  const email = useStore(form.values.email);
  const emailError = useStore(form.errors.email);
  const password = useStore(form.values.password);
  const passwordError = useStore(form.errors.password);

  return (
    <div>
      <h5>Without bindings</h5>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.submit();
        }}
      >
        <input
          type="email"
          name="email"
          id="email"
          placeholder="Email"
          value={email as string}
          onChange={(e) => {
            form.updaters.email(e.target.value);
          }}
        />
        <span className="error">{emailError}</span>

        <input
          type="password"
          name="password"
          id="password"
          placeholder="****"
          value={password as string}
          onChange={(e) => {
            form.updaters.password(e.target.value);
          }}
        />
        <span className="error">{passwordError}</span>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

const Input: React.FC<FieldProps & ComponentProps<"input">> = ({
  value,
  update,
  error,
}) => {
  return (
    <div>
      <input
        type="email"
        name="email"
        id="email"
        placeholder="Email"
        value={value as string}
        onChange={(e) => update(e.target.value)}
      />
      <span className="error">{error}</span>
    </div>
  );
};

const Email = field(form, "email", Input);
const Password = field(form, "password", Input);

const WithBindings: React.FC = () => {
  return (
    <div>
      <h5>Using bindings</h5>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.submit();
        }}
      >
        <Email type="email" name="email" id="email" placeholder="Email" />

        <Password
          type="password"
          name="password"
          id="password"
          placeholder="****"
        />

        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

const Status: React.FC = () => {
  const status = useStore($status);

  if (!status) {
    return null;
  }

  return (
    <div>
      <p>Status: {status}</p>
    </div>
  );
};

export const SecondPage: React.FC = () => {
  return (
    <div>
      <h3>Second page</h3>
      <p>Forms example</p>

      {/* Without react package */}
      <WithoutBindings />

      {/* Using react package */}
      <WithBindings />

      <Status />
    </div>
  );
};
