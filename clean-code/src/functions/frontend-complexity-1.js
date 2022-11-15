//@@viewOn:imports
import React from "react";
import createReactClass from "create-react-class";
import PropTypes from "prop-types";
import moment from "moment-timezone";
import * as UU5 from "uu5g04";
import "uu5g04-bricks";
import ItemsInput from "./internal/items-input.js";
import TextInput from "./internal/text-input.js";
import Config from "./config/config";
import { formatLocalToCet, formatUTCToCet, getCurrentBusinessZoneDate, getEndOfDay, getStartOfDay } from "./helpers/necs-date-utils";
import "./necs-absolute-date-range-picker.less";
import Lsi from "../lsi/bricks/necs-date-range-picker-lsi";
//@@viewOff:imports

const INFINITY_RIGHT_DATE = "2099-12-31";
const INFINITY_LEFT_DATE = "1900-1-1";

/**
 * Shifts date by given calendar view type.
 * @param view {string} calendar view type "days" | "months" | "years"
 * @param newDate {Date} New date which will be shifted
 * @param oldDate {Date} Old date in calendar selection
 * @param step {number} How much the new date will be shifted
 * @return {*}
 */
function changeDateByCalendarView(view, newDate, oldDate, step) {
  switch (view) {
    case "days": // month select
      newDate.setMonth(oldDate.getMonth() + step);
      break;
    case "months": // year select
      newDate.setFullYear(oldDate.getFullYear() + step);
      break;
    case "years": // decade select
      newDate.setFullYear(oldDate.getFullYear() + step * 10);
  }
}

