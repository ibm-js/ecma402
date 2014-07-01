define([ "./Record",
		"requirejs-text/text!../cldr/config/calendarDependencies.json",
        "../calendars/gregorianCalendar"],
    function (Record, calendarDependenciesJson, gregorianCalendar) {
	var calendarMap = {
			"gregory" : gregorianCalendar
		};
	var dependencies = JSON.parse(calendarDependenciesJson);
	var calendars = {
		calendarMap : calendarMap,
		dependencies : dependencies,
		toLocalTime : function (date, calendar, timeZone) {
			if (dependencies[calendar] && dependencies[calendar].option) {
				return calendarMap[calendar].toLocalTime(date, timeZone, dependencies[calendar].option);
			}
			return calendarMap[calendar].toLocalTime(date, timeZone);
		},
		hebrewMonthResource : function (year, month) {
			var mr;
			if (calendarMap.hebrew.isLeapYear(year)) {
				mr = ["1", "2", "3", "4", "5", "6", "7-yeartype-leap", "8", "9", "10", "11", "12", "13"];
			} else {
				mr = ["1", "2", "3", "4", "5", "7", "8", "9", "10", "11", "12", "13"];
			}
			return mr[month - 1];
		}
	};
	return calendars;
});
