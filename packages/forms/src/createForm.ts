import { combine, createEvent, createStore, guard, sample } from "effector";
import {
  FormConfig,
  FormErrors,
  FormErrorState,
  FormModel,
  FormResetters,
  FormState,
  FormUpdaters,
  FormValue,
  FormValues,
} from "./types";

export function createForm<FieldName extends string>(
  config: FormConfig<FieldName>
): FormModel<FieldName> {
  const submit = createEvent<void>();
  const validated = createEvent<FormState<FieldName>>();
  const reset = config.reset || createEvent<void>();

  const values = {} as FormValues<FieldName>;
  const updaters = {} as FormUpdaters<FieldName>;
  const resetters = {} as FormResetters<FieldName>;
  const errors = {} as FormErrors<FieldName>;

  const fieldNames = Object.keys(config.fields) as FieldName[];

  for (const name of fieldNames) {
    const field = config.fields[name];

    const $value = createStore<FormValue>(
      field.default !== undefined ? field.default : ""
    );
    const updater = createEvent<FormValue>();
    const resetter = createEvent<void>();
    const $error = createStore<string>("");

    $value.on(updater, (_, val) => val).reset([resetter, reset]);
    $error.reset([updater, resetter, reset]);

    values[name] = $value;
    updaters[name] = updater;
    resetters[name] = resetter;
    errors[name] = $error;

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
    Object.keys(errs).some((key) => errs[key as FieldName] !== "")
  );

  guard({
    clock: submit,
    source: $state,
    filter: $hasErrors.map((has) => !has),
    target: validated,
  });

  return {
    values,
    updaters,
    resetters,
    errors,
    $state,
    $errorState,
    $hasErrors,
    submit,
    validated,
    reset,
  };
}
