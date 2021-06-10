import { Event, Store } from "effector";

export type FormValue = string | number | boolean;

export type FieldValidator<FieldName> = (
  val: FormValue,
  getField: (name: FieldName) => FormValue
) => string;

export type FormField<FieldName extends string> = {
  default: FormValue;
  validator?: FieldValidator<FieldName>;
};

export type FormConfig<FieldName extends string> = {
  reset?: Event<void>;
  fields: Record<FieldName, FormField<FieldName>>;
};

export type FormState<FieldName extends string> = Record<FieldName, FormValue>;
export type FormErrorState<FieldName extends string> = Record<
  FieldName,
  string
>;

export type FormValues<FieldName extends string> = Record<
  FieldName,
  Store<FormValue>
>;

export type FormUpdaters<FieldName extends string> = Record<
  FieldName,
  Event<FormValue>
>;

export type FormErrors<FieldName extends string> = Record<
  FieldName,
  Store<string>
>;

export type FormModel<FieldName extends string> = {
  values: FormValues<FieldName>;
  updaters: FormUpdaters<FieldName>;
  errors: FormErrors<FieldName>;
  $state: Store<FormState<FieldName>>;
  $errorState: Store<FormErrorState<FieldName>>;
  $hasErrors: Store<boolean>;
  submit: Event<void>;
  validated: Event<FormState<FieldName>>;
  reset: Event<void>;
};
