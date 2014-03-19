// Copyright 2012,2013 Mozilla Corporation & Google Inc. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
define(
	[ 'intern!object', 'intern/chai!assert', 'ecma402/Intl', 'ecma402/tests/intl402/harness/testIntl', 'ecma402/tests/intl402/harness/testBuiltInObject' ], 
	function(registerSuite, assert, Intl, testIntl, testBuiltInObject) {
	registerSuite({
		name : '12.3',
		Test_12_3_a : function() {
			/**
			 * @description Tests that Intl.DateTimeFormat.prototype is an object that
			 * has been initialized as an Intl.DateTimeFormat.
			 * @author: Roozbeh Pournader
			 */

			// test by calling a function that would fail if "this" were not an object
			// initialized as an Intl.DateTimeFormat
			assert.strictEqual(typeof Intl.DateTimeFormat.prototype.format(0),"string",
			    "Intl.DateTimeFormat's prototype is not an object that has been " +
			        "initialized as an Intl.DateTimeFormat");
		},
		Test_12_3_b : function() {
			/**
			 * @description Tests that Intl.DateTimeFormat.prototype functions throw a
			 *     TypeError if called on a non-object value or an object that hasn't been
			 *     initialized as a DateTimeFormat.
			 * @author Norbert Lindenberg
			 */

			var functions = {
			    "format getter": Object.getOwnPropertyDescriptor(Intl.DateTimeFormat.prototype, "format").get,
			    resolvedOptions: Intl.DateTimeFormat.prototype.resolvedOptions
			};
			var invalidTargets = [undefined, null, true, 0, "DateTimeFormat", [], {}];

			Object.getOwnPropertyNames(functions).forEach(function (functionName) {
			    var f = functions[functionName];
			    invalidTargets.forEach(function (target) {
			        var error;
			        try {
			            f.call(target);
			        } catch (e) {
			            error = e;
			        }
			        assert.isDefined(error,
			            "Calling " + functionName + " on " + target + " was not rejected.");
			        assert.strictEqual(error.name,"TypeError",
			            "Calling " + functionName + " on " + target + " was rejected with wrong error " + error.name + ".");
			    });
			});

		},
		Test_12_3_L15 : function() {
			/**
			 * @description Tests that Intl.DateTimeFormat.prototype
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Intl.DateTimeFormat.prototype, false, false, ["constructor", "format", "resolvedOptions"]);
		},
		Test_12_3_1 : function() {
			/**
			 * @description Tests that Intl.DateTimeFormat.prototype.constructor is the
			 * Intl.DateTimeFormat.
			 * @author: Roozbeh Pournader
			 */
			assert.strictEqual(Intl.DateTimeFormat.prototype.constructor,Intl.DateTimeFormat,
			    "Intl.DateTimeFormat.prototype.constructor is not the same as " +
			          "Intl.DateTimeFormat");
		},
		Test_12_3_2_1_a_L15 : function() {
			/**
			 * @description Tests that the function returned by Intl.DateTimeFormat.prototype.format
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(new Intl.DateTimeFormat().format, true, false, [], 0);
		},
		Test_12_3_2_1_c : function() {
			/**
			 * @description Tests that format function is bound to its Intl.DateTimeFormat.
			 * @author Norbert Lindenberg
			 */
			var dates = [new Date(), new Date(0), new Date(Date.parse("1989-11-09T17:57:00Z"))];
			var locales = [undefined, ["de"], ["th-u-ca-gregory-nu-thai"], ["en"], ["ja-u-ca-japanese"], ["ar-u-ca-islamicc-nu-arab"]];
			var options = [
			    undefined,
			    {hour12: false},
			    {month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"}
			];

			locales.forEach(function (locales) {
			    options.forEach(function (options) {
			        var formatObj = new Intl.DateTimeFormat(locales, options);
			        var formatFunc = formatObj.format;
			        dates.forEach(function (date) {
			            var referenceFormatted = formatObj.format(date);
			            var formatted = formatFunc(date);
			            assert.strictEqual(referenceFormatted,formatted,
			                "format function produces different result than format method for locales " +
			                    locales + "; options: " + (options ? JSON.stringify(options) : options) +
			                    " : " + formatted + " vs. " + referenceFormatted + ".");
			        });
			    });
			});
		},
		Test_12_3_2_FDT_1 : function() {
			/**
			 * @description Tests that format handles non-finite values correctly.
			 * @author Norbert Lindenberg
			 */

			var invalidValues = [NaN, Infinity, -Infinity];

			var format = new Intl.DateTimeFormat();

			invalidValues.forEach(function (value) {
			    var error;
			    try {
			        var result = format.format(value);
			    } catch (e) {
			        error = e;
			    }
			    assert.isDefined(error,
			        "Invalid value " + value + " was not rejected.");
			    assert.strictEqual(error.name,"RangeError",
			        "Invalid value " + value + " was rejected with wrong error " + error.name + ".");
			});

		},
		Test_12_3_2_FDT_7_a_iv : function() {
			/**
			 * @description Tests that format uses a proleptic Gregorian calendar with no year 0.
			 * @author Norbert Lindenberg
			 */

			var dates = [
			    0, // January 1, 1970
			    -62151602400000, // in June 1 BC
			    -8640000000000000 // beginning of ECMAScript time
			];

			var format = new Intl.DateTimeFormat(["en-US"], {year: "numeric", month: "long", timeZone: "UTC"});

			// this test requires a Gregorian calendar, which we usually find in the US
			assert.strictEqual(format.resolvedOptions().calendar,"gregory",
			    "Internal error: Didn't find Gregorian calendar");

			dates.forEach(function (date) {
			    var year = new Date(date).getUTCFullYear();
			    var expectedYear = year <= 0 ? 1 - year : year;
			    var expectedYearString = expectedYear.toLocaleString(["en-US"], {useGrouping: false});
			    var dateString = format.format(date);
			    assert.notStrictEqual(dateString.indexOf(expectedYearString),-1,
			        "Formatted year doesn't contain expected year – expected " +
			            expectedYearString + ", got " + dateString + ".");
			});

		},
		Test_12_3_2_L15 : function() {
			/**
			 * @description Tests that the getter for Intl.DateTimeFormat.prototype.format
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Object.getOwnPropertyDescriptor(Intl.DateTimeFormat.prototype, "format").get , true, false, [], 0);
		},
		Test_12_3_2_TLT_2 : function() {
			/**
			 * @description Tests that the behavior of a Record is not affected by adversarial
			 *     changes to Object.prototype.
			 * @author Norbert Lindenberg
			 */
			testIntl.taintProperties(["weekday", "era", "year", "month", "day", "hour", "minute", "second", "inDST"]);

			var format = new Intl.DateTimeFormat();
			var time = format.format();
			testIntl.untaintProperties(["weekday", "era", "year", "month", "day", "hour", "minute", "second", "inDST"]);
		},
		Test_12_3_3_L15 : function() {
			/**
			 * @description Tests that Intl.DateTimeFormat.prototype.resolvedOptions
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Intl.DateTimeFormat.prototype.resolvedOptions, true, false, [], 0);
		},
		Test_12_3_3 : function() {
			/**
			 * @description Tests that the object returned by Intl.DateTimeFormat.prototype.resolvedOptions
			 *     has the right properties.
			 * @author Norbert Lindenberg
			 */
			var actual = new Intl.DateTimeFormat().resolvedOptions();

			var actual2 = new Intl.DateTimeFormat().resolvedOptions();
			assert.notStrictEqual(actual2,actual,
			    "resolvedOptions returned the same object twice.");

			// source: CLDR file common/bcp47/calendar.xml; version CLDR 24.
			var calendars = [
			    "buddhist",
			    "chinese",
			    "coptic",
			    "dangi",
			    "ethioaa",
			    "ethiopic",
			    "gregory",
			    "hebrew",
			    "indian",
			    "islamic",
			    "islamicc",
			    "islamic-civil",
			    "islamic-rgsa",
			    "islamic-tbla",
			    "islamic-umalqura",
			    "iso8601",
			    "japanese",
			    "persian",
			    "roc"
			];

			// this assumes the default values where the specification provides them
			testIntl.mustHaveProperty(actual, "locale", testIntl.isCanonicalizedStructurallyValidLanguageTag);
			testIntl.mustHaveProperty(actual, "calendar", calendars);
			testIntl.mustHaveProperty(actual, "numberingSystem", testIntl.isValidNumberingSystem);
			testIntl.mustHaveProperty(actual, "timeZone", [undefined]);
			testIntl.mustNotHaveProperty(actual, "weekday");
			testIntl.mustNotHaveProperty(actual, "era");
			testIntl.mustHaveProperty(actual, "year", ["2-digit", "numeric"]);
			testIntl.mustHaveProperty(actual, "month", ["2-digit", "numeric", "narrow", "short", "long"]);
			testIntl.mustHaveProperty(actual, "day", ["2-digit", "numeric"]);
			testIntl.mustNotHaveProperty(actual, "hour");
			testIntl.mustNotHaveProperty(actual, "minute");
			testIntl.mustNotHaveProperty(actual, "second");
			testIntl.mustNotHaveProperty(actual, "timeZoneName");
			testIntl.mustNotHaveProperty(actual, "hour12");
		},
	});
});