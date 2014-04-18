define( [ "./Record",
	  		"requirejs-text/text!./cldr/supplemental/calendarData.json",
], function (Record,calendarData_json) {

	var calendarData = JSON.parse(calendarData_json).supplemental.calendarData;
		
	var calendarFunctions = {

		eraOffset : function( calendar, era ){
			var eraStartDate = calendarData[calendar].eras[era.toString()]._start;
			var result = eraStartDate.charAt(0) === "-" ? Number(eraStartDate.split("-")[1]) * -1 : Number(eraStartDate.split("-")[0]);
			if (result <= 0) {
				result--; // Compensate for the fact that year 0 (Gregorian) doesn't exist.
			}
			return result;
		}
		
	};

	return calendarFunctions;
});