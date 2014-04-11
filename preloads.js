define( "preloads", [ 'common', 'locales', "json!cldr/root/currencies.json", "json!cldr/root/numbers.json",
		"json!cldr/root/ca-gregorian.json" ], function (common, locales, root_currencies, root_numbers,
		root_ca_gregorian) {
	var preloads = {
		"root" : {
			"currencies" : root_currencies,
			"numbers" : root_numbers,
			"ca-gregorian" : root_ca_gregorian
		}
	};

	function preloadLocale (locale) {
		if (preloads[locale] === undefined) {
			preloads[locale] = {};
		}
		locales.jsonElements.forEach(function (element) {
			preloads[locale][element] = require("json!cldr/" + locale + "/" + element + ".json");
		});
	}

	preloadLocale(common.DefaultLocale());
	locales.preLoadList.forEach(function (locale) {
		preloadLocale(locale);
	});
	return preloads;
});