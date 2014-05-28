// Copyright 2012 Mozilla Corporation & Google Inc. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
define(
	[ 'intern!object', 'intern/chai!assert', 'ecma402/Intl', 'ecma402/tests/intl402/harness/testIntl', 'ecma402/tests/intl402/harness/testBuiltInObject' ], 
	function(registerSuite, assert, Intl, testIntl, testBuiltInObject) {
	registerSuite({
		name : '11.3',
		Test_11_3_a : function() {
			/**
			 * @description Tests that Intl.NumberFormat.prototype is an object that
			 * has been initialized as an Intl.NumberFormat.
			 * @author: Roozbeh Pournader
			 */
			// test by calling a function that would fail if "this" were not an object
			// initialized as an Intl.NumberFormat
			assert.strictEqual(typeof Intl.NumberFormat.prototype.format(0),"string",
			    "Intl.NumberFormat's prototype is not an object that has been " +
			        "initialized as an Intl.NumberFormat");
		},
		Test_11_3_b : function() {
			/**
			 * @description Tests that Intl.NumberFormat.prototype functions throw a
			 *     TypeError if called on a non-object value or an object that hasn't been
			 *     initialized as a NumberFormat.
			 * @author Norbert Lindenberg
			 */

			var functions = {
			    "format getter": Object.getOwnPropertyDescriptor(Intl.NumberFormat.prototype, "format").get,
			    resolvedOptions: Intl.NumberFormat.prototype.resolvedOptions
			};
			var invalidTargets = [undefined, null, true, 0, "NumberFormat", [], {}];

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
		Test_11_3_L15 : function() {
			/**
			 * @description Tests that Intl.NumberFormat.prototype
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Intl.NumberFormat.prototype, false, false, ["constructor", "format", "resolvedOptions"]);

		},
		Test_11_3_1 : function() {
			/**
			 * @description Tests that Intl.NumberFormat.prototype.constructor is the
			 * Intl.NumberFormat.
			 * @author: Roozbeh Pournader
			 */

			assert.strictEqual(Intl.NumberFormat.prototype.constructor,Intl.NumberFormat,
			    "Intl.NumberFormat.prototype.constructor is not the same as " +
			          "Intl.NumberFormat");
		},
		Test_11_3_2_1_a_ii : function() {
			/**
			 * @description Tests that Intl.NumberFormat.prototype.format
			 * converts other types to numbers.
			 * @author: Roozbeh Pournader
			 */
			var formatter = new Intl.NumberFormat();
			var testData = [undefined, null, true, '0.6666666', {valueOf: function () { return '0.1234567';}}];
			var number;
			var i, input, correctResult, result;

			for (i in testData) {
			    input = testData[i];
			    number = +input;
			    correctResult = formatter.format(number);
			    
			    result = formatter.format(input);
			    assert.strictEqual(result,correctResult,
			        'Intl.NumberFormat does not convert other ' +
			            'types to numbers. Input: "'+input+'" Output: "'+result+'" '+
			            'Expected output: "'+correctResult+'"');
			}

		},
		Test_11_3_2_1_a_L15 : function() {
			/**
			 * @description Tests that the function returned by Intl.NumberFormat.prototype.format
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(new Intl.NumberFormat().format, true, false, [], 1);
		},
		Test_11_3_2_1_c : function() {
			/**
			 * @description Tests that format function is bound to its Intl.NumberFormat.
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
			        var formatObj = new Intl.NumberFormat(locales, options);
			        var formatFunc = formatObj.format;
			        numbers.forEach(function (number) {
			            var referenceFormatted = formatObj.format(number);
			            var formatted = formatFunc(number);
			            assert.strictEqual(referenceFormatted,formatted,
			                "format function produces different result than format method for locales " +
			                    locales + "; options: " + (options ? JSON.stringify(options) : options) +
			                    " : " + formatted + " vs. " + referenceFormatted + ".");
			        });
			    });
			});

		},
		Test_11_3_2_FN_1 : function() {
			/**
			 * @description Tests that Intl.NumberFormat.prototype.format
			 * doesn't treat all numbers as negative.
			 * @author: Roozbeh Pournader
			 */

			var formatter = new Intl.NumberFormat();
			  
			assert.notStrictEqual(formatter.format(1),formatter.format(-1),
			    'Intl.NumberFormat is formatting 1 and -1 the same way.');

			assert.strictEqual(formatter.format(-0),formatter.format(0),
			    'Intl.NumberFormat is formatting signed zeros differently.');
			
		},
		Test_11_3_2_FN_2 : function() {
			/**
			 * @description Tests that Intl.NumberFormat.prototype.format
			 * handles NaN, Infinity, and -Infinity properly.
			 * @author: Roozbeh Pournader
			 */

			// FIXME: We are only listing Numeric_Type=Decimal. May need to add more
			// when the spec clarifies. Current as of Unicode 6.1.
			var hasUnicodeDigits = new RegExp('.*([' +
			    '0-9\u0660-\u0669\u06F0-\u06F9\u07C0-\u07C9\u0966-\u096F' +
			    '\u09E6-\u09EF\u0A66-\u0A6F\u0AE6-\u0AEF\u0B66-\u0B6F\u0BE6-\u0BEF' +
			    '\u0C66-\u0C6F\u0CE6-\u0CEF\u0D66-\u0D6F\u0E50-\u0E59\u0ED0-\u0ED9' +
			    '\u0F20-\u0F29\u1040-\u1049\u1090-\u1099\u17E0-\u17E9\u1810-\u1819' +
			    '\u1946-\u194F\u19D0-\u19D9\u1A80-\u1A89\u1A90-\u1A99\u1B50-\u1B59' +
			    '\u1BB0-\u1BB9\u1C40-\u1C49\u1C50-\u1C59\uA620-\uA629\uA8D0-\uA8D9' +
			    '\uA900-\uA909\uA9D0-\uA9D9\uAA50-\uAA59\uABF0-\uABF9\uFF10-\uFF19' +
			    ']|' +
			    '\uD801[\uDCA0-\uDCA9]|' +
			    '\uD804[\uDC66-\uDC6F\uDCF0-\uDCF9\uDD36-\uDD3F\uDDD0-\uDDD9]|' +
			    '\uD805[\uDEC0-\uDEC9]|' +
			    '\uD835[\uDFCE-\uDFFF])');

			var formatter = new Intl.NumberFormat();
			var formattedNaN = formatter.format(NaN);
			var formattedInfinity = formatter.format(Infinity);
			var formattedNegativeInfinity = formatter.format(-Infinity);

			assert.notStrictEqual(formattedNaN,formattedInfinity,
			    'Intl.NumberFormat formats NaN and Infinity the ' +
			        'same way.');

			assert.notStrictEqual(formattedNaN,formattedNegativeInfinity,
			    'Intl.NumberFormat formats NaN and negative ' +
			        'Infinity the same way.');

			assert.notStrictEqual(formattedInfinity,formattedNegativeInfinity,
			    'Intl.NumberFormat formats Infinity and ' +
			        'negative Infinity the same way.');

			assert.isFalse(hasUnicodeDigits.test(formattedNaN),
			    'Intl.NumberFormat formats NaN using a digit.');

			assert.isFalse(hasUnicodeDigits.test(formattedInfinity),
			    'Intl.NumberFormat formats Infinity using a ' +
			        'digit.');

			assert.isFalse(hasUnicodeDigits.test(formattedNegativeInfinity),
			    'Intl.NumberFormat formats negative Infinity ' + 
			        'using a digit.');
		},
		Test_11_3_2_FN_3_b : function() {
			/**
			 * @description Tests that Intl.NumberFormat.prototype.format
			 * formats percent values properly.
			 * @author: Roozbeh Pournader
			 */

			var numberFormatter = new Intl.NumberFormat();
			var percentFormatter = new Intl.NumberFormat(undefined, {style: 'percent'});

			var formattedTwenty = numberFormatter.format(20);
			var formattedTwentyPercent = percentFormatter.format(0.20);

			// FIXME: May not work for some theoretical locales where percents and
			// normal numbers are formatted using different numbering systems.
			assert.notStrictEqual(formattedTwentyPercent.indexOf(formattedTwenty),-1,
			    "Intl.NumberFormat's formatting of 20% does not include a " +
			        "formatting of 20 as a substring.");

			// FIXME: Move this to somewhere appropriate
			assert.notStrictEqual(percentFormatter.format(0.011),percentFormatter.format(0.02),
			    'Intl.NumberFormat is formatting 1.1% and 2% the same way.');
		},
		// Test 11_3_2_FN_3_e omitted here because it is unfinished in the original test suite
		// and doesn't test anything.
		Test_11_3_2_L15 : function() {
			/**
			 * @description Tests that the getter for Intl.NumberFormat.prototype.format
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Object.getOwnPropertyDescriptor(Intl.NumberFormat.prototype, "format").get , true, false, [], 0);
		},
		Test_11_3_2_TRF : function() {
			/**
			 * @description Tests that the digits are determined correctly when specifying pre/post decimal digits.
			 * @author Norbert Lindenberg
			 */
			var locales = [
			    new Intl.NumberFormat().resolvedOptions().locale,
			    "ar", "de", "th", "ja"
			];
			var numberingSystems = [
			    "arab",
			    "latn",
			    "thai",
			    "hanidec"
			];
			var testData = {
			    "0": "000.0",
			    "-0": "000.0",
			    "123": "123.0",
			    "-123": "-123.0",
			    "12345": "12345.0",
			    "-12345": "-12345.0",
			    "123.45": "123.45",
			    "-123.45": "-123.45",
			    "123.444499": "123.444",
			    "-123.444499": "-123.444",
			    "123.444500": "123.445",
			    "-123.444500": "-123.445",
			    "123.44501": "123.445",
			    "-123.44501": "-123.445",
			    "0.001234": "000.001",
			    "-0.001234": "-000.001",
			    "0.00000000123": "000.0",
			    "-0.00000000123": "-000.0",
			    "0.00000000000000000000000000000123": "000.0",
			    "-0.00000000000000000000000000000123": "-000.0",
			    "1.2": "001.2",
			    "-1.2": "-001.2",
			    "0.0000000012344501": "000.0",
			    "-0.0000000012344501": "-000.0",
			    "123445.01": "123445.01",
			    "-123445.01": "-123445.01",
			    "12344501000000000000000000000000000": "12344501000000000000000000000000000.0",
			    "-12344501000000000000000000000000000": "-12344501000000000000000000000000000.0"
			};

			testIntl.testNumberFormat(locales, numberingSystems,
			    {useGrouping: false, minimumIntegerDigits: 3, minimumFractionDigits: 1, maximumFractionDigits: 3},
			    testData);

		},
		Test_11_3_2_TRP : function() {
			/**
			 * @description Tests that the digits are determined correctly when specifying significant digits.
			 * @author Norbert Lindenberg
			 */
			var locales = [
			    new Intl.NumberFormat().resolvedOptions().locale,
			    "ar", "de", "th", "ja"
			];
			var numberingSystems = [
			    "arab",
			    "latn",
			    "thai",
			    "hanidec"
			];
			var testData = {
			    "0": "0.00",
			    "-0": "0.00",
			    "123": "123",
			    "-123": "-123",
			    "12345": "12345",
			    "-12345": "-12345",
			    "123.45": "123.45",
			    "-123.45": "-123.45",
			    "123.44499": "123.44",
			    "-123.44499": "-123.44",
			    "123.44500": "123.45",
			    "-123.44500": "-123.45",
			    "123.44501": "123.45",
			    "-123.44501": "-123.45",
			    "0.001234": "0.001234",
			    "-0.001234": "-0.001234",
			    "0.00000000123": "0.00000000123",
			    "-0.00000000123": "-0.00000000123",
			    "0.00000000000000000000000000000123": "0.00000000000000000000000000000123",
			    "-0.00000000000000000000000000000123": "-0.00000000000000000000000000000123",
			    "1.2": "1.20",
			    "-1.2": "-1.20",
			    "0.0000000012344501": "0.0000000012345",
			    "-0.0000000012344501": "-0.0000000012345",
			    "123445.01": "123450",
			    "-123445.01": "-123450",
			    "12344501000000000000000000000000000": "12345000000000000000000000000000000",
			    "-12344501000000000000000000000000000": "-12345000000000000000000000000000000"
			};

			testIntl.testNumberFormat(locales, numberingSystems,
			    {useGrouping: false, minimumSignificantDigits: 3, maximumSignificantDigits: 5},
			    testData);
		},
		Test_11_3_3_L15 : function() {
			/**
			 * @description Tests that Intl.NumberFormat.prototype.resolvedOptions
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Intl.NumberFormat.prototype.resolvedOptions, true, false, [], 0);
		},
		Test_11_3_3 : function() {
			/**
			 * @description Tests that the object returned by Intl.NumberFormat.prototype.resolvedOptions
			 *     has the right properties.
			 * @author Norbert Lindenberg
			 */
			var actual = new Intl.NumberFormat().resolvedOptions();

			var actual2 = new Intl.NumberFormat().resolvedOptions();
			assert.notStrictEqual(actual2,actual,
			    "resolvedOptions returned the same object twice.");

			// this assumes the default values where the specification provides them
			testIntl.mustHaveProperty(actual, "locale", testIntl.isCanonicalizedStructurallyValidLanguageTag);
			testIntl.mustHaveProperty(actual, "numberingSystem", testIntl.isValidNumberingSystem);
			testIntl.mustHaveProperty(actual, "style", ["decimal"]);
			testIntl.mustNotHaveProperty(actual, "currency");
			testIntl.mustNotHaveProperty(actual, "currencyDisplay");
			testIntl.mustHaveProperty(actual, "minimumIntegerDigits", [1]);
			testIntl.mustHaveProperty(actual, "minimumFractionDigits", [0]);
			testIntl.mustHaveProperty(actual, "maximumFractionDigits", [3]);
			testIntl.mustNotHaveProperty(actual, "minimumSignificantDigits");
			testIntl.mustNotHaveProperty(actual, "maximumSignificantDigits");
			testIntl.mustHaveProperty(actual, "useGrouping", [true]);

		}
	});
});