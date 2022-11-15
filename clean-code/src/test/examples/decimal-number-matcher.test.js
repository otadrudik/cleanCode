const DecimalNumberMatcher = require("../../examples/decimal-number-matcher.js");

describe("DoubleNumberMatcher tests", () => {
  test("Zero parameters scenario - valid value with decimal places ", () => {
    const matcher = new DecimalNumberMatcher();
    const valueToValidate = "13000.45";

    const validationResult = matcher.match(valueToValidate);

    expect(validationResult.valid).toBe(true);
  });

  test("Zero parameters scenario - valid value with no decimal places", () => {
    const matcher = new DecimalNumberMatcher();
    const valueToValidate = "1300045";

    const validationResult = matcher.match(valueToValidate);

    expect(validationResult.valid).toBe(true);
  });

  test("Zero parameters scenario - invalid number value", () => {
    const matcher = new DecimalNumberMatcher();
    const valueToValidate = "invalid number value";

    const validationResult = matcher.match(valueToValidate);

    expect(validationResult.valid).toBe(false);
    expect(validationResult.invalidTypes).toMatchObject({
      ["doubleNumber.e001"]: "The value is not a valid decimal number.",
    });
  });

  test("Zero parameters scenario - maximum digits exceeded", () => {
    const matcher = new DecimalNumberMatcher();
    const valueToValidate = "123456789.12345";

    const validationResult = matcher.match(valueToValidate);

    expect(validationResult.valid).toBe(false);
    expect(validationResult.invalidTypes).toMatchObject({
      ["doubleNumber.e002"]: "The value exceeded maximum number of digits.",
    });
  });

  test("One parameters scenario - valid value with decimal places ", () => {
    const matcher = new DecimalNumberMatcher(8);
    const valueToValidate = "13000.45";

    const validationResult = matcher.match(valueToValidate);

    expect(validationResult.valid).toBe(true);
  });

  test("One parameters scenario - valid value with no decimal places", () => {
    const matcher = new DecimalNumberMatcher(8);
    const valueToValidate = "1300045";

    const validationResult = matcher.match(valueToValidate);

    expect(validationResult.valid).toBe(true);
  });

  test("One parameters scenario - invalid number value", () => {
    const matcher = new DecimalNumberMatcher(8);
    const valueToValidate = "invalid number value";

    const validationResult = matcher.match(valueToValidate);

    expect(validationResult.valid).toBe(false);
    expect(validationResult.invalidTypes).toMatchObject({
      ["doubleNumber.e001"]: "The value is not a valid decimal number.",
    });
  });

  test("One parameters scenario - maximum digits exceeded", () => {
    const matcher = new DecimalNumberMatcher(8);
    const valueToValidate = "123456789.12345";

    const validationResult = matcher.match(valueToValidate);

    expect(validationResult.valid).toBe(false);
    expect(validationResult.invalidTypes).toMatchObject({
      ["doubleNumber.e002"]: "The value exceeded maximum number of digits.",
    });
  });

  test("Two parameters scenario - valid value with decimal places ", () => {
    const matcher = new DecimalNumberMatcher(8, 2);
    const valueToValidate = "13000.45";

    const validationResult = matcher.match(valueToValidate);

    expect(validationResult.valid).toBe(true);
  });

  test("Two parameters scenario - valid value with no decimal places", () => {
    const matcher = new DecimalNumberMatcher(8, 2);
    const valueToValidate = "1300045";

    const validationResult = matcher.match(valueToValidate);

    expect(validationResult.valid).toBe(true);
  });

  test("One parameters scenario - invalid number value", () => {
    const matcher = new DecimalNumberMatcher(8, 2);
    const valueToValidate = "invalid number value";

    const validationResult = matcher.match(valueToValidate);

    expect(validationResult.valid).toBe(false);
    expect(validationResult.invalidTypes).toMatchObject({
      ["doubleNumber.e001"]: "The value is not a valid decimal number.",
    });
  });

  test("Two parameters scenario - maximum digits exceeded", () => {
    const matcher = new DecimalNumberMatcher(8, 2);
    const valueToValidate = "123456789.12";

    const validationResult = matcher.match(valueToValidate);

    expect(validationResult.valid).toBe(false);
    expect(validationResult.invalidTypes).toMatchObject({
      ["doubleNumber.e002"]: "The value exceeded maximum number of digits.",
    });
  });

  test("Two parameters scenario - maximum decimals exceeded", () => {
    const matcher = new DecimalNumberMatcher(8, 2);
    const valueToValidate = "1234.5678";

    const validationResult = matcher.match(valueToValidate);

    expect(validationResult.valid).toBe(false);
    expect(validationResult.invalidTypes).toMatchObject({
      ["doubleNumber.e003"]:
        "The value exceeded maximum number of decimal places.",
    });
  });

  test("Two parameters scenario - both maximum digits and decimals exceeded", () => {
    const matcher = new DecimalNumberMatcher(8, 2);
    const valueToValidate = "12345678.1234";

    const validationResult = matcher.match(valueToValidate);

    expect(validationResult.valid).toBe(false);
    expect(validationResult.invalidTypes).toMatchObject({
      ["doubleNumber.e002"]: "The value exceeded maximum number of digits.",
      ["doubleNumber.e003"]:
        "The value exceeded maximum number of decimal places.",
    });
  });
});
