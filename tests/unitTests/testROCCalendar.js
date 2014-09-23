define([ "intern!object", "intern/chai!assert", "ecma402/Intl" ], function (registerSuite, assert, Intl) {
	registerSuite({
		name : "testROCCalendar",
		testROCCalendar : function () {
			var testCases =
				[ {
					"locales" : "zh-Hant-u-ca-roc",
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
					"expected" : "民國54年3月4日週四 下午5:59:30"
				}, {
					"locales" : "zh-Hant-u-ca-roc",
					"options" : {
						year : "numeric",
						month : "long",
						day : "numeric",
					},
					"input" : new Date(1965, 2, 4).getTime(),
					"expected" : "民國54年3月4日"
				}, {
					"locales" : "zh-Hant-u-ca-roc",
					"options" : {
						year : "numeric",
						month : "numeric",
						day : "numeric",
					},
					"input" : new Date(1912, 2, 4).getTime(),
					"expected" : "民國1年3月4日"
				}, {
					"locales" : "zh-Hant-u-ca-roc",
					"options" : {
						year : "numeric",
						month : "numeric",
						day : "numeric",
					},
					"input" : new Date(1911, 2, 4).getTime(),
					"expected" : "民國前1年3月4日"
				}, {
					"locales" : "zh-Hant-u-ca-roc",
					"options" : {
						year : "numeric",
						month : "numeric",
						day : "numeric",
					},
					"input" : new Date(1776, 6, 4).getTime(),
					"expected" : "民國前136年7月4日"
				} ];
			testCases.forEach(function (currentTest) {
				var df = new Intl.DateTimeFormat(currentTest.locales, currentTest.options);
				assert.strictEqual(df.format(currentTest.input), currentTest.expected,
					"Intl.DateTimeFormat.format() should return expected string for locale " + currentTest.locales);
			});
		}
	});
});
