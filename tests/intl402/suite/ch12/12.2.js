// Copyright 2012,2013 Mozilla Corporation & Google Inc. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
define(
	[ 'intern!object', 'intern/chai!assert', 'ecma402/Intl', 'ecma402/tests/intl402/harness/testIntl', 'ecma402/tests/intl402/harness/testBuiltInObject' ], 
	function(registerSuite, assert, Intl, testIntl, testBuiltInObject) {
	registerSuite({
		name : '12.2',
		Test_12_2_1 : function() {
			/**
			 * @description Tests that Intl.DateTimeFormat.prototype has the required attributes.
			 * @author Norbert Lindenberg
			 */
			var desc = Object.getOwnPropertyDescriptor(Intl.DateTimeFormat, "prototype");
			assert.isDefined(desc,
			    "Intl.DateTimeFormat.prototype is not defined.");
			
			assert(!desc.writable,
			    "Intl.DateTimeFormat.prototype must not be writable.");
			assert(!desc.enumerable,
			    "Intl.DateTimeFormat.prototype must not be enumerable.");
			assert(!desc.configurable,
			    "Intl.DateTimeFormat.prototype must not be configurable.");
		},
		Test_12_2_2_a : function() {			
			/**
			 * @description Tests that Intl.DateTimeFormat has a supportedLocalesOf
			 * property, and it works as planned.
			 * @author: Roozbeh Pournader
			 */

			var defaultLocale = new Intl.DateTimeFormat().resolvedOptions().locale;
			var notSupported = 'zxx'; // "no linguistic content"
			var requestedLocales = [defaultLocale, notSupported];
			    
			var supportedLocales;

			assert(Intl.DateTimeFormat.hasOwnProperty('supportedLocalesOf'),
			    "Intl.DateTimeFormat doesn't have a supportedLocalesOf property.");
			    
			supportedLocales = Intl.DateTimeFormat.supportedLocalesOf(requestedLocales);
			assert.strictEqual(supportedLocales.length,1,
			    'The length of supported locales list is not 1.');
			    
			assert.strictEqual(supportedLocales[0],defaultLocale,
			    'The default locale is not returned in the supported list.');
		},
		//Test_12_2_2_b : function() {			
			/**
			 * @description Tests that Intl.DateTimeFormat.supportedLocalesOf
			 *     doesn't access arguments that it's not given.
			 * @author Norbert Lindenberg
			 */
			//testIntl.taintDataProperty(Object.prototype, "1");
			//new Intl.DateTimeFormat("und");
			//testIntl.untaintDataProperty(Object.prototype, "1");
		//},
		Test_12_2_2_L15 : function() {			
			/**
			 * @description Tests that Intl.DateTimeFormat.supportedLocalesOf
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Intl.DateTimeFormat.supportedLocalesOf, true, false, [], 1);
		},
		Test_12_2_3_b : function() {			
			/**
			 * @description Tests that Intl.DateTimeFormat does not accept Unicode locale
			 *     extension keys and values that are not allowed.
			 * @author Norbert Lindenberg
			 */
			var locales = ["ja-JP", "zh-Hans-CN", "zh-Hant-TW"];
			var input = new Date(Date.parse("1989-11-09T17:57:00Z"));

			locales.forEach(function (locale) {
			    var defaultDateTimeFormat = new Intl.DateTimeFormat([locale]);
			    var defaultOptions = defaultDateTimeFormat.resolvedOptions();
			    var defaultOptionsJSON = JSON.stringify(defaultOptions);
			    var defaultLocale = defaultOptions.locale;
			    var defaultFormatted = defaultDateTimeFormat.format(input);

			    var keyValues = {
			        "cu": ["USD", "EUR", "JPY", "CNY", "TWD", "invalid"], // DateTimeFormat internally uses NumberFormat
			        "nu": ["native", "traditio", "finance", "invalid"],
			        "tz": ["usnavajo", "utcw01", "aumel", "uslax", "usnyc", "deber", "invalid"]
			    };
			    
			    Object.getOwnPropertyNames(keyValues).forEach(function (key) {
			        keyValues[key].forEach(function (value) {
			            var dateTimeFormat = new Intl.DateTimeFormat([locale + "-u-" + key + "-" + value]);
			            var options = dateTimeFormat.resolvedOptions();
			            assert.strictEqual(options.locale,defaultLocale,
			                "Locale " + options.locale + " is affected by key " +
			                key + "; value " + value + ".");
			            assert.strictEqual(JSON.stringify(options),defaultOptionsJSON,
			                "Resolved options " + JSON.stringify(options) + " are affected by key " +
			                key + "; value " + value + ".");
			            assert.strictEqual(defaultFormatted,dateTimeFormat.format(input),
			                "Formatted value " + dateTimeFormat.format(input) + " is affected by key " +
			                key + "; value " + value + ".");
			        });
			    });
			});
		},
		Test_12_2_3_c : function() {			
			/**
			 * @description Tests that Intl.DateTimeFormat provides the required date-time
			 *     format component subsets.
			 * @author Norbert Lindenberg
			 */
			var locales = ["de-DE", "en-US", "hi-IN", "id-ID", "ja-JP", "th-TH", "zh-Hans-CN", "zh-Hant-TW", "zxx"];
			var subsets = [
			    {weekday: "long", year: "numeric", month: "numeric", day: "numeric",
			        hour: "numeric", minute: "numeric", second: "numeric"},
			    {weekday: "long", year: "numeric", month: "numeric", day: "numeric"},
			    {year: "numeric", month: "numeric", day: "numeric"},
			    {year: "numeric", month: "numeric"},
			    {month: "numeric", day: "numeric"},
			    {hour: "numeric", minute: "numeric", second: "numeric"},
			    {hour: "numeric", minute: "numeric"}
			];

			locales.forEach(function (locale) {
			    subsets.forEach(function (subset) {
			        var format = new Intl.DateTimeFormat([locale], subset);
			        var actual = format.resolvedOptions();
			        testIntl.getDateTimeComponents().forEach(function (component) {
			            if (actual.hasOwnProperty(component)) {
			                assert(subset.hasOwnProperty(component),
			                    "Unrequested component " + component +
			                        " added to requested subset " + JSON.stringify(subset) +
			                        "; locale " + locale + ".");
			                try {
			                    testIntl.testValidDateTimeComponentValue(component, actual[component]);
			                } catch (e) {
			                    e.message += " (Testing locale " + locale + "; subset " +
			                        JSON.stringify(subset) + ")";
			                    throw e;
			                }
			            } else {
			                assert(!subset.hasOwnProperty(component),
			                    "Missing component " + component +
			                        " from requested subset " + JSON.stringify(subset) +
			                        "; locale " + locale + ".");
			            }
			        });
			    });
			});
		}
	});
});