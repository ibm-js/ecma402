define( [ "require", "./common", "./locales",  "../requirejs-text/text!cldr/root/currencies.json", "../requirejs-text/text!cldr/root/numbers.json",
		"../requirejs-text/text!cldr/root/ca-gregorian.json" ], function (require, common, locales, root_currencies, root_numbers,
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
			preloads[locale][element] = JSON.parse(require("../requirejs-text/text!cldr/" + locale + "/" + element + ".json"));
		});
	}

	preloadLocale(common.DefaultLocale());
	locales.preLoadList.forEach(function (locale) {
		preloadLocale(locale);
	});
	return preloads;
});