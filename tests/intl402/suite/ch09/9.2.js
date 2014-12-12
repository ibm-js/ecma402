// Copyright 2012 Mozilla Corporation. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
define(
	[ 'intern!object', 'intern/chai!assert', 'ecma402/Intl', 'ecma402/tests/intl402/harness/testIntl' ], function(registerSuite, assert, Intl, testIntl) {
	registerSuite({
		name : '9.2',
		Test_9_2_1_1 : function() {
			/**
			 * @description Tests that canonicalization of locale lists treats undefined and empty lists the same.
			 * @author Norbert Lindenberg
			 */
			testIntl.testWithIntlConstructors(function (Constructor) {
			    var supportedForUndefined = Constructor.supportedLocalesOf(undefined);
			    var supportedForEmptyList = Constructor.supportedLocalesOf([]);
			    assert.strictEqual(supportedForUndefined.length,supportedForEmptyList.length,"Supported locales differ between undefined and empty list input.");
			    // we don't compare the elements because length should be 0 - let's just verify that
			    assert.strictEqual(supportedForUndefined.length,0,"Internal test error: Assumption about length being 0 is invalid.");
			});
		},
		Test_9_2_1_2 : function() {
			/**
			 * @description Tests that the behavior of a List is not affected by adversarial
			 *     changes to Array.prototype.
			 * @author Norbert Lindenberg
			 */
			// TODO: Deal with this properly...!  Not certain how critical this is for us (JCE).
			//testIntl.taintArray();
			//assert(false,"fix this testcase...");
			testIntl.testWithIntlConstructors(function (Constructor) {
			    var defaultLocale = new Constructor().resolvedOptions().locale;
			    var canonicalized = Constructor.supportedLocalesOf([defaultLocale, defaultLocale]);
			    assert(canonicalized.length<=1,"Canonicalization didn't remove duplicate language tags from locale list.");
			});
			//testIntl.untaintArray();
		},
		Test_9_2_1_3 : function() {
			/**
			 * @description Tests that a single string instead of a locale list is treated
			 *     as the locale list containing that string.
			 * @author Norbert Lindenberg
			 */
			var validAndInvalidLanguageTags = [
			    "de", // ISO 639 language code
			    "de-DE", // + ISO 3166-1 country code
			    "DE-de", // tags are case-insensitive
			    "cmn", // ISO 639 language code
			    "cmn-Hans", // + script code
			    "CMN-hANS", // tags are case-insensitive
			    "cmn-hans-cn", // + ISO 3166-1 country code
			    "es-419", // + UN M.49 region code
			    "es-419-u-nu-latn-cu-bob", // + Unicode locale extension sequence
			    "i-klingon", // grandfathered tag
			    "cmn-hans-cn-t-ca-u-ca-x-t-u", // singleton subtags can also be used as private use subtags
			    "enochian-enochian", // language and variant subtags may be the same
			    "de-gregory-u-ca-gregory", // variant and extension subtags may be the same
			    "de_DE",
			    "DE_de",
			    "cmn_Hans",
			    "cmn-hans_cn",
			    "es_419",
			    "es-419-u-nu-latn-cu_bob",
			    "i_klingon",
			    "cmn-hans-cn-t-ca-u-ca-x_t-u",
			    "enochian_enochian",
			    "de-gregory_u-ca-gregory",
			    "i", // singleton alone
			    "x", // private use without subtag
			    "u", // extension singleton in first place
			    "419", // region code in first place
			    "u-nu-latn-cu-bob", // extension sequence without language
			    "hans-cmn-cn", // "hans" could theoretically be a 4-letter language code,
			                   // but those can't be followed by extlang codes.
			    "cmn-hans-cn-u-u", // duplicate singleton
			    "cmn-hans-cn-t-u-ca-u", // duplicate singleton
			    "de-gregory-gregory" // duplicate variant
			];

			testIntl.testWithIntlConstructors(function (Constructor) {
			    validAndInvalidLanguageTags.forEach(function (locale) {
			        var obj1, obj2, locale1, locale2, error1, error2;
			        try {
			            obj1 = new Constructor(locale);
			            locale1 = obj1.resolvedOptions().locale;
			        } catch (e) {
			            error1 = e;
			        }
			        try {
			            obj2 = new Constructor([locale]);
			            locale2 = obj2.resolvedOptions().locale;
			        } catch (e) {
			            error2 = e;
			        }

			        if ((error1 === undefined) !== (error2 === undefined)) {
			            assert.isUndefined(error1,"Single locale string " + locale +
			                    " was accepted, but locale list containing that string wasn't.");
			            assert(false,"Single locale string " + locale +
			                    " was rejected, but locale list containing that string wasn't.");
			        } else if (error1 === undefined) {
			             assert.strictEqual(locale1,locale2,"Single locale string " + locale + " results in " + locale1 +
			                    ", but locale list [" + locale + "] results in " + locale2 + ".");
			        } else {
			            assert.strictEqual(error1.name,error2.name,
			                "Single locale string " + locale + " results in error " + error1.name +
			                    ", but locale list [" + locale + "] results in error " + error2.name + ".");
			        }
			    });
			});
		},
		Test_9_2_1_4 : function() {
			/**
			 * @description Tests that non-objects are converted to objects before canonicalization.
			 * @author Norbert Lindenberg
			 */
			testIntl.testWithIntlConstructors(function (Constructor) {
				    // undefined is handled separately
				    
				    // null should result in a TypeError
				    var error;
				    try {
				        var supportedForNull = Constructor.supportedLocalesOf(null);
				    } catch (e) {
				        error = e;
				    }
				    assert.isDefined(error,"Null as locale list was not rejected.");
				    assert.strictEqual(error.name,"TypeError",
			        "Null as locale list was rejected with wrong error " + error.name + ".");
			    
			    // let's use an empty list for comparison
			    var supportedForEmptyList = Constructor.supportedLocalesOf([]);
			    // we don't compare the elements because length should be 0 - let's just verify that
			    assert.strictEqual(supportedForEmptyList.length,0,
			    	"Internal test error: Assumption about length being 0 is invalid.");

			    // most non-objects will be interpreted as empty lists because a missing length property is interpreted as 0
			    var supportedForNumber = Constructor.supportedLocalesOf(5);
			    assert.strictEqual(supportedForNumber.length,supportedForEmptyList.length,
			        "Supported locales differ between numeric and empty list input.");
			    var supportedForBoolean = Constructor.supportedLocalesOf(true);
			    assert.strictEqual(supportedForBoolean.length,supportedForEmptyList.length,
			        "Supported locales differ between boolean and empty list input.");
			});
		},
		Test_9_2_1_8_c_ii : function() {
			/**
			 * @description Tests that values other than strings are not accepted as locales.
			 * @author Norbert Lindenberg
			 */
			var notStringOrObject = [undefined, null, true, false, 0, 5, -5, NaN];

			testIntl.testWithIntlConstructors(function (Constructor) {
			    notStringOrObject.forEach(function (value) {
			        var error;
			        try {
			            var supported = Constructor.supportedLocalesOf([value]);
			        } catch (e) {
			            error = e;
			        }
			        assert.isDefined(error,value + " as locale was not rejected.");
			        assert.strictEqual(error.name,"TypeError",value + " as locale was rejected with wrong error " + error.name + ".");
			    });
			});
		},
		Test_9_2_1_8_c_vi : function() {
			/**
			 * @description Tests that canonicalization of locale lists removes duplicate language tags.
			 * @author Norbert Lindenberg
			 */
			testIntl.testWithIntlConstructors(function (Constructor) {
			    var defaultLocale = new Constructor().resolvedOptions().locale;
			    var canonicalized = Constructor.supportedLocalesOf([defaultLocale, defaultLocale]);
			    assert(canonicalized.length <= 1,
			        "Canonicalization didn't remove duplicate language tags from locale list.");
			});
		},
		Test_9_2_2 : function() {
			/**
			 * @description Tests that locales that are reported by resolvedOptions
			 *     are also reported by supportedLocalesOf.
			 * @author Norbert Lindenberg
			 */
			testIntl.testWithIntlConstructors(function (Constructor) {
			    var info = testIntl.getLocaleSupportInfo(Constructor);
			    // this test should work equally for both matching algorithms
			    ["lookup", "best fit"].forEach(function (matcher) {
			        var supportedByConstructor = info.supported; //.concat(info.byFallback);
			        var supported = Constructor.supportedLocalesOf(supportedByConstructor,
			            {localeMatcher: matcher});
			        // we could check the length first, but it's probably more interesting which locales are missing
			        var i = 0;
			        var limit = Math.min(supportedByConstructor.length, supported.length);
			        while (i < limit && supportedByConstructor[i] === supported[i]) {
			            i++;
			        }
			        assert(i >= supportedByConstructor.length,
			            "Locale " + supportedByConstructor[i] +
			                " is returned by resolvedOptions but not by supportedLocalesOf.");
			        assert(i >= supported.length,
			        	"Locale " + supported[i] + " is returned by supportedLocalesOf but not by resolvedOptions.");
			    });
			    
			    // this test is only valid for lookup - best fit may find additional locales supported
			    var unsupportedByConstructor = info.unsupported;
			    var supported = Constructor.supportedLocalesOf(unsupportedByConstructor,
			            {localeMatcher: "lookup"});
			    assert(supported.length <= 0,"Locale " + supported[0] +
			            " is returned by supportedLocalesOf but not by resolvedOptions.");
			});
		},
		Test_9_2_3_5 : function() {
			/**
			 * @description Tests that the behavior of a Record is not affected by adversarial
			 *     changes to Object.prototype.
			 * @author Norbert Lindenberg
			 */
			testIntl.taintProperties(["locale", "extension", "extensionIndex"]);

			testIntl.testWithIntlConstructors(function (Constructor) {
			    var locale = new Constructor(undefined, {localeMatcher: "lookup"}).resolvedOptions().locale;
			    assert(testIntl.isCanonicalizedStructurallyValidLanguageTag(locale),
			        "Constructor returns invalid locale " + locale + ".");
			});
			testIntl.untaintProperties(["locale", "extension", "extensionIndex"]);
		},
		Test_9_2_5_6 : function() {
			/**
			 * @description Tests that the behavior of a Record is not affected by adversarial
			 *     changes to Object.prototype.
			 * @author Norbert Lindenberg
			 */
			testIntl.taintProperties(["dataLocale", "nu", "ca", "co", "locale"]);

			testIntl.testWithIntlConstructors(function (Constructor) {
			    var locale = new Constructor(undefined, {localeMatcher: "lookup"}).resolvedOptions().locale;
			    assert(testIntl.isCanonicalizedStructurallyValidLanguageTag(locale),
			        "Constructor returns invalid locale " + locale + ".");
			});
			testIntl.untaintProperties(["dataLocale", "nu", "ca", "co", "locale"]);

		},
		Test_9_2_6_2 : function() {
			/**
			 * @description Tests that the behavior of a List is not affected by adversarial
			 *     changes to Array.prototype.
			 * @author Norbert Lindenberg
			 */
			//assert(false," fix this testcase...");
			// TODO: Deal with this properly...!  Not certain how critical this is for us (JCE).
			// testIntl.taintArray();
			testIntl.testWithIntlConstructors(function (Constructor) {
			    // this test should work equally for both matching algorithms
			    ["lookup", "best fit"].forEach(function (matcher) {
			        var defaultLocale = new Constructor().resolvedOptions().locale;
			        var canonicalized = Constructor.supportedLocalesOf([defaultLocale, defaultLocale],
			            {localeMatcher: matcher});
			        assert(canonicalized.length <= 1,
			            "Canonicalization with matcher " + matcher + " didn't remove duplicate language tags from locale list.");
			    });
			});
			// testIntl.untaintArray();
		},
		Test_9_2_6_4 : function() {
			/**
			 * @description Tests that LookupSupportedLocales returns an empty list when
			 *     given an empty list.
			 * @author Norbert Lindenberg
			 */
			testIntl.testWithIntlConstructors(function (Constructor) {
			    // this test should work equally for both matching algorithms
			    ["lookup", "best fit"].forEach(function (matcher) {
			        var supported = Constructor.supportedLocalesOf([], {localeMatcher: matcher});
			        assert.strictEqual(supported.length,0,
			            "SupportedLocales with matcher " + matcher + " returned a non-empty list for an empty list.");
			    });
			});
		},
		Test_9_2_6_4_b : function() {
			/**
			 * @description Tests that Unicode locale extension sequences do not affect
			 *    whether a locale is considered supported, but are reported back.
			 * @author Norbert Lindenberg
			 */
			testIntl.testWithIntlConstructors(function (Constructor) {
			    // this test should work equally for both matching algorithms
			    ["lookup", "best fit"].forEach(function (matcher) {
			        var info = testIntl.getLocaleSupportInfo(Constructor);
			        var allLocales = info.supported.concat(info.byFallback, info.unsupported);
			        allLocales.forEach(function (locale) {
			            var validExtension = "-u-co-phonebk-nu-latn";
			            var invalidExtension = "-u-nu-invalid";
			            var supported1 = Constructor.supportedLocalesOf([locale],
			                {localeMatcher: matcher});
			            var supported2 = Constructor.supportedLocalesOf([locale + validExtension],
			                {localeMatcher: matcher});
			            var supported3 = Constructor.supportedLocalesOf([locale + invalidExtension],
			                {localeMatcher: matcher});
			            if (supported1.length === 1) {
			                assert(supported2.length === 1 && supported3.length === 1,
			                    "Presence of Unicode locale extension sequence affects whether locale " +
			                        locale + " is considered supported with matcher " + matcher + ".");
			                assert(supported2[0] === locale + validExtension && supported3[0] === locale + invalidExtension,
			                    "Unicode locale extension sequence is not correctly returned for locale " +
			                        locale + " with matcher " + matcher + ".");
			            } else {
			                assert(supported2.length === 0 && supported3.length === 0,
			                    "Presence of Unicode locale extension sequence affects whether locale " +
			                        locale + " is considered supported with matcher " + matcher + ".");
			            }
			        });
			    });
			});
		},
		Test_9_2_6_4_c : function() {
			/**
			 * @description Tests that LookupSupportedLocales includes the default locale
			 *     and doesn't include the "no linguistic content" locale.
			 * @author Norbert Lindenberg
			 */
			testIntl.testWithIntlConstructors(function (Constructor) {
			    // this test should work equally for both matching algorithms
			    ["lookup", "best fit"].forEach(function (matcher) {
			        var defaultLocale = new Constructor().resolvedOptions().locale;
			        var noLinguisticContent = "zxx";
			        var supported = Constructor.supportedLocalesOf([defaultLocale, noLinguisticContent],
			            {localeMatcher: matcher});
			        assert.notStrictEqual(supported.indexOf(defaultLocale),-1,
			            "SupportedLocales didn't return default locale with matcher " + matcher + ".");
			        assert.strictEqual(supported.indexOf(noLinguisticContent),-1,
			            "SupportedLocales returned the \"no linguistic content\" locale with matcher " + matcher + ".");
			        assert(supported.length <= 1,
			            "SupportedLocales returned stray locales: " + supported.join(", ") + " with matcher " + matcher + ".");
			    });
			});
		},
		Test_9_2_8_1_c : function() {
			/**
			 * @description Tests that the option localeMatcher is processed correctly.
			 * @author Norbert Lindenberg
			 */
			testIntl.testWithIntlConstructors(function (Constructor) {
			    var defaultLocale = new Constructor().resolvedOptions().locale;
			    
			    var validValues = [undefined, "lookup", "best fit", {toString: function () { return "lookup"; }}];
			    validValues.forEach(function (value) {
			        var supported = Constructor.supportedLocalesOf([defaultLocale], {localeMatcher: value});
			    });
			    
			    var invalidValues = [null, 0, 5, NaN, true, false, "invalid"];
			    invalidValues.forEach(function (value) {
			        var error;
			        try {
			            var supported = Constructor.supportedLocalesOf([defaultLocale], {localeMatcher: value});
			        } catch (e) {
			            error = e;
			        }
			        assert.isDefined(error,
			            "Invalid localeMatcher value " + value + " was not rejected.");
			        assert.strictEqual(error.name,"RangeError",
			            "Invalid localeMatcher value " + value + " was rejected with wrong error " + error.name + ".");
			    });
			});
		},
		Test_9_2_8_4 : function() {
			/**
			 * @description Tests that the array returned by SupportedLocales is extensible,
			 *     but its properties are non-writable/non-configurable.
			 * @author Norbert Lindenberg
			 */
			function testFrozenProperty(obj, property) {
			    var desc = Object.getOwnPropertyDescriptor(obj, property);
			    assert.isFalse(desc.writable,
			        "Property " + property + " of object returned by SupportedLocales is writable.");
			    assert.isFalse(desc.configurable,
			        "Property " + property + " of object returned by SupportedLocales is configurable.");
			}

			testIntl.testWithIntlConstructors(function (Constructor) {
			    var defaultLocale = new Constructor().resolvedOptions().locale;
			    var supported = Constructor.supportedLocalesOf([defaultLocale]);
			    assert(Object.isExtensible(supported),
			    	"Object returned by SupportedLocales is not extensible.");
			    for (var i = 0; i < supported.length; i++) {
			        testFrozenProperty(supported, i);
			    }
			    testFrozenProperty(supported, "length");
			});
		}
	});
});