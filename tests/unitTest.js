define([ 'intern!object', 'intern/chai!assert', 'ecma402/Intl', 'ecma402/IntlShim' ], function(registerSuite, assert, Intl, IntlShim) {
	var isFF;
	if (typeof window != undefined && typeof document != undefined) {
		isFF = (!parseFloat(navigator.userAgent.split("WebKit/")[1]) && 
			!(document.all && parseFloat(navigator.appVersion.split("MSIE ")[1]) || parseFloat(navigator.appVersion.split("rv:")[1]))) &&
			parseFloat(navigator.userAgent.split("Firefox/")[1]);
	}
	registerSuite({
		name : 'unitTest',
		matcherFunctions : function() {
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
				"lookup" : "zh",
				"bestfit" : "zh-Hans"
			}, {
				"input" : "zh-SG",
				"lookup" : "zh",
				"bestfit" : "zh-Hans-SG"
			}, {
				"input" : "zh-TW",
				"lookup" : "zh",
				"bestfit" : "zh-Hant"
			}, {
				"input" : "zh-MO",
				"lookup" : "zh",
				"bestfit" : "zh-Hant-HK"
			}, {
				"input" : "zh-HK-VARIANT",
				"lookup" : "zh",
				"bestfit" : "zh-Hant-HK"
			}, {
				"input" : "sr-ME",
				"lookup" : "sr",
				"bestfit" : "sr-Latn"
			}, {
				"input" : "sr-YU",
				"lookup" : "sr",
				"bestfit" : "sr"
			}, {
				"input" : "pt-AO",
				"lookup" : "pt",
				"bestfit" : "pt-AO"
			}, {
				"input" : "en-GB-u-co-phonebk",
				"lookup" : "en-GB",
				"bestfit" : "en-GB"
			}, {
				"input" : "en-NZ-u-ca-japanese",
				"lookup" : "en",
				"bestfit" : "en-NZ"
			} ];

			testLanguageTags.forEach(function(currentTag) {
				var nf = new Intl.NumberFormat(currentTag.input);
				assert.strictEqual(nf.resolvedOptions().locale, currentTag.bestfit,
					'BestFitMatcher() should return the correct locale for language tag "'+currentTag.input+'"');
			});
		},
		currencyFormat : function() {
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
			testCases.forEach(function(currentTest) {
				var nfOptions = {
					style : currentTest.style
				};
				if(currentTest.style=="currency"){
					nfOptions.currency = currentTest.currency;
				}
				var nf = new Intl.NumberFormat(currentTest.locales, nfOptions);
				assert.strictEqual(nf.format(currentTest.input), currentTest.expected,
					'Intl.NumberFormat.format() should return expected string for locale '+currentTest.locales
						+'" style:'+currentTest.style);
			});
		},
		dateTimeFormat : function() {
			var testCases = [ {
				"locales" : "en-US",
				"options" : {
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("2014-01-01T20:06:09Z").getTime(),
				"expected" : "8:06:09 PM"
			}, {
				"locales" : "en-US",
				"options" : {
					era : "short",
					year : "numeric",
					month : "short",
					day : "numeric",
					weekday : "short",
					timeZone : "UTC"
				},
				"input" : new Date("1970-01-01T00:00:00Z").getTime(),
				"expected" : "Thu, Jan 1, 1970 AD"
			}, {
				"locales" : "zh-Hant",
				"options" : {
					year : "numeric",
					month : "short",
					day : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1970-01-01T00:00:00Z").getTime(),
				"expected" : "1970年1月1日"
			}, {
				"locales" : "en-US",
				"options" : {
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1970-01-01T20:00:00Z").getTime(),
				"expected" : "8:00:00 PM"
			}, {
				"locales" : "en-US",
				"options" : {
					year : "numeric",
					month : "short",
					day : "numeric",
					weekday : "short",
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1970-01-01T00:00:00Z").getTime(),
				"expected" : "Thu, Jan 1, 1970 at 12:00:00 AM"
			}, {
				"locales" : "en-US",
				"options" : {
					year : "numeric",
					month : "short",
					day : "numeric",
					weekday : "short",
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1965-03-04T17:59:30Z").getTime(),
				"expected" : "Thu, Mar 4, 1965 at 5:59:30 PM"
			}, {
				"locales" : "de-DE",
				"options" : {
					year : "numeric",
					month : "short",
					day : "numeric",
					weekday : "short",
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1965-03-04T17:59:30Z").getTime(),
				"expected" : "Do., 4. März 1965 17:59:30"
			}, {
				"locales" : "en-US",
				"options" : {
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1970-01-01T00:00:00Z").getTime(),
				"expected" : "12:00:00 AM"
			}, {
				"locales" : "el",
				"options" : {
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1970-01-01T00:00:00Z").getTime(),
				"expected" : "12:00:00 π.μ."
			} ];
			testCases.forEach(function(currentTest) {
				var df = new Intl.DateTimeFormat(currentTest.locales, currentTest.options);
				assert.strictEqual(df.format(currentTest.input), currentTest.expected,
					'Intl.DateTimeFormat.format() should return expected string for locale '+currentTest.locales);
			});
		},
		testShim : function() {
			var numberFormattingTestCases = [ {
				"native" : false,
				"locales" : "sl",
				"style" : "currency",
				"currency" : "eur",
				"input" : 12345.678,
				"expected" : "12.345,68\u00A0€",
				"expected2" : "12.345,68\u00A0€" // If on a browser that doesn't have Intl.
			} ];

			var dateTimeFormattingTestCases = [ {
				"native" : false,
				"locales" : "en-US",
				"options" : {
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("2014-01-01T20:06:09Z").getTime(),
				"expected" : "8:06:09 PM",
				"expected2" : "8:06:09 PM"
			}, {
				"native" : true,
				"locales" : "en-US",
				"options" : {
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("2014-01-01T20:06:09Z").getTime(),
				"expected" : "8:06:09 PM",
				"expected2" : "8:06:09 PM"
			}, {
				"native" : false,
				"locales" : "en-US",
				"options" : {
					year : "numeric",
					month : "short",
					day : "numeric",
					weekday : "short",
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1965-03-04T17:59:30Z").getTime(),
				"expected" : "Thu, Mar 4, 1965 at 5:59:30 PM",
				"expected2" : "Thu, Mar 4, 1965 at 5:59:30 PM"
			}, {
				"native" : true,
				"locales" : "en-US",
				"options" : {
					year : "numeric",
					month : "short",
					day : "numeric",
					weekday : "short",
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1965-03-04T17:59:30Z").getTime(),
				"expected" : "Thu, Mar 4, 1965, 5:59:30 PM",
				"expected2" : "Thu, Mar 4, 1965 at 5:59:30 PM" // If on a browser that doesn't have Intl.
			}, {
				"native" : false,
				"locales" : "en-US",
				"options" : {
					year : "numeric",
					month : "long",
					day : "numeric",
					weekday : "long",
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1965-03-04T17:59:30Z").getTime(),
				"expected" : "Thu, March 4, 1965 at 5:59:30 PM",
				"expected2" : "Thu, March 4, 1965 at 5:59:30 PM"
			}, {
				"native" : true,
				"locales" : "en-US",
				"options" : {
					year : "numeric",
					month : "long",
					day : "numeric",
					weekday : "long",
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1965-03-04T17:59:30Z").getTime(),
				"expected": "Thursday, March 4, 1965, 5:59:30 PM",
				"expected2" : "Thu, March 4, 1965 at 5:59:30 PM" // If on a browswer that doesn't have Intl.
			} ];

			numberFormattingTestCases
				.forEach(function(currentTest) {
					var nfOptions = {
						style : currentTest.style
					};
					if(currentTest.style=="currency"){
						nfOptions.currency = currentTest.currency;
					}

					var nf;
					if(currentTest.native){
						nf = new IntlShim.NumberFormat(currentTest.locales, nfOptions);
					}else{
						nf = new Intl.NumberFormat(currentTest.locales, nfOptions);
					}
					var __globalObject = Function("return this;")();
					var expectedValue;
					if(__globalObject.Intl!==undefined){
						// TODO: generalize native tests to run on something else than Firefox as well?
						if(isFF) {
							expectedValue = currentTest.expected;
						} 
					}else{
						expectedValue = currentTest.expected2;
					}
					if (expectedValue) {
						assert.strictEqual(nf.format(currentTest.input), expectedValue,
								'Intl.NumberFormat.format() with native = ' + currentTest.native.toString()
								+ ' should return expected string for locale ' + currentTest.locales + '" style:'
								+ currentTest.style);
					}
				});

			var i = 0;
			dateTimeFormattingTestCases.forEach(function(currentTest) {
				i++;
				var expectedValue;
				var __globalObject = Function("return this;")();
				if(__globalObject.Intl!==undefined){
					// TODO: generalize native tests to run on something else than Firefox as well?
					if(isFF) {
						expectedValue = currentTest.expected;
					}
				}else{
					expectedValue = currentTest.expected2;
				}
				var df;
				if(currentTest.native){
					df = new IntlShim.DateTimeFormat(currentTest.locales, currentTest.options);
				}else{
					df = new Intl.DateTimeFormat(currentTest.locales, currentTest.options);
				}
				if (expectedValue) {
					assert.strictEqual(df.format(currentTest.input), expectedValue,
							'Intl.DateTimeFormat.format() with native = ' + currentTest.native.toString()
							+ ' should return expected string for locale ' + currentTest.locales + " " + i);
				}
			});
		}
	});
});
