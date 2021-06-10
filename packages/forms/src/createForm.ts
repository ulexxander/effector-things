import { combine, createEvent, createStore, guard, sample } from "effector";
import React from "react";
import {
  FormConfig,
  FormErrors,
  FormErrorState,
  FormModel,
  FormState,
  FormUpdaters,
  FormValue,
  FormValues,
} from "./types";

export type ReflectableProps = {
  value: FormValue;
  update: (value: FormValue) => void;
  error: string;
};

export type Reflectable = React.FC<ReflectableProps>;

export function createForm<FieldName extends string>(
  config: FormConfig<FieldName>
): FormModel<FieldName> {
  const submit = createEvent<void>();
  const validated = createEvent<FormState<FieldName>>();
  const reset = config.reset || createEvent<void>();

  const values = {} as FormValues<FieldName>;
  const updaters = {} as FormUpdaters<FieldName>;
  const errors = {} as FormErrors<FieldName>;

  const fieldNames = Object.keys(config.fields) as FieldName[];

  for (const name of fieldNames) {
    const field = config.fields[name];

    const $value = createStore<FormValue>(field.default);
    const $error = createStore<string>("");
    const updater = createEvent<FormValue>();

    $value.on(updater, (_, newVal) => newVal).reset(reset);
    $error.reset([updater, reset]);

    values[name] = $value;
    errors[name] = $error;
    updaters[name] = updater;

    sample({
      clock: submit,
      source: $value,
      fn(val) {
        return field.validator
          ? field.validator(val, (field) => values[field].getState())
          : "";
      },
      target: $error,
    });
  }

  const $state = combine(values, (vals) => vals as FormState<FieldName>);
  const $errorState = combine(
    errors,
    (errs) => errs as FormErrorState<FieldName>
  );

  const $hasErrors = $errorState.map((errs) =>
    Object.keys(errs).every((key) => errs[key as FieldName] !== "")
  );

  const $noErrors = $hasErrors.map((has) => !has);

  guard({
    clock: submit,
    source: $state,
    filter: $noErrors,
    target: validated,
  });

  return {
    values,
    updaters,
    errors,
    $state,
    $errorState,
    $hasErrors,
    submit,
    validated,
    reset,
  };
}
