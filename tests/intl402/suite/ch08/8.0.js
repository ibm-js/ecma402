// Copyright 2012 Mozilla Corporation. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.
define([ 'intern!object', 'intern/chai!assert', 'ecma402/Intl', 'ecma402/tests/intl402/harness/testBuiltInObject' ], 
	function(registerSuite, assert, Intl, testBuiltInObject) {
	registerSuite({
		name : '8.0',
		Test_8_0 : function() {
			/**
			 * @description Tests that Intl has Object.prototype as its prototype.
			 * @author Norbert Lindenberg
			 */

			assert.strictEqual(Object.getPrototypeOf(Intl), Object.prototype,
				"Intl doesn't have Object.prototype as its prototype.");
		},
		Test_8_0_L15 : function() {
			/**
			 * @description Tests that Intl
			 *     meets the requirements for built-in objects defined by the introduction of
			 *     chapter 15 of the ECMAScript Language Specification.
			 * @author Norbert Lindenberg
			 */
			testBuiltInObject(Intl, false, false, [/*"Collator",*/ "NumberFormat"/*, "DateTimeFormat"*/]);
		}
	});
});