define([ "./impl/Record", "./impl/calendars", "./impl/common", "./locales!",
		"requirejs-text/text!./cldr/supplemental/currencyData.json",
		"requirejs-text/text!./cldr/supplemental/timeData.json",
		"requirejs-text/text!./cldr/supplemental/numberingSystems.json" ],
	function (Record, calendars, common, preloads,
			currencyDataJson, timeDataJson, numberingSystemsJson) {
			/**
			 * JavaScript implementation of internationalization APIs ("Intl") as defined by ECMA standard 402
			 * version 1.0, available for download at http://www.ecma-international.org/ecma-402/1.0/ECMA-402.pdf
			 * 
			 * @constructor
			 */
			/*jshint maxcomplexity: 25*/
			var Intl = {};
			var currencyData = JSON.parse(currencyDataJson);
			var timeData = JSON.parse(timeDataJson).supplemental.timeData;
			var numberingSystems = JSON.parse(numberingSystemsJson).supplemental.numberingSystems;
			var availableNumberingSystems = [ "latn" ];
			for (var ns in numberingSystems) {
				if (numberingSystems[ns]._type === "numeric" && ns !== "latn") {
					availableNumberingSystems.push(ns);
				}
			}

			/**
			 * InitializeNumberFormat abstract operation as defined in ECMA-402 Section 11.1.1.1
			 * 
			 * @param {Object} numberFormat The object to be initialized as a NumberFormat object
			 * @param {*} locales The requested locale or locales for formatting
			 * @param {Object} options Number formatting options
			 * @private
			 */
			function _initializeNumberFormat(numberFormat, locales, options) {
				if (numberFormat.hasOwnProperty("initializedIntlObject") && numberFormat.initializedIntlObject) {
					throw new TypeError("NumberFormat is already initialized.");
				}
				numberFormat.initializedIntlObject = true;
				var requestedLocales = common.CanonicalizeLocaleList(locales);
				if (options === undefined) {
					options = {};
				} else {
					options = Object(options);
				}
				var opt = new Record();
				var matcher = common
						.GetOption(options, "localeMatcher", "string", [ "lookup", "best fit" ], "best fit");
				opt.set("localeMatcher", matcher);
				var r = common.ResolveLocale(NumberFormat.availableLocales, requestedLocales, opt,
						NumberFormat.relevantExtensionKeys, NumberFormat.localeData);
				numberFormat.locale = r.locale;
				numberFormat.dataLocale = r.dataLocale;
				numberFormat.numberingSystem = r.nu;
				var s = common.GetOption(options, "style", "string", [ "decimal", "percent", "currency" ], "decimal");
				numberFormat.style = s;
				var c = common.GetOption(options, "currency", "string");
				if (c !== undefined && !common.IsWellFormedCurrencyCode(c)) {
					throw new RangeError("Invalid currency code " + c);
				}
				if (s === "currency" && c === undefined) {
					throw new TypeError("No currency code specified.");
				}
				var cDigits = 2;
				if (s === "currency") {
					c = common._toUpperCaseIdentifier(c);
					numberFormat.currency = c;
					numberFormat.currencySymbol = c;
					numberFormat.currencyDisplayName = c;
					if (currencyData.supplemental.currencyData.fractions[c]) {
						cDigits = currencyData.supplemental.currencyData.fractions[c]._digits;
					}
				}
				var cd = common.GetOption(options, "currencyDisplay", "string", [ "code", "symbol", "name" ], "symbol");
				if (s === "currency") {
					numberFormat.currencyDisplay = cd;
					if (cd === "symbol" || cd === "name") {
						var curr = preloads[r.dataLocale].currencies.main[r.dataLocale].numbers.currencies;
						if (curr[numberFormat.currency]) {
							numberFormat.currencySymbol = curr[numberFormat.currency].symbol;
							numberFormat.currencyDisplayName = curr[numberFormat.currency].displayName;
						}
					}
				}
				var mnid = common.GetNumberOption(options, "minimumIntegerDigits", 1, 21, 1);
				numberFormat.minimumIntegerDigits = mnid;
				var mnfdDefault;
				if (s === "currency") {
					mnfdDefault = cDigits;
				} else {
					mnfdDefault = 0;
				}
				var mnfd = common.GetNumberOption(options, "minimumFractionDigits", 0, 20, mnfdDefault);
				numberFormat.minimumFractionDigits = mnfd;
				var mxfdDefault;
				if (s === "currency") {
					mxfdDefault = Math.max(mnfd, cDigits);
				} else if (s === "percent") {
					mxfdDefault = Math.max(mnfd, 0);
				} else {
					mxfdDefault = Math.max(mnfd, 3);
				}
				var mxfd = common.GetNumberOption(options, "maximumFractionDigits", mnfd, 20, mxfdDefault);
				numberFormat.maximumFractionDigits = mxfd;
				var mnsd = options.minimumSignificantDigits;
				var mxsd = options.maximumSignificantDigits;
				if (mnsd !== undefined || mxsd !== undefined) {
					mnsd = common.GetNumberOption(options, "minimumSignificantDigits", 1, 21, 1);
					mxsd = common.GetNumberOption(options, "maximumSignificantDigits", mnsd, 21, 1);
					numberFormat.minimumSignificantDigits = mnsd;
					numberFormat.maximumSignificantDigits = mxsd;
				}
				var g = common.GetOption(options, "useGrouping", "boolean", undefined, true);
				numberFormat.useGrouping = g;
				var numb = preloads[r.dataLocale].numbers.main[r.dataLocale].numbers;
				if (r.locale === r.dataLocale) {
					numberFormat.numberingSystem = numb.defaultNumberingSystem;
				}
				var numberInfo = _getNumberInfo(numb, numberFormat.numberingSystem);
				var stylePatterns = numberInfo.patterns[s];
				numberFormat.positivePattern = stylePatterns.positivePattern;
				numberFormat.negativePattern = stylePatterns.negativePattern;
				/*
				 * The CLDR number format pattern is necessary in order to do localized grouping properly, for example
				 * #,##,##0.00 grouping in India.
				 */
				numberFormat.cldrPattern = stylePatterns.cldrPattern;
				numberFormat.symbols = numberInfo.symbols;
				numberFormat.boundFormat = undefined;
				numberFormat.initializedNumberFormat = true;
			}

			/**
			 * Utility function to insert grouping separators into the proper locations in a string of digits based on
			 * the CLDR pattern string.
			 * 
			 * @param {String} n The string representing the number to be formatted
			 * @param {String} pattern The number formatting pattern (from CLDR)
			 * @returns {String} The formatted string
			 * @private
			 */
			function doGrouping(n, pattern) {
				var numExp = /[0-9#.,]+/;
				var number = numExp.exec(pattern)[0];
				var dPos = number.lastIndexOf(".");
				if (dPos !== -1) {
					number = number.substring(0, dPos);
				}
				var groupings = number.split(",");
				groupings.reverse();
				groupings.pop();
				var currentGrouping = groupings.shift();
				var ungroupedDigits = /^\d+/.exec(n);
				while (ungroupedDigits && ungroupedDigits[0].length > currentGrouping.length) {
					var digitsLeft = ungroupedDigits[0].length - currentGrouping.length;
					n = n.substr(0, digitsLeft) + "," + n.substring(digitsLeft);
					if (groupings.length > 0) {
						currentGrouping = groupings.shift();
					}
					ungroupedDigits = /^\d+/.exec(n);
				}
				return n;
			}
			/**
			 * Utility function to convert a string in scientific notation to a corresponding string of digits
			 * 
			 * @param {String} x The string to be converted
			 * @returns {String} The corresponding string of digits
			 * @private
			 */
			function _toDigitString(x) {
				var m = x;
				var negative = false;
				if (m.charAt(0) === "-") {
					negative = true;
					m = m.substring(1);
				}
				var parts = m.split("e");
				var mantissa = parts[0];
				var exponent = Number(parts[1]);
				if (exponent > 0) {
					m = mantissa.substr(0, 1) + mantissa.substr(2); // Get just the digits
					if (m.length - 1 < exponent) { // Need to add zeroes.
						var e = exponent + 1 - m.length;
						while (e > 0) {
							m = m + "0";
							e--;
						}
					} else if (m.length - 1 > exponent) {
						m = m.substr(0, exponent + 1) + "." + m.substr(exponent + 1);
					}
				} else if (exponent < 0) {
					var digits = mantissa.substr(0, 1) + mantissa.substr(2); // Get just the digits
					m = "0.";
					for (var i = exponent; i < -1; i++) {
						m += "0";
					}
					m += digits;
				}
				if (negative) {
					m = "-" + m;
				}
				return m;
			}
			/**
			 * ToRawPrecision abstract operation as defined in ECMA-402 Section 11.3.2
			 * 
			 * @param {Number} x The number being formatted
			 * @param {Number} minPrecision The minimum precision
			 * @param {Number} maxPrecision The maximum precision
			 * @returns {String} The string representing the formatted number
			 * @private
			 */
			function _toRawPrecision(x, minPrecision, maxPrecision) {
				var p = maxPrecision;
				var e;
				var m = "";
				var target;
				if (x === 0) {
					for (var i = 0; i < p; i++) {
						m += "0";
					}
					e = 0;
				} else {
					target = Math.pow(10, p - 1);
					if (x < target) {
						e = p - 1;
						while (x < target) {
							target /= 10;
							e--;
						}
					} else {
						target = Math.pow(10, p);
						e = p - 1;
						while (x >= target) {
							target *= 10;
							e++;
						}
					}
					m = x.toString();
					if (/e/.test(m)) {
						m = _toDigitString(m);
					}
					if (!/\./.test(m)) {
						m += ".";
					}
					for (i = 0; i < p; i++) {
						m += "0";
					}
					var placesToMove = p - 1 - e;
					var mi = m.indexOf(".");
					if (placesToMove > 0) {
						m = m.substr(0, mi) + m.substr(mi + 1, placesToMove) + "." + m.substr(mi + 1 + placesToMove, 1);
					}
					if (placesToMove < 0) {
						m = m.substr(0, p) + "." + m.substr(p, 1);
					}
					m = Math.round(m).toString();
				}
				if (e >= p) {
					for (i = 0; i < e - p + 1; i++) {
						m += "0";
					}
					return m;
				}
				if (e === p - 1) {
					return m;
				}
				if (e >= 0) {
					m = m.substr(0, e + 1) + "." + m.substr(e + 1, p - (e + 1));
				} else {
					var prefix = "0.";
					for (i = 0; i < -(e + 1); i++) {
						prefix += "0";
					}
					m = prefix + m;

				}
				if (/\./.test(m) && maxPrecision > minPrecision) {
					var cut = maxPrecision - minPrecision;
					while (cut > 0 && /0$/.test(m)) {
						m = m.substr(0, m.length - 1);
						cut--;
					}
					if (/\.$/.test(m)) {
						m = m.substr(0, m.length - 1);
					}
				}
				return m;
			}
			/**
			 * ToRawFixed abstract operation as defined in ECMA-402 Section 11.3.2
			 * 
			 * @param {Number} x The number being formatted
			 * @param {Number} minInteger The minimum number of integer digits
			 * @param {Number} minFraction The minimum number of fractional digits
			 * @param {Number} maxFraction The maximum number of fractional digits
			 * @returns {String} The string representing the formatted number
			 * @private
			 */
			function _toRawFixed(x, minInteger, minFraction, maxFraction) {
				var m;
				/*
				 * if x < 10^21, then we can use the standard built in function. Otherwise, Number.toFixed() is going to
				 * give us back a value in scientific notation, and we have to convert it back to a series of digits.
				 */
				if (Math.abs(x) < Math.pow(10, 21)) {
					m = x.toFixed(maxFraction).toString();
				} else {
					m = _toDigitString(x.toString());
					if (maxFraction > 0) {
						m += ".";
						for (var i = 0; i < maxFraction; i++) {
							m += "0";
						}
					}
				}
				var cut = maxFraction - minFraction;
				while (cut > 0 && /0$/.test(m)) {
					m = m.replace(/0$/, "");
					cut--;
				}
				if (/\.$/.test(m)) {
					m = m.replace(/\.$/, "");
				}
				var dPos = m.indexOf(".");
				var _int = dPos > 0 ? dPos : m.length;
				while (_int < minInteger) {
					m = "0" + m;
					_int++;
				}
				return m;
			}
			/**
			 * FormatNumber abstract operation as defined in ECMA-402 Section 11.3.2
			 * 
			 * @param {Object} numberFormat The number format object to use for formatting
			 * @param {Number} x The number being formatted
			 * @returns {String} The string representing the formatted number
			 * @private
			 */
			function _formatNumber(numberFormat, x) {
				var negative = (x < 0);
				var n;
				if (!isFinite(x)) {
					if (isNaN(x)) {
						n = numberFormat.symbols.nan;
					} else {
						n = numberFormat.symbols.infinity;
					}
				} else {
					if (negative) {
						x = -x;
					}
					if (numberFormat.style === "percent") {
						x *= 100;
					}
					if (numberFormat.minimumSignificantDigits !== undefined
							&& numberFormat.maximumSignificantDigits !== undefined) {
						n = _toRawPrecision(x, numberFormat.minimumSignificantDigits,
								numberFormat.maximumSignificantDigits);
					} else {
						n = _toRawFixed(x, numberFormat.minimumIntegerDigits, numberFormat.minimumFractionDigits,
								numberFormat.maximumFractionDigits);
					}
					if (numberFormat.useGrouping) {
						n = doGrouping(n, numberFormat.cldrPattern);
					}
					if (numberFormat.numberingSystem !== undefined && numberFormat.numberingSystem !== "latn") {
						var alldigits = /\d/g;
						n = n.replace(alldigits, function (m) {
							return numberingSystems[numberFormat.numberingSystem]._digits.charAt(m);
						});
					}
					n = n.replace(/[.,]/g, function (m) {
						if (m === ".") {
							return numberFormat.symbols.decimal ? numberFormat.symbols.decimal : m;
						}
						return numberFormat.symbols.group ? numberFormat.symbols.group : m;
					});
				}
				var result = numberFormat.positivePattern;
				if (negative) {
					result = numberFormat.negativePattern;
				}
				if (result) {
					result = result.replace("-", numberFormat.symbols.minusSign);
					result = result.replace("%", numberFormat.symbols.percentSign);
					result = result.replace("{number}", n);
					if (numberFormat.style === "currency") {
						var currency = numberFormat.currency;
						var cd = currency;
						if (numberFormat.currencyDisplay === "symbol") {
							cd = numberFormat.currencySymbol;
						} else if (numberFormat.currencyDisplay === "name") {
							cd = numberFormat.currencyDisplayName;
						}
						result = result.replace("{currency}", cd);
					}
				}
				return result;
			}

			/**
			 * Utility function to retrive necessary number fields from the CLDR data
			 * 
			 * @param {Object} numbers The JSON object containing numbers data from CLDR
			 * @param {String} numberingSystem The numbering system being used
			 * @returns {Object} An object containing the number symbols and formatting patterns
			 * @private
			 */
			function _getNumberInfo(numbers, numberingSystem) {
				var result = {};
				result.symbols = {};
				var numberExp = /[0-9#.,]+/;
				var key = "symbols-numberSystem-" + numberingSystem;
				var altkey = "symbols-numberSystem-latn";
				var cldrSymbols = numbers[key] ? numbers[key] : numbers[altkey];
				result.symbols = cldrSymbols;

				result.patterns = {};
				var styles = [ "decimal", "percent", "currency" ];
				for (var s in styles) {
					var style = styles[s];
					key = style + "Formats-numberSystem-" + numberingSystem;
					altkey = style + "Formats-numberSystem-latn";
					var cldrPattern = numbers[key] ? numbers[key].standard : numbers[altkey].standard;
					var patterns = cldrPattern.split(";");
					var positivePattern, negativePattern;
					positivePattern = patterns[0];
					if (patterns[length] === 2) {
						negativePattern = patterns[1];
					} else {
						negativePattern = "-" + positivePattern;
					}
					positivePattern = positivePattern.replace(numberExp, "{number}").replace(/\u00A4/, "{currency}");
					negativePattern = negativePattern.replace(numberExp, "{number}").replace(/\u00A4/, "{currency}");
					result.patterns[style] = {
						"cldrPattern" : cldrPattern,
						"positivePattern" : positivePattern,
						"negativePattern" : negativePattern
					};
				}
				return result;
			}

			/**
			 * ToDateTimeOptions abstract operation as defined in ECMA-402 Section 12.1.1.1
			 * 
			 * @param {Object} options The number format object to use for formatting
			 * @param {String} required String indicating which options are required
			 * @param {String} defaults String indicating which options can use defaults
			 * @returns {Object} The corresponding date/time options
			 * @private
			 */
			function _toDateTimeOptions(options, required, defaults) {
				if (options === undefined) {
					options = null;
				} else {
					options = Object(options);
				}
				options = Object.create(options);
				var weekdayFields = [ "weekday", "year", "month", "day" ];
				var dateFields = [ "year", "month", "day" ];
				var timeFields = [ "hour", "minute", "second" ];

				var needDefaults = true;
				if (required === "date" || required === "any") {
					weekdayFields.forEach(function (field) {
						if (options[field] !== undefined) {
							needDefaults = false;
						}
					});
				}
				if (required === "time" || required === "any") {
					timeFields.forEach(function (field) {
						if (options[field] !== undefined) {
							needDefaults = false;
						}
					});
				}
				if (needDefaults && (defaults === "date" || defaults === "all")) {
					dateFields.forEach(function (field) {
						Object.defineProperty(options, field, {
							value : "numeric",
							writable : true,
							configurable : true,
							enumerable : true
						});
					});
				}
				if (needDefaults && (defaults === "time" || defaults === "all")) {
					timeFields.forEach(function (field) {
						Object.defineProperty(options, field, {
							value : "numeric",
							writable : true,
							configurable : true,
							enumerable : true
						});
					});
				}
				return options;
			}
			/**
			 * BasicFormatMatcher abstract operation as defined in ECMA-402 Section 12.1.1.1
			 * 
			 * @param {Object} options The requested options (i.e. fields) to be included in the date/time format
			 * @param {Object []} formats An array of the available date/time formats
			 * @returns {Object} The date/time format that best matches the requested options
			 * @private
			 */
			function _basicFormatMatcher(options, formats) {
				var removalPenalty = 120;
				var additionPenalty = 20;
				var longLessPenalty = 8;
				var longMorePenalty = 6;
				var shortLessPenalty = 6;
				var shortMorePenalty = 3;
				var bestScore = Number.NEGATIVE_INFINITY;
				var bestFormat;
				var i = 0;
				var len = formats.length;
				while (i < len) {
					var format = formats[i.toString()];
					var score = 0;
					var dateTimeProperties = [ "weekday", "era", "year", "month", "day", "hour", "minute", "second",
							"timeZoneName" ];
					dateTimeProperties.forEach(function (property) {
						var optionsProp = options[property];
						var formatProp;
						var formatPropDesc = Object.getOwnPropertyDescriptor(format, property);
						if (formatPropDesc !== undefined) {
							formatProp = format[property];
						}
						if (optionsProp === undefined && formatProp !== undefined) {
							score -= additionPenalty;
						} else if (optionsProp !== undefined && formatProp === undefined) {
							score -= removalPenalty;
						} else {
							var values = [ "2-digit", "numeric", "narrow", "short", "long" ];
							var optionsPropIndex = values.indexOf(optionsProp);
							var formatPropIndex = values.indexOf(formatProp);
							var delta = Math.max(Math.min(formatPropIndex - optionsPropIndex, 2), -2);
							if (delta === 2) {
								score -= longMorePenalty;
							} else if (delta === 1) {
								score -= shortMorePenalty;
							} else if (delta === -1) {
								score -= shortLessPenalty;
							} else if (delta === -2) {
								score -= longLessPenalty;
							}
						}
					});
					if (score > bestScore) {
						bestScore = score;
						bestFormat = format;
					}
					i++;
				}
				return bestFormat;
			}
			/**
			 * BestFitFormat abstract operation as defined in ECMA-402 Section 12.1.1.1
			 * ECMA-402 allows this algorithm to be implementation defined. For now we are using
			 * the same algorithm as for BasicFormatMatcher.
			 * 
			 * @param {Object} options The requested options (i.e. fields) to be included in the date/time format
			 * @param {Object []} formats An array of the available date/time formats
			 * @returns {Object} The date/time format that best matches the requested options
			 * @private
			 */
			function _bestFitFormatMatcher(options, formats) {
				return _basicFormatMatcher(options, formats);
			}

			/**
			 * InitializeDateTimeFormat abstract operation as defined in ECMA-402 Section 12.1.1.1
			 * 
			 * @param {Object} dateTimeFormat The object to be initialized as a DateTimeFormat object
			 * @param {*} locales The requested locale or locales for formatting
			 * @param {Object} options Date/time formatting options
			 * @private
			 */
			function _initializeDateTimeFormat(dateTimeFormat, locales, options) {
				var dateProperties = [ "weekday", "era", "year", "month", "day" ];
				var timeProperties = [ "hour", "minute", "second", "timeZoneName" ];
				var dateTimeProperties = [ "weekday", "era", "year", "month", "day", "hour", "minute", "second",
				                           "timeZoneName" ];
				var hasDateProperties = false;
				var hasTimeProperties = false;
				if (dateTimeFormat.hasOwnProperty("initializedIntlObject") && dateTimeFormat.initializedIntlObject) {
					throw new TypeError("DateTimeFormat is already initialized.");
				}
				dateTimeFormat.initializedIntlObject = true;
				var requestedLocales = common.CanonicalizeLocaleList(locales);
				options = _toDateTimeOptions(options, "any", "date");
				var opt = new Record();
				var matcher = common
						.GetOption(options, "localeMatcher", "string", [ "lookup", "best fit" ], "best fit");
				opt.set("localeMatcher", matcher);
				var r = common.ResolveLocale(DateTimeFormat.availableLocales, requestedLocales, opt,
						DateTimeFormat.relevantExtensionKeys, DateTimeFormat.localeData);
				dateTimeFormat.locale = r.locale;
				dateTimeFormat.numberingSystem = r.nu;
				dateTimeFormat.calendar = r.ca;
				dateTimeFormat.dataLocale = r.dataLocale;
				var tz = options.timeZone;
				if (tz !== undefined) {
					tz = tz.toString();
					tz = common._toUpperCaseIdentifier(tz);
					if (tz !== "UTC") {
						throw new RangeError("Timezones other than UTC are not supported");
					}
				}
				dateTimeFormat.timeZone = tz;
				opt = new Record();
				var requestedDateOptions = new Record();
				var requestedTimeOptions = new Record();
				dateProperties.forEach(function (prop) {
					var value = common
							.GetOption(options, prop, "string", _validDateTimePropertyValues(prop), undefined);
					opt.set(prop, value);
					if (value) {
						requestedDateOptions.set(prop,value);
						hasDateProperties = true;
					}
				});
				timeProperties.forEach(function (prop) {
					var value = common
							.GetOption(options, prop, "string", _validDateTimePropertyValues(prop), undefined);
					opt.set(prop, value);
					if (value) {
						requestedTimeOptions.set(prop,value);
						hasTimeProperties = true;
					}
				});

				/*
				 * Steps 20-21: Here we deviate slightly from the strict definition as defined in ECMA 402. Instead of
				 * having all the formats predefined (i.e. hard-coded) in the locale data object up front, and accessing
				 * them here, we instead wait until we know which locale we are interested in, and load the formats from
				 * the JSON data. This saves us having to convert CLDR date formats to ECMA 402's format for a bunch of
				 * locales that we aren't really using.
				 */
				var cldrCalendar = dateTimeFormat.calendar.replace("gregory", "gregorian");
				dateTimeFormat.calData =
					preloads[r.dataLocale]["ca-" + cldrCalendar].main[r.dataLocale].dates.calendars[cldrCalendar];
				var dateTimeFormats = dateTimeFormat.calData.dateTimeFormats;
				var formats = _convertAvailableDateTimeFormats(dateTimeFormats);
				matcher = common.GetOption(options, "formatMatcher", "string", [ "basic", "best fit" ], "best fit");
				var bestFormat;
				if (hasDateProperties && hasTimeProperties) {
					var bestDateFormat = matcher === "basic" ? _basicFormatMatcher(requestedDateOptions, formats) : 
						_bestFitFormatMatcher(requestedDateOptions, formats);
					var bestTimeFormat = matcher === "basic" ? _basicFormatMatcher(requestedTimeOptions, formats) :
						_bestFitFormatMatcher(requestedTimeOptions, formats);
					bestFormat = bestDateFormat;
					var combinedDateFormat;
					if (requestedDateOptions.weekday === "long" &&
						requestedDateOptions.month === "long" ) {
						combinedDateFormat = _ToIntlDateTimeFormat(dateTimeFormats.full || "{1} {0}");
					} else if (requestedDateOptions.month === "long") {
						combinedDateFormat = _ToIntlDateTimeFormat(dateTimeFormats.long || "{1} {0}");
					} else if (requestedDateOptions.month === "short") {
						combinedDateFormat = _ToIntlDateTimeFormat(dateTimeFormats.medium || "{1} {0}");
					} else {
						combinedDateFormat = _ToIntlDateTimeFormat(dateTimeFormats.short || "{1} {0}");
					}
					combinedDateFormat.pattern = combinedDateFormat.pattern.replace("{1}", bestDateFormat.pattern);
					var combinedDateTimeFormat24 = combinedDateFormat.pattern.replace("{0}", bestTimeFormat.pattern);
					var combinedDateTimeFormat12 = combinedDateFormat.pattern.replace("{0}", bestTimeFormat.pattern12);
					bestFormat.set("hour12", bestTimeFormat.hour12);
					bestFormat.set("pattern", combinedDateTimeFormat24);
					bestFormat.set("pattern12", combinedDateTimeFormat12);
					dateProperties.forEach(function (prop) {
						var pDesc = Object.getOwnPropertyDescriptor(bestDateFormat, prop);
						if (pDesc !== undefined) {
							dateTimeFormat[prop] = bestDateFormat[prop];
						}
					});					
					timeProperties.forEach(function (prop) {
						var pDesc = Object.getOwnPropertyDescriptor(bestTimeFormat, prop);
						if (pDesc !== undefined) {
							dateTimeFormat[prop] = bestTimeFormat[prop];
						}
					});					
				} else {
					bestFormat = matcher === "basic" ? _basicFormatMatcher(opt, formats) : _bestFitFormatMatcher(opt,
						formats);
					dateTimeProperties.forEach(function (prop) {
						var pDesc = Object.getOwnPropertyDescriptor(bestFormat, prop);
						if (pDesc !== undefined) {
							dateTimeFormat[prop] = bestFormat[prop];
						}
					});
				}
				var pattern;
				var hr12 = common.GetOption(options, "hour12", "boolean", undefined, undefined);
				if (dateTimeFormat.hour !== undefined) {
					if (hr12 === undefined) {
						hr12 = DateTimeFormat.localeData[dateTimeFormat.dataLocale]
								&& DateTimeFormat.localeData[dateTimeFormat.dataLocale].hour12;
					}
					dateTimeFormat.hour12 = hr12;
					if (hr12) {
						var hourNo0 = DateTimeFormat.localeData[dateTimeFormat.dataLocale]
								&& DateTimeFormat.localeData[dateTimeFormat.dataLocale].hourNo0;
						dateTimeFormat.hourNo0 = hourNo0;
						dateTimeFormat.hour = bestFormat.hour12;
						pattern = bestFormat.pattern12;
					} else {
						pattern = bestFormat.pattern;
					}
				} else {
					pattern = bestFormat.pattern;
				}
				dateTimeFormat.pattern = pattern;
				dateTimeFormat.boundFormat = undefined;
				dateTimeFormat.initializedDateTimeFormat = true;
			}

			/**
			 * FormatDateTime abstract operation as defined in ECMA-402 Section 12.3.2
			 * 
			 * @param {Object} dateTimeFormat The date/time format object to use for formatting
			 * @param {Number} x The value of the date being formatted, as would be received from
			 *  the getTime() method of the Date object
			 * @returns {String} The string representing the formatted number
			 * @private
			 */
			function _formatDateTime(dateTimeFormat, x) {
				var dateTimeProperties = [ "weekday", "era", "year", "month", "day", "hour", "minute", "second",
						"timeZoneName" ];
				if (!isFinite(x)) {
					throw new RangeError("Attempting to format an invalid date/time.");
				}
				var locale = dateTimeFormat.locale;
				var nf = {};
				_initializeNumberFormat(nf, locale, {
					useGrouping : false
				});
				var nf2 = {};
				_initializeNumberFormat(nf2, locale, {
					minimumIntegerDigits : 2,
					useGrouping : false
				});
				var tm = calendars.toLocalTime(x, dateTimeFormat.calendar, dateTimeFormat.timeZone);
				var pm = false;
				var result = dateTimeFormat.pattern;
				dateTimeProperties.forEach(function (prop) {
					var p = prop;
					var f = dateTimeFormat[p];
					var v = tm[p];
					var fv;
					if (p === "month") {
						v++;
					}
					if (p === "hour" && dateTimeFormat.hour12) {
						v = v % 12;
						pm = (v !== tm[p]);
						if (v === 0 && dateTimeFormat.hourNo0) {
							v = 12;
						}
					}
					if (f === "numeric") {
						fv = _formatNumber(nf, v);
					} else if (f === "2-digit") {
						fv = _formatNumber(nf2, v);
						if (fv.length > 2) {
							fv = fv.substr(-2);
						}
					} else {
						var standalone = (p === "month" && dateTimeFormat.standaloneMonth || 
								p === "weekday" && dateTimeFormat.standaloneWeekday);
						fv = _getCalendarField(dateTimeFormat.calendar, dateTimeFormat.calData, tm.year, standalone, p,
								f, v);
					}
					if (result) {
						result = result.replace("{" + p + "}", fv);
					}
				});
				if (dateTimeFormat.hour12) {
					var ampm = pm ? "pm" : "am";
					var fv = _getCalendarField(dateTimeFormat.calendar, dateTimeFormat.calData, tm.year, false,
							"dayperiod", "short", ampm);
					if (result) {
						result = result.replace("{ampm}", fv);
					}
				}
				return result;
			}

			/**
			 * Utility function to retrive necessary date/time fields from the CLDR data
			 * 
			 * @param {String} calType The type of calendar in use (i.e. "hebrew", "japanese", etc. )
			 * @param {Object} calData The JSON object containing calendar data from CLDR
			 * @param {Number} year The year number
			 * @param {Boolean} standalone TRUE indicates a stand-alone month name,
			 *  which is spelled differently in some languages.
			 * @param {String} property The type of field being requested (i.e. "weekday", "month", etc.)
			 * @param {String} format The length of the field being requested (i.e. "narrow", "short", "long")
			 * @param {Number} value Indicates which month, day, etc. is being requested (zero based)
			 * @returns {String} A string containing the requested calendar field
			 * @private
			 */
			function _getCalendarField(calType, calData, year, standalone, property, format, value) {
				/*jshint maxcomplexity: 36*/
				var result = null;
				switch (property) {
				case "weekday":
					var cldrWeekdayKeys = [ "sun", "mon", "tue", "wed", "thu", "fri", "sat" ];
					var weekdayKey = cldrWeekdayKeys[value];
					switch (format) {
					case "narrow":
						result = standalone ? calData.days["stand-alone"].narrow[weekdayKey]
								: calData.days.format.narrow[weekdayKey];
						break;
					case "short":
						result = standalone ? calData.days["stand-alone"].abbreviated[weekdayKey]
						: calData.days.format.abbreviated[weekdayKey];
						break;
					case "long":
						result = standalone ? calData.days["stand-alone"].wide[weekdayKey]
						: calData.days.format.wide[weekdayKey];
						break;
					}
					break;
				case "era":
					switch (format) {
					case "narrow":
						result = calData.eras.eraNarrow[value];
						break;
					case "short":
						result = calData.eras.eraAbbr[value];
						break;
					case "long":
						result = calData.eras.eraNames[value];
						break;
					}
					break;
				case "month":
					var monthValue = value;
					/*
					* Because of leap month in the Hebrew calendar, there isn't a 1-1 correlation between
					* month number and the resource name in CLDR, so we have to adjust accordingly.
					*/
					if (calType === "hebrew") {
						monthValue = calendars.hebrewMonthResource(year, value);
					}
					switch (format) {
					case "narrow":
						result = standalone ? calData.months["stand-alone"].narrow[monthValue]
								: calData.months.format.narrow[monthValue];
						break;
					case "short":
						result = standalone ? calData.months["stand-alone"].abbreviated[monthValue]
								: calData.months.format.abbreviated[monthValue];
						break;
					case "long":
						result = standalone ? calData.months["stand-alone"].wide[monthValue]
								: calData.months.format.wide[monthValue];
						break;
					}
					break;
				case "dayperiod":
					switch (format) {
					case "narrow":
						result = calData.dayPeriods.format.narrow[value];
						break;
					case "short":
						result = calData.dayPeriods.format.abbreviated[value];
						break;
					case "long":
						result = calData.dayPeriods.format.wide[value];
						break;
					}
					break;
				case "timeZoneName":
					if (value === "UTC") {
						result = "UTC";
					}
					result = "local";
					break;
				}
				return result;
			}
			/**
			 * Utility function to convert the availableFormats from a CLDR JSON object into an array of available
			 * formats as defined by ECMA 402. For definition of fields, in CLDR, refer to
			 * http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
			 * 
			 * @param {String} format The date/time format pattern as from CLDR
			 * @returns {String} A string containing the corresponding date/time pattern in ECMA-402 format
			 * @private
			 */
			function _ToIntlDateTimeFormat(format) {
				var dateFields = /G{1,5}|y{1,4}|[ML]{1,5}|[Ec]{1,5}|d{1,2}|a|[Hh]{1,2}|m{1,2}|s{1,2}/g;
				var result = new Record();
				var pieces = format.split("'");
				for (var x = 0; x < pieces.length; x += 2) { // Don't do replacements for fields that are quoted
					/*jshint maxcomplexity: 45*/
					pieces[x] = pieces[x].replace(dateFields, function (field) {
						switch (field) {
						case "GGGGG":
							result.set("era", "narrow");
							return "{era}";
						case "GGGG":
							result.set("era", "long");
							return "{era}";
						case "GGG":
						case "GG":
						case "G":
							result.set("era", "short");
							return "{era}";
						case "yy":
							result.set("year", "2-digit");
							return "{year}";
						case "y":
						case "yyy":
						case "yyyy":
							result.set("year", "numeric");
							return "{year}";
						case "LLLLL":
							result.set("standaloneMonth", true);
							result.set("month", "narrow");
							return "{month}";
						case "MMMMM":
							result.set("month", "narrow");
							return "{month}";
						case "LLLL":
							result.set("standaloneMonth", true);
							result.set("month", "long");
							return "{month}";
						case "MMMM":
							result.set("month", "long");
							return "{month}";
						case "LLL":
							result.set("standaloneMonth", true);
							result.set("month", "short");
							return "{month}";
						case "MMM":
							result.set("month", "short");
							return "{month}";
						case "LL":
						case "MM":
							result.set("month", "2-digit");
							return "{month}";
						case "L":
						case "M":
							result.set("month", "numeric");
							return "{month}";
						case "ccccc":
							result.set("standaloneWeekday", true);
							result.set("weekday", "narrow");
							return "{weekday}";
						case "EEEEE":
							result.set("weekday", "narrow");
							return "{weekday}";
						case "cccc":
							result.set("standaloneWeekday", true);
							result.set("weekday", "long");
							return "{weekday}";
						case "EEEE":
							result.set("weekday", "long");
							return "{weekday}";
						case "ccc":
						case "cc":
						case "c":
							result.set("standaloneWeekday", true);
							result.set("weekday", "short");
							return "{weekday}";
						case "EEE":
						case "EE":
						case "E":
							result.set("weekday", "short");
							return "{weekday}";
						case "dd":
							result.set("day", "2-digit");
							return "{day}";
						case "d":
							result.set("day", "numeric");
							return "{day}";
						case "a":
							return "{ampm}";
						case "hh":
							result.set("hour12", "2-digit");
							result.set("hour", "2-digit");
							return "{hour}";
						case "HH":
							result.set("hour", "2-digit");
							return "{hour}";
						case "h":
							result.set("hour12", "numeric");
							result.set("hour", "numeric");
							return "{hour}";
						case "H":
							result.set("hour", "numeric");
							return "{hour}";
						case "mm":
							result.set("minute", "2-digit");
							return "{minute}";
						case "m":
							result.set("minute", "numeric");
							return "{minute}";
						case "ss":
							result.set("second", "2-digit");
							return "{second}";
						case "s":
							result.set("second", "numeric");
							return "{second}";
						default:
							return field;
						}
					});
					/*jshint maxcomplexity: 10*/
				}
				result.set("pattern", pieces.join(""));
				return result;
			}

			/**
			 * Utility function to construct alternate forms of flexible date
			 * patterns to accommodate the various widths.
			 * 
			 * @param {String} format The original date format pattern
			 * @param {RegExp} sourceFormat Matches the field that will be replaced in the "format" context.
			 * @param {String} targetFormat String to replace "sourceFormat" when matched.
			 * @param {RegExp} sourceStandalone Matches the field that will be replaced in the "stand alone" context.
			 * @param {String} targetStandalone String to replace "sourceStandalone" when matched.
			 * @returns {String[]} The constructed date pattern, in ECMA-402 format
			 * @private
			 */
			function _constructFormat(format,sourceFormat,targetFormat,sourceStandalone,targetStandalone) {
				var constructedFormatPattern = format.replace(sourceFormat, targetFormat)
					.replace(sourceStandalone, targetStandalone);
				var constructedFormat = _ToIntlDateTimeFormat(constructedFormatPattern);
				constructedFormat.cldrPattern = constructedFormatPattern;
				return constructedFormat;
			}
			/**
			 * Utility function to convert the availableFormats from a CLDR JSON
			 * object into an array of available formats as defined by ECMA 402. For
			 * a definition of fields in CLDR, refer to
			 * http://www.unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
			 * 
			 * @param {Object} dateTimeFormats The CLDR JSON object containing date/time information
			 * @returns {String[]} A array of strings, each corrresponding to one of the date/time 
			 *  patterns (in ECMA-402 format) that can be used to format dates or times
			 * @private
			 */
			function _convertAvailableDateTimeFormats(dateTimeFormats) {
				var availableFormats = dateTimeFormats.availableFormats;
				var result = [];
				var usableFormatSkeletons = /^G{0,5}y{0,4}M{0,5}E{0,5}d{0,2}H{0,2}m{0,2}s{0,2}$/;
				var abbrMonthSkeleton = /(^|[^M])M{3}([^M]|$)/;
				var weekdaySkeleton = /(^|[^E])E{1,3}([^E]|$)/;
				for (var format in availableFormats) {
					var format12 = availableFormats[format.replace("H", "h")];
					if (usableFormatSkeletons.test(format) && format12 !== undefined) {
						var outputFormat = _ToIntlDateTimeFormat(availableFormats[format]);
						if (/H/.test(format)) {
							var outputFormat12 = _ToIntlDateTimeFormat(format12);
							outputFormat.set("hour12", outputFormat12.hour12);
							outputFormat.set("pattern12", outputFormat12.pattern);
						}
						result.push(outputFormat);
						// Flexible date format logic - If the locale contains just a E pattern (abbreviated weekday)
						// and not a corresponding EEEE pattern (long weekday), then we can infer
						// an appropriate EEEE pattern by just replacing the E with EEEE.
						if (weekdaySkeleton.test(format) && !availableFormats[format.replace("E", "EEEE")]) {
							result.push(_constructFormat(availableFormats[format],/E{1,3}/,"EEEE",/c{1,3}/,"cccc"));
						}
						// Flexible date format logic - If the locale contains just a E pattern (abbreviated weekday)
						// and not a corresponding EEEEE pattern (narrow weekday), then we can infer
						// an appropriate EEEEE pattern by just replacing the E with EEEEE.
						if (weekdaySkeleton.test(format) && !availableFormats[format.replace("E", "EEEEE")]) {
							result.push(_constructFormat(availableFormats[format],/E{1,3}/,"EEEEE",/c{1,3}/,"ccccc"));
						}
						// Flexible date format logic - If the locale contains just a MMM pattern (abbreviated month)
						// and not a corresponding MMMM pattern (long month), then we can infer
						// an appropriate MMMM pattern by just replacing the MMM with MMMM.
						if (abbrMonthSkeleton.test(format) && !availableFormats[format.replace("MMM", "MMMM")]) {
							var constructedSkeleton = format.replace("MMM", "MMMM");
							var constructedFormat = _constructFormat(availableFormats[format],
									/M{3}/,"MMMM",/L{3}/,"LLLL");
							result.push(constructedFormat);
							// If the constructed format contains a weekday pattern, then we have to repeat the
							// two steps above to cover that case as well.
							if (weekdaySkeleton.test(constructedSkeleton) && 
									!availableFormats[constructedSkeleton.replace(weekdaySkeleton, "EEEE")]) {
								result.push(_constructFormat(constructedFormat.cldrPattern,
										/E{1,3}/,"EEEE",/c{1,3}/,"cccc"));
							}
							if (weekdaySkeleton.test(constructedSkeleton) &&
									!availableFormats[constructedSkeleton.replace(weekdaySkeleton, "EEEEE")]) {
								result.push(_constructFormat(constructedFormat.cldrPattern,
										/E{1,3}/,"EEEEE",/c{1,3}/,"ccccc"));
							}
						}
					}
				}
				return result;
			}

			/**
			 * Utility function to return the valid values for a date/time field, according to table 3 in ECMA 402
			 * section 12.1.1.1
			 * 
			 * @param {String} prop The requested date/time field
			 * @returns {String[]} A array of strings, each corrresponding one of the valid date/time property values 
			 * @private
			 */
			function _validDateTimePropertyValues(prop) {
				if (prop === "weekday" || prop === "era") {
					return [ "narrow", "short", "long" ];
				}
				if (prop === "year" || prop === "day" || prop === "hour" || prop === "minute" || prop === "second") {
					return [ "2-digit", "numeric" ];
				}
				if (prop === "month") {
					return [ "2-digit", "numeric", "narrow", "short", "long" ];
				}
				if (prop === "timeZoneName") {
					return [ "short", "long" ];
				}
			}

			/**
			 * Internal properties of NumberFormat, as defined in ECMA 402 Section 11.2.3
			 */
			var NumberFormat = {};
			NumberFormat.availableLocales = Object.keys(preloads);
			NumberFormat.relevantExtensionKeys = [ "nu" ];
			NumberFormat.localeData = {};
			NumberFormat.availableLocales.forEach(function (loc) {
				NumberFormat.localeData[loc] = {
					"nu" : availableNumberingSystems
				};
			});
			Object.freeze(NumberFormat);

			/**
			 * Internal properties of DateTimeFormat, as defined in ECMA 402 Section 12.2.3
			 */
			var DateTimeFormat = {};
			DateTimeFormat.availableLocales = Object.keys(preloads);
			DateTimeFormat.relevantExtensionKeys = [ "ca", "nu" ];
			DateTimeFormat.localeData = {};
			DateTimeFormat.availableLocales.forEach(function (loc) {
				var region = common._getRegion(loc);
				var hour12 = false;
				var hourNo0 = false;
				hour12 = timeData[region] && (/h|K/.test(timeData[region]._preferred));
				hourNo0 = timeData[region] && (/h|k/.test(timeData[region]._preferred));
				
				DateTimeFormat.localeData[loc] = {
					"nu" : availableNumberingSystems,
					"ca" : common._getSupportedCalendars(common._getRegion(loc)),
					"hour12" : hour12,
					"hourNo0" : hourNo0
				};
			});
			Object.freeze(DateTimeFormat);

			/**
			 * Placeholder for Intl.Collator constructor as defined by EMCA 402 Section 10.1.
			 * Intl.Collator is not supported by this package.
			 * @constructor
			 */
			Intl.Collator = function () {
				throw new TypeError("Intl.Collator is not supported.");
			};

			/**
			 * Intl.NumberFormat constructor as defined by EMCA 402 Section 11.1.
			 * @constructor
			 */
			Intl.NumberFormat = function () {
				this.prototype = Intl.NumberFormat.prototype;
				this.extensible = true;
				// ECMA 402 Section 11.1.3.1
				var locales;
				var options;
				if (arguments.length > 0) {
					locales = arguments[0];
				}
				if (arguments.length > 1) {
					options = arguments[1];
				}
				_initializeNumberFormat(this, locales, options);
			};

			// ECMA 402 Section 7
			Object.defineProperty(Intl, "NumberFormat", {
				writable : true,
				configurable : true,
				enumerable : false
			});

			/**
			 * Intl.NumberFormat.call as defined in ECMA-402 Section 11.1.2.1
			 *
			 * @param {Object} thisObject The NumberFormat object. If undefined,
			 *  a new NumberFormat object will be created.
			 * @param {*} locales The requested locale or locales for formatting
			 * @param {Object} options Number formatting options
			 * @returns 
			 */
			Intl.NumberFormat.call = function (thisObject, locales, options) {
				if (thisObject === Intl || thisObject === undefined) {
					return new Intl.NumberFormat(locales, options);
				}
				var obj = Object(thisObject);
				if (!Object.isExtensible(obj)) {
					throw new TypeError("Intl.NumberFormat.call: object is not extensible");
				}
				_initializeNumberFormat(obj, locales, options);
				return obj;
			};

			/**
			 * Intl.NumberFormat.supportedLocalesOf as defined in ECMA-402 Section 11.2.2
			 *
			 * @param {*} locales The requested locale or locales for formatting
			 * @param {Object} options Locale lookup options
			 * @returns {String[]} An array of supported locales that matches the request
			 */
			Object.defineProperty(Intl.NumberFormat, "supportedLocalesOf", {
				value : function (locales) {
					var availableLocales = NumberFormat.availableLocales;
					var requestedLocales = common.CanonicalizeLocaleList(locales);
					var options;
					if (arguments.length > 1) {
						options = arguments[1];
					}
					return common.SupportedLocales(availableLocales, requestedLocales, options);
				},
				writable : true,
				enumerable : false,
				configurable : true
			});

			Intl.NumberFormat.prototype = Intl.NumberFormat.call({});

			// ECMA 402 Section 11.2.1
			Object.defineProperty(Intl.NumberFormat, "prototype", {
				writable : false,
				enumerable : false,
				configurable : false
			});

			// ECMA 402 Section 11.3.1
			Object.defineProperty(Intl.NumberFormat.prototype, "constructor", {
				value : Intl.NumberFormat,
				writable : true,
				configurable : true,
				enumerable : false
			});

			/**
			 * Intl.NumberFormat.prototype.format as defined in ECMA-402 Section 11.3.2
			 * @param {Number} value The number to format
			 */
			Object.defineProperty(Intl.NumberFormat.prototype, "format", {
				get : function () {
					if (this !== Object(this) || !this.initializedNumberFormat) {
						throw new TypeError(
								"Intl.NumberFormat format getter: 'this' is not a valid Intl.NumberFormat instance");
					}
					if (this.boundFormat === undefined) {
						var F = function (value) {
							var x = Number(value);
							return _formatNumber(this, x);
						};
						var bf = F.bind(this);
						this.boundFormat = bf;
					}
					return this.boundFormat;
				},
				configurable : true
			});

			/**
			 * Intl.NumberFormat.resolvedOptions as defined in ECMA-402 Section 11.3.3
			 *
			 * @returns {Object} An object containing information about the options associated with a NumberFormat
			 */
			Object.defineProperty(Intl.NumberFormat.prototype, "resolvedOptions", {
				value : function () {
					if (this !== Object(this) || !this.initializedNumberFormat) {
						throw new TypeError(
								"Intl.NumberFormat.resolvedOptions: 'this' is not a valid Intl.NumberFormat instance");
					}
					var fields = [ "locale", "numberingSystem", "style", "currency", "currencyDisplay",
							"minimumIntegerDigits", "minimumFractionDigits", "maximumFractionDigits",
							"minimumSignificantDigits", "maximumSignificantDigits", "useGrouping" ];
					var result = new Record();
					for (var f in fields) {
						if (this.hasOwnProperty(fields[f])) {
							result.set(fields[f], this[fields[f]]);
						}
					}
					return result;
				},
				writable : true,
				enumerable : false,
				configurable : true
			});

			/**
			 * Intl.DateTimeFormat constructor as defined by EMCA 402 Section 12.1.
			 * @constructor
			 */
			Intl.DateTimeFormat = function () {
				this.prototype = Intl.DateTimeFormat.prototype;
				this.extensible = true;
				// ECMA 402 Section 12.1.3.1
				var locales;
				var options;
				if (arguments.length > 0) {
					locales = arguments[0];
				}
				if (arguments.length > 1) {
					options = arguments[1];
				}
				_initializeDateTimeFormat(this, locales, options);
			};
			// ECMA 402 Section 7
			Object.defineProperty(Intl, "DateTimeFormat", {
				writable : true,
				configurable : true,
				enumerable : false
			});

			/**
			 * Intl.DateTimeFormat.call as defined in ECMA-402 Section 12.1.2.1
			 *
			 * @param {Object} thisObject The DateTimeFormat object. If undefined,
			 *  a new DateTimeFormat object will be created.
			 * @param {*} locales The requested locale or locales for formatting
			 * @param {Object} options Date/time formatting options
			 * @returns 
			 */
			Intl.DateTimeFormat.call = function (thisObject, locales, options) {
				if (thisObject === Intl || thisObject === undefined) {
					return new Intl.DateTimeFormat(locales, options);
				}
				var obj = Object(thisObject);
				if (!Object.isExtensible(obj)) {
					throw new TypeError("Intl.DateTimeFormat.call: object is not extensible");
				}
				_initializeDateTimeFormat(obj, locales, options);
				return obj;
			};

			/**
			 * Intl.DateTimeFormat.supportedLocalesOf as defined in ECMA-402 Section 12.2.2
			 *
			 * @param {*} locales The requested locale or locales for formatting
			 * @param {Object} options Locale lookup options
			 * @returns {String[]} An array of supported locales that matches the request
			 */
			Object.defineProperty(Intl.DateTimeFormat, "supportedLocalesOf", {
				value : function (locales) {
					var availableLocales = DateTimeFormat.availableLocales;
					var requestedLocales = common.CanonicalizeLocaleList(locales);
					var options;
					if (arguments.length > 1) {
						options = arguments[1];
					}
					return common.SupportedLocales(availableLocales, requestedLocales, options);
				},
				writable : true,
				enumerable : false,
				configurable : true
			});

			Intl.DateTimeFormat.prototype = Intl.DateTimeFormat.call({});

			// ECMA 402 Section 12.2.1
			Object.defineProperty(Intl.DateTimeFormat, "prototype", {
				writable : false,
				enumerable : false,
				configurable : false
			});

			// ECMA 402 Section 12.3.1
			Object.defineProperty(Intl.DateTimeFormat.prototype, "constructor", {
				value : Intl.DateTimeFormat,
				writable : true,
				configurable : true,
				enumerable : false
			});

			/**
			 * @param {Date} date The date to format
			 * Intl.DateTimeFormat.prototype.format as defined in ECMA-402 Section 12.3.2
			 */
			Object.defineProperty(Intl.DateTimeFormat.prototype, "format", {
				get : function () {
					if (this !== Object(this) || !this.initializedDateTimeFormat) {
						var msg = "DateTimeFormat format getter: 'this' is not a valid Intl.DateTimeFormat instance";
						throw new TypeError(msg);
					}
					if (this.boundFormat === undefined) {
						var F = function () {
							var date;
							if (arguments.length > 0) {
								date = arguments[0];
							}
							var x;
							if (date === undefined) {
								x = Date.now();
							} else {
								x = Number(date);
							}
							return _formatDateTime(this, x);
						};
						var bf = F.bind(this);
						this.boundFormat = bf;
					}
					return this.boundFormat;
				},
				configurable : true
			});

			/**
			 * Intl.DateTimeFormat.resolvedOptions as defined in ECMA-402 Section 12.3.3
			 *
			 * @returns {Object} An object containing information about the options associated with a DateTimeFormat
			 */
			Object.defineProperty(Intl.DateTimeFormat.prototype, "resolvedOptions", {
				value : function () {
					if (this !== Object(this) || !this.initializedDateTimeFormat) {
						var msg = "DateTimeFormat.resolvedOptions: 'this' is not a valid Intl.DateTimeFormat instance";
						throw new TypeError(msg);
					}
					var fields = [ "locale", "calendar", "numberingSystem", "timeZone", "hour12", "weekday", "era",
							"year", "month", "day", "hour", "minute", "second", "timeZoneName" ];
					var result = new Record();
					for (var f in fields) {
						if (this.hasOwnProperty(fields[f])) {
							result.set(fields[f], this[fields[f]]);
						}
					}
					return result;
				},
				writable : true,
				enumerable : false,
				configurable : true
			});

			/**
			 * Number.prototype.toLocaleString as defined in ECMA-402 Section 13.2.1
			 *
			 * @param {*} locales The requested locale or locales for formatting
			 * @param {Object} options Number formatting options
			 * @returns {String} String representing the formatted number
			 */
			Number.prototype.toLocaleString = function () {
				if (!(this instanceof Number)) {
					throw new TypeError("not a valid Number");
				}
				var x = Number(this);
				var locales;
				var options;
				if (arguments.length > 0) {
					locales = arguments[0];
				}
				if (arguments.length > 1) {
					options = arguments[1];
				}
				var numberFormat = {};
				_initializeNumberFormat(numberFormat, locales, options);
				return _formatNumber(numberFormat, x);
			};

			/**
			 * Date.prototype.toLocaleString as defined in ECMA-402 Section 13.3.1
			 *
			 * @param {*} locales The requested locale or locales for formatting
			 * @param {Object} options Date/time formatting options
			 * @returns {String} String representing the formatted date/time
			 */
			Date.prototype.toLocaleString = function () {
				if (!(this instanceof Date)) {
					throw new TypeError("not a valid Date");
				}
				var x = this.getTime();
				if (isNaN(x)) {
					return "Invalid Date";
				}
				var locales;
				var options;
				if (arguments.length > 0) {
					locales = arguments[0];
				}
				if (arguments.length > 1) {
					options = arguments[1];
				}
				options = _toDateTimeOptions(options, "any", "all");
				var dateTimeFormat = {};
				_initializeDateTimeFormat(dateTimeFormat, locales, options);
				return _formatDateTime(dateTimeFormat, x);
			};
			/**
			 * Date.prototype.toLocaleDateString as defined in ECMA-402 Section 13.3.2
			 *
			 * @param {*} locales The requested locale or locales for formatting
			 * @param {Object} options Date formatting options
			 * @returns {String} String representing the formatted date
			 */
			Date.prototype.toLocaleDateString = function () {
				if (!(this instanceof Date)) {
					throw new TypeError("not a valid Date");
				}
				var x = this.getTime();
				if (isNaN(x)) {
					return "Invalid Date";
				}
				var locales;
				var options;
				if (arguments.length > 0) {
					locales = arguments[0];
				}
				if (arguments.length > 1) {
					options = arguments[1];
				}
				options = _toDateTimeOptions(options, "date", "date");
				var dateTimeFormat = {};
				_initializeDateTimeFormat(dateTimeFormat, locales, options);
				return _formatDateTime(dateTimeFormat, x);
			};
			/**
			 * Date.prototype.toLocaleTimeString as defined in ECMA-402 Section 13.3.3
			 *
			 * @param {*} locales The requested locale or locales for formatting
			 * @param {Object} options Time formatting options
			 * @returns {String} String representing the formatted time
			 */
			Date.prototype.toLocaleTimeString = function () {
				if (!(this instanceof Date)) {
					throw new TypeError("not a valid Date");
				}
				var x = this.getTime();
				if (isNaN(x)) {
					return "Invalid Date";
				}
				var locales;
				var options;
				if (arguments.length > 0) {
					locales = arguments[0];
				}
				if (arguments.length > 1) {
					options = arguments[1];
				}
				options = _toDateTimeOptions(options, "time", "time");
				var dateTimeFormat = {};
				_initializeDateTimeFormat(dateTimeFormat, locales, options);
				return _formatDateTime(dateTimeFormat, x);
			};
			return Intl;
		});
