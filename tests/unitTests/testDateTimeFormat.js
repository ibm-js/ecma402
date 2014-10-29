define([ "intern!object", "intern/chai!assert", "ecma402/Intl" ], function (registerSuite, assert, Intl) {
	registerSuite({
		name : "testDateTimeFormat",
		dateTimeFormat : function () {
			var testCases = [  {
				"locales" : "en-US",
				"options" : {
					weekday : "long",
					timeZone : "UTC"
				},
				"input" : new Date("1970-01-01T00:00:00Z").getTime(),
				"expected" : "Thursday"
			}, {
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
					month : "long",
					day : "numeric",
					weekday : "long",
					timeZone : "UTC"
				},
				"input" : new Date("1970-01-01T00:00:00Z").getTime(),
				"expected" : "Thursday, January 1, 1970 AD"
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
				"expected" : "Thu, Jan 1, 1970, 12:00:00 AM"
			}, {
				"locales" : "en-US",
				"options" : {
					year : "numeric",
					month : "long",
					day : "numeric",
					weekday : "long",
					hour : "numeric",
					minute : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1970-01-01T00:00:00Z").getTime(),
				"expected" : "Thursday, January 1, 1970 at 12:00 AM"
			}, {
				"locales" : "en-US",
				"options" : {
					year : "numeric",
					month : "long",
					day : "numeric",
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1965-03-04T17:59:30Z").getTime(),
				"expected" : "March 4, 1965 at 5:59:30 PM"
			}, {
				"locales" : "de-DE",
				"options" : {
					year : "numeric",
					month : "long",
					day : "numeric",
					weekday : "long",
					hour : "numeric",
					minute : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1965-03-04T17:59:30Z").getTime(),
				"expected" : "Donnerstag, 4. März 1965 um 17:59"
			}, {
				"locales" : "de-DE",
				"options" : {
					year : "numeric",
					month : "long",
					day : "numeric",
					hour : "numeric",
					minute : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1965-03-04T17:59:30Z").getTime(),
				"expected" : "4. März 1965 um 17:59"
			}, {
				"locales" : "en-US",
				"options" : {
					year : "numeric",
					month : "short",
					day : "numeric",
					hour : "numeric",
					minute : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1965-03-04T17:59:30Z").getTime(),
				"expected" : "Mar 4, 1965, 5:59 PM"
			}, {
				"locales" : "de-DE",
				"options" : {
					year : "numeric",
					month : "numeric",
					day : "numeric",
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
					timeZone : "UTC"
				},
				"input" : new Date("1965-03-04T17:59:30Z").getTime(),
				"expected" : "4.3.1965, 17:59:30"
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
			testCases.forEach(function (currentTest) {
				var df = new Intl.DateTimeFormat(currentTest.locales, currentTest.options);
				assert.strictEqual(df.format(currentTest.input), currentTest.expected,
					"Intl.DateTimeFormat.format() should return expected string for locale " + currentTest.locales);
			});
		}
	});
});
