define(
	[ 'locales', "json!cldr/root/currencies.json", "json!cldr/root/numbers.json", "json!cldr/root/ca-gregorian.json" ],
	function(locales, root_currencies, root_numbers, root_ca_gregorian) {
		var preloads = {
			"root" : {
				"currencies" : root_currencies,
				"numbers" : root_numbers,
				"ca-gregorian" : root_ca_gregorian
			}
		};

		var jsonElements = [ "currencies", "numbers", "ca-gregorian" ];
		function preloadLocale(locale) {
			if(preloads[locale]===undefined){
				preloads[locale] = {};
			}
			jsonElements.forEach(function(element) {
				preloads[locale][element] = require("json!cldr/"+locale+"/"+element+".json");
			});
		}

		preloadLocale(locales.defaultLocale());
		locales.preLoadList.forEach(function(locale) {
			preloadLocale(locale);
		});
		return preloads;
	});