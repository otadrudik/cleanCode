"use strict";

const DeepMerge = require("deepmerge");

/**
 * Object validation result
 */
class ValidationResult {

  constructor() {
    this.valid = true;
    this.empty = true;
  }

  /**
   * Checks if validation passed without any problems.
   * @returns {boolean}
   */
  isValid() {
    return this.valid;
  }

  /**
   * Adds error that value is of invalid base type.
   * @param {String} code
   * @param {String} message
   */
  addInvalidTypeError(code, message) {
    this.valid = false;
    this.empty = false;
    if (!this.invalidTypes) {
      this.invalidTypes = { [code]: message }
    } else {
      this.invalidTypes[code] = message;
    }
  }

  /**
   * Adds error that value is not valid.
   * @param {String} code
   * @param {String} message
   */
  addInvalidValueError(code, message) {
    this.valid = false;
    this.empty = false;
    if (!this.invalidValues) {
      this.invalidValues = { [code]: message };
    } else {
      this.invalidValues[code] = message;
    }
  }

  /**
   * Adds error that key is not valid.
   * @param {String} code
   * @param {String} message
   */
  addInvalidKeyError(code, message) {
    this.valid = false;
    this.empty = false;
    if (!this.invalidKeyMap) {
      this.invalidKeyMap = { [code]: message };
    } else {
      this.invalidKeyMap[code] = message;
    }
  }

  /**
   * Adds key which is not declared in type definition.
   * @param {String} key
   */
  addUnsupportedKey(key) {
    this.empty = false;
    if (!this.unsuportedKeys) {
      this.unsuportedKeys = [key];
    } else {
      this.unsuportedKeys.push(key);
    }
  }

  /**
   * Adds error that required value is missing.
   * @param {String} code
   * @param {String} message
   */
  addMissingKey(code, message) {
    this.valid = false;
    this.empty = false;
    if (!this.missingKeys) {
      this.missingKeys = { [code]: message };
    } else {
      this.missingKeys[code] = message;
    }
  }

  /**
   * Adds validation result of nested object.
   * @param {String} key
   * @param {Object} result
   */
  addChildResult(key, result) {
    if (!result || (result.valid && result.empty && !result.childResults)) {
      return; // do not keep empty result
    }
    if (!this.childResults) {
      this.childResults = { [key]: result };
    } else if (this.childResults[key]) {
      let childResults = this.childResults[key];
      if (!childResults.invalidKeyMap) {
        childResults.invalidKeyMap = result.invalidKeyMap;
      } else if (result.invalidKeyMap) {
        childResults.invalidKeyMap = DeepMerge(childResults.invalidKeyMap, result.invalidKeyMap);
      }
      if (!childResults.invalidTypes) {
        childResults.invalidTypes = result.invalidTypes;
      } else if (result.invalidTypes) {
        childResults.invalidTypes = DeepMerge(childResults.invalidTypes, result.invalidTypes);
      }
      if (!childResults.invalidValues) {
        childResults.invalidValues = result.invalidValues;
      } else if (result.invalidValues) {
        childResults.invalidValues = DeepMerge(childResults.invalidValues, result.invalidValues);
      }
      if (!childResults.missingKeys) {
        childResults.missingKeys = result.missingKeys;
      } else if (result.missingKeys) {
        childResults.missingKeys = DeepMerge(childResults.missingKeys, result.missingKeys);
      }
      if (!childResults.unsupportedKeyList) {
        childResults.unsupportedKeyList = result.unsupportedKeyList;
      } else if (result.unsupportedKeyList) {
        childResults.unsupportedKeyList = childResults.unsupportedKeyList.concat(unsupportedKeyList.missingKeys);
      }
      childResults.valid = childResults.valid === false ? false : result.valid;
    } else {
      this.childResults[key] = result;
    }
    this.valid = this.valid && result.valid;
  }

  /**
   * Returns set of keys which were required, but were not.
   * @returns {Array}
   */
  getMissingKeys() {
    if (!this.validationErrorMap) {
      this.getValidationErrorMap();
    }
    if (this.validationErrorMap.missingKeyMap) {
      return Object.keys(this.validationErrorMap.missingKeyMap);
    } else {
      return [];
    }
  }

