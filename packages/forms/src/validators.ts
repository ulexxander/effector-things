import { FieldValidator } from "./types";

export function notEmpty<FieldName>(
  errMessage: string
): FieldValidator<FieldName> {
  return (val) => (val ? "" : errMessage);
}

export function numeric<FieldName>(
  errMessage: string
): FieldValidator<FieldName> {
  return (val) => {
    const invalid = Number.isNaN(Number(val));
    return invalid ? errMessage : "";
  };
}

export function numericNotEmpty<FieldName>(
  errMessage: string
): FieldValidator<FieldName> {
  return (val) => {
    if (val === "") {
      return errMessage;
    }

    const invalid = Number.isNaN(Number(val));
    return invalid ? errMessage : "";
  };
}
