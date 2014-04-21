define(
	[ "./Record", "./calendarFunctions"], function (Record, calendarFunctions) {

	var ca_buddhist = {};
	ca_buddhist.ToLocalTime = function (date, timeZone) {
			var result = new Record();
			var dt = new Date(date);
			result.set("weekday", timeZone == "UTC" ? dt.getUTCDay() : dt.getDay());
			result.set("era", 0);
			var year = ( timeZone == "UTC" ? dt.getUTCFullYear() : dt.getFullYear() ) - calendarFunctions.eraOffset("buddhist",0);
			result.set("year", year);
			result.set("month", timeZone == "UTC" ? dt.getUTCMonth() : dt.getMonth());
			result.set("day", timeZone == "UTC" ? dt.getUTCDate() : dt.getDate());
			calendarFunctions.setTimeFields(dt,timeZone,result);
			return result;
	};
	return ca_buddhist;
});