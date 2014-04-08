/**
 * 
 */
define( ["module",
        "json!cldr/config/availableLocales.json",
     	"json!cldr/supplemental/aliases.json",
    	"json!cldr/supplemental/localeAliases.json",
    	"json!cldr/supplemental/parentLocales.json",
], function(module, availableLocales_json, aliases_json, localeAliases_json, parentLocales_json) {
	var locales = {};
	locales.preLoadList = [];
	locales.preLoadDependencyList = [];
	var jsonElements = [ "currencies", "numbers", "ca-gregorian" ];

	function loadLocaleElements(locale) {
		jsonElements.forEach(function(element){
			var dependency = "json!cldr/"+locale+"/"+element+".json";
			locales.preLoadDependencyList.push(dependency);
			require([dependency]);
		});
	}

	locales.defaultLocale = function() {
		return "en";
	};
	
	loadLocaleElements(locales.defaultLocale());
	if (module.config()){
		module.config().forEach(function(locale){
			locales.preLoadList.push(locale);
			loadLocaleElements(locale);
		});
	}
	return locales;
});