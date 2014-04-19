define( [ "./Record",
	  		"requirejs-text/text!./cldr/supplemental/calendarData.json",
            "./ca-buddhist",
            "./ca-gregorian",
            "./ca-roc",
], function (Record,calendarData_json,ca_buddhist,ca_gregorian,ca_roc) {
	
	var calendars = {};
	calendars.ToLocalTime = function (date, calendar, timeZone) {
		switch (calendar) {
			case "buddhist" : return ca_buddhist.ToLocalTime(date, timeZone);
			case "roc" : return ca_roc.ToLocalTime(date, timeZone);
			default:
				return ca_gregorian.ToLocalTime(date, timeZone);
		}
	};

	return calendars;
});