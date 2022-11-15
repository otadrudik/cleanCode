// noinspection JSUnusedGlobalSymbols

import moment from "moment-timezone";
import Defaults from "../../config/defaults";

/**
 * Set date to the business time zone.
 *
 * @param {Moment | Date | string | number | (number | string)[] | MomentInputObject | void} [date=moment()] - Date that will be change to business time zone (CET)
 *
 * @returns {Moment} Returns date converted to [business time zone]{@link Defaults.businessTimeZone}.
 *
 * @desc
 * <pre>
 * Input:  2020-11-01T03:00:00-08:00 (any type representing local date)
 * Output: 2020-11-01T12:00:00+01:00
 * </pre>
 */
function resolveDateInBusinessTimeZone(date = moment()) {
  return moment.tz(date, Defaults.businessTimeZone);
}

/**
 * Set date to the business time zone and return string by format
 *
 * @param {Moment | Date | string | number | (number | string)[] | MomentInputObject | void} [date=moment()] - Date that will be change to business time zone (CET)
 * @param {string} [format = "YYYY-MM-DD"] format - String format in form of Moment.js (https://momentjs.com/docs/#/displaying/format/)
 *
 * @returns {string} - Returns formatted date converted to [business time zone]{@link Defaults.businessTimeZone}.
 * @desc
 * <pre>
 * Input:  "2020-10-31T23:00:00-07:00" (any type representing local date)
 * Output: "2020-11-01"
 * </pre>
 */
function formatDateToBusinessTimeZone(date = moment(), format = "YYYY-MM-DD") {
  return resolveDateInBusinessTimeZone(date).format(format);
}

/**
 * Returns date adjusted by amount of days in business time zone
 *
 * @param {Moment | Date | string | number | (number | string)[] | MomentInputObject | void} [date=moment()] - Date that will be adjusted by amount of days.
 * @param {number} amount - Amount of days to add.
 *
 * @returns {Moment} - Returns date with days added and converted to [business time zone]{@link Defaults.businessTimeZone}.
 * @desc
 * <pre>
 * Input:  2020-11-01T03:00:00-08:00 (any type representing local date)
 *         +1
 * Output: 2020-11-02T12:00:00+01:00
 * </pre>
 */
function addDays(date = moment(), amount) {
  return resolveDateInBusinessTimeZone(date).add(amount, "days");
}

/**
 * Returns start of day in business time zone
 *
 * @param {Moment | Date | string | number | (number | string)[] | MomentInputObject | void} [date=moment()] - Date that will be adjusted by amount of days.
 *
 * @returns {Moment} - Returns start of day converted to [business time zone]{@link Defaults.businessTimeZone}.
 * @desc
 * <pre>
 * Input:  2020-10-31T23:00:00-07:00 (any type representing local date)
 * Output: 2020-11-01T00:00:00+01:00
 * </pre>
 */
function getStartOfDay(date = moment()) {
  return resolveDateInBusinessTimeZone(date).startOf("day");
}

/**
 * Returns end of day in business time zone
 *
 * @param {Moment | Date | string | number | (number | string)[] | MomentInputObject | void} [date=moment()] - Date that will be adjusted by amount of days.
 *
 * @returns {Moment} - Returns end of day converted to [business time zone]{@link Defaults.businessTimeZone}.
 * @desc
 * <pre>
 * Input:  2020-10-31T23:00:00-07:00 (any type representing local date)
 * Output: 2020-11-02T00:00:00+01:00
 * </pre>
 */
function getEndOfDay(date = moment()) {
  return resolveDateInBusinessTimeZone(date).add(1, "days").startOf("day");
}

export { resolveDateInBusinessTimeZone, formatDateToBusinessTimeZone, addDays, getStartOfDay, getEndOfDay };
