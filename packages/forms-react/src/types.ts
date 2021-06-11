import { FormValue } from "@effector-things/forms";

export type FieldProps = {
  value: FormValue;
  update: (value: FormValue) => void;
  error: string;
};
