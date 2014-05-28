// Copyright 2012 Mozilla Corporation. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
define(
	[ 'intern!object', 'intern/chai!assert', 'ecma402/Intl', 'ecma402/tests/intl402/harness/testIntl', 'ecma402/tests/intl402/harness/testBuiltInObject' ], 
	function(registerSuite, assert, Intl, testIntl, testBuiltInObject) {
	registerSuite({
		name : '13.2',
		Test_13_2_1_1 : function() {
			/**
			 * @description Tests that toLocaleString handles "this Number value" correctly.
			 * @author Norbert Lindenberg
			 */

			var invalidValues = [undefined, null, "5", false, {valueOf: function () { return 5; }}];
			var validValues = [5, NaN, -1234567.89, -Infinity];

			invalidValues.forEach(function (value) {
			    var error;
			    try {
			        var result = Number.prototype.toLocaleString.call(value);
			    } catch (e) {
			        error = e;
			    }
			    assert.isDefined(error,
			        "Number.prototype.toLocaleString did not reject this = " + value + ".");
			    assert.strictEqual(error.name,"TypeError",
			        "Number.prototype.toLocaleString rejected this = " + value + " with wrong error " + error.name + ".");
			});

			// for valid values, just check that a Number value and the corresponding
			// Number object get the same result.
			validValues.forEach(function (value) {
			    var Constructor = Number; // to keep jshint happy
			    var valueResult = Number.prototype.toLocaleString.call(value);
			    var objectResult = Number.prototype.toLocaleString.call(new Constructor(value));
			    assert.strictEqual(valueResult,objectResult,
			        "Number.prototype.toLocaleString produces different results for Number value " +
			            value + " and corresponding Number object: " + valueResult + " vs. " + objectResult + ".");
			});

		},
		Test_13_2_1_4_1 : function() {
			/**
			 * @description Tests that Number.prototype.toLocaleString throws the same exceptions as Intl.NumberFormat.
			 * @author Norbert Lindenberg
			 */

			var locales = [null, [NaN], ["i"], ["de_DE"]];
			var options = [
			    {localeMatcher: null},
			    {style: "invalid"},
			    {style: "currency"},
			    {style: "currency", currency: "ßP"},
			    {maximumSignificantDigits: -Infinity}
			];

			locales.forEach(function (locales) {
			    var referenceError, error;
			    try {
			        var format = new Intl.NumberFormat(locales);
			    } catch (e) {
			        referenceError = e;
			    }
			    assert.isDefined(referenceError,
			        "Internal error: Expected exception was not thrown by Intl.NumberFormat for locales " + locales + ".");
			    
			    try {
			        var result = (0).toLocaleString(locales);
			    } catch (e) {
			        error = e;
			    }
			    assert.isDefined(error,
			        "Number.prototype.toLocaleString didn't throw exception for locales " + locales + ".");
			    assert.strictEqual(error.name,referenceError.name,
			        "Number.prototype.toLocaleString threw exception " + error.name +
			            " for locales " + locales + "; expected " + referenceError.name + ".");
			});

			options.forEach(function (options) {
			    var referenceError, error;
			    try {
			        var format = new Intl.NumberFormat([], options);
			    } catch (e) {
			        referenceError = e;
			    }
			    assert.isDefined(referenceError,
			        "Internal error: Expected exception was not thrown by Intl.NumberFormat for options " +
			            JSON.stringify(options) + ".");
			    
			    try {
			        var result = (0).toLocaleString([], options);
			    } catch (e) {
			        error = e;
			    }
			    assert.isDefined(error,
			        "Number.prototype.toLocaleString didn't throw exception for options " +
			            JSON.stringify(options) + ".");
			    assert.strictEqual(error.name,referenceError.name,
			        "Number.prototype.toLocaleString threw exception " + error.name +
			            " for options " + JSON.stringify(options) + "; expected " + referenceError.name + ".");
			});

		},
		Test_13_2_1_5 : function() {
			/**
			 * @description Tests that Number.prototype.toLocaleString produces the same results as Intl.NumberFormat.
			 * @author Norbert Lindenberg
			 */
			var numbers = [0, -0, 1, -1, 5.5, 123, -123, -123.45, 123.44501, 0.001234,
			    -0.00000000123, 0.00000000000000000000000000000123, 1.2, 0.0000000012344501,
			    123445.01, 12344501000000000000000000000000000, -12344501000000000000000000000000000,
			    Infinity, -Infinity, NaN];
			var locales = [undefined, ["de"], ["th-u-nu-thai"], ["en"], ["ja-u-nu-jpanfin"], ["ar-u-nu-arab"]];
			var options = [
			    undefined,
			    {style: "percent"},
			    {style: "currency", currency: "EUR", currencyDisplay: "symbol"},
			    {style: "currency", currency: "IQD", currencyDisplay: "symbol"},
			    {style: "currency", currency: "KMF", currencyDisplay: "symbol"},
			    {style: "currency", currency: "CLF", currencyDisplay: "symbol"},
			    {useGrouping: false, minimumIntegerDigits: 3, minimumFractionDigits: 1, maximumFractionDigits: 3}
			];

			locales.forEach(function (locales) {
			    options.forEach(function (options) {
			        var referenceNumberFormat = new Intl.NumberFormat(locales, options);
			        var referenceFormatted = numbers.map(referenceNumberFormat.format);
			        
			        var formatted = numbers.map(function (a) { return a.toLocaleString(locales, options); });
			        try {
			            testIntl.testArraysAreSame(referenceFormatted, formatted);
			        } catch (e) {
			            e.message += " (Testing with locales " + locales + "; options " +
			            (options ? JSON.stringify(options) : options) + ".)";
			            throw e;
			        }
			    });
			});

		},
		Test_13_2_1_L15 : function() {
			/**
			 * @description Tests that Number.prototype.toLocaleString
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Number.prototype.toLocaleString, true, false, [], 0);
		},
		Test_13_2_1_4_2 : function() {
			/**
			 * @description Tests that Number.prototype.toLocaleString uses the standard
			 *     built-in Intl.NumberFormat constructor.
			 * @author Norbert Lindenberg
			 */
			var save = Intl.NumberFormat;
			testIntl.taintDataProperty(Intl, "NumberFormat");
			(0.0).toLocaleString();
			testIntl.untaintDataProperty(Intl, "NumberFormat");
			Intl.NumberFormat = save;

		}
	});
});