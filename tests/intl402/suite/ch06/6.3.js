// Copyright 2012 Mozilla Corporation. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/**
 * @description Tests that structurally valid language tags are accepted.
 * @author Norbert Lindenberg
 */
define(
	[ 'intern!object', 'intern/chai!assert', 'ecma402/Intl', 'ecma402/tests/intl402/harness/testIntl' ], 
	function(registerSuite, assert, Intl, testIntl) {
	registerSuite({
		name : '6.3',
		Test_6_3_1_a : function() {
			/**
			 * @description Tests that well-formed currency codes are accepted.
			 * @author Norbert Lindenberg
			 */

			var wellFormedCurrencyCodes =
				[ "BOB", "EUR", "usd", // currency codes are case-insensitive
				"XdR", "xTs" ];

			wellFormedCurrencyCodes.forEach(function(code) {
				// this must not throw an exception for a valid currency code
				var format = new Intl.NumberFormat(
					[ "de-de" ], {
					style : "currency",
					currency : code
				});
				assert.strictEqual(format.resolvedOptions().currency, code.toUpperCase(), "Currency "+code
					+" was not correctly accepted; turned into "+format.resolvedOptions().currency+".");
			});

		},
		Test_6_3_1_b : function() {
			/**
			 * @description Tests that invalid currency codes are not accepted.
			 * @author Norbert Lindenberg
			 */

			var invalidCurrencyCodes = [
			    "",
			    "€",
			    "$",
			    "SFr.",
			    "DM",
			    "KR₩",
			    "702",
			    "ßP",
			    "ınr"
			];

			invalidCurrencyCodes.forEach(function (code) {
			    var error;
			    try {
			        // this must throw an exception for an invalid currency code
			        var format = new Intl.NumberFormat(["de-de"], {style: "currency", currency: code});
			    } catch (e) {
			        error = e;
			    }
			    assert.isDefined(error,"Invalid currency code '" + code + "' was not rejected.");
			    assert.strictEqual(error.name,"RangeError","Invalid currency code '" + code + "' was rejected with wrong error " + error.name + ".");
			});
		}
	});
});