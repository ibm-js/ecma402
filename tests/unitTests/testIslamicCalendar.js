define([ 'intern!object', 'intern/chai!assert', 'ecma402/Intl' ], function(registerSuite, assert, Intl) {
	registerSuite({
		name : 'testIslamicCalendar',
		testIslamicCalendar : function() {
			var testCases = [
			{
				"locales" : "ar-u-ca-islamic",
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
				"expected" : "الثلاثاء، ٣ جمادى الأولى، ١٤٣٥ هـ ٥:٥٩:٣٠ م"
			},			{
				"locales" : "ar-u-ca-islamic",
				"options" : {
					year : "numeric",
					month : "short",
					day : "numeric",
					weekday : "short",
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
				},
				"input" : new Date(2014,2,4,17,59,30).getTime(),
				"expected" : "الثلاثاء، ٣ جمادى الأولى، ١٤٣٥ هـ ٥:٥٩:٣٠ م"
			}];
			testCases.forEach(function(currentTest) {
				var df = new Intl.DateTimeFormat(currentTest.locales, currentTest.options);
				assert.strictEqual(df.format(currentTest.input), currentTest.expected,
					'Intl.DateTimeFormat.format() should return expected string for locale '+currentTest.locales);
			});
		},
		testIslamicCivilCalendar : function() {
			var testCases = [
			{
				"locales" : "ar-u-ca-islamic-civil",
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
				"expected" : "الثلاثاء، ٢ جمادى الأولى، ١٤٣٥ هـ ٥:٥٩:٣٠ م"
			},			{
				"locales" : "ar-u-ca-islamic-civil",
				"options" : {
					year : "numeric",
					month : "short",
					day : "numeric",
					weekday : "short",
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
				},
				"input" : new Date(2014,2,4,17,59,30).getTime(),
				"expected" : "الثلاثاء، ٢ جمادى الأولى، ١٤٣٥ هـ ٥:٥٩:٣٠ م"
			}];
			testCases.forEach(function(currentTest) {
				var df = new Intl.DateTimeFormat(currentTest.locales, currentTest.options);
				assert.strictEqual(df.format(currentTest.input), currentTest.expected,
					'Intl.DateTimeFormat.format() should return expected string for locale '+currentTest.locales);
			});
		},
		testIslamicTabularCalendar : function() {
			var testCases = [
			{
				"locales" : "ar-u-ca-islamic-tbla",
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
				"expected" : "الثلاثاء، ٣ جمادى الأولى، ١٤٣٥ هـ ٥:٥٩:٣٠ م"
			},			{
				"locales" : "ar-u-ca-islamic-tbla",
				"options" : {
					year : "numeric",
					month : "short",
					day : "numeric",
					weekday : "short",
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
				},
				"input" : new Date(2014,2,4,17,59,30).getTime(),
				"expected" : "الثلاثاء، ٣ جمادى الأولى، ١٤٣٥ هـ ٥:٥٩:٣٠ م"
			}];
			testCases.forEach(function(currentTest) {
				var df = new Intl.DateTimeFormat(currentTest.locales, currentTest.options);
				assert.strictEqual(df.format(currentTest.input), currentTest.expected,
					'Intl.DateTimeFormat.format() should return expected string for locale '+currentTest.locales);
			});
		},
		testIslamicUmalquraCalendar : function() {
			var testCases = [
			{
				"locales" : "ar-SA-u-ca-islamic-umalqura",
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
				"expected" : "الثلاثاء، ٤ مارس، ٢٠١٤ ٥:٥٩:٣٠ م"
			},			{
				"locales" : "ar-u-ca-islamic-umalqura",
				"options" : {
					year : "numeric",
					month : "short",
					day : "numeric",
					weekday : "short",
					hour : "numeric",
					minute : "numeric",
					second : "numeric",
				},
				"input" : new Date(2014,2,4,17,59,30).getTime(),
				"expected" : "الثلاثاء، ٤ مارس، ٢٠١٤ ٥:٥٩:٣٠ م"
			}];
			testCases.forEach(function(currentTest) {
				var df = new Intl.DateTimeFormat(currentTest.locales, currentTest.options);
				assert.strictEqual(df.format(currentTest.input), currentTest.expected,
					'Intl.DateTimeFormat.format() should return expected string for locale '+currentTest.locales);
			});
		}
	});
});
