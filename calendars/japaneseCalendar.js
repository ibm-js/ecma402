define(
	[ "../impl/Record", "../impl/calendarFunctions" ],
	function (Record, calendarFunctions) {
	var japaneseCalendar = {
		toLocalTime : function (date, timeZone) {
			var result = new Record();
			var dt = new Date(date);
			result.set("weekday", timeZone === "UTC" ? dt.getUTCDay() : dt.getDay());
			/*
			 * Current highest era number in Japanese calendar is 235 - Will need to bump this up if Japan gets a new
			 * emperor!!!
			 */
			var maxJapaneseEra = 235;
			var era = calendarFunctions.findEra("japanese", dt, maxJapaneseEra);
			var year = timeZone === "UTC" ? dt.getUTCFullYear() : dt.getFullYear();
			var offset = calendarFunctions.eraOffset("japanese", era >= 0 ? era : 0);
			result.set("era", era >= 0 ? era : 0);
			result.set("year", year - offset + 1);
			result.set("month", timeZone === "UTC" ? dt.getUTCMonth() : dt.getMonth());
			result.set("day", timeZone === "UTC" ? dt.getUTCDate() : dt.getDate());
			calendarFunctions.setTimeFields(dt, timeZone, result);
			return result;
		}
	};
	return japaneseCalendar;
});