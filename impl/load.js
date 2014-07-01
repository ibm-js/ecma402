/**
 * Plugin to load a single locale.  For example, load!en returns
 * an Object like { currencies: ..., numbers: ..., "ca-gregorian": ... }.
 * Used by preloads! plugin.
 */
define([
    "./calendars",
	"./common",
	"require",
	"requirejs-text/text"	// just so builder knows we will be using that module
], function (calendars, common, require) {
	return {
		load: function (locale, callerRequire, onload) {
			// Compute dependencies to require().
			// For specified locale, load JSON files for its "currencies", "numbers" data.
			var jsonElements = ["currencies", "numbers"];
			var calendarsToLoad = [];
			var region = common._getRegion(locale);
			var supportedCalendars = common._getSupportedCalendars(region);
			supportedCalendars.forEach(function (calendar) {
				var calendarName = "ca-" +  (calendar === "gregory" ? "gregorian" : calendar);
				if (jsonElements.indexOf(calendarName) === -1) {
					jsonElements.push(calendarName);
				}
				if (calendar !== "gregory") {
					calendarsToLoad.push(calendar);
				}
			});

			var dependencies = jsonElements.map(function (element) {
				return "requirejs-text/text!../cldr/" + locale + "/" + element + ".json";
			});

			var calendarDependencies = calendarsToLoad.map(function (calendar) {
				return "../calendars/" + calendars.dependencies[calendar].calendar;
			});

			calendarDependencies.forEach(function (dep) {
				dependencies.push(dep);
			});

			// Load all the JSON files requested, and any non-gregorian calendars
			// that are required.  Return the locale data in a hash
			require(dependencies, function () {
				var dataAsArray = arguments, dataAsHash = {};
				jsonElements.forEach(function (element, idx) {
					dataAsHash[element] = JSON.parse(dataAsArray[idx]);
				});
				calendarsToLoad.forEach(function (cal, idx) {
					calendars.calendarMap[cal] = dataAsArray[idx + jsonElements.length];
				});
				onload(dataAsHash);
			});
		}
	};
});
