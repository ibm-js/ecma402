// Copyright 2012 Mozilla Corporation. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
define(
	[ 'intern!object', 'intern/chai!assert', 'ecma402/Intl', 'ecma402/tests/intl402/harness/testIntl', 'ecma402/tests/intl402/harness/testBuiltInObject' ], 
	function(registerSuite, assert, Intl, testIntl, testBuiltInObject) {
	registerSuite({
		name : '11.2',
		Test_11_2_1 : function() {
			/**
			 * @description Tests that Intl.NumberFormat.prototype has the required attributes.
			 * @author Norbert Lindenberg
			 */
			var desc = Object.getOwnPropertyDescriptor(Intl.NumberFormat, "prototype");
			assert.isDefined(desc,
			    "Intl.NumberFormat.prototype is not defined.");
			assert.isFalse(desc.writable,
			    "Intl.NumberFormat.prototype must not be writable.");
			assert.isFalse(desc.enumerable,
			    "Intl.NumberFormat.prototype must not be enumerable.");
			assert.isFalse(desc.configurable,
			    "Intl.NumberFormat.prototype must not be configurable.");
		},
		Test_11_2_2_a : function() {
			/**
			 * @description Tests that Intl.NumberFormat has a supportedLocalesOf
			 * property, and it works as planned.
			 * @author: Roozbeh Pournader
			 */
			var defaultLocale = new Intl.NumberFormat().resolvedOptions().locale;
			var notSupported = 'zxx'; // "no linguistic content"
			var requestedLocales = [defaultLocale, notSupported];
			    
			var supportedLocales;

			assert(Intl.NumberFormat.hasOwnProperty('supportedLocalesOf'),
			    "Intl.NumberFormat doesn't have a supportedLocalesOf property.");
			    
			supportedLocales = Intl.NumberFormat.supportedLocalesOf(requestedLocales);
			assert.strictEqual(supportedLocales.length,1,
			    "The length of supported locales list is not 1.");
			    
			assert.strictEqual(supportedLocales[0],defaultLocale,
			    "The default locale is not returned in the supported list.");
		},
		//Test_11_2_2_b : function() {
			/**
			 * @description Tests that Intl.NumberFormat.supportedLocalesOf
			 *     doesn't access arguments that it's not given.
			 * @author Norbert Lindenberg
			 */
		//	testIntl.taintDataProperty(Object.prototype, "1");
		//	new Intl.NumberFormat("und");
		//	testIntl.untaintDataProperty(Object.prototype, "1");
		//},
		Test_11_2_2_L15 : function() {
			/**
			 * @description Tests that Intl.NumberFormat.supportedLocalesOf
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Intl.NumberFormat.supportedLocalesOf, true, false, [], 1);
		},
		Test_11_2_3_b : function() {
			/**
			 * @description Tests that Intl.NumberFormat does not accept Unicode locale
			 *     extension keys and values that are not allowed.
			 * @author Norbert Lindenberg
			 */
			var locales = ["ja-JP", "zh-Hans-CN", "zh-Hant-TW"];
			var input = 1234567.89;

			locales.forEach(function (locale) {
			    var defaultNumberFormat = new Intl.NumberFormat([locale]);
			    var defaultOptions = defaultNumberFormat.resolvedOptions();
			    var defaultOptionsJSON = JSON.stringify(defaultOptions);
			    var defaultLocale = defaultOptions.locale;
			    var defaultFormatted = defaultNumberFormat.format(input);

			    var keyValues = {
			        "cu": ["USD", "EUR", "JPY", "CNY", "TWD", "invalid"],
			        "nu": ["native", "traditio", "finance", "invalid"]
			    };
			    
			    Object.getOwnPropertyNames(keyValues).forEach(function (key) {
			        keyValues[key].forEach(function (value) {
			            var numberFormat = new Intl.NumberFormat([locale + "-u-" + key + "-" + value]);
			            var options = numberFormat.resolvedOptions();
			            assert.strictEqual(options.locale,defaultLocale,
			                "Locale " + options.locale + " is affected by key " +
			                key + "; value " + value + ".");
			            assert.strictEqual(JSON.stringify(options),defaultOptionsJSON,
			                "Resolved options " + JSON.stringify(options) + " are affected by key " +
			                key + "; value " + value + ".");
			            assert.strictEqual(defaultFormatted,numberFormat.format(input),
			                "Formatted value " + numberFormat.format(input) + " is affected by key " +
			                key + "; value " + value + ".");
			        });
			    });
			});
		}
	});
});