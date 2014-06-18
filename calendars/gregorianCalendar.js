define(
	[ "../impl/Record", "../impl/calendarFunctions" ],
	function (Record, calendarFunctions) {
	var gregorianCalendar = {
		toLocalTime : function (date, timeZone) {
			var result = new Record();
			var dt = new Date(date);
			result.set("weekday", timeZone === "UTC" ? dt.getUTCDay() : dt.getDay());
			var year = timeZone === "UTC" ? dt.getUTCFullYear() : dt.getFullYear();
			if (year <= 0) {
				result.set("era", 0);
				year--; // Compensate for fact that year 0 doesn't exist.
				year = -year;
			} else {
				result.set("era", 1);
			}
			result.set("year", year);
			result.set("month", timeZone === "UTC" ? dt.getUTCMonth() : dt.getMonth());
			result.set("day", timeZone === "UTC" ? dt.getUTCDate() : dt.getDate());
			calendarFunctions.setTimeFields(dt, timeZone, result);
			return result;
		}
	};
	return gregorianCalendar;
});