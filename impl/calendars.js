define([ "./Record",
		"requirejs-text/text!../cldr/config/calendarDependencies.json",
        "../calendars/gregorianCalendar"],
    /**
     * Functions and data related to implementation of calendars.
     * 
     * @private
     */
    function (Record, calendarDependenciesJson, gregorianCalendar) {
	var calendarMap = {
			"gregory" : gregorianCalendar
		};
	var dependencies = JSON.parse(calendarDependenciesJson);
	var calendars = {
		calendarMap : calendarMap,
		dependencies : dependencies,
		/**
		 * 
		 * Converts the given date to an object representing the date/time as represented
		 * in a particular calendar.
		 * 
		 * @param {Date} date The date to convert
		 * @param {String} calendar The BCP 47 tag representing the calendar type
		 * @param {String} timeZone String representing the time zone (UTC or local)
		 * @returns {Ojbect} An object representing the year,month,day,hour,minute,second in the given calendar.
		 * @private
		 */
		toLocalTime : function (date, calendar, timeZone) {
			if (dependencies[calendar] && dependencies[calendar].option) {
				return calendarMap[calendar].toLocalTime(date, timeZone, dependencies[calendar].option);
			}
			return calendarMap[calendar].toLocalTime(date, timeZone);
		},
		/**
		 * 
		 * In the Hebrew calendar, determine which month name string to use based on the year. The Hebrew
		 * calendar has a "leap month", so the set of month names used is variable.
		 * 
		 * @param {Number} year The year number
		 * @param {Number} month The year number
		 * @returns {String} The key for looking up the month name in the CLDR resource file.
		 * @private
		 */
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
