define(
	[ "../impl/Record", "../impl/calendarFunctions"],
	function (Record, calendarFunctions) {
	var rocCalendar = {
		toLocalTime : function (date, timeZone) {
			var result = new Record();
			var dt = new Date(date);
			result.set("weekday", timeZone === "UTC" ? dt.getUTCDay() : dt.getDay());
			var year = timeZone === "UTC" ? dt.getUTCFullYear() : dt.getFullYear();
			result.set("era", calendarFunctions.findEra("roc", dt, 1));
			var offset = calendarFunctions.eraOffset("roc", 1);
			if (year - offset >= 0) {
				result.set("year", year - offset + 1);
			} else {
				result.set("year", offset - year);
			}
			result.set("month", timeZone === "UTC" ? dt.getUTCMonth() : dt.getMonth());
			result.set("day", timeZone === "UTC" ? dt.getUTCDate() : dt.getDate());
			calendarFunctions.setTimeFields(dt, timeZone, result);
			return result;
		}
	};
	return rocCalendar;
});