  /**
   * Returns set of keys which refers to values not matching expected.
   * @returns {Array}
   */
  getInvalidValueKeys() {
    if (!this.validationErrorMap) {
      this.getValidationErrorMap();
    }
    if (this.validationErrorMap.invalidValueKeyMap) {
      return Object.keys(this.validationErrorMap.invalidValueKeyMap);
    } else {
      return [];
    }
  }

  /**
   * Returns set of keys which refers to values of invalid base type.
   * @returns {Array}
   */
  getInvalidTypeKeys() {
    if (!this.validationErrorMap) {
      this.getValidationErrorMap();
    }
    if (this.validationErrorMap.invalidTypeKeyMap) {
      return Object.keys(this.validationErrorMap.invalidTypeKeyMap);
    } else {
      return [];
    }
  }

  /**
   * Returns set of keys which are unknown according to type definition.
   * @returns {Array}
   */
  getUnsupportedKeys() {
    if (!this.validationErrorMap) {
      this.getValidationErrorMap();
    }
    if (this.validationErrorMap.unsupportedKeyList) {
      return this.validationErrorMap.unsupportedKeyList;
    } else {
      return [];
    }
  }

  /**
   * Returns set of keys whose validation resulted in one of given.
   * @returns {Array}
   */
  getInvalidAttributeKeys() {
    if (!this.validationErrorMap) {
      this.getValidationErrorMap();
    }
    if (this.validationErrorMap) {
      let result = [];
      let keys = Object.keys(this.validationErrorMap);
      keys.forEach(key => {
        if (Array.isArray(this.validationErrorMap[key]) || this.validationErrorMap[key] instanceof Array) {
          result = result.concat(this.validationErrorMap[key]);
        } else {
          result = result.concat(Object.keys(this.validationErrorMap[key]));
        }
      });
      return result;
    } else {
      return [];
    }
  }

  /**
   * Returns nested validation result.
   * @param rootString
   * @returns {Object}
   */
  getValidationResult(rootString) {
    rootString = rootString.split(/\]\[|\]\.|\[|\]|\./);
    if (rootString[0] === "$") {
      rootString.shift();
    }

