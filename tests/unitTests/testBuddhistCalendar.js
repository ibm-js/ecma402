define([ "intern!object", "intern/chai!assert", "ecma402/Intl" ], function (registerSuite, assert, Intl) {
	registerSuite({
		name : "testBuddhistCalendar",
		testBuddhistCalendar : function () {
			var testCases = [
			    {
					"locales" : "th",
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
					"expected" : "พฤ. 4 มี.ค. 2508 17:59:30"
				}, {
					"locales" : "th",
					"options" : {
						year : "numeric",
						month : "long",
						day : "numeric",
					},
					"input" : new Date(1965, 2, 4).getTime(),
					"expected" : "4 มีนาคม 2508"
				}, {
					"locales" : "th",
					"options" : {
						year : "numeric",
						month : "numeric",
						day : "numeric",
					},
					"input" : new Date(-542, 2, 4).getTime(),
					"expected" : "4/3/1"
				}, {
					"locales" : "th",
					"options" : {
						year : "numeric",
						month : "numeric",
						day : "numeric",
					},
					"input" : new Date(-543, 2, 4).getTime(),
					"expected" : "4/3/0"
				}, {
					"locales" : "th",
					"options" : {
						year : "numeric",
						month : "numeric",
						day : "numeric",
					},
					"input" : new Date(-548, 2, 4).getTime(),
					"expected" : "4/3/-5"
				}
			];
			testCases.forEach(function (currentTest) {
				var df = new Intl.DateTimeFormat(currentTest.locales, currentTest.options);
				assert.strictEqual(df.format(currentTest.input), currentTest.expected,
					"Intl.DateTimeFormat.format() should return expected string for locale " + currentTest.locales);
			});
		}
	});
});
