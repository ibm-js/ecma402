/**
 * Plugin to pre-load the locales the app has specified via:
 *
 * require.config({
 *		config: {
 * 			"ecma402/locales":  /^(ar-(TN|SA)|en|es|hi|ja|de)$/
 *		}
 * });
 */
define([
	"module",
	"require",
	"./impl/common",
	"./impl/load"
], function (module, require, common, loadCss) {
	// Build variable
	var writeFile;

	// Compute locales to pre-load. Use hash to remove duplicates.
	var localeHash = {};
	localeHash.root = true;
	localeHash[common.DefaultLocale()] = true;
	var config = module.config();
	if (config instanceof RegExp) {
		common.availableLocalesList.forEach(function (locale) {
			if (config.test(locale)) {
				localeHash[locale] = true;
			}
		});
	} else {
		if (typeof config === "string") {
			config = [ config ];
		}
		if (config instanceof Array) {
			config.forEach(function (locale) {
				var bestFitPreload = common.BestFitAvailableLocale(common.availableLocalesList, locale);
				if (bestFitPreload) {
					localeHash[bestFitPreload] = true;
				}
			});
		}
	}
	var locales = Object.keys(localeHash);
	var localeDataHash = {};

	// Compute dependencies to require()
	function getDependency(locale) {
		return loadCss.id + "!" + locale;
	}

	return {
		load: function (path, callerRequire, onload) {
			var dependencies = locales.map(getDependency);
			// Load the locale data for every requested locale, and then return it in a hash
			require(dependencies, function () {
				var localeDataArray = arguments;
				locales.forEach(function (locale, idx) {
					localeDataHash[locale] = localeDataArray[idx];
				});
				onload(localeDataHash);
			});
		},

		writeFile: function (pluginName, resource, callerRequire, write) {
			writeFile = write;
		},

		addModules: function (pluginName, resource, addModules) {
			var modulesToAdd = [];
			locales.forEach(function (locale) {
				var localeData = localeDataHash[locale];
				var calendarsDeps = localeData.calendars.map(function (cal) {return "./calendars/" + cal; });
				modulesToAdd = modulesToAdd.concat(calendarsDeps);
				delete localeData.calendars;
			});
			addModules(modulesToAdd);
		},

		onLayerEnd: function (write, data) {
			// Calculate layer path
			var match = data.path.match(/^(.*\/)?(.*)\.js$/);
			var partialLayerPath = (match[1] || "") + "cldr/" + match[2] + "_";

			// Calculate layer mid
			match = data.name.match(/^(.*\/)?(.*)$/);
			var layerMid = (match[1] || "") + "cldr/" + match[2];

			locales.forEach(function (locale) {
				var path = partialLayerPath + locale + ".js";
				writeFile(path, "define(" + JSON.stringify(localeDataHash[locale]) + ")");
			});

			localeHash._layerMid = layerMid;
			write("require.config({config:{'" + loadCss.id + "':" + JSON.stringify(localeHash) + "}});");

			// Reset
			localeDataHash = {};
		}
	};
});
