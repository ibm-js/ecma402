define([ "./Record",
		"requirejs-text/text!./cldr/supplemental/calendarData.json",
        "./buddhistCalendar",
        "./gregorianCalendar",
        "./japaneseCalendar",
        "./rocCalendar"],
    function (Record, calendarDataJson, buddhistCalendar, gregorianCalendar, japaneseCalendar, rocCalendar) {
	var calendars = {
		toLocalTime : function (date, calendar, timeZone) {
			switch (calendar) {
				case "buddhist" :
					return buddhistCalendar.toLocalTime(date, timeZone);
				case "japanese" :
					return japaneseCalendar.toLocalTime(date, timeZone);
				case "roc" :
					return rocCalendar.toLocalTime(date, timeZone);
				default:
					return gregorianCalendar.toLocalTime(date, timeZone);
			}
		}
	};
	return calendars;
});