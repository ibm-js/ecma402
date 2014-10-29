define([ "intern!object", "intern/chai!assert", "ecma402/Intl" ], function (registerSuite, assert, Intl) {
	registerSuite({
		name : "testHebrewCalendar",
		testHebrewCalendar : function () {
			var testCases =
				[ {
					"locales" : "he-u-ca-hebrew",
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
					"input" : new Date("2014-03-04T17:59:30Z").getTime(),
					"expected" : "יום ג׳, 2 באדר ב׳ 5774, 17:59:30"
				}, {
					"locales" : "he-u-ca-hebrew",
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
					"input" : new Date("2014-02-04T17:59:30Z").getTime(),
					"expected" : "יום ג׳, 4 באדר א׳ 5774, 17:59:30"
				}, {
					"locales" : "he-u-ca-hebrew",
					"options" : {
						year : "numeric",
						month : "short",
						day : "numeric",
						weekday : "short",
						hour : "numeric",
						minute : "numeric",
						second : "numeric",
					},
					"input" : new Date(2014, 01, 04, 17, 59, 30).getTime(),
					"expected" : "יום ג׳, 4 באדר א׳ 5774, 17:59:30"
				}, {
					"locales" : "he-u-ca-hebrew",
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
					"input" : new Date("2013-02-12T17:59:30Z").getTime(),
					"expected" : "יום ג׳, 2 באדר 5773, 17:59:30"
				}, {
					"locales" : "he-u-ca-hebrew",
					"options" : {
						year : "numeric",
						month : "long",
						day : "numeric",
					},
					"input" : new Date("1965-03-04T17:59:30").getTime(),
					"expected" : "30 באדר א׳ 5725"
				} ];
			testCases.forEach(function (currentTest) {
				var df = new Intl.DateTimeFormat(currentTest.locales, currentTest.options);
				assert.strictEqual(df.format(currentTest.input), currentTest.expected,
					"Intl.DateTimeFormat.format() should return expected string for locale " + currentTest.locales);
			});
		}
	});
});
