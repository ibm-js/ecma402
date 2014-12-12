// Copyright 2012 Mozilla Corporation. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
define(
	[ 'intern!object', 'intern/chai!assert', 'ecma402/Intl', 'ecma402/tests/intl402/harness/testIntl' ], function(registerSuite, assert, Intl, testIntl) {
	registerSuite({
		name : '9.1',
		/**
		 * @description Tests that default locale is available.
		 * @author Norbert Lindenberg
		 */
		Test_9_1_a : function() {
			testIntl.testWithIntlConstructors(function (Constructor) {
			    var defaultLocale = new Constructor().resolvedOptions().locale;
			    var supportedLocales = Constructor.supportedLocalesOf([defaultLocale]);
			    assert.notStrictEqual(supportedLocales.indexOf(defaultLocale),-1,"Default locale should be reported as available.");
			});
		},

		/**
		 * @description Tests that appropriate fallback locales are provided for
		 *     supported locales.
		 * @author Norbert Lindenberg
		 */
		Test_9_1_b : function() {
			testIntl.testWithIntlConstructors(function (Constructor) {
				var info = testIntl.getLocaleSupportInfo(Constructor);
				var fallback;
				info.supported.forEach(function (locale) {
					var pos = locale.lastIndexOf("-");
					if (pos !== -1) {
						fallback = locale.substring(0, pos);
						assert.notStrictEqual(info.supported.indexOf(fallback),-1,
							"Locale " + locale + " is supported, but fallback " + fallback + " isn't.");
		            }
// JCE: This isn't really a valid test, because locales like zh_SG alias to zh_Hans_SG.
//					var match = /([a-z]{2,3})(-[A-Z][a-z]{3})(-[A-Z]{2})/.exec(locale);
//					if (match !== null) {
//						fallback = match[1] + match[3];
//						assert.notStrictEqual(info.supported.indexOf(fallback),-1,"Locale " + locale + " is supported, but fallback " + fallback + " isn't.");
//					}
				});
			});
		}
	});
});