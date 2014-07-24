/**
 * Plugin to load a single locale.  For example, load!en returns
 * an Object like { currencies: ..., numbers: ..., "ca-gregorian": ... }.
 * Used by locales! plugin.
 */
define([
    "./calendars",
	"./common",
	"require",
	"module",
	"requirejs-text/text"	// just so builder knows we will be using that module
], function (calendars, common, require, module) {
	return {
		id: module.id,

		load: function (locale, callerRequire, onload, loaderConfig) {
			// Compute dependencies to require().
			// For specified locale, load JSON files for its "currencies", "numbers" data.
			var jsonElements = ["currencies", "numbers"];
			var calendarsToLoad = [];
			var region = common._getRegion(locale);
			var supportedCalendars = common._getSupportedCalendars(region);
			supportedCalendars.forEach(function (calendar) {
				var calendarName = "ca-" +  (calendar === "gregory" ? "gregorian" : calendar);
				// Add json data
				jsonElements.push(calendarName);
				// Add calendar module
				if (calendar !== "gregory") {
					calendarsToLoad.push(calendar);
				}
			});

			var dependencies;

			// Check if there is a layer
			var config = module.config();
			if (config[locale]) {
				dependencies = jsonElements = [config._layerMid + "_" + locale];
			} else {
				dependencies = jsonElements.map(function (element) {
					return "requirejs-text/text!../cldr/" + locale + "/" + element + ".json";
				});
			}

			var calendarDependencies = calendarsToLoad.map(function (calendar) {
				return "../calendars/" + calendars.dependencies[calendar].calendar;
			});

			dependencies = dependencies.concat(calendarDependencies);

			// Load all the JSON files requested, and any non-gregorian calendars
			// that are required. Return the locale data in a hash
			require(dependencies, function () {
				var dataAsArray = arguments, dataAsHash = {};
				jsonElements.forEach(function (element, idx) {
					if (config[locale]) {
						dataAsHash = dataAsArray[0];
					} else {
						dataAsHash[element] = JSON.parse(dataAsArray[idx]);
					}
				});
				calendarsToLoad.forEach(function (cal, idx) {
					calendars.calendarMap[cal] = dataAsArray[idx + jsonElements.length];
				});

				if (loaderConfig.isBuild) {
					dataAsHash.calendars = calendarsToLoad.map(function (calendar) {
						return calendars.dependencies[calendar].calendar;
					});
				}

				onload(dataAsHash);
			});
		}
	};
});
