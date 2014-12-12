define([ "intern!object", "intern/chai!assert", "ecma402/Intl" ], function (registerSuite, assert, Intl) {
	registerSuite({
		name : "testAbstractOperations",
		matcherFunctions : function () {
			var lookupMatcherOptions = {
				"localeMatcher" : "lookup"
			};
			var testLanguageTags = [ {
				"input" : "en-US",
				"lookup" : "en",
				"bestfit" : "en"
			}, {
				"input" : "en-BS",
				"lookup" : "en",
				"bestfit" : "en"
			}, {
				"input" : "foo",
				"lookup" : "en",
				"bestfit" : "en"
			}, {
				"input" : "de-de",
				"lookup" : "de",
				"bestfit" : "de"
			}, {
				"input" : "de-ch",
				"lookup" : "de-CH",
				"bestfit" : "de-CH"
			}, {
				"input" : "ja-jp",
				"lookup" : "ja",
				"bestfit" : "ja"
			}, {
				"input" : "iw-il",
				"lookup" : "he",
				"bestfit" : "he"
			}, {
				"input" : "zh-CN",
				"lookup" : "zh-Hans",
				"bestfit" : "zh-Hans"
			}, {
				"input" : "zh-SG",
				"lookup" : "zh-Hans-SG",
				"bestfit" : "zh-Hans-SG"
			}, {
				"input" : "zh-TW",
				"lookup" : "zh-Hant",
				"bestfit" : "zh-Hant"
			}, {
				"input" : "zh-MO",
				"lookup" : "zh-Hant",
				"bestfit" : "zh-Hant-HK"
			}, {
				"input" : "zh-HK-VARIANT",
				"lookup" : "zh-Hant-HK",
				"bestfit" : "zh-Hant-HK"
			}, {
				"input" : "sr-ME",
				"lookup" : "sr-Latn",
				"bestfit" : "sr-Latn"
			}, {
				"input" : "sr-YU",
				"lookup" : "sr",
				"bestfit" : "sr"
			}, {
				"input" : "pt-TL",
				"lookup" : "pt",
				"bestfit" : "pt-PT"
			}, {
				"input" : "en-GB-u-co-phonebk",
				"lookup" : "en-GB",
				"bestfit" : "en-GB"
			}, {
				"input" : "en-NZ-u-ca-japanese",
				"lookup" : "en-NZ",
				"bestfit" : "en-NZ"
			}, {
				"input" : [ "fr", "fr" ],
				"lookup" : "fr",
				"bestfit" : "fr"
			} ];

			testLanguageTags.forEach(function (currentTag) {
				var nf = new Intl.NumberFormat(currentTag.input);
				var nf2 = new Intl.NumberFormat(currentTag.input, lookupMatcherOptions);
				assert.strictEqual(nf.resolvedOptions().locale, currentTag.bestfit,
					"BestFitMatcher() should return the correct locale for language tag \"" + currentTag.input + "\"");
				assert.strictEqual(nf2.resolvedOptions().locale, currentTag.lookup,
					"LookupMatcher() should return the correct locale for language tag \"" + currentTag.input + "\"");
			});
		},
		testCollator : function () {
			var colFunction = function () {
				var col = new Intl.Collator();
				return col;
			};
			assert.throws(colFunction, TypeError, "Intl.Collator is not supported.");
		}
	});
});