    return this._pathToValue(rootString);
  }

  _pathToValue(parts) {
    let value = this;
    parts.forEach(val => {
      if (val !== "") {
        value = (value && value.childResults) ? value.childResults[val] : null;
      }
    });

    return value;
  }

  /**
   * Transforms validation result into Hash which can be used e.g. as part
   * @param rootString
   * @returns {{invalidValueKeyMap: {}, invalidTypeKeyMap: {}, invalidKeyMap: {}, missingKeyMap: {}, unsupportedKeyList: Array}}
   */
  getValidationErrorMap(rootString) {
    let result;

    if (rootString) {
      let validationResult = this.getValidationResult(rootString);
      result = this._getInvalidErrorMap("$", validationResult);
    } else {
      result = this._getInvalidErrorMap("$");
    }

    if (result.invalidValueKeyMap && Object.keys(result.invalidValueKeyMap).length === 0) {
      delete result.invalidValueKeyMap;
    }
    if (result.invalidTypeKeyMap && Object.keys(result.invalidTypeKeyMap).length === 0) {
      delete result.invalidTypeKeyMap;
    }
    if (result.invalidKeyMap && Object.keys(result.invalidKeyMap).length === 0) {
      delete result.invalidKeyMap;
    }
    if (result.missingKeyMap && Object.keys(result.missingKeyMap).length === 0) {
      delete result.missingKeyMap;
    }
    if (result.unsupportedKeyList && result.unsupportedKeyList.length === 0) {
      delete result.unsupportedKeyList;
    }

    this.validationErrorMap = result;
    return result;
  }

  /**
   *
   * @param prefix
   * @param root
   * @returns {{invalidValueKeyMap: {}, invalidTypeKeyMap: {}, invalidKeyMap: {}, missingKeyMap: {}, unsupportedKeyList: Array}}
   * @private
   */
  _getInvalidErrorMap(prefix, root = this) {
    let result = {};
    if (!root) {
      return result;
    }
    root.prefix = prefix;
    if (root.invalidValues && Object.keys(root.invalidValues).length !== 0) {
      if (!result.invalidValueKeyMap || !result.invalidValueKeyMap[prefix]) {
        result.invalidValueKeyMap = { [prefix]: root.invalidValues };
      } else {
        Object.assign(result.invalidValueKeyMap[prefix], root.invalidValues);
      }
    }
    if (result.invalidValueKeyMap && (!result.invalidValueKeyMap[prefix] || Object.keys(result.invalidValueKeyMap[prefix]).length === 0)) {
      delete result.invalidValueKeyMap[prefix];
    }

    if (root.invalidTypes && Object.keys(root.invalidTypes).length !== 0) {
      if (!result.invalidTypeKeyMap || !result.invalidTypeKeyMap[prefix]) {
        result.invalidTypeKeyMap = { [prefix]: root.invalidTypes };
      } else {
        Object.assign(result.invalidTypeKeyMap[prefix], root.invalidTypes);
      }
    }
    if (result.invalidTypeKeyMap && (!result.invalidTypeKeyMap[prefix] || Object.keys(result.invalidTypeKeyMap[prefix]).length === 0)) {
      delete result.invalidTypeKeyMap[prefix];
    }

    if (root.invalidKeyMap && Object.keys(root.invalidKeyMap).length !== 0) {
      if (!result.invalidKeyMap || !result.invalidKeyMap[prefix]) {
        result.invalidKeyMap = { [prefix]: root.invalidKeyMap };
      } else {
        Object.assign(result.invalidKeyMap[prefix], root.invalidKeyMap);
      }
    }
    if (result.invalidKeyMap && (!result.invalidKeyMap[prefix] || Object.keys(result.invalidKeyMap[prefix]).length === 0)) {
      delete result.invalidKeyMap[prefix];
    }

    if (root.missingKeys && Object.keys(root.missingKeys).length !== 0) {
      if (!result.missingKeyMap || !result.missingKeyMap[prefix]) {
        result.missingKeyMap = { [prefix]: root.missingKeys };
      } else {
        Object.assign(result.missingKeyMap[prefix], root.missingKeys);
      }
    }
    if (result.missingKeyMap && (!result.missingKeyMap[prefix] || Object.keys(result.missingKeyMap[prefix]).length === 0)) {
      delete result.missingKeyMap[prefix];
    }

    if (root.unsuportedKeys && root.unsuportedKeys.length > 0) {
      if (!result.unsupportedKeyList) {
        result.unsupportedKeyList = [];
      }
      root.unsuportedKeys.forEach(unsupKey => {
        if (!prefix) {
          prefix = "$";
        }
        result.unsupportedKeyList.push(`${prefix}.${unsupKey}`);
      });
    }

    if (root.childResults) {
      Object.keys(root.childResults).forEach(childdrenKey => {
        let children = root.childResults[childdrenKey];
        if (childdrenKey.match(/^[0-9]+$/)) {
          childdrenKey = `[${childdrenKey}]`;
        } else {
          childdrenKey = `.${childdrenKey}`;
        }
        let prefix = `${root.prefix}${childdrenKey}`;
        let tmp;
        if ("_getInvalidErrorMap" in children) {
          tmp = children._getInvalidErrorMap(prefix);
        }
        if (tmp) {
          if (tmp.invalidValueKeyMap) {
            if (!result.invalidValueKeyMap) {
              result.invalidValueKeyMap = tmp.invalidValueKeyMap;
            } else {
              Object.assign(result.invalidValueKeyMap, tmp.invalidValueKeyMap);
            }
          }
          if (tmp.invalidTypeKeyMap) {
            if (!result.invalidTypeKeyMap) {
              result.invalidTypeKeyMap = tmp.invalidTypeKeyMap;
            } else {
              Object.assign(result.invalidTypeKeyMap, tmp.invalidTypeKeyMap);
            }
          }
          if (tmp.invalidKeyMap) {
            if (!result.invalidKeyMap) {
              result.invalidKeyMap = tmp.invalidKeyMap;
            } else {
              Object.assign(result.invalidKeyMap, tmp.invalidKeyMap);
            }
          }
          if (tmp.missingKeyMap) {
            if (!result.missingKeyMap) {
              result.missingKeyMap = tmp.missingKeyMap;
            } else {
              Object.assign(result.missingKeyMap, tmp.missingKeyMap);
            }
          }
          if (tmp.unsupportedKeyList) {
            if (!result.unsupportedKeyList) {
              result.unsupportedKeyList = tmp.unsupportedKeyList;
            } else {
              result.unsupportedKeyList = result.unsupportedKeyList.concat(
                tmp.unsupportedKeyList);
            }
          }
        }
      });
    }

    return result;
  }

}

module.exports = ValidationResult;
