// Copyright 2012 Mozilla Corporation. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/**
 * @description Tests that structurally valid language tags are accepted.
 * @author Norbert Lindenberg
 */
define(
	[ 'intern!object', 'intern/chai!assert', 'ecma402/Intl', 'ecma402/tests/intl402/harness/testIntl' ], function(registerSuite, assert, Intl, testIntl) {
	registerSuite({
		name : '6.2',
		Test_6_2_2_a : function() {
			var validLanguageTags =
				[ 
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
				"aa-a-foo-x-a-foo-bar", // variant subtags can also be used as private use subtags
				"x-en-US-12345", // anything goes in private use tags
				"x-12345-12345-en-US", "x-en-US-12345-12345", "x-en-u-foo", "x-en-u-foo-u-bar" ];
			testIntl.testWithIntlConstructors(function(Constructor) {
				validLanguageTags.forEach(function(tag) {
					var error;
					try{
						// this must not throw an exception for a valid language tag
						var obj = new Constructor(
							[ tag ].toString());
					}catch(e){
						error = e;
					}
					assert.isUndefined(error, "Valid language tag "+tag+" should not have been rejected.");
				});
				return true;
			});
		},
		Test_6_2_2_b : function() {
			var invalidLanguageTags =
				[
					"de_DE",
					"DE_de",
					"cmn_Hans",
					"cmn-hans_cn",
					"es_419",
					"es-419-u-nu-latn-cu_bob",
					"i_klingon",
					"cmn-hans-cn-t-ca-u-ca-x_t-u",
					"enochian_enochian",
					"de-gregory_u-ca-gregory" ];

			testIntl.testWithIntlConstructors(function(Constructor) {
				invalidLanguageTags.forEach(function(tag) {
					var error;
					try{
						// this must throw an exception for an invalid language tag
						var obj = new Constructor(
							[ tag ]);
					}catch(e){
						error = e;
					}
					assert.isDefined(error, "Invalid language tag "+tag+" was not rejected.");
					assert.strictEqual(error.name, "RangeError", "Invalid language tag "+tag+" was rejected with wrong error "+error.name+".");
				});
				return true;
			});

		},
		Test_6_2_2_c : function() {
			var invalidLanguageTags =
				[ "", // empty tag
				"i", // singleton alone
				"x", // private use without subtag
				"u", // extension singleton in first place
				"419", // region code in first place
				"u-nu-latn-cu-bob", // extension sequence without language
				"hans-cmn-cn", // "hans" could theoretically be a 4-letter language code,
				// but those can't be followed by extlang codes.
				"cmn-hans-cn-u-u", // duplicate singleton
				"cmn-hans-cn-t-u-ca-u", // duplicate singleton
				"de-gregory-gregory", // duplicate variant
				"*", // language range
				"de-*", // language range
				"中文", // non-ASCII letters
				"en-ß", // non-ASCII letters
				"ıd" // non-ASCII letters
				];

			testIntl.testWithIntlConstructors(function(Constructor) {
				invalidLanguageTags.forEach(function(tag) {
					var error;
					try{
						// this must throw an exception for an invalid language tag
						var obj = new Constructor(
							[ tag ]);
					}catch(e){
						error = e;
					}
					assert.isDefined(error, "Invalid language tag "+tag+" was not rejected.");
					assert.strictEqual(error.name, "RangeError", "Invalid language tag "+tag+" was rejected with wrong error "+error.name+".");
				});
				return true;
			});
		},
		 Test_6_2_3 : function() {
		 var canonicalizedTags = {
		 "de": ["de"],
		 "de-DE": ["de-DE", "de"],
		 "DE-de": ["de-DE", "de"],
		 "cmn": [ "cmn"],
		 "CMN-hANS": [ "cmn-Hans", "cmn" ],
		 "cmn-hans-cn": [ "cmn-Hans-CN", "cmn-Hans", "cmn"],
		 "es-419": ["es-419", "es"],
		 "es-419-u-nu-latn": ["es-419-u-nu-latn", "es-419", "es", "es-u-nu-latn"],
		 // -u-ca is incomplete, so it will not show up in resolvedOptions().locale
		 "cmn-hans-cn-u-ca-t-ca-x-t-u": [ "cmn-Hans-CN-t-ca-u-ca-x-t-u", "cmn-Hans-CN-t-ca-x-t-u", "cmn-Hans-CN-t-ca-x-t", "cmn-Hans-CN-t-ca", "cmn-Hans-CN", "cmn-Hans", "cmn"],
		 "enochian-enochian": ["enochian-enochian", "enochian"],
		 "de-gregory-u-ca-gregory": ["de-gregory-u-ca-gregory", "de-gregory", "de-u-ca-gregory", "de"],
		 "no-nyn": ["nn"],
		 "i-klingon": ["tlh"],
		 "sgn-GR": ["gss"],
		 "ji": ["yi"],
		 "de-DD": ["de-DE", "de"],
		 "zh-hak-CN": ["hak-CN", "hak"],
		 "sgn-ils": ["ils"],
		 "in": ["id"],
		 "x-foo": ["x-foo"]
		 };

		 // make sure the data above is correct
			Object.getOwnPropertyNames(canonicalizedTags).forEach(
				function(tag) {
					canonicalizedTags[tag]
						.forEach(function(canonicalTag) {
							assert.isTrue(testIntl.isCanonicalizedStructurallyValidLanguageTag(canonicalTag),
								"Test data \""+canonicalTag
									+"\" is not canonicalized and structurally valid language tag.");
						});
				});

			// now the actual test
			testIntl.testWithIntlConstructors(function(Constructor) {
				var resolvedOptions = new Constructor().resolvedOptions();
				var defaultLocale = new Constructor().resolvedOptions().locale;
				Object.getOwnPropertyNames(canonicalizedTags).forEach(function(tag) {
					// use lookup locale matcher to keep the set of possible return values predictable

					// Variant 1: construct an object and see whether its locale is canonicalized.
					// In this variant, shortened forms or the default locale may be returned
					var object = new Constructor(
						[ tag ], {
						localeMatcher : "lookup"
					});
					var locale = object.resolvedOptions().locale;
					assert(!(canonicalizedTags[tag].indexOf(locale)===-1&&locale!==defaultLocale),
						"For "+tag+" got "+locale+"; expected one of "+canonicalizedTags[tag].join(", ")+".");
					
					// Variant 2: get the supported locales. If the tag is supported, it should be returned canonicalized but unshortened
					var supported = Constructor.supportedLocalesOf([ tag ]);
					assert(!(supported[length]>0&&supported[0]!==canonicalizedTags[tag][0]),
						"For "+tag+" got "+supported[0]+"; expected "+canonicalizedTags[tag][0]+".");
				});
			});
		},
		Test_6_2_4 : function() {
			testIntl.testWithIntlConstructors(function (Constructor) {
			    var defaultLocale = new Constructor().resolvedOptions().locale;
			    assert.isTrue(testIntl.isCanonicalizedStructurallyValidLanguageTag(defaultLocale),
			    	"Default locale \"" + defaultLocale + "\" is not canonicalized and structurally valid language tag.");
			});
		}
	});
});