/**
 * Plugin to load a single locale.  For example, load!en returns
 * an Object like { currencies: ..., numbers: ..., "ca-gregorian": ... }.
 * Used by preloads! plugin.
 */
define([
	"require",
	"requirejs-text/text"	// just so builder knows we will be using that module
], function (require) {
	return {
		load: function (locale, callerRequire, onload) {
			// Compute dependencies to require().
			// For specified locale, load JSON files for its "currencies", "numbers", and "ca-gregorian" data.
			var jsonElements = [ "currencies", "numbers", "ca-gregorian" ];
			var dependencies = jsonElements.map(function (element) {
				return "requirejs-text/text!./cldr/" + locale + "/" + element + ".json";
			});

			// Load all the JSON files requested, and then return their data in a hash
			require(dependencies, function () {
				var dataAsArray = arguments, dataAsHash = {};
				jsonElements.forEach(function (element, idx) {
					dataAsHash[element] = JSON.parse(dataAsArray[idx]);
				});
				onload(dataAsHash);
			});
		}
	};
});
