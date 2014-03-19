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
		name : '6.4',
		Test_6_4_a : function() {
			/**
			 * @description Tests that valid time zone names are accepted.
			 * @author Norbert Lindenberg
			 */

			var validTimeZoneNames = [
			    "UTC",
			    "utc" // time zone names are case-insensitive
			];

			validTimeZoneNames.forEach(function (name) {
			    // this must not throw an exception for a valid time zone name
			    var format = new Intl.DateTimeFormat(["de-de"], {timeZone: name});
			    assert.strictEqual(format.resolvedOptions().timeZone,name.toUpperCase(),
			    	"Time zone name " + name + " was not correctly accepted; turned into " + format.resolvedOptions().timeZone + ".");
			});
		},
		Test_6_4_b : function() {
			/**
			 * @description Tests that invalid time zone names are not accepted.
			 * @author Norbert Lindenberg
			 */

			var invalidTimeZoneNames = [
			    "",
			    "MEZ", // localized abbreviation
			    "Pacific Time", // localized long form
			    "cnsha", // BCP 47 time zone code
			    "invalid", // as the name says
			    "Europe/İstanbul", // non-ASCII letter
			    "asıa/baku", // non-ASCII letter
			    "europe/brußels"  // non-ASCII letter
			];

			invalidTimeZoneNames.forEach(function (name) {
			    var error;
			    try {
			        // this must throw an exception for an invalid time zone name
			        var format = new Intl.DateTimeFormat(["de-de"], {timeZone: name});
			    } catch (e) {
			        error = e;
			    }
			    assert.isDefined(error,"Invalid time zone name " + name + " was not rejected.");
			    assert.strictEqual(error.name,"RangeError",
			    	"Invalid time zone name " + name + " was rejected with wrong error " + error.name + ".");
			});
		},
		Test_6_4_c : function() {
			/**
			 * @description Tests that additional time zone names, if accepted, are handled correctly.
			 * @author Norbert Lindenberg
			 */

			// canonicalization specified in conformance clause
			var additionalTimeZoneNames = {
			    "Etc/GMT": "UTC",
			    "Greenwich": "UTC",
			    "PRC": "Asia/Shanghai",
			    "AmErIcA/LoS_aNgElEs": "America/Los_Angeles",
			    "etc/gmt+7": "Etc/GMT+7"
			};

			Object.getOwnPropertyNames(additionalTimeZoneNames).forEach(function (name) {
			    var format, error;
			    try {
			        format = new Intl.DateTimeFormat([], {timeZone: name});
			    } catch (e) {
			        error = e;
			    }
			    if (error === undefined) {
			        var actual = format.resolvedOptions().timeZone;
			        var expected = additionalTimeZoneNames[name];
			        assert.strictEqual(actual,expected,
			            "Time zone name " + name + " was accepted, but incorrectly canonicalized to " +
			                actual + "; expected " + expected + ".");
			    } else {
			    	assert.strictEqual(error.name,"RangeError",
			    		"Time zone name " + name + " was rejected with wrong error " + error.name + ".");
			    }
			});
		}
	});
});