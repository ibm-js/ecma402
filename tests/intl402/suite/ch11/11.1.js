// Copyright 2012 Mozilla Corporation. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
define(
	[ 'intern!object', 'intern/chai!assert', 'ecma402/Intl', 'ecma402/tests/intl402/harness/testIntl', 'ecma402/tests/intl402/harness/testBuiltInObject' ], 
	function(registerSuite, assert, Intl, testIntl, testBuiltInObject) {
	registerSuite({
		name : '11.1',
		Test_11_1_L15 : function() {
			/**
			 * @description Tests that Intl.NumberFormat
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Intl.NumberFormat, true, true, ["supportedLocalesOf"], 0);
		},
		Test_11_1_1_1 : function() {
			/**
			 * @description Tests that an object can't be re-initialized as a NumberFormat.
			 * @author Norbert Lindenberg
			 */
			testIntl.testWithIntlConstructors(function (Constructor) {
			    var obj, error;
			    
			    // variant 1: use constructor in a "new" expression
			    obj = new Constructor();
			    try {
			        Intl.NumberFormat.call(obj);
			    } catch (e) {
			        error = e;
			    }
			    assert.isDefined(error,"Re-initializing object created with \"new\" as NumberFormat was not rejected.");
			    assert.strictEqual(error.name,"TypeError","Re-initializing object created with \"new\" as NumberFormat was rejected with wrong error " + error.name + ".");
			    
			    // variant 2: use constructor as a function
			    obj = Constructor.call({});
			    error = undefined;
			    try {
			        Intl.NumberFormat.call(obj);
			    } catch (e) {
			        error = e;
			    }
			    assert.isDefined(error,"Re-initializing object created with constructor as function as NumberFormat was not rejected.");
			    assert.strictEqual(error.name,"TypeError","Re-initializing object created with constructor as function as NumberFormat was rejected with wrong error " + error.name + ".");
			});
		},
		Test_11_1_1_6 : function() {
			/**
			 * @description Tests that the behavior of a Record is not affected by adversarial
			 *     changes to Object.prototype.
			 * @author Norbert Lindenberg
			 */
			testIntl.taintProperties(["localeMatcher"]);

			var locale = new Intl.NumberFormat(undefined, {localeMatcher: "lookup"}).resolvedOptions().locale;
			assert(testIntl.isCanonicalizedStructurallyValidLanguageTag(locale),
			    "NumberFormat returns invalid locale " + locale + ".");
			
			testIntl.untaintProperties(["localeMatcher"]);
		},
		Test_11_1_1_15 : function() {
			/**
			 * @description Tests that the option style is processed correctly.
			 * @author Norbert Lindenberg
			 */
			testIntl.testOption(Intl.NumberFormat, "style", "string", ["decimal", "percent", "currency"], "decimal",
			        {extra: {"currency": {currency: "CNY"}}});

		},
		Test_11_1_1_17 : function() {
			/**
			 * @description Tests that the option currency is processed correctly.
			 * @author Norbert Lindenberg
			 */

			var validValues = ["CNY", "USD", "EUR", "IDR", "jpy", {toString: function () {return "INR";}}];
			var invalidValues = ["$", "SFr.", "US$", "ßP", {toString: function () {return;}}];

			var defaultLocale = new Intl.NumberFormat().resolvedOptions().locale;

			validValues.forEach(function (value) {
			    var format, actual, expected;

			    // with currency style, we should get the upper case form back
			    format = new Intl.NumberFormat([defaultLocale], {style: "currency", currency: value});
			    actual = format.resolvedOptions().currency;
			    expected = value.toString().toUpperCase();
			    assert.strictEqual(actual,expected,
			        "Incorrect resolved currency with currency style - expected " +
			            expected + "; got " + actual + ".");
			    
			    // without currency style, we shouldn't get any currency back
			    format = new Intl.NumberFormat([defaultLocale], {currency: value});
			    actual = format.resolvedOptions().currency;
			    expected = undefined;
			    assert.strictEqual(actual,expected,
			        "Incorrect resolved currency with non-currency style - expected " +
			            expected + "; got " + actual + ".");
			    
			    // currencies specified through the locale must be ignored
			    format = new Intl.NumberFormat([defaultLocale + "-u-cu-krw"], {style: "currency", currency: value});
			    actual = format.resolvedOptions().currency;
			    expected = value.toString().toUpperCase();
			    assert.strictEqual(actual,expected,
			        "Incorrect resolved currency with -u-cu- and currency style - expected " +
			            expected + "; got " + actual + ".");
			    
			    format = new Intl.NumberFormat([defaultLocale + "-u-cu-krw"], {currency: value});
			    actual = format.resolvedOptions().currency;
			    expected = undefined;
			    assert.strictEqual(actual,expected,
			        "Incorrect resolved currency with -u-cu- and non-currency style - expected " +
			            expected + "; got " + actual + ".");
			});

			invalidValues.forEach(function (value) {
			    function expectError(f) {
			        var error;
			        try {
			            f();
			        } catch (e) {
			            error = e;
			        }
			        assert.isDefined(error,
			            "Invalid currency value " + value + " was not rejected.");
			        assert.strictEqual(error.name,"RangeError",
			            "Invalid currency value " + value + " was rejected with wrong error " + error.name + ".");
			    }

			    expectError(function () {
			            return new Intl.NumberFormat([defaultLocale], {style: "currency", currency: value});
			    });
			    expectError(function () {
			            return new Intl.NumberFormat([defaultLocale], {currency: value});
			    });
			    expectError(function () {
			            return new Intl.NumberFormat([defaultLocale + "-u-cu-krw"], {style: "currency", currency: value});
			    });
			    expectError(function () {
			            return new Intl.NumberFormat([defaultLocale + "-u-cu-krw"], {currency: value});
			    });
			});
		},
		Test_11_1_1_19 : function() {
			/**
			 * @description Tests that the currency style can not be used without a specified currency.
			 * @author Norbert Lindenberg
			 */

			var defaultLocale = new Intl.NumberFormat().resolvedOptions().locale;

			function expectError(f) {
			    var error = undefined;
			    try {
			        f();
			    } catch (e) {
			        error = e;
			    }
			    assert.isDefined(error,
			        "Using currency style without a specified currency was not rejected.");
			    assert.strictEqual(error.name,"TypeError",
			    	"Using currency style without a specified currency was rejected with wrong error " + error.name + ".");
			}

			expectError(function () {
			        return new Intl.NumberFormat([defaultLocale], {style: "currency"});
			});
			expectError(function () {
			        return new Intl.NumberFormat([defaultLocale + "-u-cu-krw"], {style: "currency"});
			});
		},
		Test_11_1_1_20_c : function() {
			/**
			 * @description Tests that the number of fractional digits is determined correctly for currencies.
			 * @author Norbert Lindenberg
			 */

			// data from CLDR 26 common/supplemental/supplementalData.xml
			var currencyDigits = {
			    AED: 2,
			    AFN: 0,
			    ALL: 0,
			    AMD: 0,
			    ANG: 2,
			    AOA: 2,
			    ARS: 2,
			    AUD: 2,
			    AWG: 2,
			    AZN: 2,
			    BAM: 2,
			    BBD: 2,
			    BDT: 2,
			    BGN: 2,
			    BHD: 3,
			    BIF: 0,
			    BMD: 2,
			    BND: 2,
			    BOB: 2,
			    BOV: 2,
			    BRL: 2,
			    BSD: 2,
			    BTN: 2,
			    BWP: 2,
			    BYR: 0,
			    BZD: 2,
			    CAD: 2,
			    CDF: 2,
			    CHE: 2,
			    CHF: 2,
			    CHW: 2,
			    CLF: 4,
			    CLP: 0,
			    CNY: 2,
			    COP: 0,
			    COU: 2,
			    CRC: 0,
			    CUC: 2,
			    CUP: 2,
			    CVE: 2,
			    CZK: 2,
			    DJF: 0,
			    DKK: 2,
			    DOP: 2,
			    DZD: 2,
			    EGP: 2,
			    ERN: 2,
			    ETB: 2,
			    EUR: 2,
			    FJD: 2,
			    FKP: 2,
			    GBP: 2,
			    GEL: 2,
			    GHS: 2,
			    GIP: 2,
			    GMD: 2,
			    GNF: 0,
			    GTQ: 2,
			    GYD: 0,
			    HKD: 2,
			    HNL: 2,
			    HRK: 2,
			    HTG: 2,
			    HUF: 2,
			    IDR: 0,
			    ILS: 2,
			    INR: 2,
			    IQD: 0,
			    IRR: 0,
			    ISK: 0,
			    JMD: 2,
			    JOD: 3,
			    JPY: 0,
			    KES: 2,
			    KGS: 2,
			    KHR: 2,
			    KMF: 0,
			    KPW: 0,
			    KRW: 0,
			    KWD: 3,
			    KYD: 2,
			    KZT: 2,
			    LAK: 0,
			    LBP: 0,
			    LKR: 2,
			    LRD: 2,
			    LSL: 2,
			    LTL: 2,
			    LVL: 2,
			    LYD: 3,
			    MAD: 2,
			    MDL: 2,
			    MGA: 0,
			    MKD: 2,
			    MMK: 0,
			    MNT: 0,
			    MOP: 2,
			    MRO: 0,
			    MUR: 0,
			    MVR: 2,
			    MWK: 2,
			    MXN: 2,
			    MXV: 2,
			    MYR: 2,
			    MZN: 2,
			    NAD: 2,
			    NGN: 2,
			    NIO: 2,
			    NOK: 2,
			    NPR: 2,
			    NZD: 2,
			    OMR: 3,
			    PAB: 2,
			    PEN: 2,
			    PGK: 2,
			    PHP: 2,
			    PKR: 0,
			    PLN: 2,
			    PYG: 0,
			    QAR: 2,
			    RON: 2,
			    RSD: 0,
			    RUB: 2,
			    RWF: 0,
			    SAR: 2,
			    SBD: 2,
			    SCR: 2,
			    SDG: 2,
			    SEK: 2,
			    SGD: 2,
			    SHP: 2,
			    SLL: 0,
			    SOS: 0,
			    SRD: 2,
			    SSP: 2,
			    STD: 0,
			    SVC: 2,
			    SYP: 0,
			    SZL: 2,
			    THB: 2,
			    TJS: 2,
			    TMT: 2,
			    TND: 3,
			    TOP: 2,
			    TRY: 2,
			    TTD: 2,
			    TWD: 2,
			    TZS: 0,
			    UAH: 2,
			    UGX: 0,
			    USD: 2,
			    USN: 2,
			    USS: 2,
			    UYI: 0,
			    UYU: 2,
			    UZS: 0,
			    VEF: 2,
			    VND: 0,
			    VUV: 0,
			    WST: 2,
			    XAF: 0,
			    XCD: 2,
			    XOF: 0,
			    XPF: 0,
			    YER: 0,
			    ZAR: 2,
			    ZMW: 2,
			    ZWL: 2
			};

			Object.getOwnPropertyNames(currencyDigits).forEach(function (currency) {
			    var digits = currencyDigits[currency];
			    var format = new Intl.NumberFormat([], {style: "currency", currency: currency});
			    var min = format.resolvedOptions().minimumFractionDigits;
			    var max = format.resolvedOptions().maximumFractionDigits;
			    assert.equal(min,digits,
			        "Didn't get correct minimumFractionDigits for currency " +
			            currency + "; expected " + digits + ", got " + min + ".");
			    assert.equal(max,digits,
			        "Didn't get correct maximumFractionDigits for currency " +
			            currency + "; expected " + digits + ", got " + max + ".");
			});

		},
		Test_11_1_1_21 : function() {
			/**
			 * @description Tests that the option currencyDisplay is processed correctly.
			 * @author Norbert Lindenberg
			 */
			testIntl.testOption(Intl.NumberFormat, "currencyDisplay", "string", ["code", "symbol", "name"],
			    "symbol", {extra: {any: {style: "currency", currency: "XDR"}}});
			testIntl.testOption(Intl.NumberFormat, "currencyDisplay", "string", ["code", "symbol", "name"],
			    undefined, {noReturn: true});

		},
		Test_11_1_1_32 : function() {
			/**
			 * @description Tests that the options minimumSignificantDigits and
			 *     maximumSignificantDigits are read in the right sequence.
			 * @author Norbert Lindenberg
			 */

			var read = 0;

			function readMinimumSignificantDigits() {
			    ++read;
			    if (read === 1) {
			        return 0; // invalid value, but on first read that's OK
			    } else if (read === 3) {
			        return 1; // valid value
			    } else {
			        assert(false,"minimumSignificantDigits read out of sequence: " + read + ".");
			    }
			}

			function readMaximumSignificantDigits() {
			    ++read;
			    if (read === 2) {
			        return 0; // invalid value, but on first read that's OK
			    } else if (read === 4) {
			        return 1; // valid value
			    } else {
			    	assert(false,"maximumSignificantDigits read out of sequence: " + read + ".");
			    }
			}

			var options = {};
			Object.defineProperty(options, "minimumSignificantDigits",
			    { get: readMinimumSignificantDigits });
			Object.defineProperty(options, "maximumSignificantDigits",
			    { get: readMaximumSignificantDigits });

			new Intl.NumberFormat("de", options);

			assert.strictEqual(read,4,
				"insuffient number of property reads: " + read + ".");
		},
		Test_11_1_1_34 : function() {
			/**
			 * @description Tests that the option useGrouping is processed correctly.
			 * @author Norbert Lindenberg
			 */
			testIntl.testOption(Intl.NumberFormat, "useGrouping", "boolean", undefined, true);
		},
		Test_11_1_1_7 : function() {
			/**
			 * @description Tests that the option localeMatcher is processed correctly.
			 * @author Norbert Lindenberg
			 */
			testIntl.testOption(Intl.NumberFormat, "localeMatcher", "string", ["lookup", "best fit"], "best fit", {noReturn: true});

		},
		Test_11_1_1_a : function() {
			/**
			 * @description Tests that constructing a NumberFormat doesn't create or modify
			 *     unwanted properties on the RegExp constructor.
			 * @author Norbert Lindenberg
			 */
			//testIntl.testForUnwantedRegExpChanges(function () {
			//    new Intl.NumberFormat("de-DE-u-nu-latn");
			//});

			//testIntl.testForUnwantedRegExpChanges(function () {
			//    new Intl.NumberFormat("de-DE-u-nu-latn", {style: "currency", currency: "EUR"});
			//});
					/*
					 * JCE: After consulting with Norbert, I have come to the conclusion that this test isn't relevant
					 * or desired for our implementation, since making this test pass would basically preclude us from
					 * using RegExp at all. So skipping this test.
					 */
		},
		Test_11_1_2_1_4 : function() {
			/**
			 * @description Tests that for non-object values passed as this to NumberFormat a
			 * wrapper object will be initialized and returned.
			 * @author Norbert Lindenberg
			 */

			var thisValues = [true, 42, "国際化"];

			thisValues.forEach(function (value) {
			    var format = Intl.NumberFormat.call(value);
			    // check that the returned object functions as a number format
			    var referenceFormat = new Intl.NumberFormat();
			    assert.strictEqual(Intl.NumberFormat.prototype.format.call(format, 12.3456),referenceFormat.format(12.3456),
			        "NumberFormat initialized from " + value + " doesn't behave like normal number format.");
			});

		},
		Test_11_1_2 : function() {
			/**
			 * @description Tests that Intl.NumberFormat can be subclassed.
			 * @author Norbert Lindenberg
			 */
			// get a number format and have it format an array of numbers for comparison with the subclass
			var locales = ["tlh", "id", "en"];
			var a = [0, 1, -1, -123456.789, -Infinity, NaN];
			var referenceNumberFormat = new Intl.NumberFormat(locales);
			var referenceFormatted = a.map(referenceNumberFormat.format);

			function MyNumberFormat(locales, options) {
			    Intl.NumberFormat.call(this, locales, options);
			    // could initialize MyNumberFormat properties
			}

			MyNumberFormat.prototype = Object.create(Intl.NumberFormat.prototype);
			MyNumberFormat.prototype.constructor = MyNumberFormat;
			// could add methods to MyNumberFormat.prototype

			var format = new MyNumberFormat(locales);
			var actual = a.map(format.format);
			testIntl.testArraysAreSame(referenceFormatted, actual);

		},
		Test_11_1_3 : function() {
			/**
			 * @description Tests that objects constructed by Intl.NumberFormat have the specified internal properties.
			 * @author Norbert Lindenberg
			 */

			var obj = new Intl.NumberFormat();

			var actualPrototype = Object.getPrototypeOf(obj);
			assert.strictEqual(actualPrototype,Intl.NumberFormat.prototype,
			    "Prototype of object constructed by Intl.NumberFormat isn't Intl.NumberFormat.prototype; got " + actualPrototype);

			assert(Object.isExtensible(obj),
			    "Object constructed by Intl.NumberFormat must be extensible.");
		},

	});
});