import { createForm } from "./createForm";
import { FormModel, FormState } from "./types";

const expectState = <FieldName extends string>(
  f: FormModel<FieldName>,
  state: Partial<FormState<FieldName>>
) => {
  for (const [name, mustBe] of Object.entries(state)) {
    const $value = f.values[name as FieldName];
    const currentState = f.$state.getState();
    expect($value).toBeDefined();
    expect($value.getState()).toBe(mustBe);
    expect(currentState[name as FieldName]).toBe(mustBe);
  }
};

const expectErrors = <FieldName extends string>(
  f: FormModel<FieldName>,
  errors: Partial<Record<FieldName, string>>
) => {
  expect(f.$hasErrors.getState()).toEqual(true);
  for (const [name, mustBe] of Object.entries(errors)) {
    const $error = f.errors[name as FieldName];
    const errorState = f.$errorState.getState();
    expect($error.getState()).toBe(mustBe);
    expect(errorState[name as FieldName]).toBe(mustBe);
  }
};

const expectNoErrors = (f: FormModel<string>) => {
  expect(f.$hasErrors.getState()).toEqual(false);
  for (const [name, $error] of Object.entries(f.errors)) {
    const errorState = f.$errorState.getState();
    expect($error.getState()).toBe("");
    expect(errorState[name]).toBe("");
  }
};

test("basic values, defaults, updates and state", () => {
  const def1 = "";
  const def2 = "";
  const def3 = "Abc";
  const def4 = 1;
  const def5 = false;

  const f = createForm({
    fields: {
      One: {},
      Two: { default: "" },
      Three: { default: "Abc" },
      Four: { default: 1 },
      Five: { default: false },
    },
  });

  expectState(f, {
    One: def1,
    Two: def2,
    Three: def3,
    Four: def4,
    Five: def5,
  });

  const val1 = "first";
  const val2 = "second";
  const val3 = "third";
  const val4 = "fourth";
  const val5 = "fifth";

  f.updaters["One"]("first");
  f.updaters["Two"]("second");
  f.updaters["Three"]("third");
  f.updaters["Four"]("fourth");
  f.updaters["Five"]("fifth");

  expectState(f, {
    One: val1,
    Two: val2,
    Three: val3,
    Four: val4,
    Five: val5,
  });

  expectNoErrors(f);
});

test("validation", async () => {
  const f = createForm({
    fields: {
      One: {
        default: "",
        validator(val) {
          if (!val) {
            return "required";
          }

          return "";
        },
      },
      Two: {
        default: "anything",
        validator(val) {
          if (val === ":(") {
            return "must not be sad";
          }

          return "";
        },
      },
      Three: {
        default: "anything",
        validator(val, getField) {
          if (val !== getField("Two")) {
            return "should be same as two";
          }

          return "";
        },
      },
      Four: {
        default: "i dont have validation",
      },
    },
  });

  const afterValidated = () => {
    const fn = jest.fn();
    f.validated.watch(fn);
    return fn;
  };

  expectNoErrors(f);

  const validated1 = afterValidated();
  f.submit();

  expect(validated1).not.toBeCalled();
  expectErrors(f, {
    One: "required",
  });

  f.updaters["One"]!("Something good");
  expectNoErrors(f); // error resets on field update (user's typing)

  const validated2 = afterValidated();
  f.submit();

  expect(validated2).toBeCalledTimes(1);
  expectNoErrors(f);

  f.updaters["Three"]!("hmmmmmmm that is wrong");

  const validated3 = afterValidated();
  f.submit();

  expect(validated3).not.toBeCalled();
  expectErrors(f, {
    Three: "should be same as two",
  });

  f.updaters["Two"]!(":(");
  f.submit();

  expectErrors(f, {
    Two: "must not be sad",
    Three: "should be same as two",
  });
});

test("resetting separated fields and whole form", () => {
  const def1 = "";
  const def2 = 123;
  const def3 = false;

  const f = createForm({
    fields: {
      One: { default: def1 },
      Two: { default: def2 },
      Third: {
        default: def3,
        validator(val) {
          if (!val) {
            return "should be true";
          }
          return "";
        },
      },
    },
  });

  f.updaters.One("neww val");
  f.updaters.Two("50249738888");

  f.resetters.One();
  expectState(f, {
    One: def1,
    Two: "50249738888",
  });

  f.submit();
  expectErrors(f, {
    Third: "should be true",
  });

  f.resetters.Third();
  expectNoErrors(f);

  f.reset(); // whole form
  expectState(f, {
    One: def1,
    Two: def2,
    Third: def3,
  });
});
