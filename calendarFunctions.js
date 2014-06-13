define([ "./Record", "requirejs-text/text!./cldr/supplemental/calendarData.json"],
	function (Record, calendarDataJson) {
	var calendarData = JSON.parse(calendarDataJson).supplemental.calendarData;
	var calendarFunctions = {
		eraOffset : function (calendar, era) {
			var eraStartDate = calendarData[calendar].eras[era.toString()]._start;
			var result = eraStartDate.charAt(0) === "-" ? Number(eraStartDate.split("-")[1]) * -1 : Number(eraStartDate
					.split("-")[0]);
			if (result <= 0) {
				result--; // Compensate for the fact that year 0 (Gregorian) doesn't exist.
			}
			return result;
		},
		/*
		 * Used to find the era for a given date. Starts at the most recent era (highest era number) and works
		 * backwards.
		 */
		findEra : function (calendar, date, maxEra) {
			var currentEra = maxEra;
			while (currentEra >= 0) {
				var compareDate = new Date();
				if (calendarData[calendar].eras[currentEra.toString()]) {
					var eraStartDate = calendarData[calendar].eras[currentEra.toString()]._start;
					if (!eraStartDate) {
						return currentEra;
					}
					var pieces = eraStartDate.split("-");
					if (eraStartDate.charAt(0) === "-") {
						compareDate.setFullYear(pieces[1] * -1, pieces[2] - 1, pieces[3] - 1);
					} else {
						compareDate.setFullYear(pieces[0], pieces[1] - 1, pieces[2] - 1);
					}
					if (date >= compareDate) {
						return currentEra;
					}
				}
				currentEra--;
			}
			return currentEra; // Return -1 if date is before the start of era #0
		},
		setTimeFields : function (dt, timeZone, result) {
			result.set("hour", timeZone === "UTC" ? dt.getUTCHours() : dt.getHours());
			result.set("minute", timeZone === "UTC" ? dt.getUTCMinutes() : dt.getMinutes());
			result.set("second", timeZone === "UTC" ? dt.getUTCSeconds() : dt.getSeconds());
			var localMinutes = dt.getHours() * 60 + dt.getMinutes();
			var UTCMinutes = dt.getUTCHours() * 60 + dt.getUTCMinutes();
			result.set("inDST", timeZone === "UTC" ? false : localMinutes + dt.getTimezoneOffset() !== UTCMinutes);
		},
		isLeapYear : function (/*Date*/ dateObject) {
			// summary:
			//		Determines if the year of the dateObject is a leap year.
			// description:
			//		Leap years are years with an additional day YYYY-02-29, where the
			//		Year number is a multiple of four with the following exception: If
			//		A year is a multiple of 100, then it is only a leap year if it is
			//		Also a multiple of 400. For example, 1900 was not a leap year, but
			//		2000 is one.

			var year = dateObject.getFullYear();
			return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
		},
		getYearStart : function (/*Number*/ year) {
			// summary:
			//		Return start of Islamic year.
			return (year - 1) * 354	+ Math.floor((3 + 11 * year) / 30.0);
		},
		getMonthStart : function (/*Number*/ year, /*Number*/ month) {
			// summary:
			//		Return the start of Islamic Month.
			return Math.ceil(29.5 * month) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30.0);
		}
	};
	return calendarFunctions;
});