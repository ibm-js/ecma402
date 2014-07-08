define([ "intern!object", "intern/chai!assert", "ecma402/Intl"], function (registerSuite, assert, Intl) {
	registerSuite({
		name : "testNumberFormat",
		currencyFormat : function () {
			var testCases = [ {
				"locales" : "ar",
				"style" : "currency",
				"currency" : "jpy",
				"input" : 12345.678,
				"expected" : "JP¥ ١٢٬٣٤٦"
			}, {
				"locales" : "ar-u-nu-latn",
				"style" : "currency",
				"currency" : "jpy",
				"input" : 12345.678,
				"expected" : "JP¥ 12,346"
			}, {
				"locales" : "ar",
				"style" : "currency",
				"currency" : "eur",
				"input" : 12345.678,
				"expected" : "€ ١٢٬٣٤٥٫٦٨"
			}, {
				"locales" : "ar-u-nu-latn",
				"style" : "currency",
				"currency" : "eur",
				"input" : 12345.678,
				"expected" : "€ 12,345.68"
			}, {
				"locales" : "en-US",
				"style" : "currency",
				"currency" : "eur",
				"input" : 12345.678,
				"expected" : "€12,345.68"
			} ];
			testCases.forEach(function (currentTest) {
				var nfOptions = {
					style : currentTest.style
				};
				if (currentTest.style === "currency") {
					nfOptions.currency = currentTest.currency;
				}
				var nf = new Intl.NumberFormat(currentTest.locales, nfOptions);
				assert.strictEqual(nf.format(currentTest.input), currentTest.expected,
					"Intl.NumberFormat.format() should return expected string for locale \"" + currentTest.locales
						+ "\" style:" + currentTest.style);
			});
		}
	});
});
