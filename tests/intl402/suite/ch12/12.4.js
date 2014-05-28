// Copyright 2012 Mozilla Corporation. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
define(
	[ 'intern!object', 'intern/chai!assert', 'ecma402/Intl' ], 
	function(registerSuite, assert, Intl) {
	registerSuite({
		name : '12.4',
		Test_12_4_a : function() {
			/**
			 * @description Tests that Intl.DateTimeFormat instances have the specified properties.
			 * @author Norbert Lindenberg
			 */
			var obj = new Intl.DateTimeFormat();

			var toStringValue = Object.prototype.toString.call(obj);
			assert.strictEqual(toStringValue,"[object Object]",
			    "Intl.DateTimeFormat instance produces wrong [[Class]] - toString returns " + toStringValue + ".");
		}
	});
});