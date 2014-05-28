// Copyright 2012,2013 Mozilla Corporation. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
define(
	[ 'intern!object', 'intern/chai!assert', 'ecma402/Intl', 'ecma402/tests/intl402/harness/testIntl', 'ecma402/tests/intl402/harness/testBuiltInObject' ], 
	function(registerSuite, assert, Intl, testIntl, testBuiltInObject) {
	registerSuite({
		name : '12.1',
		Test_12_1_L15 : function() {
			/**
			 * @description Tests that Intl.DateTimeFormat
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Intl.DateTimeFormat, true, true, ["supportedLocalesOf"], 0);
		},
		Test_12_1_1_1 : function() {
			/**
			 * @description Tests that an object can't be re-initialized as a DateTimeFormat.
			 * @author Norbert Lindenberg
			 */
			testIntl.testWithIntlConstructors(function (Constructor) {
			    var obj, error;
			    
			    // variant 1: use constructor in a "new" expression
			    obj = new Constructor();
			    try {
			        Intl.DateTimeFormat.call(obj);
			    } catch (e) {
			        error = e;
			    }
			    assert.isDefined(error,
			        "Re-initializing object created with \"new\" as DateTimeFormat was not rejected.");
			    assert.strictEqual(error.name,"TypeError",
			        "Re-initializing object created with \"new\" as DateTimeFormat was rejected with wrong error " + error.name + ".");
			    
			    // variant 2: use constructor as a function
			    obj = Constructor.call({});
			    error = undefined;
			    try {
			        Intl.DateTimeFormat.call(obj);
			    } catch (e) {
			        error = e;
			    }
			    assert.isDefined(error,
			        "Re-initializing object created with constructor as function as DateTimeFormat was not rejected.");
			    assert.strictEqual(error.name,"TypeError",
			        "Re-initializing object created with constructor as function as DateTimeFormat was rejected with wrong error " + error.name + ".");
			});

		},
		Test_12_1_1_a : function() {
			/**
			 * @description Tests that constructing a DateTimeFormat doesn't create or modify
			 *     unwanted properties on the RegExp constructor.
			 * @author Norbert Lindenberg
			 */
			//testIntl.testForUnwantedRegExpChanges(function () {
			//    new Intl.DateTimeFormat("de-DE-u-ca-gregory");
			//});

			//testIntl.testForUnwantedRegExpChanges(function () {
			//    new Intl.DateTimeFormat("de-DE-u-ca-gregory", {timeZone: "UTC"});
			//});
			/*
			 * JCE: After consulting with Norbert, I have come to the conclusion that this test isn't relevant
			 * or desired for our implementation, since making this test pass would basically preclude us from
			 * using RegExp at all. So skipping this test.
			 */
		},
		Test_12_1_1_TDTO : function() {
			/**
			 * @description Tests that the set of options for the date and time components is processed correctly.
			 * @author Norbert Lindenberg
			 */
			var locales = [[], ["zh-Hans-CN"], ["hi-IN"], ["en-US"], ["id-ID"]];
			var dates = [new Date(), new Date(0), new Date(Date.parse("1989-11-09T17:57:00Z"))];

			function testWithDateTimeFormat(options, expected) {
			    locales.forEach(function (locales) {
			        var format = new Intl.DateTimeFormat(locales, options);
			        var resolvedOptions = format.resolvedOptions();
			        testIntl.getDateTimeComponents().forEach(function (component) {
			            if (resolvedOptions.hasOwnProperty(component)) {
			                assert(expected.hasOwnProperty(component),
			                    "Unrequested component " + component +
			                        " added to expected subset " + JSON.stringify(expected) +
			                        "; locales " + locales + ", options " +
			                        (options ? JSON.stringify(options) : options) + ".");
			            } else {
			                assert.isFalse(expected.hasOwnProperty(component),
			                    "Missing component " + component +
			                        " from expected subset " + JSON.stringify(expected) +
			                        "; locales " + locales + ", options " +
			                        (options ? JSON.stringify(options) : options) + ".");
			            }
			        });
			    });
			}

			function testWithToLocale(f, options, expected) {
			    // expected can be either one subset or an array of possible subsets
			    if (expected.length === undefined) {
			        expected = [expected];
			    }
			    locales.forEach(function (locales) {
			        dates.forEach(function (date) {
			            var formatted = Date.prototype[f].call(date, locales, options);
			            var expectedStrings = [];
			            expected.forEach(function (expected) {
			                var referenceFormat = new Intl.DateTimeFormat(locales, expected);
			                expectedStrings.push(referenceFormat.format(date));
			            });
			            assert.notStrictEqual(expectedStrings.indexOf(formatted),-1,
			                "Function " + f + " did not return expected string for locales " +
			                    locales + ", options " + (options? JSON.stringify(options) : options) +
			                    "; expected " +
			                    (expectedStrings.length === 1 ? expectedStrings[0] : "one of " + expectedStrings) +
			                    ", got " + formatted + ".");
			        });
			    });
			}   

			// any/date: steps 5a, 6a, 7a
			testWithDateTimeFormat(undefined, {year: "numeric", month: "numeric", day: "numeric"});

			// any/date: steps 5a, 6a
			testWithDateTimeFormat({year: "numeric", month: "numeric"}, {year: "numeric", month: "numeric"});

			// any/date: steps 5a, 6a
			testWithDateTimeFormat({hour: "numeric", minute: "numeric"}, {hour: "numeric", minute: "numeric"});

			// any/all: steps 5a, 6a, 7a, 8a
			testWithToLocale("toLocaleString", undefined, [
			        // the first one is not guaranteed to be supported; the second one is
			        {year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"},
			        {weekday: "short", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"}
			]);

			// any/all: steps 5a, 6a
			testWithToLocale("toLocaleString", {year: "numeric", month: "numeric"}, {year: "numeric", month: "numeric"});

			// any/all: steps 5a, 6a
			testWithToLocale("toLocaleString", {hour: "numeric", minute: "numeric"}, {hour: "numeric", minute: "numeric"});

			// date/date: steps 5a, 7a
			testWithToLocale("toLocaleDateString", undefined, {year: "numeric", month: "numeric", day: "numeric"});

			// date/date: steps 5a
			testWithToLocale("toLocaleDateString", {year: "numeric", month: "numeric"}, {year: "numeric", month: "numeric"});

			// date/date: steps 5a, 7a
			testWithToLocale("toLocaleDateString", {hour: "numeric", minute: "numeric", second: "numeric"}, [
			        // the first one is not guaranteed to be supported; the second one is
			        {year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"},
			        {weekday: "short", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"}
			]);

			// time/time: steps 6a, 8a
			testWithToLocale("toLocaleTimeString", undefined, {hour: "numeric", minute: "numeric", second: "numeric"});

			// time/time: steps 6a, 8a
			testWithToLocale("toLocaleTimeString", {weekday: "short", year: "numeric", month: "numeric", day: "numeric"},
			    {weekday: "short", year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"});

			// time/time: steps 6a
			testWithToLocale("toLocaleTimeString", {hour: "numeric", minute: "numeric"}, {hour: "numeric", minute: "numeric"});


		},
		Test_12_1_1_5 : function() {
			/**
			 * @description Tests that the behavior of a Record is not affected by adversarial
			 *     changes to Object.prototype.
			 * @author Norbert Lindenberg
			 */
			testIntl.taintProperties(["localeMatcher"]);
			var locale = new Intl.DateTimeFormat(undefined, {localeMatcher: "lookup"}).resolvedOptions().locale;
			assert(testIntl.isCanonicalizedStructurallyValidLanguageTag(locale),
			    "DateTimeFormat returns invalid locale " + locale + ".");
			testIntl.untaintProperties(["localeMatcher"]);
		},
		Test_12_1_1_6 : function() {
			/**
			 * @description Tests that the option localeMatcher is processed correctly.
			 * @author Norbert Lindenberg
			 */
			testIntl.testOption(Intl.DateTimeFormat, "localeMatcher", "string", ["lookup", "best fit"], "best fit", {noReturn: true});
		},
		Test_12_1_1_18 : function() {
			/**
			 * @description Tests that the option hour12 is processed correctly.
			 * @author Norbert Lindenberg
			 */
			testIntl.testOption(Intl.DateTimeFormat, "hour12", "boolean", undefined, undefined,
			    {extra: {any: {hour: "numeric", minute: "numeric"}}});
			testIntl.testOption(Intl.DateTimeFormat, "hour12", "boolean", undefined, undefined,
			    {noReturn: true});
		},
		Test_12_1_1_22 : function() {
			/**
			 * @description Tests that the behavior of a Record is not affected by adversarial
			 *     changes to Object.prototype.
			 * @author Norbert Lindenberg
			 */
			testIntl.taintProperties(["weekday", "era", "year", "month", "day", "hour", "minute", "second", "timeZone"]);

			var locale = new Intl.DateTimeFormat(undefined, {localeMatcher: "lookup"}).resolvedOptions().locale;
			assert(testIntl.isCanonicalizedStructurallyValidLanguageTag(locale),
			    "DateTimeFormat returns invalid locale " + locale + ".");
			testIntl.untaintProperties(["weekday", "era", "year", "month", "day", "hour", "minute", "second", "timeZone"]);
		},
		Test_12_1_1_23 : function() {
			/**
			 * @description Tests that the options for the date and time components are processed correctly.
			 * @author Norbert Lindenberg
			 */
			testIntl.getDateTimeComponents().forEach(function (component) {
			    testIntl.testOption(Intl.DateTimeFormat, component, "string", testIntl.getDateTimeComponentValues(component), undefined, {isILD: true});
			});
		},
		Test_12_1_1_25 : function() {
			/**
			 * @description Tests that the option formatMatcher is processed correctly.
			 * @author Norbert Lindenberg
			 */
			testIntl.testOption(Intl.DateTimeFormat, "formatMatcher", "string", ["basic", "best fit"], "best fit", {noReturn: true});
		},
		Test_12_1_2 : function() {
			/**
			 * @description Tests that Intl.DateTimeFormat can be subclassed.
			 * @author Norbert Lindenberg
			 */
			// get a date-time format and have it format an array of dates for comparison with the subclass
			var locales = ["tlh", "id", "en"];
			var a = [new Date(0), Date.now(), new Date(Date.parse("1989-11-09T17:57:00Z"))];
			var referenceDateTimeFormat = new Intl.DateTimeFormat(locales);
			var referenceFormatted = a.map(referenceDateTimeFormat.format);

			function MyDateTimeFormat(locales, options) {
			    Intl.DateTimeFormat.call(this, locales, options);
			    // could initialize MyDateTimeFormat properties
			}

			MyDateTimeFormat.prototype = Object.create(Intl.DateTimeFormat.prototype);
			MyDateTimeFormat.prototype.constructor = MyDateTimeFormat;
			// could add methods to MyDateTimeFormat.prototype

			var format = new MyDateTimeFormat(locales);
			var actual = a.map(format.format);
			testIntl.testArraysAreSame(referenceFormatted, actual);
		},
		Test_12_1_2_1_4 : function() {
			/**
			 * @description Tests that for non-object values passed as this to DateTimeFormat a
			 * wrapper object will be initialized and returned.
			 * @author Norbert Lindenberg
			 */

			var thisValues = [true, 42, "国際化"];

			thisValues.forEach(function (value) {
			    var format = Intl.DateTimeFormat.call(value);
			    // check that the returned object functions as a date-time format
			    var referenceFormat = new Intl.DateTimeFormat();
			    assert.strictEqual(Intl.DateTimeFormat.prototype.format.call(format, new Date(111111111)),referenceFormat.format(new Date(111111111)),
			        "DateTimeFormat initialized from " + value + " doesn't behave like normal date-time format.");
			});
		},
		Test_12_1_3 : function() {
			/**
			 * @description Tests that objects constructed by Intl.DateTimeFormat have the specified internal properties.
			 * @author Norbert Lindenberg
			 */

			var obj = new Intl.DateTimeFormat();

			var actualPrototype = Object.getPrototypeOf(obj);
			assert.strictEqual(actualPrototype,Intl.DateTimeFormat.prototype,
			    "Prototype of object constructed by Intl.DateTimeFormat isn't Intl.DateTimeFormat.prototype; got " + actualPrototype);
			assert(Object.isExtensible(obj),
			    "Object constructed by Intl.DateTimeFormat must be extensible.");
		}
	});
});