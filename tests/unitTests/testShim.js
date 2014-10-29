define(
	[ "intern!object", "intern/chai!assert", "ecma402/Intl", "ecma402/IntlShim" ],
		function (registerSuite, assert, Intl, IntlShim) {
			var isFF = false;
			if (typeof window !== undefined && typeof document !== undefined) {
				isFF = (!parseFloat(navigator.userAgent.split("WebKit/")[1]) && !(document.all
						&& parseFloat(navigator.appVersion.split("MSIE ")[1]) || parseFloat(navigator.appVersion
						.split("rv:")[1])))
						&& parseFloat(navigator.userAgent.split("Firefox/")[1]);
			}
			registerSuite({
				name : "testShim",
				testShim : function () {
					var numberFormattingTestCases =
						[ {
							"native" : false,
							"locales" : "sl",
							"style" : "currency",
							"currency" : "eur",
							"input" : 12345.678,
							"expected" : "12.345,68\u00A0€",
							"expected2" : "12.345,68\u00A0€" // If on a browser with no Intl.
						} ];

					var dateTimeFormattingTestCases =
						[ {
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
								month : "long",
								day : "numeric",
								weekday : "long",
								hour : "numeric",
								minute : "numeric",
								second : "numeric",
								timeZone : "UTC"
							},
							"input" : new Date("1965-03-04T17:59:30Z").getTime(),
							"expected" : "Thursday, March 4, 1965 at 5:59:30 PM",
							"expected2" : "Thursday, March 4, 1965 at 5:59:30 PM"
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
							"expected" : "Thursday, March 4, 1965, 5:59:30 PM",
							"expected2" : "Thursday, March 4, 1965 at 5:59:30 PM" // If on a browser with no Intl.
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
							"expected" : "Thursday, March 4, 1965 at 5:59:30 PM",
							"expected2" : "Thursday, March 4, 1965 at 5:59:30 PM"
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
							"expected" : "Thursday, March 4, 1965, 5:59:30 PM",
							"expected2" : "Thursday, March 4, 1965 at 5:59:30 PM" // If on a browser with no Intl.
						} ];

					numberFormattingTestCases.forEach(function (currentTest) {
						var nfOptions = {
							style : currentTest.style
						};
						if (currentTest.style === "currency") {
							nfOptions.currency = currentTest.currency;
						}

						var nf;
						if (currentTest.native) {
							nf = new IntlShim.NumberFormat(currentTest.locales, nfOptions);
						} else {
							nf = new Intl.NumberFormat(currentTest.locales, nfOptions);
						}
						/*jshint evil:true*/
						var __globalObject = new Function("return this;")();
						/*jshint evil:false*/
						var expectedValue = null;
						if (__globalObject.Intl !== undefined) {
							// TODO: generalize native tests to run on something else than Firefox as well?
							if (isFF) {
								expectedValue = currentTest.expected;
							}
						} else {
							expectedValue = currentTest.expected2;
						}
						if (expectedValue) {
							assert.strictEqual(nf.format(currentTest.input), expectedValue,
									"Intl.NumberFormat.format() with native = " + currentTest.native.toString()
											+ " should return expected string for locale \"" + currentTest.locales
											+ "\" style:" + currentTest.style);
						}
					});

					var i = 0;
					dateTimeFormattingTestCases.forEach(function (currentTest) {
						i++;
						var expectedValue = null;
						/*jshint evil:true*/
						var __globalObject = new Function("return this;")();
						/*jshint evil:false*/
						if (__globalObject.Intl !== undefined) {
							// TODO: generalize native tests to run on something else than Firefox as well?
							if (isFF) {
								expectedValue = currentTest.expected;
							}
						} else {
							expectedValue = currentTest.expected2;
						}
						var df;
						if (currentTest.native) {
							df = new IntlShim.DateTimeFormat(currentTest.locales, currentTest.options);
						} else {
							df = new Intl.DateTimeFormat(currentTest.locales, currentTest.options);
						}
						if (expectedValue) {
							assert.strictEqual(df.format(currentTest.input), expectedValue,
									"Intl.DateTimeFormat.format() with native = " + currentTest.native.toString()
											+ " should return expected string for locale " + currentTest.locales + " "
											+ i);
						}
					});
				}
			});
		});
