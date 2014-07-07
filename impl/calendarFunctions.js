define([ "./Record", "requirejs-text/text!../cldr/supplemental/calendarData.json"],
	function (Record, calendarDataJson) {
	/*
	 * calendarFunctions - This file contains utility functions that are common across multiple
	 * different calendars.  Functions that are unique to a specific calendar should be contained
	 * in the code for the given calendar, and not here.
	 */
	var calendarData = JSON.parse(calendarDataJson).supplemental.calendarData;
	var calendarFunctions = {
		eraOffset : function (calendar, era) {
			var eraStartDate = calendarData[calendar].eras[era.toString()]._start;
			var result = eraStartDate.charAt(0) === "-" ? Number(eraStartDate.split("-")[1]) * -1 :
				Number(eraStartDate.split("-")[0]);
			
			if (result <= 0) {
				result--; // Compensate for the fact that year 0 (Gregorian) doesn't exist.
			}
			return result;
		},
		/*
		 * Used to find the era for a given date. Starts at the most recent era (highest era number) and works
		 * backwards. Right now, findEra is only used in the Japanese and ROC calendar implementations, so
		 * we don't have to worry about eras starting in a year numbered less than 0.
		 */
		findEra : function (calendar, date, maxEra) {
			var currentEra = maxEra;
			while (currentEra >= 0) {
				var compareDate = new Date();
				var eraStartDate = calendarData[calendar].eras[currentEra.toString()]._start;
				if (!eraStartDate) {
					return currentEra;
				}
				var pieces = eraStartDate.split("-");
				compareDate.setFullYear(pieces[0], pieces[1] - 1, pieces[2] - 1);
				if (date >= compareDate) {
					return currentEra;
				}
				currentEra--;
			}
			return currentEra; // Return -1 if date is before the start of era #0
		},
		setTimeFields : function (dt, timeZone, result) {
			result.set("hour", timeZone === "UTC" ? dt.getUTCHours() : dt.getHours());
			result.set("minute", timeZone === "UTC" ? dt.getUTCMinutes() : dt.getMinutes());
			result.set("second", timeZone === "UTC" ? dt.getUTCSeconds() : dt.getSeconds());
			var localMinutes = dt.getHours() * 60 + dt.getMinutes();
			var UTCMinutes = dt.getUTCHours() * 60 + dt.getUTCMinutes();
			result.set("inDST", timeZone === "UTC" ? false : localMinutes + dt.getTimezoneOffset() !== UTCMinutes);
		}
	};
	return calendarFunctions;
});