define(
	[ "./Record", "./calendarFunctions"], function (Record, calendarFunctions) {

	var ca_roc = {};
	ca_roc.ToLocalTime = function (date, timeZone) {
			var result = new Record();
			var dt = new Date(date);
			result.set("weekday", timeZone == "UTC" ? dt.getUTCDay() : dt.getDay());
			var year = timeZone == "UTC" ? dt.getUTCFullYear() : dt.getFullYear();
			var offset = calendarFunctions.eraOffset("roc", 1);
			if ( year - offset >= 0 ) {
				result.set("era", 1);
				result.set("year", year - offset + 1);
			} else {
				result.set("era", 0);
				result.set("year", offset - year );
			}
			result.set("month", timeZone == "UTC" ? dt.getUTCMonth() : dt.getMonth());
			result.set("day", timeZone == "UTC" ? dt.getUTCDate() : dt.getDate());
			result.set("hour", timeZone == "UTC" ? dt.getUTCHours() : dt.getHours());
			result.set("minute", timeZone == "UTC" ? dt.getUTCMinutes() : dt.getMinutes());
			result.set("second", timeZone == "UTC" ? dt.getUTCSeconds() : dt.getSeconds());
			var localMinutes = dt.getHours() * 60 + dt.getMinutes();
			var UTCMinutes = dt.getUTCHours() * 60 + dt.getUTCMinutes();
			result.set("inDST", timeZone == "UTC" ? false : localMinutes + dt.getTimezoneOffset() != UTCMinutes);
			return result;
	};
	return ca_roc;
});