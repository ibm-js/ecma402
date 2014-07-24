/**
 * Commonly used routines throughout ECMA-402 package. Also referred to in the standard as "Abstract Operations"
 */
define(["./List", "./Record",
		"requirejs-text/text!../cldr/config/availableLocales.json",
		"requirejs-text/text!../cldr/supplemental/aliases.json",
		"requirejs-text/text!../cldr/supplemental/localeAliases.json",
		"requirejs-text/text!../cldr/supplemental/parentLocales.json",
		"requirejs-text/text!../cldr/supplemental/likelySubtags.json",
		"requirejs-text/text!../cldr/supplemental/calendarPreferenceData.json",
],
	function (List, Record, availableLocalesJson, aliasesJson, localeAliasesJson,
			parentLocalesJson, likelySubtagsJson, calendarPreferenceDataJson) {
		var aliases = JSON.parse(aliasesJson).supplemental.metadata.alias;
		var localeAliases = JSON.parse(localeAliasesJson).supplemental.metadata.alias;
		var parentLocales = JSON.parse(parentLocalesJson).supplemental.parentLocales.parentLocale;
		var likelySubtags = JSON.parse(likelySubtagsJson).supplemental.likelySubtags;
		var calendarPreferenceData = JSON.parse(calendarPreferenceDataJson).supplemental.calendarPreferenceData;
		var common = {
			unicodeLocaleExtensions : /-u(-[a-z0-9]{2,8})+/g,
			/**
			 * Utility function to convert identifier strings to upper case as defined in ECMA-402 Section 6.1
			 * 
			 * @param {String} identifier The string to be converted
			 * @returns {String} The converted string
			 * @private
			 */
			_toUpperCaseIdentifier : function (identifier) {
				var match = /[a-z]/g;
				return identifier.replace(match, function (m) {
					return m.toUpperCase();
				}); // String
			},
			/**
			 * Utility function to convert identifier strings to lower case as defined in ECMA-402 Section 6.1
			 * 
			 * @param {String} identifier The string to be converted
			 * @returns {String} The converted string
			 * @private
			 */
			_toLowerCaseIdentifier : function (identifier) {
				var match = /[A-Z]/g;
				return identifier.replace(match, function (m) {
					return m.toLowerCase();
				}); // String
			},
			/**
			 * Utility function to retrieve the appropriate region code given a locale identifier.
			 * If just a language tag is given, then the likely subtags data from CLDR is checked
			 * to find the most likely region code.
			 * 
			 * @param {String} locale The locale identifier
			 * @returns {String} The 2 letter region code
			 * @private
			 */
			_getRegion : function (locale) {
				var region = "001";
				var regionPos = locale.search(/(?:-)([A-Z]{2})(?=(-|$))/);
				if (regionPos >= 0) {
					region = locale.substr(regionPos + 1, 2);
				} else {
					var likelySubtag = likelySubtags[locale];
					if (likelySubtag) {
						region = likelySubtag.substr(-2);
					}
				}
				return region;
			},
			/**
			 * Utility function to determine the supported calendars for a given region.
			 * Calendar preference data from CLDR is used to determine which locales are used
			 * in a given region.
			 * 
			 * @param {String} region The 2 letter region code
			 * @returns {String[]} An array containing the supported calendars for this region, in order of preference.
			 * @private
			 */
			_getSupportedCalendars : function (region) {
				var supportedCalendars = [ "gregory", "buddhist", "hebrew", "japanese", "roc",
				                           "islamic", "islamic-civil", "islamic-tbla", "islamic-umalqura"];
				var calendarPreferences = [];
				if (calendarPreferenceData[region]) {
					var prefs = calendarPreferenceData[region].toString().split(" ");
					prefs.forEach(function (pref) {
						var thisPref = pref.replace("gregorian", "gregory");
						if (supportedCalendars.indexOf(thisPref) !== -1) {
							calendarPreferences.push(thisPref);
						}
					});
				}
				/* Gregorian should always be supported */
				if (calendarPreferences.indexOf("gregory") === -1) {
					calendarPreferences.push("gregory");
				}
				return calendarPreferences;
			},

			/**
			 * IsStructurallyValidLanguageTag abstract operation as defined in ECMA-402 Section 6.2.2
			 * 
			 * @param {String} locale The language tag to check
			 * @returns {Boolean} Returns true if the string is a structurally valid language tag.
			 * @private
			 */
			isStructurallyValidLanguageTag : function (locale) {
				if (typeof locale !== "string") {
					return false; // Boolean
				}
				var identifier = this._toLowerCaseIdentifier(locale);
				var langtag = new RegExp(
						"^([a-z]{2,3}(-[a-z]{3}){0,3}|[a-z]{4,8})" + // language
						"(-[a-z]{4})?" + // script
						"(-([a-z]{2}|\\d{3}))?" + // territory
						"(-([a-z0-9]{5,8}|\\d[a-z0-9]{3}))*" + // variant
						"(-[a-wyz0-9](-[a-z0-9]{2,8})+)*(-x(-[a-z0-9]{1,8})+)?$"); // extension
				var privateuse = /x(-[a-z0-9]{1,8})+/;
				var grandfathered = new RegExp(
						"en-gb-oed|(i-(ami|bnn|default|enochian|hak|klingon|lux|mingo|navajo|pwn|tao|tay|tsu))|" +
						"sgn-((be-(fr|nl))|(ch-de))");
				if (privateuse.test(identifier) || grandfathered.test(identifier)) {
					return true; // Boolean
				}

				/**
				 * Utility function to determine whether the given element is a unique variant
				 * within the context of a BCP 47 compliant language tag.
				 * 
				 * @param {String} element The element tag
				 * @returns {Boolean} Returns true if the given element is a unique variant.
				 * @private
				 */
				function _isUniqueVariant(element) {
					var firstSingletonPosition = identifier.search(/-[a-z0-9]-/);
					if (firstSingletonPosition > 0) {
						return identifier.indexOf(element) > firstSingletonPosition
							|| identifier.indexOf(element) === identifier.lastIndexOf(element,
							firstSingletonPosition); // Boolean
					}
					return identifier.indexOf(element) === identifier.lastIndexOf(element); // Boolean
				}

				/**
				 * Utility function to determine whether the given element is a unique singleton
				 * within the context of a BCP 47 compliant language tag.
				 * 
				 * @param {String} element The element tag
				 * @returns {Boolean} Returns true if the given element is a unique singleton.
				 * @private
				 */
				function _isUniqueSingleton(element) {
					var firstXPosition = identifier.search(/-x-/);
					if (firstXPosition > 0) {
						return identifier.indexOf(element) === identifier.lastIndexOf(element, firstXPosition);
					}
					return identifier.indexOf(element) === identifier.lastIndexOf(element); // Boolean
				}

				if (langtag.test(identifier)) { // represents a well-formed BCP 47 language tag
					var varianttag = /-[a-z0-9]{5,8}|\d[a-z0-9]{3}/g;
					var variants = varianttag.exec(identifier);
					var singletontag = /-[a-wyz0-9]-/g;
					var singletons = singletontag.exec(identifier);
					var variantsOK = !variants || variants.every(_isUniqueVariant); // has no duplicate variant tags
					var singletonsOK = !singletons || singletons.every(_isUniqueSingleton); // has no duplicate
					// singleton tags
					return variantsOK && singletonsOK;
				}
				return false; // Boolean
			},

			/**
			 * CanonicalizeLanguageTag abstract operation as defined in ECMA-402 Section 6.2.3
			 * 
			 * @param {String} locale The structurally valid language tag to canonicalize
			 * @returns {String} The canonical and case regularized form of the language tag.
			 * @private
			 */
			CanonicalizeLanguageTag : function (locale) {
				var result = locale.toLowerCase();
				var firstSingletonPosition = result.search(/(^|-)[a-z0-9]-/);
				var languageTag = /^([a-z]{2,3}(-[a-z]{3}){0,3}|[a-z]{4,8})(?=(-|$))/;
				var scriptTag = /(?:-)([a-z]{4})(?=(-|$))/;
				var regionTag = /(?:-)([a-z]{2})(?=(-|$))/g;
				var variantTag = /(?:-)([a-z0-9]{5,8}|\d[a-z0-9]{3})/;
				var extlangTag = /^([a-z]{2,3}(-[a-z]{3}))(?=(-|$))/;
				/* Canonicalize the Language Tag */
				result = result.replace(languageTag, function (m) {
					var lookupAlias = aliases.languageAlias[m];
					if (lookupAlias && lookupAlias._reason !== "macrolanguage") {
						m = lookupAlias._replacement ? lookupAlias._replacement : m;
					}
					return m;
				}); // String
				// Canonicalize the Script Tag
				result = result.replace(scriptTag, function (m) {
					if (firstSingletonPosition === -1 || result.indexOf(m) < firstSingletonPosition) {
						m = m.substring(0, 2).toUpperCase() + m.substring(2);
						var script = m.substring(1);
						var lookupAlias = aliases.scriptAlias[script];
						if (lookupAlias) {
							m = lookupAlias._replacement ? "-" + lookupAlias._replacement : m;
						}
					}
					return m;
				}); // String
				// Canonicalize the Region Tag
				result = result.replace(regionTag, function (m) {
					if (firstSingletonPosition === -1 || result.indexOf(m) < firstSingletonPosition) {
						m = m.toUpperCase();
						var region = m.substring(1);
						var lookupAlias = aliases.territoryAlias[region];
						if (lookupAlias) {
							var repl = lookupAlias._replacement;
							if (repl.indexOf(" ") >= 0) {
								repl = repl.substring(0, repl.indexOf(" "));
							}
							m = repl ? "-" + repl : m;
						}
					}
					return m;
				}); // String
				// Canonicalize the Variant Tag
				result = result.replace(variantTag, function (m) {
					// Variant tags are upper case in CLDR's data.
					var variant = common._toUpperCaseIdentifier(m.substring(1));
					var lookupAlias = aliases.variantAlias[variant];
					if (lookupAlias) {
						var repl = lookupAlias._replacement;
						m = repl ? "-" + common._toLowerCaseIdentifier(repl) : m;
					}
					return m;
				}); // String
				// Canonicalize any whole tag combinations or grandfathered tags
				result = result.replace(result, function (m) {
					var lookupAlias = aliases.languageAlias[m];
					if (lookupAlias && lookupAlias._reason !== "macrolanguage") {
						m = lookupAlias._replacement ? lookupAlias._replacement : m;
					}
					return m;
				}); // String
				// Remove the prefix if an extlang tag exists
				if (extlangTag.test(result)) {
					result = result.replace(/^[a-z]{2,3}-/, "");
				}
				return result; // String
			},

			/**
			 * DefaultLocale abstract operation as defined in ECMA-402 Section 6.2.4
			 * 
			 * @returns {String} A string value representing the structurally valid (6.2.2)
			 *  and canonicalized (6.2.3) BCP 47 language tag for the host environment’s current locale.
			 * @private
			 */
			DefaultLocale : function () {
				var result;
				var global = (function () {return this; })();
				var navigator = global.navigator;
				if (navigator && this.isStructurallyValidLanguageTag(navigator.language)) {
					result = this.BestFitAvailableLocale(this.availableLocalesList, this
						.CanonicalizeLanguageTag(navigator.language));
				}
				if (!result && navigator && this.isStructurallyValidLanguageTag(navigator.userLanguage)) {
					result = this.BestFitAvailableLocale(this.availableLocalesList, this
						.CanonicalizeLanguageTag(navigator.userLanguage));
				}
				if (!result) {
					result = "root";
				}
				return result;
			},

			/**
			 * IsWellFormedCurrencyCode abstract operation as defined in ECMA-402 Section 6.3.1
			 * 
			 * @param {String} currency The currency code to check
			 * @returns {Boolean} Returns true if the string is a well formed currency code.
			 * @private
			 */
			IsWellFormedCurrencyCode : function (currency) {
				var wellFormed = /^[A-Za-z]{3}$/;
				return wellFormed.test(currency.toString()); // Boolean
			},

			/**
			 * CanonicalizeLocaleList abstract operation as defined in ECMA-402 Section 9.2.1
			 * 
			 * @param {*} locales The list of locales to canonicalize
			 * @returns {Object} The canonicalized list of locales, as a "List" object.
			 * @private
			 */
			CanonicalizeLocaleList : function (locales) {
				if (locales === undefined) {
					return new List();
				}
				if (locales === null) {
					throw new TypeError("Locale list can not be null");
				}
				var seen = new List();
				if (typeof locales === "string") {
					locales = new Array(locales);
				}
				var O = Object(locales);
				var lenValue = O.length;
				var len = lenValue >>> 0; // Convert to unsigned 32-bit integer
				for (var k = 0; k < len ; k++) {
					var Pk = k.toString();
					var kPresent = Pk in O;
					if (kPresent) {
						var kValue = O[Pk];
						if (typeof kValue !== "string" && typeof kValue !== "object") {
							throw new TypeError(kValue + " must be a string or an object.");
						}
						var tag = kValue.toString();
						if (!this.isStructurallyValidLanguageTag(tag)) {
							throw new RangeError(tag + " is not a structurally valid language tag.");
						}
						tag = this.CanonicalizeLanguageTag(tag);
						if (seen.indexOf(tag) < 0) {
							seen.push(tag);
						}
					}
				}
				return seen;
			},

			/**
			 * BestAvailableLocale abstract operation as defined in ECMA-402 Section 9.2.2
			 * 
			 * @param {List} availableLocales The canonicalized list of available locales
			 * @param {String} locale The locale identifier to check
			 * @returns {String} The best available locale, using the fallback mechanism of RFC 4647, section 3.4.
			 * @private
			 */
			BestAvailableLocale : function (availableLocales, locale) {
				var candidate = locale;
				while (true) {
					if (availableLocales.indexOf(candidate) >= 0) {
						return candidate;
					}
					var pos = candidate.lastIndexOf("-");
					if (pos < 0) {
						return undefined;
					}
					if (pos >= 2 && candidate.charAt(pos - 2) === "-") {
						pos -= 2;
					}
					candidate = candidate.substring(0, pos);
				}
			},

			/**
			 * LookupMatcher abstract operation as defined in ECMA-402 Section 9.2.3
			 * 
			 * @param {List} availableLocales The canonicalized list of available locales
			 * @param {List} requestedLocales The canonicalized list of requested locales
			 * @returns {String} The best available locale identifier to meet the request
			 * @private
			 */
			LookupMatcher : function (availableLocales, requestedLocales) {
				var i = 0;
				var len = requestedLocales.length;
				var availableLocale = null;
				var locale = null;
				var noExtensionsLocale = null;
				while (i < len && availableLocale === null) {
					locale = requestedLocales[i];
					noExtensionsLocale = locale.replace(this.unicodeLocaleExtensions, "");
					availableLocale = this.BestAvailableLocale(availableLocales, noExtensionsLocale);
					i++;
				}
				var result = new Record();
				if (availableLocale) {
					result.set("locale", availableLocale);
					if (locale !== noExtensionsLocale) {
						result.set("extension", locale.match(this.unicodeLocaleExtensions)[0]);
						result.set("extensionIndex", locale.search(this.unicodeLocaleExtensions));
					}
				} else {
					result.set("locale", this.DefaultLocale());
				}

				return result;
			},

			/**
			 * BestFitAvailableLocale abstract operation.
			 * 
			 * Algorithm is similar to BestAvailableLocale, as in Section 9.2.2
			 * except that the following additional operations are performed:
			 * 1). CLDR macrolanguage replacements are done ( i.e. "cmn" becomes "zh" )
			 * 2). Known locale aliases, such as zh-TW = zh-Hant-TW, are resolved,
			 * 3). Explicit parent locales from CLDR's supplemental data are also considered.
			 * 
			 * @param {List} availableLocales The canonicalized list of available locales
			 * @param {String} locale The locale identifier to check
			 * @returns {String} The best fit available locale, using CLDR's locale fallback mechanism.
			 * @private
			 */

			BestFitAvailableLocale : function (availableLocales, locale) {
				var candidate = locale;
				while (true) {
					var langtag = candidate.substring(0, candidate.indexOf("-"));
					var lookupAlias = aliases.languageAlias[langtag];
					if (lookupAlias && lookupAlias._reason === "macrolanguage") {
						candidate = candidate.replace(langtag, lookupAlias._replacement);
					}
					lookupAlias = localeAliases.localeAlias[candidate];
					if (lookupAlias) {
						candidate = lookupAlias._replacement;
					}
					if (availableLocales.indexOf(candidate) >= 0) {
						return candidate;
					}
					var parentLocale = parentLocales[candidate];
					if (parentLocale) {
						candidate = parentLocale;
					} else {
						var pos = candidate.lastIndexOf("-");
						if (pos < 0) {
							return undefined;
						}
						if (pos >= 2 && candidate.charAt(pos - 2) === "-") {
							pos -= 2;
						}
						candidate = candidate.substring(0, pos);
					}
				}
			},

			/**
			 * BestFitMatcher abstract operation as defined in ECMA-402 Section 9.2.4
			 * 
			 * @param {List} availableLocales The canonicalized list of available locales
			 * @param {List} requestedLocales The canonicalized list of requested locales
			 * @returns {String} The best available locale identifier to meet the request
			 * @private
			 */
			BestFitMatcher : function (availableLocales, requestedLocales) {
				var i = 0;
				var len = requestedLocales.length;
				var availableLocale = null;
				var locale = null;
				var noExtensionsLocale = null;
				while (i < len && availableLocale === null) {
					locale = requestedLocales[i];
					noExtensionsLocale = locale.replace(this.unicodeLocaleExtensions, "");
					availableLocale = this.BestFitAvailableLocale(availableLocales, noExtensionsLocale);
					i++;
				}
				var result = new Record();
				if (availableLocale) {
					result.set("locale", availableLocale);
					if (locale !== noExtensionsLocale) {
						result.set("extension", locale.match(this.unicodeLocaleExtensions)[0]);
						result.set("extensionIndex", locale.search(this.unicodeLocaleExtensions));
					}
				} else {
					result.set("locale", this.DefaultLocale());
				}
				return result;
			},

			/**
			 * ResolveLocale abstract operation as defined in ECMA-402 Section 9.2.5
			 * 
			 * Compares a BCP 47 language priority list requestedLocales against the locales in availableLocales
			 * and determines the best available language to meet the request.
			 * 
			 * @param {List} availableLocales The canonicalized list of available locales
			 * @param {List} requestedLocales The canonicalized list of requested locales
			 * @param {Record} options Locale matching options (for example, "lookup" vs. "best fit" algorithm)
			 * @param {String[]} relevantExtensionKeys Array of relevant -u extension keys for the match
			 * @param {Object} localeData Hash table containing the preloaded locale data.
			 * @returns {Record} The locale information regarding best available locale that meets the request
			 * @private
			 */
			/* jshint maxcomplexity: 14 */
			ResolveLocale : function (availableLocales, requestedLocales, options, relevantExtensionKeys,
									  localeData) {
				var matcher = options.localeMatcher;
				var r = matcher === "lookup" ? this.LookupMatcher(availableLocales, requestedLocales) : this
					.BestFitMatcher(availableLocales, requestedLocales);
				var foundLocale = r.locale;
				var extension = "";
				var extensionSubtags = [];
				var extensionSubtagsLength = 0;
				var extensionIndex = 0;
				if (r.extension !== undefined) {
					extension = r.extension;
					extensionIndex = r.extensionIndex;
					extensionSubtags = extension.split("-");
					extensionSubtagsLength = extensionSubtags.length;
				}
				var result = new Record();
				result.set("dataLocale", foundLocale);
				var supportedExtension = "-u";
				var i = 0;
				var len = relevantExtensionKeys.length;
				while (i < len) {
					var key = relevantExtensionKeys[String(i)];
					var foundLocaleData = localeData[foundLocale];
					var keyLocaleData = foundLocaleData[key];
					var value = keyLocaleData["0"];
					var supportedExtensionAddition = "";
					if (typeof extensionSubtags !== "undefined") {
						var keyPos = extensionSubtags.indexOf(key);
						var valuePos;
						if (keyPos !== -1) {
							if (keyPos + 1 < extensionSubtagsLength
								&& extensionSubtags[String(keyPos + 1)].length > 2) {
								var requestedValue = extensionSubtags[String(keyPos + 1)];
								// fix for islamic-civil, islamic-umalqura & islamic-tbla calendars
								if (requestedValue === "islamic" && extensionSubtags[String(keyPos + 2)]) {
									requestedValue += "-" + extensionSubtags[String(keyPos + 2)];
								}
								valuePos = keyLocaleData.indexOf(requestedValue);
								if (valuePos !== -1) {
									value = requestedValue;
									supportedExtensionAddition = "-" + key + "-" + value;
								}
							} else {
								valuePos = keyLocaleData.indexOf("true");
								if (valuePos !== -1) {
									value = "true";
								}
							}
						}
					}
					var optionsValue = options[key];
					if (optionsValue !== undefined) {
						if (keyLocaleData.indexOf(optionsValue) !== -1) {
							if (optionsValue !== value) {
								value = optionsValue;
								supportedExtensionAddition = "";
							}
						}
					}
					result.set(key, value);
					supportedExtension += supportedExtensionAddition;
					i++;
				}
				if (supportedExtension.length > 2) {
					var preExtension = foundLocale.substring(0, extensionIndex);
					var postExtension = foundLocale.substring(extensionIndex);
					foundLocale = preExtension + supportedExtension + postExtension;
				}
				result.set("locale", foundLocale);
				return result;
			},
			/* jshint maxcomplexity: 10 */

			/**
			 * LookupSupportedLocales abstract operation as defined in ECMA-402 Section 9.2.6
			 * 
			 * Returns the subset of the provided BCP 47 language priority list requestedLocales for which
			 * availableLocales has a matching locale when using the BCP 47 lookup algorithm.
			 * Locales appear in the same order in the returned list as in requestedLocales.
			 * 
			 * @param {List} availableLocales The canonicalized list of available locales
			 * @param {List} requestedLocales The canonicalized list of requested locales
			 * @returns {String[]} An array containing a list of matching locales
			 * @private
			 */
			LookupSupportedLocales : function (availableLocales, requestedLocales) {
				var len = requestedLocales.length;
				var subset = new List();
				var k = 0;
				while (k < len) {
					var locale = requestedLocales[k];
					var noExtensionsLocale = locale.replace(this.unicodeLocaleExtensions, "");
					var availableLocale = this.BestAvailableLocale(availableLocales, noExtensionsLocale);
					if (availableLocale !== undefined) {
						subset.push(locale);
					}
					k++;
				}
				var subsetArray = subset.toArray();
				return subsetArray;
			},

			/**
			 * BestFitSupportedLocales abstract operation as defined in ECMA-402 Section 9.2.7
			 * 
			 * Returns the subset of the provided BCP 47 language priority list requestedLocales for which
			 * availableLocales has a matching locale when using the best fit matcher algorithm.
			 * Locales appear in the same order in the returned list as in requestedLocales.
			 * 
			 * @param {List} availableLocales The canonicalized list of available locales
			 * @param {List} requestedLocales The canonicalized list of requested locales
			 * @returns {String[]} An array containing a list of matching locales
			 * @private
			 */
			BestFitSupportedLocales : function (availableLocales, requestedLocales) {
				var len = requestedLocales.length;
				var subset = new List();
				var k = 0;
				while (k < len) {
					var locale = requestedLocales[k];
					var noExtensionsLocale = locale.replace(this.unicodeLocaleExtensions, "");
					var availableLocale = this.BestFitAvailableLocale(availableLocales, noExtensionsLocale);
					if (availableLocale !== undefined) {
						subset.push(locale);
					}
					k++;
				}
				var subsetArray = subset.toArray();
				return subsetArray;
			},

			/**
			 * SupportedLocales abstract operation as defined in ECMA-402 Section 9.2.8
			 * 
			 * Returns the subset of the provided BCP 47 language priority list requestedLocales for which
			 * availableLocales has a matching locale. Two algorithms are available to match the locales:
			 * the Lookup algorithm described in RFC 4647 section 3.4, and an implementation dependent
			 * best-fit algorithm. Locales appear in the same order in the returned list as in requestedLocales.
			 * 
			 * @param {List} availableLocales The canonicalized list of available locales
			 * @param {List} requestedLocales The canonicalized list of requested locales
			 * @param {Object} options Specifies which lookup algorithm to use
			 * @returns {String[]} An array containing a list of matching locales
			 * @private
			 */
			SupportedLocales : function (availableLocales, requestedLocales, options) {
				var matcher;
				var subset;
				if (options !== undefined) {
					options = Object(options);
					matcher = options.localeMatcher;
					if (matcher !== undefined) {
						matcher = String(matcher);
						if (matcher !== "lookup" && matcher !== "best fit") {
							throw new RangeError("Matching algorithm must be 'lookup' or 'best fit'.");
						}
					}
				}
				if (matcher === undefined || matcher === "best fit") {
					subset = this.BestFitSupportedLocales(availableLocales, requestedLocales);
				} else {
					subset = this.LookupSupportedLocales(availableLocales, requestedLocales);
				}
				for (var P in Object.getOwnPropertyNames(subset)) {
					var desc = Object.getOwnPropertyDescriptor(subset, P);
					if (desc !== undefined) {
						desc.writable = false;
						desc.configurable = false;
						Object.defineProperty(subset, P, desc);
					}
				}
				Object.defineProperty(subset, "length", {
					writable : false,
					configurable : false
				});
				return subset;
			},

			/**
			 * GetOption abstract operation as defined in ECMA-402 Section 9.2.9
			 * 
			 * Extracts the value of the named property from the provided options object,
			 * converts it to the required type, checks whether it is one of a List of allowed values,
			 * and fills in a fallback value if necessary.
			 * 
			 * @param {Object} options The object containing the options to search
			 * @param {String} property The property to retrieve
			 * @param {String} type The type of the resulting option value
			 * @param {Array} values The list of allowed values
			 * @param {*} fallback The fallback value
			 * @returns {*} The resulting value as described above.
			 * @private
			 */
			GetOption : function (options, property, type, values, fallback) {
				var value = options[property];
				if (value !== undefined) {
					if (type === "boolean") {
						value = Boolean(value);
					}
					if (type === "string") {
						value = String(value);
					}
					if (values !== undefined) {
						for (var v in values) {
							if (values[v] === value) {
								return value;
							}
						}
						throw new RangeError("The specified value " + value + " for property " + property
							+ " is invalid.");
					}
					return value;
				}
				return fallback;
			},

			/**
			 * GetNumberOption abstract operation as defined in ECMA-402 Section 9.2.10
			 * 
			 * Extracts the value of the named property from the provided options object,
			 * converts it to a Number value, checks whether it is in the allowed range,
			 * and fills in a fallback value if necessary.
			 * 
			 * @param {Object} options The object containing the options to search
			 * @param {String} property The property to retrieve
			 * @param {Number} minimum The minimum numeric value for this option
			 * @param {Number} maximum The maximum numeric value for this option
			 * @param {*} fallback The fallback value
			 * @returns {Number} The resulting value as described above.
			 * @private
			 */
			GetNumberOption : function (options, property, minimum, maximum, fallback) {
				var value = options[property];
				if (value !== undefined) {
					value = Number(value);
					if (isNaN(value) || value < minimum || value > maximum) {
						throw new RangeError("The specified number value " + value + " is not in the allowed range");
					}
					return Math.floor(value);
				}
				return fallback;
			}
		};

		common.availableLocalesList = common.CanonicalizeLocaleList(JSON.parse(availableLocalesJson).availableLocales);
		return common;
	});