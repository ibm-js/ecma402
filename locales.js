/**
 * 
 */
define( [ "require", "module", "./common",  ], function (require, module, common) {
	var locales = {
		preLoadList : [ "root" ],
		jsonElements : [ "currencies", "numbers", "ca-gregorian" ]
	};

	function loadLocaleElements (locale) {
		locales.jsonElements.forEach(function (element) {
			var dependency = "../requirejs-text/text!cldr/" + locale + "/" + element + ".json";
			require([ dependency ]);
		});
	}

	locales.preLoadList.push(common.DefaultLocale());
	loadLocaleElements(common.DefaultLocale());

	if (module.config()) {
		if (typeof module.config() === "string") {
			if (module.config() === "allAvailable") {
				common.availableLocalesList.forEach(function (locale) {
					if (locales.preLoadList.indexOf(locale) === -1) {
						locales.preLoadList.push(locale);
						loadLocaleElements(locale);
					}
				});
			} else {
				var bestFitPreload = common.BestFitAvailableLocale(common.availableLocalesList, module.config());
				if (bestFitPreload && locales.preLoadList.indexOf(bestFitPreload) === -1) {
					locales.preLoadList.push(bestFitPreload);
					loadLocaleElements(bestFitPreload);
				}
			}
		} else if (module.config() instanceof Array) {
			module.config().forEach(function (locale) {
				var bestFitPreload = common.BestFitAvailableLocale(common.availableLocalesList, locale);
				if (bestFitPreload && locales.preLoadList.indexOf(bestFitPreload) === -1) {
					locales.preLoadList.push(bestFitPreload);
					loadLocaleElements(bestFitPreload);
				}
			});
		} else if (module.config() instanceof RegExp) {
			common.availableLocalesList.forEach(function (locale) {
				if (module.config().test(locale) && locales.preLoadList.indexOf(locale) === -1) {
					locales.preLoadList.push(locale);
					loadLocaleElements(locale);
				}
			});
		}
	}
	return locales;
});