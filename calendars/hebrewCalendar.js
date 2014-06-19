define(
	[ "../impl/Record", "../impl/calendarFunctions" ], function (Record, calendarFunctions) {
	// A helek ( plural halakim ) is the basic unit of time measurement in the Hebrew calendar.
	// There are exactly 1080 halakim in an hour. Ref: http://en.wikipedia.org/wiki/Helek
	var HALAKIM_PER_HOUR = 1080;
	var HALAKIM_PER_DAY = 24 * HALAKIM_PER_HOUR;
	var HALAKIM_FRACTIONAL_MONTH = 12 * HALAKIM_PER_HOUR + 793;
	var HALAKIM_PER_MONTH = 29 * HALAKIM_PER_DAY + HALAKIM_FRACTIONAL_MONTH; // Refers to a Hebrew mean month.
	// BAHARAD refers to the time of the new moon (in halakim) on 1 Tishri, year 1 (the epoch)
	// counting from noon on the day before.
	var BAHARAD = 11 * HALAKIM_PER_HOUR + 204;
	var MILLIS_PER_MINUTE = 60000;

	function isLeapYear(year) {
		var x = (year * 12 + 17) % 19;
		return x >= ((x < 0) ? -7 : 12);
	}

	function firstDayOfYear(year) {
		var monthsBeforeYear = Math.floor((235 * year - 234) / 19);
		var fractionalMonthsBeforeYear = monthsBeforeYear * HALAKIM_FRACTIONAL_MONTH + BAHARAD;
		var dayNumber = monthsBeforeYear * 29 + Math.floor(fractionalMonthsBeforeYear / HALAKIM_PER_DAY);
		var timeOfDay = fractionalMonthsBeforeYear % HALAKIM_PER_DAY;

		var dayOfWeek = dayNumber % 7; // 0 == Monday

		// Postponement rules.
		if (dayOfWeek === 2 || dayOfWeek === 4 || dayOfWeek === 6) {
			dayNumber++;
			dayOfWeek = dayNumber % 7;
		}
		if (dayOfWeek === 1 && timeOfDay > 15 * HALAKIM_PER_HOUR + 204 && !isLeapYear(year)) {
			dayNumber += 2;
		} else if (dayOfWeek === 0 && timeOfDay > 21 * HALAKIM_PER_HOUR + 589 && isLeapYear(year - 1)) {
			dayNumber++;
		}
		return dayNumber;
	}

	var calendarHebrew = {
		isLeapYear : isLeapYear,
		toLocalTime : function (date, timeZone) {
			var result = new Record();
			var dt = new Date(date);
			result.set("weekday", timeZone === "UTC" ? dt.getUTCDay() : dt.getDay());
			result.set("era", 0);
			var MILLIS_PER_DAY = 86400000;
			var HEBREW_DAY_ON_JAN_1_1970 = 2092591;
			var time = timeZone === "UTC" ? dt.getTime() : dt.getTime() - dt.getTimezoneOffset() * MILLIS_PER_MINUTE;
			var daysSinceEpoch = Math.floor(time / MILLIS_PER_DAY) + HEBREW_DAY_ON_JAN_1_1970;
			var monthsSinceEpoch = Math.floor(daysSinceEpoch * HALAKIM_PER_DAY / HALAKIM_PER_MONTH);
			var year = Math.floor((monthsSinceEpoch * 19 + 234) / 235) + 1;
			var firstDayOfThisYear = firstDayOfYear(year);
			var dayOfYear = daysSinceEpoch - firstDayOfThisYear;
			while (dayOfYear < 1) {
				year--;
				firstDayOfThisYear = firstDayOfYear(year);
				dayOfYear = daysSinceEpoch - firstDayOfThisYear;
			}
			var yearLength = firstDayOfYear(year + 1) - firstDayOfThisYear;
			if (yearLength > 380) {
				yearLength -= 30;
			}
			var yearType = yearLength - 353; // This should result in 0 = deficient, 1 = normal, 2 = complete
			var leapYear = isLeapYear(year);
			var daysInMonth = leapYear ?
				[ 30, 29, 29, 29, 30, 30, 29, 30, 29, 30, 29, 30, 29 ] :
				[ 30, 29, 29, 29, 30, 29, 30, 29, 30, 29, 30, 29 ];
			if (yearType > 0) {
				daysInMonth[2]++; // Kislev gets an extra day in normal or complete years.
			}
			if (yearType > 1) {
				daysInMonth[1]++; // Heshvan gets an extra day in complete years only.
			}
			var month = 0;
			var day = dayOfYear;
			while (day > daysInMonth[month]) {
				day -= daysInMonth[month];
				month++;
			}
			result.set("year", year);
			result.set("month", month);
			result.set("day", day);
			calendarFunctions.setTimeFields(dt, timeZone, result);
			return result;
		}
	};
	return calendarHebrew;
});
