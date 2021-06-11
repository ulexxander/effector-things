import { FormModel } from "@effector-things/forms";
import { useStore } from "effector-react";
import { ComponentType, createElement, FC } from "react";
import { FieldProps } from "./types";

export function field<FieldName extends string, Props>(
  form: FormModel<FieldName>,
  name: FieldName,
  render: ComponentType<FieldProps & Props>
): FC<Props> {
  const { values, updaters, errors } = form;

  return (restProps: Props) =>
    createElement<FieldProps & Props>(render, {
      value: useStore(values[name]),
      update: updaters[name],
      error: useStore(errors[name]),
      ...restProps,
    });
}
