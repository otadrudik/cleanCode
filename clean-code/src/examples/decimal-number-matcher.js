// noinspection JSUnusedGlobalSymbols

const Decimal = require("decimal.js");
const ValidationResult = require("./validation-result");

const MAX_OF_DIGITS = 11;
const DECIMAL_VALIDATION_PARAMS_LENGTH = 2;

const ERRORS = {
  VALID_DECIMAL_NUMBER: {
    code: "doubleNumber.e001",
    message: "The value is not a valid decimal number.",
  },
  EXCEEDED_DIGITS: {
    code: "doubleNumber.e002",
    message: "The value exceeded maximum number of digits.",
  },
  EXCEEDED_DECIMAL: {
    code: "doubleNumber.e003",
    message: "The value exceeded maximum number of decimal places.",
  },
};
/**
 * Matcher validates that string value represents a decimal number or null.
 * Decimal separator is always "."
 * In addition, it must comply to the rules described below.
 *
 * @param params - Matcher can take 0 to 2 parameters with following rules:
 * - no parameters: validates that number of digits does not exceed the maximum value of 11.
 * - one parameter: the parameter specifies maximum length of number for the above rule (parameter replaces the default value of 11)
 * - two parameters:
 *   -- first parameter represents the total maximum number of digits,
 *   -- the second parameter represents the maximum number of decimal places.
 *   -- both conditions must be met in this case.
 */
class DecimalNumberMatcher {
  constructor(...params) {
    this.params = params;
  }

  match(value) {
    let result = new ValidationResult();

    if (value != null) {
      const { number } = this._getValidatedNumber(value, result); // returns null for invalid number
      number && this._validateMaximalDigits(number, result);
      number && this._validateDecimalPlaces(number, result);
    }

    return result;
  }

  _getValidatedNumber(value, result) {
    let number;
    try {
      number = new Decimal(value);
    } catch (e) {
      number = null;
      result.addInvalidTypeError(ERRORS.VALID_DECIMAL_NUMBER.code, ERRORS.VALID_DECIMAL_NUMBER.message);
    }
    return { number };
  }

  _validateMaximalDigits(number, result) {
    const { maximalDigits } = this._getMaximalDigits();
    if (number.precision(true) > maximalDigits) {
      result.addInvalidTypeError(ERRORS.EXCEEDED_DIGITS.code, ERRORS.EXCEEDED_DIGITS.message);
    }
  }

  _getMaximalDigits() {
    let maximalDigits;
    switch (this.params.length) {
      case 0:
        maximalDigits = MAX_OF_DIGITS;
        break;
      case 1:
      case 2:
        maximalDigits = this.params[0];
        break;
    }
    return { maximalDigits };
  }

  _validateDecimalPlaces(number, result) {
    let isParamsLengthEqual = this.params.length === DECIMAL_VALIDATION_PARAMS_LENGTH;
    if (isParamsLengthEqual && number.decimalPlaces() > this.params[1]) {
      result.addInvalidTypeError(ERRORS.EXCEEDED_DECIMAL.code, ERRORS.EXCEEDED_DECIMAL.message);
    }
  }
}

module.exports = DecimalNumberMatcher;
