define([ 'intern!object', 'intern/chai!assert', 'ecma402/Intl' ], function(registerSuite, assert, Intl) {
	registerSuite({
		name : 'testJapaneseCalendar',
		testJapaneseCalendar : function() {
			var testCases = [
			{
				"locales" : "ja-u-ca-japanese",
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
				"expected" : "昭和40年3月4日(木) 17:59:30"
			},{
				"locales" : "ja-u-ca-japanese",
				"options" : {
					year : "numeric",
					month : "long",
					day : "numeric",
				},
				"input" : new Date("1989-01-07T00:00:00").getTime(),
				"expected" : "昭和64年1月7日"
			},{
				"locales" : "ja-u-ca-japanese",
				"options" : {
					year : "numeric",
					month : "long",
					day : "numeric",
				},
				"input" : new Date("1989-01-08T00:00:00").getTime(),
				"expected" : "平成1年1月8日"
			},{
				"locales" : "ja-u-ca-japanese",
				"options" : {
					year : "numeric",
					month : "long",
					day : "numeric",
				},
				"input" : new Date("2014-06-05T12:34:56").getTime(),
				"expected" : "平成26年6月5日"
			},{
				"locales" : "ja-u-ca-japanese",
				"options" : {
					year : "numeric",
					month : "numeric",
					day : "numeric",
				},
				"input" : new Date("0335-10-31T12:34:56").getTime(),
				"expected" : "大化-309年10月31日"
			}];
			testCases.forEach(function(currentTest) {
				var df = new Intl.DateTimeFormat(currentTest.locales, currentTest.options);
				assert.strictEqual(df.format(currentTest.input), currentTest.expected,
					'Intl.DateTimeFormat.format() should return expected string for locale '+currentTest.locales);
			});
		}
	});
});
