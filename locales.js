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
	"./impl/load"	// just so builder knows we will be using that module
], function (module, require, common) {
	// Compute locales to pre-load. Use hash to remove duplicates.
	var localeHash = {};
	localeHash.root = true;
	localeHash[common.DefaultLocale()] = true;
	var config = module.config();
	if (config) {
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
	}
	var locales = Object.keys(localeHash);

	// Compute dependencies to require()
	var dependencies = locales.map(function (locale) { return "./impl/load!" + locale; });

	return {
		load: function (path, callerRequire, onload) {
			// Load the locale data for every requested locale, and then return it in a hash
			require(dependencies, function () {
				var localeDataArray = arguments, localeDataHash = {};
				locales.forEach(function (locale, idx) {
					localeDataHash[locale] = localeDataArray[idx];
				});
				onload(localeDataHash);
			});
		}
	};
});
