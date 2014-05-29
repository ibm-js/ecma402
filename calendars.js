define([ "./Record",
		"requirejs-text/text!./cldr/supplemental/calendarData.json",
        "./buddhistCalendar",
        "./gregorianCalendar",
        "./hebrewCalendar",
        "./japaneseCalendar",
        "./rocCalendar"],
    function (Record, calendarDataJson, buddhistCalendar, gregorianCalendar, hebrewCalendar,
	japaneseCalendar, rocCalendar) {
	var calendars = {
		toLocalTime : function (date, calendar, timeZone) {
			switch (calendar) {
				case "buddhist" :
					return buddhistCalendar.toLocalTime(date, timeZone);
				case "hebrew" :
					return hebrewCalendar.toLocalTime(date, timeZone);
				case "japanese" :
					return japaneseCalendar.toLocalTime(date, timeZone);
				case "roc" :
					return rocCalendar.toLocalTime(date, timeZone);
				default:
					return gregorianCalendar.toLocalTime(date, timeZone);
			}
		},
		hebrewMonthResource : function (year, month) {
			var mr;
			if (hebrewCalendar.isLeapYear(year)) {
				mr = ["1", "2", "3", "4", "5", "6", "7-yeartype-leap", "8", "9", "10", "11", "12", "13"];
			} else {
				mr = ["1", "2", "3", "4", "5", "7", "8", "9", "10", "11", "12", "13"];
			}
			return mr[month - 1];
		}
	};
	return calendars;
});