export const NecsAbsoluteDateRangePicker = createReactClass({
  //@@viewOn:mixins
  mixins: [UU5.Common.BaseMixin, UU5.Common.PureRenderMixin, UU5.Common.ElementaryMixin, UU5.Common.ScreenSizeMixin, UU5.Common.ContentMixin, UU5.Forms.TextInputMixin],
  //@@viewOff:mixins

  //@@viewOn:statics
  statics: {
    tagName: Config.TAG + "NecsDateRangePicker",
    classNames: {
      main: Config.CSS + "necs-date-range-picker",
      open: Config.CSS + "necs-date-range-picker-open",
      menu: Config.CSS + "input-menu",
      leftCalendar: Config.CSS + "necs-date-range-picker-calendar-left",
      rightCalendar: Config.CSS + "necs-date-range-picker-calendar-right",
      multiMonth: Config.CSS + "necs-date-range-picker-multi-month-selection",
      screenSizeBehaviour: Config.CSS + "screen-size-behaviour",
      mainInput: Config.CSS + "necs-date-range-picker-main-input",
      inputContentWrapper: Config.CSS + "necs-date-range-picker-input-content-wrapper",
      inputText: Config.CSS + "necs-date-range-picker-input-text",
      inputValue: Config.CSS + "necs-date-range-picker-input-value",
      inputTextRightInfinity: Config.CSS + "necs-date-range-picker-input-text-right-infinity",
      inputTextBothInfinity: Config.CSS + "necs-date-range-picker-input-text-both-infinity",
      inputFrom: Config.CSS + "necs-date-range-picker-from-input",
      inputTo: Config.CSS + "necs-date-range-picker-to-input",
      inputActive: Config.CSS + "input-active",
      calendarSeparator: Config.CSS + "necs-date-range-picker-calendar-separator",
      firstRow: Config.CSS + "necs-date-range-picker-popover-first-row",
      secondRow: Config.CSS + "necs-date-range-picker-popover-second-row",
      leftColumn: Config.CSS + "necs-date-range-picker-popover-left-column",
      rightColumn: Config.CSS + "necs-date-range-picker-popover-right-column",
      calendarInput: Config.CSS + "necs-date-range-picker-calendar-input",
      todayButton: Config.CSS + "necs-date-range-picker-today-button",
      inputOpen: Config.CSS + "items-input-open",
      calendars: Config.CSS + "necs-date-range-picker-calendars",
      customContent: Config.CSS + "necs-date-range-picker-custom-content",
      labelFrom: Config.CSS + "necs-date-range-picker-from-label",
      labelTo: Config.CSS + "necs-date-range-picker-to-label",
      mainPlaceholder: Config.CSS + "necs-date-range-picker-main-placeholder",
      popoverWrapper: Config.CSS + "necs-date-range-picker-popover-wrapper",
      radio: Config.CSS + "necs-date-range-picker-radio",
      rightInfinity: Config.CSS + "necs-date-range-picker-right-infinity",
      leftInfinity: Config.CSS + "necs-date-range-picker-left-infinity",
      buttonGroup: Config.CSS + "necs-date-range-picker-button-group",
      normalRenderButtonGroup: Config.CSS + "necs-date-range-picker-normal-render-button-group",
      infinityIconRight: Config.CSS + "necs-date-range-picker-infinity-icon-right",
      infinityIconLeft: Config.CSS + "necs-date-range-picker-infinity-icon-left",
      infinityIconBoth: Config.CSS + "necs-date-range-picker-infinity-icon-both",
      calendarInputIcon: Config.CSS + "necs-date-range-picker-calendar-input-icon",
    },
    defaults: {
      format: "Y-mm-dd",
      columnRegexp: /^((?:offset-)?[a-z]+)(?:-)?(\d+)$/,
    },

    state: {
      leftInfinity: false,
      rightInfinity: false,
    },

    errors: {
      dateFromGreaterThanDateTo: "The property dateFrom is greater than the property dateTo.",
      firstGreaterThanSecond: "The first date of range is greater than the second date of range.",
    },
    lsi: () => UU5.Common.Tools.merge({}, UU5.Environment.Lsi.Bricks.calendar, UU5.Environment.Lsi.Forms.message, Lsi),
  },
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    value: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.string])),
    dateFrom: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    dateTo: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    format: PropTypes.string,
    country: PropTypes.string,
    beforeRangeMessage: PropTypes.any,
    afterRangeMessage: PropTypes.any,
    parseDate: PropTypes.func,
    icon: PropTypes.string,
    iconOpen: PropTypes.string,
    iconClosed: PropTypes.string,
    disableBackdrop: PropTypes.bool,
    openToContent: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
    hideFormatPlaceholder: PropTypes.bool,
    hideWeekNumber: PropTypes.bool,
    showTodayButton: PropTypes.bool,
    labelFrom: PropTypes.any,
    labelTo: PropTypes.any,
    innerLabel: PropTypes.bool,
  },
  //@@viewOff:propTypes

  //@@viewOn:getDefaultProps
  getDefaultProps() {
    let today = getCurrentBusinessZoneDate();
    let tomorrow = moment(today).add(1, "days");
    return {
      value: [today.toDate(), tomorrow.toDate()],
      dateFrom: null,
      dateTo: null,
      format: "Y-mm-dd",
      country: null,
      beforeRangeMessage: "Date is out of range.",
      afterRangeMessage: "Date is out of range.",
      parseDate: null,
      icon: "mdi-calendar",
      iconOpen: "mdi-menu-down",
      iconClosed: "mdi-menu-down",
      disableBackdrop: false,
      openToContent: "xs",
      hideFormatPlaceholder: false,
      hideWeekNumber: false,
      showTodayButton: true,
      labelFrom: null,
      labelTo: null,
      innerLabel: false,
    };
  },
  //@@viewOff:getDefaultProps

  //@@viewOn:reactLifeCycle
  getInitialState() {
    let propValue = Array.isArray(this.props.value) && this.props.value.length > 1 ? this.props.value : null;
    let fromInputValue = null;
    let toInputValue = null;
    let formatOptions = {
      format: this.props.format,
      country: this.props.country,
    };

    if (propValue) {
      let devValidation = this._validateDevProps(propValue, this.props.dateFrom, this.props.dateTo);
      if (devValidation.valid) {
        let validateResult = this._validateDateRangeResult({ value: propValue });
        if (validateResult.feedback === "error") {
          propValue = null;
        } else if (Array.isArray(propValue) && propValue.length === 1) {
          propValue = null;
        }

        if (propValue) {
          fromInputValue = UU5.Common.Tools.getDateString(this._getFromValue(propValue), formatOptions);
          toInputValue = UU5.Common.Tools.getDateString(this._getToValue(propValue), formatOptions);
        }
      } else {
        propValue = null;
        this.showError(devValidation.error);
      }
    }
    let fromDisplayDate, toDisplayDate;
    let today = getCurrentBusinessZoneDate().toDate();
    if (propValue) {
      fromDisplayDate = this._getFromValue(propValue);
      toDisplayDate = new Date(fromDisplayDate.getFullYear(), fromDisplayDate.getMonth() + 1, 1);
    } else if (this.props.dateFrom || this.props.dateTo) {
      if (
        (!this.props.dateFrom || (this.props.dateFrom && this._compareDates(today, this.props.dateFrom, "greater"))) &&
        (!this.props.dateTo || (this.props.dateTo && this._compareDates(today, this.props.dateTo, "lesser")))
      ) {
        fromDisplayDate = this._getFromValue(today);
        toDisplayDate = new Date(fromDisplayDate.getFullYear(), fromDisplayDate.getMonth() + 1, 1);
      } else {
        fromDisplayDate = this._getFromValue(this.parseDate(this.props.dateFrom || this.props.dateTo));
        toDisplayDate = new Date(fromDisplayDate.getFullYear(), fromDisplayDate.getMonth() + 1, 1);
      }
    } else {
      fromDisplayDate = this._getFromValue(today);
      toDisplayDate = new Date(fromDisplayDate.getFullYear(), fromDisplayDate.getMonth() + 1, 1);
    }

    return {
      fromDisplayDate: fromDisplayDate,
      fromInputValue: fromInputValue,
      fromFeedback: { feedback: "initial", message: null },
      toDisplayDate: toDisplayDate,
      toInputValue: toInputValue,
      toFeedback: { feedback: "initial", message: null },
      country: this.props.country,
      formatOptions: formatOptions,
      toInputActive: false,
      tempValue: null,
      leftInfinity: false,
      rightInfinity: false,
      focusRightInput: false,
      focusLeftInput: false,
      fromView: null,
      toView: null,
    };
  },

  componentWillMount() {
    this._hasFocus = false;

    let value;
    let devValidation = this._validateDevProps(this.props.value, this.props.dateFrom, this.props.dateTo);
    if (devValidation.valid) {
      if (this.state.value) {
        // value is probably valid
        value = this.state.value;

        if (this.props.onValidate && typeof this.props.onValidate === "function") {
          this._validateOnChange({ value, event: null, component: this });
        }
      } else if (this.props.value) {
        // value probably isnt valid
        value = this.props.value;

        if (this.props.onValidate && typeof this.props.onValidate === "function") {
          this._validateOnChange({ value, event: null, component: this });
        } else {
          if (Array.isArray(value) && value.length === 1) {
            this.setValue(null);
          } else {
            let validateResult = this._validateDateRangeResult({ value });
            if (validateResult.feedback === "error") {
              this.setError(validateResult.message, null);
            }
          }
        }
      } else {
        // there is no value
        if (this.props.onValidate && typeof this.props.onValidate === "function") {
          this._validateOnChange({ value, event: null, component: this });
        }
      }
    } else {
      this.showError(devValidation.error);
    }

    return this;
  },

  componentDidMount() {
    UU5.Environment.EventListener.registerDateTime(this.getId(), this._change);
  },

  componentWillReceiveProps(nextProps) {
    if (this.props.controlled) {
      let devValidation = this._validateDevProps(nextProps.value, nextProps.dateFrom, nextProps.dateTo);
      if (devValidation.valid) {
        let result = this._validateDateRangeResult(
          {
            value: nextProps.value,
            message: nextProps.message,
            feedback: nextProps.feedback,
          },
          nextProps
        );
        if (result) {
          if (typeof result === "object") {
            if (this.props.onValidate && typeof this.props.onValidate === "function") {
              this._validateOnChange({ value: result.value, event: null, component: this }, true);
            } else {
              if (result.feedback) {
                this.setFeedback(result.feedback, result.message, result.feedback === "error" ? null : result.value);
              } else {
                this.setFeedback(nextProps.feedback, nextProps.message, nextProps.value);
              }
            }
          }
        }
      } else {
        this.showError(devValidation.error);
      }
    }

    return this;
  },

  componentWillUnmount() {
    this._removeEvent();
    this._removeKeyEvents();
    UU5.Environment.EventListener.unregisterDateTime(this.getId(), this._change);
  },

  componentDidUpdate(prevProps, prevState) {
    if (this.isOpen()) {
      if ((this.state.screenSize === "xs" && prevState.screenSize !== "xs") || (this.state.screenSize !== "xs" && prevState.screenSize === "xs")) {
        this._onOpen();
      }

      if (prevState.toInputActive !== this.state.toInputActive) {
        this._onOpen(this.state.toInputActive);
      }

      if (prevState.message && !this.state.message) {
        this._open(this.state.toInputActive);
      }
    }
  },

  //@@viewOff:reactLifeCycle

  //@@viewOn:interface
  toggle(setStateCallback) {
    if (this.isOpen()) {
      this.close(() => this._removeEvent(setStateCallback));
    } else {
      this.open(() => this._addEvent(setStateCallback));
    }

    return this;
  },

  parseDate(dates) {
    let result;

    if (Array.isArray(dates)) {
      result = dates.map((date) => this._parseDate(date)).filter((date) => !!date);
      if (result.length === 0) {
        result = null;
      }
    } else {
      result = this._parseDate(dates);
    }

    return result;
  },

  parseDateDefault(stringDate) {
    return UU5.Common.Tools.parseDate(stringDate, "Y-mm-dd", this.state ? this.state.country : this.props.country);
  },
  //@@viewOff:interface

  //@@viewOn:overriding
  open_(setStateCallback) {
    this._addEvent();
    this.openDefault(() => this._onOpen(false, setStateCallback));
  },

  close_(setStateCallback) {
    this._removeEvent();
    this.closeDefault(() => this._onClose(setStateCallback));
  },

  setValue_(valueOfDate) {
    if (valueOfDate !== undefined) {
      let dateFrom;
      let dateTo;
      if (valueOfDate.hasOwnProperty("absolute")) {
        dateFrom = valueOfDate.absolute.from ? new Date(valueOfDate.absolute.from) : null;
        dateTo = valueOfDate.absolute.to ? new Date(valueOfDate.absolute.to) : null;
        dateTo = dateTo ? new Date(dateTo.setDate(dateTo.getDate() - 1)) : null;
      } else {
        dateFrom = new Date(valueOfDate[0]);
        dateTo = new Date(valueOfDate[1]);
      }
      let { fromDisplayDate, toDisplayDate } = this._getNewDisplayDates(dateFrom);
      if (dateFrom === null || dateTo === null) {
        this._setComponentState(
          {
            leftInfinity: dateFrom === null,
            rightInfinity: dateTo === null,
          },
          () => {
            this.setValue([
              this.state.leftInfinity === false ? dateFrom : new Date(INFINITY_LEFT_DATE),
              this.state.rightInfinity === false ? dateTo : new Date(INFINITY_RIGHT_DATE),
            ]);
          }
        );
      } else {
        this._setComponentState({
          value: [dateFrom, dateTo],
          fromInputValue: formatUTCToCet(dateFrom),
          toInputValue: formatUTCToCet(dateTo),
          fromDisplayDate,
          toDisplayDate,
        });
      }
    }
  },

  setFeedback_(feedback, message, value, setStateCallback) {
    if (value === "") {
      value = null;
    }

    let state = { ...this._getInnerState(value), ...{ feedback }, ...{ message } };
    this._setComponentState({ ...state }, setStateCallback);
  },

  getValue_() {
    let date;

    if (!this.state.value) {
      date = null;
    } else {
      date = this.state.value;
      return this._createAbsoluteDateResult(this.state.fromInputValue, this.state.toInputValue);
    }

    return this._createAbsoluteDateResult(date[0].toISOString().toString(), date[1].toISOString().toString());
  },

  getInputWidth_(opt) {
    let width = null;

    if (this.props.inputWidth) {
      if (opt && opt.dualInput) {
        let unit = this.props.inputWidth.replace(/[0-9]/g, "");
        // take 4px from each input because of a margin
        width = parseInt(this.props.inputWidth) / 2 - 4 + unit;
      } else {
        width = this.props.inputWidth;
      }
    }

    return width;
  },

  onChangeDefault_(opt) {
    if (opt._data.type === "calendar") {
      this._onCalendarChangeDefault(opt);
    } else if (opt._data.type === "input") {
      this._onInputChangeDefault(opt);
    }

    return this;
  },

  onFocusDefault_(opt) {
    let result = this.getFocusFeedback(opt);

    if (result || opt._data) {
      result = result || {};
      if (opt._data && this.state.toInputActive !== opt._data.toInputActive) {
        if (opt._data.toInputActive) {
          result.toInputActive = true;
        } else {
          result.toInputActive = false;
        }
      }

      this._setComponentState({ ...result });
    }

    return this;
  },

  setChangeFeedback__(opt, setStateCallback) {
    let value = this.parseDate(opt.value);
    let newState = this._getInnerState(value);
    newState.feedback = opt.feedback;
    newState.message = opt.message;

    this._setComponentState({ ...newState }, setStateCallback);
  },

  getInitialValue_(propValue) {
    let stateValue = !Array.isArray(propValue) || propValue.length < 2 ? null : propValue;

    if (stateValue) {
      let devValidation = this._validateDevProps(stateValue, this.props.dateFrom, this.props.dateTo);
      if (devValidation.valid) {
        let validateResult = this._validateDateRangeResult({ value: stateValue });
        if (validateResult.feedback === "error") {
          stateValue = null;
        }
      } else {
        stateValue = null;
      }
    }

    return this.parseDate(stateValue);
  },
  //@@viewOff:overriding

  //@@viewOn:private
  _createAbsoluteDateResult(dateFrom, dateTo) {
    return {
      absolute: {
        from: this.state.leftInfinity ? null : getStartOfDay(dateFrom).toISOString(),
        to: this.state.rightInfinity ? null : getEndOfDay(dateTo).toISOString(),
      },
    };
  },

  _isSorXs() {
    return this.isS() || this.isXs();
  },

  _getValue() {
    let date;

    if (!this.state.value) {
      date = null;
    } else {
      date = this.state.value;
    }
    return this.parseDate(date);
  },

  _parseDate(stringDate) {
    let date = null;

    if (typeof stringDate !== "string") {
      date = stringDate;
    } else {
      if (this.props.parseDate && typeof this.props.parseDate === "function") {
        date = this.props.parseDate(stringDate, this);
      } else {
        date = this.parseDateDefault(stringDate);
      }
    }
    return date;
  },

  _getDateFrom(date) {
    return this.parseDate(date || this.props.dateFrom);
  },

  _getDateTo(date) {
    return this.parseDate(date || this.props.dateTo);
  },

  _getFromValue(value = this.state.value) {
    let result = null;

    if (Array.isArray(value) && value.length >= 1) {
      result = value[0];
    } else if (!value && this.state && this.state.tempValue) {
      result = this.state.tempValue;
    } else {
      result = value;
    }
    if (result) {
      result = UU5.Common.Tools.cloneDateObject(this.parseDate(result));
    }

    return result;
  },

  _getToValue(value = this.state.value) {
    let result = null;

    if (Array.isArray(value) && value.length >= 2) {
      result = UU5.Common.Tools.cloneDateObject(this.parseDate(value[1]));
    } else {
      result = UU5.Common.Tools.cloneDateObject(this.parseDate(value));
    }

    return result;
  },

  _getNewDisplayDates(fromDate) {
    let fromDisplayDate, toDisplayDate;

    if (!fromDate) {
      fromDate = new Date(INFINITY_LEFT_DATE);
    }

    fromDisplayDate = UU5.Common.Tools.cloneDateObject(fromDate);
    toDisplayDate = new Date(fromDisplayDate.getFullYear(), fromDisplayDate.getMonth() + 1, 1);
    return { fromDisplayDate, toDisplayDate };
  },

  _validateOnChange(opt, checkValue) {
    if (!checkValue || this._hasValueChanged(this.state.value, opt.value)) {
      let result = typeof this.props.onValidate === "function" ? this.props.onValidate(opt) : null;
      if (result) {
        if (typeof result === "object") {
          if (result.feedback) {
            this.setFeedback(result.feedback, result.message, result.value);
          } else {
            this._setComponentState({ value: opt.value });
          }
        } else {
          this.showError("validateError", null, {
            context: {
              event: null,
              func: this.props.onValidate,
              result: result,
            },
          });
        }
      } else if (opt._data.state) {
        this._setComponentState({ ...opt._data.state });
      } else if (opt.value) {
        this.setInitial(null, opt.value);
      }
    }

    return this;
  },

  _validateDateResult(opt, props = this.props) {
    let result = opt;

    if (opt) {
      let date = this.parseDate(opt.value);

      if (!opt.value || date) {
        if (this._compareDates(date, props.dateFrom, "lesser")) {
          result.feedback = "error";
          result.message = props.beforeRangeMessage;
        } else if (this._compareDates(date, props.dateTo, "greater")) {
          result.feedback = "error";
          result.message = props.afterRangeMessage;
        } else {
          result.feedback = opt ? opt.feedback || "initial" : "initial";
          result.message = opt ? opt.message || null : null;
          result.value = date;
        }
      }
    }

    return result;
  },

  _validateDateRangeResult(opt, props = this.props) {
    let result = opt;

    let date = this.parseDate(opt.value);
    if (opt && Array.isArray(opt.value)) {
      if (date) {
        let dateFrom = this._getDateFrom(props.dateFrom);
        let dateTo = this._getDateTo(props.dateTo);
        let valueFrom = this._getFromValue(date);
        let valueTo = this._getToValue(date);
        if ((valueFrom instanceof Date && isNaN(valueFrom.getDate())) || (valueTo instanceof Date && isNaN(valueTo.getDate()))) {
          result = false;
        } else if (dateFrom && valueFrom < dateFrom) {
          result.feedback = "error";
          result.message = this.props.beforeRangeMessage;
        } else if (dateTo && valueTo > dateTo) {
          result.feedback = "error";
          result.message = this.props.afterRangeMessage;
        }
      }
    }

    return result;
  },

  _validateDevProps(value, dateFrom = this.props.dateFrom, dateTo = this.props.dateTo) {
    let result = { valid: true, error: null };

    if (Array.isArray(value) && value.length === 2) {
      // Currently only 2 values are relevant
      if (this._compareDates(this.parseDate(value[0]), value[1], "greater")) {
        result.valid = false;
        result.error = "firstGreaterThanSecond";
      } else if (dateFrom && dateTo && this._compareDates(dateFrom, dateTo, "greater")) {
        result.valid = false;
        result.error = "dateFromGreaterThanDateTo";
      }
    }

    return result;
  },

  _onOpen(right, setStateCallback) {
    let aroundElement = this.isS() ? (right ? this._rightTextInput.findDOMNode() : this._leftTextInput.findDOMNode()) : this._textInput;

    if (this._popover) {
      this._popover.open(
        {
          onClose: this._onClose,
          aroundElement: aroundElement,
          position: "bottom",
          offset: this._shouldOpenToContent() ? 0 : 4,
          preventPositioning: this._shouldOpenToContent(),
        },
        setStateCallback
      );
    } else if (typeof setStateCallback === "function") {
      setStateCallback();
    }
  },

  _onClose(setStateCallback) {
    if (this._popover) {
      this._popover.close(setStateCallback);
    } else if (typeof setStateCallback === "function") {
      setStateCallback();
    }
  },

  _close(persistListeners, setStateCallback) {
    if (!persistListeners) {
      this._removeEvent();
    }
    this.closeDefault(() => this._onClose(setStateCallback));
  },

  _open(right = false, setStateCallback) {
    this._addEvent();
    this.openDefault(this._onOpen(right, setStateCallback));
  },

  _change(opt) {
    this._setOptions(opt);
    return this;
  },

  _setOptions(opt, setStateCallback) {
    this._setComponentState(
      {
        format: opt.format === undefined ? this.state.format : opt.format,
        country: opt.country === undefined ? this.state.country : opt.country ? opt.country.toLowerCase() : opt.country,
      },
      setStateCallback
    );
    return this;
  },

  _getInputValidationResult(fromValue, toValue) {
    fromValue = this.parseDate(fromValue);
    toValue = this.parseDate(toValue);

    let result = {
      fromFeedback: this._validateDateResult({ value: fromValue }),
      toFeedback: this._validateDateResult({ value: toValue }),
    };

    delete result.fromFeedback.value;
    delete result.toFeedback.value;

    if (this._compareDates(fromValue, toValue, "greater")) {
      result.toFeedback = {
        feedback: "error",
        message: this.getLsiComponent("dateInPast"),
      };
    }

    return result;
  },

  _onResize() {
    if (this.isOpen()) {
      UU5.Common.Tools.debounce(() => {
        this._onOpen(this.state.toInputActive);
      }, 500)();
    }
  },

  _onChange(opt) {
    opt.component = this;

    if (opt._data.type === "calendar") {
      this._onCalendarChange(opt);
    } else if (opt._data.type === "input") {
      this._onInputChange(opt);
    }
  },

  _onCalendarChange(opt) {
    let value = opt.value;
    let executeOnChange = false;

    if (this.state.focusRightInput && this.state.value !== null) {
      value = [this.state.value[0], value];
    } else if (this.state.focusLeftInput) {
      if (this.state.value !== null) {
        value = [value, this.state.value[1]];
      } else {
        value = [value];
      }
    } else {
      if (this.state.tempValue) {
        if (this._compareDates(value, this.state.tempValue, "greater") || this._compareDates(value, this.state.tempValue, "equals")) {
          value = [this.state.tempValue, value];
          executeOnChange = true;
        } else {
          value = [value];
        }
      } else {
        value = [value];
      }
    }

    opt.value = value;
    opt._data.value = value;
    opt._data.executeOnChange = executeOnChange;
    if (executeOnChange && typeof this.props.onChange === "function") {
      this.props.onChange(opt);
    } else {
      this.onChangeDefault(opt);
    }
    this._setComponentState({ focusRightInput: false, focusLeftInput: false });
  },

  _onInputChange(opt) {
    // The code below tries to parse values of both inputs and validate them towards eachother.
    // If the second (right) value (date) isnt greater than the first (left) value (date), then
    // the value isnt valid and thus it basically is null. It means that onChange cannot be executed
    let newValue = this.parseDate(opt.value);
    let formatedDate = newValue ? formatUTCToCet(newValue) : null;
    let state = {
      fromFeedback: this.state.fromFeedback,
      toFeedback: this.state.toFeedback,
    };
    let executeOnChange = false;

    if (opt._data.right) {
      state.toInputValue = opt.value || formatedDate;
    } else {
      state.fromInputValue = opt.value || formatedDate;
    }

    if (newValue) {
      let fromInputValue, toInputValue, validateResult;

      if (opt._data.right) {
        let isSameMonth = this._isSameMonth(newValue, this.state.fromDisplayDate);
        fromInputValue = this.parseDate(this.state.fromInputValue);
        toInputValue = this.parseDate(newValue);
        validateResult = this._getInputValidationResult(fromInputValue, newValue);

        if (!isSameMonth && validateResult.toFeedback.feedback !== "error") {
          state.toDisplayDate = newValue;
          let fromDisplayDate = this._cloneDate(newValue);
          fromDisplayDate.setDate(1);
          fromDisplayDate.setMonth(newValue.getMonth() - 1);
          state.fromDisplayDate = fromDisplayDate;
        }
      } else {
        fromInputValue = this.parseDate(newValue);
        toInputValue = this.parseDate(this.state.toInputValue);
        validateResult = this._getInputValidationResult(newValue, toInputValue);

        if (validateResult.fromFeedback.feedback !== "error") {
          state.fromDisplayDate = newValue;
          let toDisplayDate = this._cloneDate(newValue);
          toDisplayDate.setDate(1);
          toDisplayDate.setMonth(newValue.getMonth() + 1);
          state.toDisplayDate = toDisplayDate;
        }
      }

      let fromValueValid = validateResult.fromFeedback.feedback !== "error";
      let toValueValid = validateResult.toFeedback.feedback !== "error";

      state = { ...state, ...validateResult };

      if (fromInputValue) {
        if (!opt._data.right && (!toValueValid || !toInputValue) && fromValueValid) {
          // The right value appears to be invalid towards the left value. Set this new value as temporary one
          // to allow the user to fix the range with next selection (otherwise next click will reset the range
          // and start a new one)
          state.tempValue = newValue;
        }
        if ((opt._data.right && toValueValid) || (!opt._data.right && fromValueValid)) {
          if (this.state.tempValue) {
            if (opt._data.right) {
              if (toValueValid) {
                state.value = [this.state.tempValue, newValue];
                state.tempValue = null;
              } else {
                state.value = null;
              }
            } else {
              if (toValueValid && toInputValue) {
                state.value = [newValue, toInputValue];
                state.tempValue = null;
              } else {
                state.value = [newValue, newValue];
                state.tempValue = null;
              }
            }
          } else if (toInputValue) {
            if (opt._data.right) {
              if (toValueValid) {
                state.value = [fromInputValue, newValue];
              } else {
                state.value = null;
                state.tempValue = fromInputValue;
              }
            } else {
              if (toValueValid) {
                state.value = [newValue, toInputValue];
              } else {
                state.value = [newValue, newValue];
              }
            }
          }
        }
      } else {
        state.tempValue = opt._data.right ? null : newValue;
      }
    } else if (opt.value === "") {
      if (opt._data.right && !this.state.fromInputValue) {
        state = this._getInnerState(null);
      } else if (!opt._data.right && !this.state.toInputValue) {
        state = this._getInnerState(null);
      }
    }

    if (state.value === null && this.state.value) {
      executeOnChange = true;
    } else if (this.state.value === null && state.value) {
      executeOnChange = true;
    } else if (state.value && this.state.value && state.value.length === 2 && this.state.value.length === 2) {
      if (!this._compareDates(state.value[0], this.state.value[0], "equals") || !this._compareDates(state.value[1], this.state.value[1], "equals")) {
        executeOnChange = true;
      }
    }

    if (!this.isComputedDisabled() && !this.isReadOnly()) {
      opt._data.state = state;
      opt._data.executeOnChange = executeOnChange;
      opt.value = state.value;
      if (executeOnChange && typeof this.props.onChange === "function") {
        this.props.onChange(opt);
      } else {
        this.onChangeDefault(opt);
      }
    }
  },

  _onCalendarChangeDefault(opt) {
    let right = (this.isXs() || this.isS()) && opt._data._right;
    let value = right && Array.isArray(opt.value) && opt.value.length === 1 ? [null, opt.value[0]] : opt.value;
    let innerState = this._getInnerState(value);
    let feedback;

    if (!innerState.value && this.props.required && this.state.value) {
      feedback = {
        feedback: "error",
        message: this.props.requiredMessage || this.getLsiComponent("requiredMessage"),
      };
    } else if (innerState.value || (!innerState.value && this.state.value)) {
      feedback = { feedback: "initial", message: null };
    }

    if (innerState.tempValue) {
      innerState.toInputActive = true;
    }

    if (opt._data.executeOnChange) {
      opt.value = innerState.value;
      opt.feedback = feedback && feedback.feedback;
      opt.message = feedback && feedback.message;

      if (this.props.validateOnChange) {
        this._validateOnChange(opt);
      } else if (this._checkRequired({ value: opt.value })) {
        opt.required = this.props.required;
        let result = this.getChangeFeedback(opt);
        this._setComponentState({ ...feedback, ...innerState, ...result });
      }
    } else {
      this._setComponentState({ ...feedback, ...innerState });
    }
  },

  _onInputChangeDefault(opt) {
    if (opt._data.executeOnChange) {
      if (this.props.validateOnChange) {
        this._validateOnChange(opt);
      } else if (this.shouldValidateRequired()) {
        if (this.props.required && !opt.value) {
          opt.feedback = "error";
          opt.message = this.props.requiredMessage || this.getLsiComponent("requiredMessage");
        }
        opt.required = this.props.required;
        let result = this.getChangeFeedback(opt);
        this._setComponentState({ ...opt._data.state, ...result });
      }
    } else {
      this._setComponentState({ ...opt._data.state });
    }
  },

  _getNumberOfColumns() {
    let currentScreenSize = this.getScreenSize();
    let colWidthData = { label: {}, input: {} };

    this.props.labelColWidth.split(" ").forEach((colWidth) => {
      let match = colWidth.match(this.getDefault().columnRegexp);
      colWidthData.label[match[1]] = parseInt(match[2]);
    });

    this.props.inputColWidth.split(" ").forEach((colWidth) => {
      let match = colWidth.match(this.getDefault().columnRegexp);
      colWidthData.input[match[1]] = parseInt(match[2]);
    });

    return parseInt(colWidthData.label[currentScreenSize]) + parseInt(colWidthData.input[currentScreenSize]);
  },

  _getInnerState(value, adjustDisplayDate) {
    let initialFeedback = { feedback: "initial", message: null };
    let state = {};
    let fromValue, toValue, fromInputValidateResult, toInputValidateResult;

    if (value) {
      if (!Array.isArray(value)) {
        fromValue = this.parseDate(value);
        toValue = this.parseDate(value);
        fromInputValidateResult = fromValue || this.state.fromInputValue ? this._validateDateResult({ value: fromValue || this.state.fromInputValue }) : initialFeedback;
        toInputValidateResult = toValue || this.state.toInputValue ? this._validateDateResult({ value: toValue || this.state.toInputValue }) : initialFeedback;
        delete fromInputValidateResult.value;
        delete toInputValidateResult.value;
        state.value = [fromValue, toValue];
        state.fromInputValue = formatLocalToCet(fromValue);
        state.toInputValue = formatLocalToCet(toValue);
      } else if (Array.isArray(value)) {
        // value is array
        fromValue = this.parseDate(value[0]);
        toValue = this.parseDate(value[1]);
        fromInputValidateResult = fromValue || this.state.fromInputValue ? this._validateDateResult({ value: fromValue || this.state.fromInputValue }) : initialFeedback;
        toInputValidateResult = toValue || this.state.toInputValue ? this._validateDateResult({ value: toValue || this.state.toInputValue }) : initialFeedback;
        delete fromInputValidateResult.value;
        delete toInputValidateResult.value;

        if (this._compareDates(fromValue, toValue, "greater") || (!fromValue && toValue && this.state.fromInputValue)) {
          fromValue = toValue;
          toValue = null;
        }

        if (!toValue) {
          if (this.state.toInputValue && !this.state.value) {
            toValue = this.parseDate(this.state.toInputValue);

            if (toValue) {
              if (!this._compareDates(toValue, fromValue, "lesser")) {
                state.value = [fromValue, toValue];
                state.tempValue = null;
                state.fromInputValue = formatLocalToCet(fromValue);
                state.toInputValue = formatLocalToCet(toValue);
              } else {
                state.value = null;
                state.tempValue = null;
                state.fromInputValue = formatLocalToCet(fromValue);
                state.toInputValue = null;
              }
            } else {
              state.value = null;
              state.tempValue = fromValue;
              state.fromInputValue = formatLocalToCet(fromValue);
            }
          } else {
            state.value = null;
            state.tempValue = fromValue;
            state.fromInputValue = formatLocalToCet(fromValue);
            state.toInputValue = null;
          }
        } else if (!fromValue) {
          state.value = null;
          state.tempValue = null;
          state.fromInputValue = formatLocalToCet(fromValue);
          state.toInputValue = formatLocalToCet(toValue);
        } else {
          state.value = [fromValue, toValue];
          state.tempValue = null;
          state.fromInputValue = formatLocalToCet(fromValue);
          state.toInputValue = formatLocalToCet(toValue);
        }
      }

      state.fromFeedback = this.state.fromInputValue ? fromInputValidateResult : initialFeedback;
      state.toFeedback = this.state.toInputValue ? toInputValidateResult : initialFeedback;
    } else {
      state.tempValue = null;
      state.value = value;
      state.fromInputValue = null;
      state.toInputValue = null;
      state.fromFeedback = initialFeedback;
      state.toFeedback = initialFeedback;
    }

    if (adjustDisplayDate && state.value) {
      if (fromValue && toValue) {
        state.fromDisplayDate = fromValue;
        state.toDisplayDate = new Date(this._cloneDate(fromValue).setMonth(fromValue.getMonth() + 1));
      } else if (fromValue) {
        state.fromDisplayDate = fromValue;
        state.toDisplayDate = new Date(this._cloneDate(fromValue).setMonth(fromValue.getMonth() + 1));
      } else if (toValue) {
        state.toDisplayDate = toValue;
        state.fromDisplayDate = new Date(this._cloneDate(toValue).setMonth(toValue.getMonth() - 1));
      }
    }

    return state;
  },

  _allowPropagation() {
    this._stopPropagation = false;
    return this;
  },

  _rightTextFocus() {
    this._setComponentState({ focusRightInput: true });
  },

  _leftTextFocus() {
    this._setComponentState({ focusLeftInput: true });
  },

  _handleClick(e) {
    if (!this._stopPropagation) {
      let clickData = this._findTarget(e);
      let canClose = this.isXs() || this.isS() ? !clickData.popover && !clickData.input && this.isOpen() : !clickData.popover && this.isOpen();
      let canBlur = !clickData.popover && !clickData.input;
      let opt = { value: this.state.value, event: e, component: this };

      if (canClose) {
        if (!clickData.input) {
          this._onBlur(opt);
          this._onClose();
        } else if (canBlur) {
          this._onBlur(opt);
        }
      } else if (canBlur) {
        this._onBlur(opt);
      }
    }

    this._allowPropagation();
  },

  _addEvent(callback) {
    window.addEventListener("click", this._handleClick, true);
    UU5.Environment.EventListener.addWindowEvent("resize", this.getId(), this._onResize);
    if (typeof callback === "function") {
      callback();
    }
  },

  _removeEvent(callback) {
    window.removeEventListener("click", this._handleClick, true);
    UU5.Environment.EventListener.removeWindowEvent("resize", this.getId());
    if (typeof callback === "function") {
      callback();
    }
  },

  _compareDates(date1, date2, method) {
    let result = false;
    date1 = this.parseDate(date1);
    date2 = this.parseDate(date2);

    if (date1 && date2) {
      date1 = Date.UTC(date1.getFullYear(), date1.getMonth(), date1.getDate());
      date2 = Date.UTC(date2.getFullYear(), date2.getMonth(), date2.getDate());
      if (method === "equals") {
        result = date1 === date2;
      } else if (method === "greater") {
        result = date1 > date2;
      } else if (method === "lesser") {
        result = date1 < date2;
      }
    }

    return result;
  },

  _isSameMonth(date1, date2) {
    let result = false;
    if (date1 instanceof Date && date2 instanceof Date) {
      result = date1.getMonth() === date2.getMonth() && date1.getFullYear() === date2.getFullYear();
    }
    return result;
  },

  _cloneDate(date) {
    return new Date(date.valueOf());
  },

  _goToToday() {
    let leftDate = getCurrentBusinessZoneDate().toDate();
    let temp = getCurrentBusinessZoneDate().toDate();
    let rightDate = getCurrentBusinessZoneDate().toDate();
    let toDisplay = new Date(temp.setMonth(temp.getMonth() + 1));
    let reformatDateFrom = UU5.Common.Tools.formatDate(leftDate, "Y-mm-dd");
    rightDate.setDate(rightDate.getDate());
    let reformatDateTo = UU5.Common.Tools.formatDate(rightDate, "Y-mm-dd");
    this.setValue([reformatDateFrom, reformatDateTo]);
    this.setFeedback_("initial");
    this._setComponentState({
      leftInfinity: false,
      rightInfinity: false,
      value: [reformatDateFrom, reformatDateTo],
      fromInputValue: reformatDateFrom,
      toInputValue: reformatDateTo,
      fromDisplayDate: leftDate,
      toDisplayDate: rightDate,
    });
  },

  _onNextSelection(opt) {
    let fromDisplayDate = this._cloneDate(this.state.toDisplayDate);
    let toDisplayDate = this._cloneDate(this.state.toDisplayDate);
    changeDateByCalendarView(opt.component.state.view, toDisplayDate, this.state.toDisplayDate, 1);
    this._setComponentState({
      fromDisplayDate: fromDisplayDate,
      toDisplayDate: toDisplayDate,
      toView: opt.component.state.view,
    });
  },

  _onPrevSelection(opt) {
    let fromDisplayDate = this._cloneDate(this.state.fromDisplayDate);
    let step = -1;
    changeDateByCalendarView(opt.component.state.view, fromDisplayDate, this.state.fromDisplayDate, step);
    let toDisplayDate;
    if (opt.component.state.view !== "years") {
      toDisplayDate = this._cloneDate(this.state.toDisplayDate);
      changeDateByCalendarView(opt.component.state.view, toDisplayDate, this.state.toDisplayDate, step);
    }
    this._setComponentState({
      fromDisplayDate: fromDisplayDate,
      toDisplayDate: toDisplayDate ? toDisplayDate : this.state.toDisplayDate,
      fromView: opt.component.state.view,
    });
  },

  _onFocus(opt) {
    let setStateCallback;

    if (!this._hasFocus) {
      this._addKeyEvents();
      this._hasFocus = true;
      if (!this.isReadOnly() && !this.isComputedDisabled()) {
        if (typeof this.props.onFocus === "function") {
          setStateCallback = () => this.props.onFocus(opt);
        } else {
          setStateCallback = () => this.onFocusDefault(opt);
        }
      }
    }

    if (opt._data && opt._data.toInputActive) {
      let toInputActive = opt._data.toInputActive;
      this._setComponentState({ toInputActive }, setStateCallback);
    } else if (typeof setStateCallback === "function") {
      setStateCallback();
    }
  },

  _onBlur(opt) {
    if (this._hasFocus) {
      this._hasFocus = false;
      let state = { toInputActive: false };

      let callback;
      if (typeof this.props.onBlur === "function") {
        callback = (opt) => this.props.onBlur(opt);
      } else {
        callback = (opt) => {
          this._removeKeyEvents();
          this.onBlurDefault(opt);
        };
      }

      let value = null;
      if (this.state.tempValue && !this._getToValue()) {
        value = [this.state.tempValue, this.state.tempValue];
        opt.value = value;
        state = { ...state, value, ...this._getInnerState(value) };
      } else if (this.state.toInputValue && !this.state.fromInputValue) {
        value = [this.parseDate(this.state.toInputValue), this.parseDate(this.state.toInputValue)];
        if (!value[0] || !value[1]) {
          value = null;
        }
        opt.value = value;
        state = { ...state, value, ...this._getInnerState(value) };
      }

      this._setComponentState(state, () => callback(opt));
    }
  },

  _getEventPath(e) {
    let path = [];
    let node = e.target;

    while (node != document.body && node != document.documentElement && node) {
      path.push(node);
      node = node.parentNode;
    }

    return path;
  },

  _findTarget(e) {
    let labelMatch = "[id='" + this.getId() + "'] label";
    let inputMatch1 = "[id='" + this.getId() + "'] .uu5-forms-items-input";
    let inputMatch2 = "[id='" + this.getId() + "'] .uu5-forms-text-input";
    let fromInputMatch = "[id='" + this.getId() + "'] .uu5-forms-daterangepicker-from-input";
    let toInputMatch = "[id='" + this.getId() + "'] .uu5-forms-daterangepicker-to-input";
    let popoverMatch = "[id='" + this.getId() + "'] .uu5-bricks-popover";
    let customContentMatch = "[id='" + this.getId() + "'] .uu5-forms-daterangepicker-custom-content";
    let result = {
      component: false,
      input: false,
      label: false,
      fromInput: false,
      toInput: false,
      popover: false,
      customContent: false,
    };
    let eventPath = this._getEventPath(e);

    eventPath.every((item) => {
      let functionType = item.matches ? "matches" : "msMatchesSelector";
      if (item[functionType]) {
        if (item[functionType](labelMatch)) {
          result.label = true;
          result.component = true;
        } else if (item[functionType](inputMatch1)) {
          result.input = true;
          result.component = true;
        } else if (item[functionType](inputMatch2)) {
          result.input = true;
          result.component = true;

          if (item[functionType](fromInputMatch)) {
            result.fromInput = true;
          } else if (item[functionType](toInputMatch)) {
            result.toInput = true;
          }
        } else if (item[functionType](popoverMatch)) {
          result.popover = true;
          result.component = true;
        } else if (item[functionType](customContentMatch)) {
          result.customContent = true;
          result.component = true;
        } else if (item === this._root) {
          result.component = true;
          return false;
        }
        return true;
      } else {
        return false;
      }
    });

    return result;
  },

  _addKeyEvents() {
    let handleKeyDown = (e) => {
      if (e.which === 13) {
        // enter
        e.preventDefault();
      } else if (e.which === 40) {
        // bottom
        e.preventDefault();
      } else if (e.which === 27) {
        // esc
        e.preventDefault();
      }
    };

    let handleKeyUp = (e) => {
      let focusResult = this._findTarget(e);
      let isRightInput = focusResult.toInput;
      let isLeftInput = focusResult.fromInput;
      let isMainInput = focusResult.input;
      let isCustomContent = focusResult.customContent;
      let doBlur = !isLeftInput && !isRightInput && !isMainInput && !isCustomContent;
      let opt = { value: this.state.value, event: e, component: this };
      if (e.which === 13) {
        // enter
        if (!this.isOpen()) {
          this.open();
        } else {
          this.close();
        }
      } else if (e.which === 40) {
        // bottom
        e.preventDefault();
        if (!this.isOpen()) {
          this.open();
        }
      } else if (e.which === 9) {
        // tab
        if (doBlur) {
          if (this.isOpen()) {
            this._close(false, () => this._onBlur(opt));
          } else {
            this._onBlur(opt);
          }
        } else {
          if (!e.shiftKey && isRightInput) {
            this._setComponentState({ toInputActive: true });
          } else if (e.shiftKey && isLeftInput) {
            this._setComponentState({ toInputActive: false });
          }
        }
      } else if (e.which === 27) {
        // esc
        if (this.isOpen()) {
          this._close();
        }
      }
    };

    UU5.Environment.EventListener.addWindowEvent("keydown", this.getId(), (e) => handleKeyDown(e));
    UU5.Environment.EventListener.addWindowEvent("keyup", this.getId(), (e) => handleKeyUp(e));
  },

  _removeKeyEvents() {
    UU5.Environment.EventListener.removeWindowEvent("keydown", this.getId());
    UU5.Environment.EventListener.removeWindowEvent("keyup", this.getId());
  },

  _shouldOpenToContent() {
    let result = false;

    if (typeof this.props.openToContent === "string") {
      let screenSize = this.getScreenSize();
      this.props.openToContent
        .trim()
        .split(" ")
        .some((size) => {
          if (screenSize == size) {
            result = true;
            return true;
          } else {
            return false;
          }
        });
    } else if (typeof this.props.openToContent === "boolean") {
      result = this.props.openToContent;
    }

    return result;
  },

  _getFromInputPlaceholder() {
    let format = "Y-mm-dd";
    format && (format = format.replace(/Y+/, "YYYY").replace(/y+/, "yy"));
    let placeholder;
    if (format && !this.props.hideFormatPlaceholder) {
      placeholder = format;
    }

    return placeholder;
  },

  _getToInputPlaceholder() {
    let format = "Y-mm-dd";
    format && (format = format.replace(/Y+/, "YYYY").replace(/y+/, "yy"));
    let placeholder;
    if (format && !this.props.hideFormatPlaceholder) {
      placeholder = format;
    }

    return placeholder;
  },

  _getMainPlaceholder() {
    let format = "Y-mm-dd";
    format && (format = format.replace(/Y+/, "YYYY").replace(/y+/, "yy"));
    let placeholder;
    if (this.props.placeholder && format && !this.props.hideFormatPlaceholder) {
      placeholder = this.props.placeholder + " " + format + " - " + format;
    } else if (format && !this.props.hideFormatPlaceholder) {
      placeholder = format + " - " + format;
    } else {
      placeholder = this.props.placeholder;
    }
    return placeholder;
  },

  _getPopoverProps() {
    let props = {};

    props.ref_ = (ref) => (this._popover = ref);
    props.forceRender = true;
    props.disableBackdrop = true;
    props.shown = this.isOpen();

    return props;
  },

  _getCalendarValue(right) {
    let value = this._getValue();
    let firstDate, secondDate;

    if (value && value.length === 2) {
      firstDate = this._cloneDate(value[0]);
      secondDate = this._cloneDate(value[1]);
      let multiMonth = !this._isSameMonth(firstDate, secondDate);

      if (multiMonth) {
        value = [firstDate, secondDate];
      } else {
        if (right) {
          if (this._isSameMonth(firstDate, this.state.toDisplayDate)) {
            // value = value;
          } else {
            value = null;
          }
        } else {
          if (this._isSameMonth(firstDate, this.state.fromDisplayDate)) {
            // value = value;
          } else {
            value = null;
          }
        }
      }
    } else if (this.state.tempValue) {
      firstDate = this._cloneDate(this.state.tempValue);
      if (right) {
        if (this.state.toDisplayDate.getMonth() === firstDate.getMonth()) {
          value = this.state.tempValue;
        } else {
          value = null;
        }
      } else {
        if (this.state.fromDisplayDate.getMonth() === firstDate.getMonth()) {
          value = this.state.tempValue;
        } else {
          value = null;
        }
      }
    }

    return value;
  },

  _getCalendarProps(mobile, right) {
    let value = this._getCalendarValue(right);
    let className = this.getClassName().menu;
    let props = {
      className: className,
      value: value,
      dateFrom: this.props.dateFrom,
      dateTo: this.props.dateTo,
      hidden: !this.isOpen(),
      selectionMode: "range",
      monthNameFormat: "abbr",
      onChange: (opt) => {
        this._onChange({
          ...opt,
          ...{
            _data: {
              right: this.state.toInputActive || right,
              type: "calendar",
            },
          },
        });
        if (value) {
          this._setComponentState({
            leftInfinity: moment(value[0]).isSame(INFINITY_LEFT_DATE),
            rightInfinity: moment(value[1]).isSame(INFINITY_RIGHT_DATE),
          });
        }
        // Set the calendar to the default view, change display value to the same date as new one selected
        if (right) {
          this._setComponentState({ toView: undefined, toDisplayDate: opt.value });
        } else {
          this._setComponentState({ fromView: undefined, fromDisplayDate: opt.value });
        }
      },
      hideWeekNumber: this.props.hideWeekNumber,
      hideOtherSections: true,
      colorSchema: this.getColorSchema(),
    };

    if (mobile) {
      props.displayDate = this.state.fromDisplayDate;
      props.onPrevSelection = this._onPrevSelection;
      props.onNextSelection = this._onNextSelection;
    } else {
      if (right) {
        props.className += " " + this.getClassName("rightCalendar");
        props.displayDate = this.state.toDisplayDate;
        props.onNextSelection = this._onNextSelection;
        props.hidePrevSelection = true;
        props.view = this.state.toView;
      } else {
        props.className += " " + this.getClassName("leftCalendar");
        props.displayDate = this.state.fromDisplayDate;
        props.onPrevSelection = this._onPrevSelection;
        props.hideNextSelection = true;
        props.view = this.state.fromView;
      }
    }

    return props;
  },

  _getCalendarInputProps(isSorXs, right, sizeClass) {
    let props = {
      className: this.getClassName("calendarInput"),
      size: this.props.size,
      onChange: (e) =>
        this._onChange({
          event: e,
          component: this,
          value: e.target.value,
          _data: { right: right, type: "input" },
        }),
      onKeyDown: this.onKeyDown,
      value: right ? this.state.toInputValue || "" : this.state.fromInputValue || "",
      placeholder: right ? this._getToInputPlaceholder() : this._getFromInputPlaceholder(),
      mainAttrs: {},
    };

    if (isSorXs) {
      props.mainAttrs = this.props.inputAttrs;
      props.mainAttrs = UU5.Common.Tools.merge({ autoComplete: "off" }, props.mainAttrs);
      props.mainAttrs.className =
        (props.mainAttrs.className ? (props.mainAttrs.className += " ") : "") + (this.getColorSchema() ? "color-schema-" + this.getColorSchema() : "");
      props.mainAttrs.className === "" ? delete props.mainAttrs.className : null;
      props.mainAttrs.tabIndex = !this.isReadOnly() && !this.isComputedDisabled() ? "0" : undefined;

      let useSeparatedFeedback = this.state.fromFeedback.feedback === "error" || this.state.toFeedback.feedback === "error";
      props.inputWidth = this._getInputWidth({ dualInput: true });
      props.className += " " + sizeClass;
      props.icon = this.props.icon;
      props.borderRadius = this.props.borderRadius;
      props.elevation = this.props.elevation;
      props.bgStyle = this.props.bgStyle;

      if (right) {
        if (useSeparatedFeedback) {
          props = { ...props, ...this.state.toFeedback };
          props.mainAttrs.title = this.state.toFeedback.message;
        } else {
          props.feedback = this.getFeedback();
        }

        props.className += " " + this.getClassName("inputTo");
        props.ref_ = (item) => (this._rightTextInput = item);

        if (this.isOpen() && this.state.toInputActive) {
          props.mainAttrs.className = this.getClassName("inputActive");
        }
      } else {
        if (useSeparatedFeedback) {
          props = { ...props, ...this.state.fromFeedback };
          props.mainAttrs.title = this.state.fromFeedback.message;
        } else {
          props.feedback = this.getFeedback();
        }

        props.className += " " + this.getClassName("inputFrom");
        props.ref_ = (item) => {
          this._textInput = item;
          this._leftTextInput = item;
        };

        if (this.isOpen() && !this.state.toInputActive) {
          props.mainAttrs.className = this.getClassName("inputActive");
        }
      }
    } else {
      if (right) {
        props.mainAttrs.title = this.state.toFeedback.message;
        props.feedback = this.state.toFeedback.feedback;
      } else {
        props.mainAttrs.title = this.state.fromFeedback.message;
        props.feedback = this.state.fromFeedback.feedback;
      }
      props.ref_ = (item) => {
        if (right) {
          this._rightTextInput = item;
        } else {
          this._leftTextInput = item;
        }
      };
    }

    return props;
  },

  _getMainAttrs() {
    let attrs = this.getMainAttrs();
    attrs.id = this.getId();
    attrs.ref = (comp) => (this._root = comp);

    let mainClassRegExp = new RegExp(this.getClassName("main", "UU5.Forms.InputMixin"), "g");
    attrs.className = attrs.className.replace(mainClassRegExp, "").replace(/\s\s/, " ");

    let firstValue = this._getFromValue();
    let secondValue = this._getToValue();

    if (firstValue && secondValue && firstValue.getMonth() !== secondValue.getMonth()) {
      attrs.className += " " + this.getClassName("multiMonth");
    }

    if (this.props.nestingLevel === "inline" || this.props.inputWidth) {
      attrs.className += " " + this.getClassName("inline", "UU5.Forms.InputMixin");
    }

    if (this.isOpen()) {
      attrs.className += " " + this.getClassName("open");
    }

    if (this.isS() || this.isXs() || this._shouldOpenToContent()) {
      attrs.className += " " + this.getClassName("screenSizeBehaviour");
    }

    return attrs;
  },

  _getMainInnerMainAttrs(ommitMainAttrs) {
    let attrs = this._getInputAttrs(ommitMainAttrs);
    attrs.className += " " + this.getClassName("main", "UU5.Forms.InputMixin");

    if (!ommitMainAttrs) {
      attrs.id = this.getId();
      attrs.ref = (comp) => (this._root = comp);
    }

    if (this.isS() || this.isXs() || this._shouldOpenToContent()) {
      attrs.className += " " + this.getClassName("screenSizeBehaviour");
    }

    if (!this.isReadOnly() && !this.isComputedDisabled()) {
      let handleMobileClick = (e, clickData) => {
        let result = false;

        if (this.isOpen()) {
          if (clickData.toInput && !this.state.toInputActive) {
            document.activeElement.blur();
            e.target.blur();
            result = true;
          } else if (clickData.fromInput && this.state.toInputActive) {
            document.activeElement.blur();
            e.target.blur();
            result = true;
          } else {
            e.target.focus();
            this._close(true);
          }
        } else {
          if ((clickData.toInput && this.state.toInputActive) || (clickData.fromInput && !this.state.toInputActive) || (clickData.toInput && !this.state.toInputActive)) {
            document.activeElement.blur();
            e.target.blur();
            result = true;
          } else if (clickData.input && !clickData.fromInput && !clickData.toInput) {
            result = true;
          }
        }

        UU5.Common.Tools.scrollToTarget(this.getId() + "-input", false, UU5.Environment._fixedOffset + 20);

        return result;
      };

      let handleClick = (e) => {
        let clickData = this._findTarget(e.nativeEvent);
        let shouldOpen = !this._popover.isOpen();

        if (this._shouldOpenToContent() && clickData.input) {
          shouldOpen = handleMobileClick(e, clickData);
        }

        let opt = { value: this.state.value || null, event: e, component: this };

        if (clickData.input) {
          e.preventDefault();

          if (clickData.fromInput) {
            opt._data = { toInputActive: false };
          } else if (clickData.toInput) {
            opt._data = { toInputActive: true };
          }

          if (shouldOpen) {
            this._open(clickData.toInput, () => this._onFocus(opt));
          } else {
            this._close(false, () => this._onBlur(opt));
          }
        }
      };

      attrs.onClick = (e) => {
        handleClick(e);
      };
    }

    return attrs;
  },

  _getInputValue() {
    let result = null;
    let firstDate = this._getFromValue();
    let secondDate = this._getToValue();

    if (firstDate && secondDate) {
      let stringDate1 = formatLocalToCet(firstDate);
      let stringDate2 = formatLocalToCet(secondDate);
      let separator = "Y-mm-dd" ? "Y-mm-dd".match(/[^dmy]/i)[0] : stringDate1 ? stringDate1.match(/\W/)[0] : ".";
      let partialyShortenValue = separator === "." && !UU5.Common.Tools.isDateReversed();
      let regExp;

      if (this._compareDates(firstDate, secondDate, "equals")) {
        stringDate1 = "";
      } else if (partialyShortenValue) {
        if (firstDate.getMonth() === secondDate.getMonth() && firstDate.getFullYear() === secondDate.getFullYear()) {
          regExp = new RegExp("(^.+?)" + "\\" + separator, "g");
          stringDate1 = stringDate1.match(regExp)[0];
        } else if (firstDate.getFullYear() === secondDate.getFullYear()) {
          regExp = new RegExp(firstDate.getFullYear(), "g");
          stringDate1 = stringDate1.replace(regExp, "");
        }
      }
      result = stringDate1 + (stringDate1 ? " - " : "") + stringDate2;
    } else if (firstDate) {
      result = formatLocalToCet(firstDate);
    }

    if (result) {
      if (this.state.leftInfinity) {
        if (!secondDate) {
          result = "∞ -";
        } else {
          result = formatLocalToCet(secondDate);
          result = "∞ - " + result.toString();
        }
        result = UU5.Common.Tools.wrapIfExists(
          React.Fragment,
          <span className={this.getClassName("inputText")}>{this.props.innerLabel && this.props.label ? this.props.label + "\xa0" : null}</span>,
          <span className={this.getClassName("inputValue")}>{result}</span>
        );
      }
      if (this.state.rightInfinity) {
        result = formatLocalToCet(firstDate);
        result = result.toString() + " - ∞";
        result = UU5.Common.Tools.wrapIfExists(
          React.Fragment,
          <span className={this.getClassName("inputTextRightInfinity")}>{this.props.innerLabel && this.props.label ? this.props.label + "\xa0" : null}</span>,
          <span className={this.getClassName("inputValue")}>{result}</span>
        );
      }

      if (this.state.rightInfinity && this.state.leftInfinity) {
        result = "∞ - ∞";
        result = UU5.Common.Tools.wrapIfExists(
          React.Fragment,
          <span className={this.getClassName("inputTextBothInfinity")}>{this.props.innerLabel && this.props.label ? this.props.label + "\xa0" : null}</span>,
          <span className={this.getClassName("inputValue")}>{result}</span>
        );
      }
      result = UU5.Common.Tools.wrapIfExists(
        React.Fragment,
        <span className={this.getClassName("inputText")}>{this.props.innerLabel && this.props.label ? this.props.label + "\xa0" : null}</span>,
        <span className={this.getClassName("inputValue")}>{result}</span>
      );
    } else {
      result = UU5.Common.Tools.wrapIfExists(
        React.Fragment,
        <span className={this.getClassName("inputText")}>{this.props.innerLabel && this.props.label ? this.props.label + "\xa0" : null}</span>,
        <span className={this.getClassName("mainPlaceholder")}>{this._getMainPlaceholder()}</span>
      );
    }

    return (
      <div className={this.getClassName("inputContentWrapper")}>
        <UU5.Bricks.Icon icon={this.props.icon} style={{ color: "#787878" }} />
        {result}
        {!this.isComputedDisabled() && !this.isReadOnly() ? <UU5.Bricks.Icon icon={this.isOpen() ? this.props.iconOpen : this.props.iconClosed} /> : null}
      </div>
    );
  },

  _getSideLabels(inputId) {
    let result = null;
    let colWidth = UU5.Common.Tools.buildColWidthClassName(this.props.labelColWidth);

    if (this.props.labelFrom || this.props.labelTo) {
      result = [];
      if (this.props.labelFrom) {
        result.push(
          <Label
            colWidth={colWidth}
            for={inputId}
            content={this.props.labelFrom}
            key="fromLabel"
            required={this.props.required}
            className={this.getClassName("labelFrom")}
          />
        );
      }

      if (this.props.labelTo) {
        result.push(
          <Label colWidth={colWidth} for={inputId} content={this.props.labelTo} key="toLabel" required={this.props.required} className={this.getClassName("labelTo")} />
        );
      }
    } else {
      result = this.getLabel(inputId);
    }

    return result;
  },

  _getCustomContent() {
    let result = null;
    let content = this.getChildren();

    if (content) {
      result = <div className={this.getClassName("customContent")}>{content}</div>;
    }

    return result;
  },

  _handleLeftInfinity() {
    this._setComponentState(
      (prevState) => {
        return {
          leftInfinity: !prevState.leftInfinity,
        };
      },
      () => {
        const fromValue = this.state.leftInfinity === false ? new Date() : new Date(INFINITY_LEFT_DATE);
        const toValue = this._getToValue();
        this.setValue([fromValue, toValue ? toValue : this._getFromValue()]);
      }
    );
  },

  _handleRightInfinity() {
    this._setComponentState(
      (prevState) => ({
        rightInfinity: !prevState.rightInfinity,
      }),
      () => {
        this.setValue([this._getFromValue(), this.state.rightInfinity === false ? new Date() : new Date(INFINITY_RIGHT_DATE)]);
      }
    );
  },

  _normalRender(inputId, sizeClass) {
    let mainClassName = this.getClassName("mainInput");
    if (this.isOpen()) {
      mainClassName += " " + this.getClassName("inputOpen");
    }

    mainClassName += " " + sizeClass;

    let inputAttrs = this.props.inputAttrs;
    inputAttrs = UU5.Common.Tools.merge({ autoComplete: "off" }, inputAttrs);
    inputAttrs.className = (inputAttrs.className ? (inputAttrs.className += " ") : "") + (this.getColorSchema() ? "color-schema-" + this.getColorSchema() : "");
    inputAttrs.className === "" ? delete inputAttrs.className : null;
    inputAttrs.tabIndex = !this.isReadOnly() && !this.isComputedDisabled() ? "0" : undefined;

    return (
      <>
        <div {...this._getMainAttrs()}>
          <div {...this._getMainInnerMainAttrs(true)}>
            {this.getInputWrapper([
              <ItemsInput
                id={inputId}
                name={this.props.name || inputId}
                value={this._getInputValue()}
                placeholder={this._getMainPlaceholder()}
                mainAttrs={inputAttrs}
                disabled={this.isComputedDisabled()}
                readonly={this.isReadOnly()}
                loading={this.isLoading()}
                ref_={(item) => (this._textInput = item && item.findDOMNode())}
                feedback={this.getFeedback()}
                borderRadius={this.props.borderRadius}
                elevation={this.props.elevation}
                bgStyle={this.props.bgStyle}
                inputWidth={this._getInputWidth({ dualInput: false })}
                key="input"
                size={this.props.size}
                className={mainClassName}
                onKeyDown={this.onKeyDown}
              />,
            ])}
          </div>
          <div className={this.getClassName("popoverWrapper")}>
            <UU5.Bricks.Popover {...this._getPopoverProps()} key="popover">
              <div className={this.getClassName("calendars") + " uu5-forms-input-m"}>
                <div className={this.getClassName("firstRow")}>
                  <div className={this.getClassName("leftColumn")}>
                    {this.state.leftInfinity ? (
                      <UU5.Bricks.Icon className={this.getClassName("calendarInputIcon")} icon={"mdi-infinity"} />
                    ) : (
                      <TextInput onFocus={this._leftTextFocus} {...this._getCalendarInputProps(false, false)} />
                    )}
                    <UU5.Bricks.Link className={this.getClassName("leftInfinity")} colorSchema="grey" onClick={this._handleLeftInfinity}>
                      <UU5.Bricks.Icon icon={"mdi-infinity"} />
                    </UU5.Bricks.Link>
                    {this.isOpen() && <UU5.Bricks.Calendar {...this._getCalendarProps(false, false)} />}
                  </div>
                  <span className={this.getClassName("calendarSeparator")} />
                  <div className={this.getClassName("rightColumn")}>
                    {this.state.rightInfinity ? (
                      <UU5.Bricks.Icon className={this.getClassName("calendarInputIcon")} icon={"mdi-infinity"} />
                    ) : (
                      <TextInput onFocus={this._rightTextFocus} {...this._getCalendarInputProps(false, true)} />
                    )}

                    <UU5.Bricks.Link onClick={this._handleRightInfinity} colorSchema="grey" className={this.getClassName("rightInfinity")}>
                      <UU5.Bricks.Icon icon={"mdi-infinity"} />
                    </UU5.Bricks.Link>
                    {this.isOpen() && <UU5.Bricks.Calendar {...this._getCalendarProps(false, true)} />}
                  </div>
                </div>
                {this.props.showTodayButton ? (
                  <div className={this.getClassName("secondRow")}>
                    <UU5.Bricks.Button content={this.getLsiComponent("today")} className={this.getClassName("todayButton")} onClick={this._goToToday} />
                  </div>
                ) : null}
              </div>
              {this._getCustomContent()}
            </UU5.Bricks.Popover>
          </div>
        </div>
      </>
    );
  },

  _smallRender(inputId, sizeClass) {
    return (
      <div {...this._getMainInnerMainAttrs()}>
        {this.getInputWrapper([
          <TextInput id={inputId} {...this._getCalendarInputProps(true, false, sizeClass)} key="input1" />,
          <TextInput id={inputId} {...this._getCalendarInputProps(true, true, sizeClass)} key="input2" />,
          <UU5.Bricks.Popover {...this._getPopoverProps()} key="popover">
            <div className={this.getClassName("calendars") + " uu5-forms-input-m"}>
              <div className={this.getClassName("firstRow")}>
                <div className={this.getClassName("leftColumn")}>{this.isOpen() && <UU5.Bricks.Calendar {...this._getCalendarProps(true, false)} />}</div>
              </div>
            </div>
          </UU5.Bricks.Popover>,
        ])}
      </div>
    );
  },

  /**
   * This function handles the state change so it is centralized (shouldComponentUpdate function cannot be implemented due to mixin)
   * @param nextState
   * @param setStateCallback
   * @private
   */
  _setComponentState(nextState, setStateCallback) {
    this.setState(nextState, setStateCallback);
  },
  //@@viewOff:private

  //@@viewOn:render
  render() {
    let inputId = this.getId() + "-input";
    let sizeClass = this.props.size ? "uu5-forms-input-" + this.props.size : null;
    let result = null;
    if (this.isXs() || this.isS()) {
      result = this._smallRender(inputId, sizeClass);
    } else {
      result = this._normalRender(inputId, sizeClass);
    }

    return result;
  },
  //@@viewOff:render
});

export default NecsAbsoluteDateRangePicker;
