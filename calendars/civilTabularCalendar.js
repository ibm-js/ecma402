define([ "../impl/Record", "../impl/calendarFunctions"], function (Record, calendarFunctions) {
	return {
		CIVIL_EPOC : 1948439.5,
		ASTRONOMICAL_EPOC : 1948438.5,
		GREGORIAN_EPOCH : 1721425.5,
		isGregorianLeapYear : function (year) {
			// summary:
			//		Determines if the year is a leap year in the Gregorian calendar.
			// description:
			//		Leap years are years with an additional day YYYY-02-29, where the
			//		Year number is a multiple of four with the following exception: If
			//		A year is a multiple of 100, then it is only a leap year if it is
			//		Also a multiple of 400. For example, 1900 was not a leap year, but
			//		2000 is one.
			return year % 4 === 0 && year % 100 !== 0 || year % 400 === 0;
		},
		getIslamicYearStart : function (/*Number*/ year) {
			// summary:
			//		Return start of Islamic year.
			return (year - 1) * 354	+ Math.floor((3 + 11 * year) / 30.0);
		},
		getIslamicMonthStart : function (/*Number*/ year, /*Number*/ month) {
			// summary:
			//		Return the start of Islamic Month.
			return Math.ceil(29.5 * month) + (year - 1) * 354 + Math.floor((3 + 11 * year) / 30.0);
		},
		fromGregorian : function (/*Date*/ gdate, /*String*/ cType) {
			// summary:
			//		This function returns the equivalent islamic(civil/tabular) date value 
			//		for a give input gregorian date.
			// gdate: Date
			//      Gregorian date which will be converted to islamic(civil/tabular) date
			// cType: String
			//      The type of the islamic calendar the gregorain date should converted to.
			//		The expected values are 'civil' or 'tbla'
			// returns:
			//      Islamic(civil/tabular) date.
			var date = new Date(gdate);
			var gYear = date.getFullYear(),
				gMonth = date.getMonth(),
				gDay = date.getDate();
			var julianDay = (this.GREGORIAN_EPOCH - 1) + (365 * (gYear - 1)) + Math.floor((gYear - 1) / 4)
						+ (-Math.floor((gYear - 1) / 100)) + Math.floor((gYear - 1) / 400)
						+ Math.floor((((367 * (gMonth + 1)) - 362) / 12)
						+ (((gMonth + 1) <= 2) ? 0 : (this.isGregorianLeapYear(gYear) ? -1 : -2)) + gDay);
			julianDay = Math.floor(julianDay) + 0.5;
			var  days = julianDay - this.CIVIL_EPOC;
			if (cType === "tbla") {
				days = julianDay - this.ASTRONOMICAL_EPOC;
			}
			var hYear  = Math.floor((30 * days + 10646) / 10631.0);
			var hMonth = Math.ceil((days - 29 - this.getIslamicYearStart(hYear)) / 29.5);
			hMonth = Math.min(hMonth, 11);
			var hDay = Math.ceil(days - this.getIslamicMonthStart(hYear, hMonth) + 1);

			this.date = hDay;
			this.month = hMonth;
			this.year = hYear;
			this.hours = date.getHours();
			this.minutes = date.getMinutes();
			this.seconds = date.getSeconds();
			this.milliseconds = date.getMilliseconds();
			this.day = date.getDay();
			return this;
		},
		
		toLocalTime : function (date, timeZone, cType) {
			var islamicDate = this.fromGregorian(date, cType);
			var dt = new Date(date);
			var result = new Record();
			result.set("weekday", timeZone === "UTC" ? dt.getUTCDay() : dt.getDay());
			result.set("era", 0);
			result.set("year", islamicDate.year);
			result.set("month", islamicDate.month);
			result.set("day", islamicDate.date);
			calendarFunctions.setTimeFields(dt, timeZone, result);
			return result;
		}
	};
});