// Copyright 2012,2013 Mozilla Corporation. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
define(
	[ 'intern!object', 'intern/chai!assert', 'ecma402/Intl', 'ecma402/tests/intl402/harness/testIntl', 'ecma402/tests/intl402/harness/testBuiltInObject' ], 
	function(registerSuite, assert, Intl, testIntl, testBuiltInObject) {
	registerSuite({
		name : '13.3',
		Test_13_3_0_1 : function() {
			/**
			 * @description Tests that Date.prototype.toLocaleString & Co. handle "this time value" correctly.
			 * @author Norbert Lindenberg
			 */

			var functions = {
			    toLocaleString: Date.prototype.toLocaleString,
			    toLocaleDateString: Date.prototype.toLocaleDateString,
			    toLocaleTimeString: Date.prototype.toLocaleTimeString
			};
			var invalidValues = [undefined, null, 5, "5", false, {valueOf: function () { return 5; }}];

			Object.getOwnPropertyNames(functions).forEach(function (p) {
			    var f = functions[p];
			    invalidValues.forEach(function (value) {
			        var error;
			        try {
			            var result = f.call(value);
			        } catch (e) {
			            error = e;
			        }
			        assert.isDefined(error,
			            "Date.prototype." + p + " did not reject this = " + value + ".");
			        assert.strictEqual(error.name,"TypeError",
			            "Date.prototype." + p + " rejected this = " + value + " with wrong error " + error.name + ".");
			    });
			});
		},
		Test_13_3_0_2 : function() {
			/**
			 * @description Tests that Date.prototype.toLocaleString & Co. handle non-finite values correctly.
			 * @author Norbert Lindenberg
			 */

			var functions = {
			    toLocaleString: Date.prototype.toLocaleString,
			    toLocaleDateString: Date.prototype.toLocaleDateString,
			    toLocaleTimeString: Date.prototype.toLocaleTimeString
			};
			var invalidValues = [NaN, Infinity, -Infinity];

			Object.getOwnPropertyNames(functions).forEach(function (p) {
			    var f = functions[p];
			    invalidValues.forEach(function (value) {
			        var result = f.call(new Date(value));
			        assert.strictEqual(result,"Invalid Date",
			            "Date.prototype." + p + " did not return \"Invalid Date\" for " +
			                value + " – got " + result + " instead.");
			    });
			});
		},
		Test_13_3_0_6_1 : function() {
			/**
			 * @description Tests that Date.prototype.toLocaleString & Co. throws the same exceptions as Intl.DateTimeFormat.
			 * @author Norbert Lindenberg
			 */

			var functions = {
			    toLocaleString: Date.prototype.toLocaleString,
			    toLocaleDateString: Date.prototype.toLocaleDateString,
			    toLocaleTimeString: Date.prototype.toLocaleTimeString
			};
			var locales = [null, [NaN], ["i"], ["de_DE"]];
			var options = [
			    {localeMatcher: null},
			    {timeZone: "invalid"},
			    {hour: "long"},
			    {formatMatcher: "invalid"}
			];

			Object.getOwnPropertyNames(functions).forEach(function (p) {
			    var f = functions[p];
			    locales.forEach(function (locales) {
			        var referenceError, error;
			        try {
			            var format = new Intl.DateTimeFormat(locales);
			        } catch (e) {
			            referenceError = e;
			        }
			        assert.isDefined(referenceError,
			            "Internal error: Expected exception was not thrown by Intl.DateTimeFormat for locales " + locales + ".");
			        
			        try {
			            var result = f.call(new Date(), locales);
			        } catch (e) {
			            error = e;
			        }
			        assert.isDefined(error,
			            "Date.prototype." + p + " didn't throw exception for locales " + locales + ".");
			        assert.strictEqual(error.name,referenceError.name,
			            "Date.prototype." + p + " threw exception " + error.name +
			                " for locales " + locales + "; expected " + referenceError.name + ".");
			    });
			    
			    options.forEach(function (options) {
			        var referenceError, error;
			        try {
			            var format = new Intl.DateTimeFormat([], options);
			        } catch (e) {
			            referenceError = e;
			        }
			        assert.isDefined(referenceError,
			            "Internal error: Expected exception was not thrown by Intl.DateTimeFormat for options " +
			                JSON.stringify(options) + ".");
			        
			        try {
			            var result = f.call(new Date(), [], options);
			        } catch (e) {
			            error = e;
			        }
			        assert.isDefined(error,
			            "Date.prototype." + p + " didn't throw exception for options " +
			                JSON.stringify(options) + ".");
			        assert.strictEqual(error.name,referenceError.name,
			            "Date.prototype." + p + " threw exception " + error.name +
			                " for options " + JSON.stringify(options) + "; expected " + referenceError.name + ".");
			    });
			});

		},
		Test_13_3_0_7 : function() {
			/**
			 * @description Tests that Date.prototype.toLocaleString & Co. produces the same results as Intl.DateTimeFormat.
			 * @author Norbert Lindenberg
			 */
			var functions = {
			    toLocaleString: [Date.prototype.toLocaleString,
			        {year: "numeric", month: "numeric", day: "numeric", hour: "numeric", minute: "numeric", second: "numeric"}],
			    toLocaleDateString: [Date.prototype.toLocaleDateString,
			        {year: "numeric", month: "numeric", day: "numeric"}],
			    toLocaleTimeString: [Date.prototype.toLocaleTimeString,
			        {hour: "numeric", minute: "numeric", second: "numeric"}]
			};
			var dates = [new Date(), new Date(0), new Date(Date.parse("1989-11-09T17:57:00Z"))];
			var locales = [undefined, ["de"], ["th-u-ca-gregory-nu-thai"], ["en"], ["ja-u-ca-japanese"], ["ar-u-ca-islamicc-nu-arab"]];
			var options = [
			    undefined,
			    {hour12: false},
			    {month: "long", day: "numeric", hour: "2-digit", minute: "2-digit"}
			];

			Object.getOwnPropertyNames(functions).forEach(function (p) {
			    var f = functions[p][0];
			    var defaults = functions[p][1];
			    locales.forEach(function (locales) {
			        options.forEach(function (options) {
			            var constructorOptions = options;
			            if (options === undefined) {
			                constructorOptions = defaults;
			            } else if (options.day === undefined) {
			                // for simplicity, our options above have either both date and time or neither
			                constructorOptions = Object.create(defaults);
			                for (var prop in options) {
			                    if (options.hasOwnProperty(prop)) {
			                        constructorOptions[prop] = options[prop];
			                    }
			                }
			            }
			            var referenceDateTimeFormat = new Intl.DateTimeFormat(locales, constructorOptions);
			            var referenceFormatted = dates.map(referenceDateTimeFormat.format);
			            
			            var formatted = dates.map(function (a) { return f.call(a, locales, options); });
			            try {
			                testIntl.testArraysAreSame(referenceFormatted, formatted);
			            } catch (e) {
			                e.message += " (Testing with locales " + locales + "; options " +
			                    (options ? JSON.stringify(options) : options) + ".)";
			                throw e;
			            }
			        });
			    });
			});
		},
		Test_13_3_1_L15 : function() {
			/**
			 * @description Tests that Date.prototype.toLocaleString
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Date.prototype.toLocaleString, true, false, [], 0);
		},
		Test_13_3_2_L15 : function() {
			/**
			 * @description Tests that Date.prototype.toLocaleDateString
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Date.prototype.toLocaleDateString, true, false, [], 0);
		},
		Test_13_3_3_L15 : function() {
			/**
			 * @description Tests that Date.prototype.toLocaleTimeString
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Date.prototype.toLocaleTimeString, true, false, [], 0);
		},
		Test_13_3_0_6_2 : function() {
			/**
			 * @description Tests that Date.prototype.toLocaleString & Co. use the standard
			 *     built-in Intl.DateTimeFormat constructor.
			 * @author Norbert Lindenberg
			 */
			var save = Intl.DateTimeFormat;
			testIntl.taintDataProperty(Intl, "DateTimeFormat");
			new Date().toLocaleString();
			new Date().toLocaleDateString();
			new Date().toLocaleTimeString();
			testIntl.untaintDataProperty(Intl, "DateTimeFormat");
			Intl.DateTimeFormat = save;
		}
	});
});