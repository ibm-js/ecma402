// Copyright 2012 Mozilla Corporation. All rights reserved.
// This code is governed by the BSD license found in the LICENSE file.

/**
 * @description Tests that obj meets the requirements for built-in objects defined by the introduction of chapter 15 of the ECMAScript Language Specification.
 * @param {Object}
 *            obj the object to be tested.
 * @param {boolean}
 *            isFunction whether the specification describes obj as a function.
 * @param {boolean}
 *            isConstructor whether the specification describes obj as a constructor.
 * @param {String[]}
 *            properties an array with the names of the built-in properties of obj, excluding length, prototype, or properties with non-default attributes.
 * @param {number}
 *            length for functions only: the length specified for the function or derived from the argument list.
 * @author Norbert Lindenberg
 */
define([ 'intern!object', 'intern/chai!assert' ],
	function(registerSuite, assert) {

		function testBuiltInObject(obj, isFunction, isConstructor, properties, length) {

			assert.isDefined(obj, "Object being tested is undefined.");

			var objString = Object.prototype.toString.call(obj);
			if(isFunction){
				assert.strictEqual(objString, "[object Function]",
					"The [[Class]] internal property of a built-in function must be "
						+"\"Function\", but toString() returns "+objString);
			}else{
				assert.strictEqual(objString, "[object Object]",
					"The [[Class]] internal property of a built-in non-function object must be "
						+"\"Object\", but toString() returns "+objString);
			}

			assert(Object.isExtensible(obj), "Built-in objects must be extensible.");

			if(isFunction){
				assert.strictEqual(Object.getPrototypeOf(obj), Function.prototype,
					"Built-in functions must have Function.prototype as their prototype.");
			}

			if(isConstructor){
				assert.strictEqual(Object.getPrototypeOf(obj.prototype), Object.prototype,
					"Built-in prototype objects must have Object.prototype as their prototype.");
			}

			// verification of the absence of the [[Construct]] internal property has
			// been moved to the end of the test

			// verification of the absence of the prototype property has
			// been moved to the end of the test

			if(isFunction){

				assert(typeof obj.length=="number"&&obj.length===Math.floor(obj.length),
					"Built-in functions must have a length property with an integer value.");

				assert.strictEqual(obj.length, length,
						"Function's length property doesn't have specified value; expected "+length+", got "+obj.length
							+".");

				var desc = Object.getOwnPropertyDescriptor(obj, "length");
				assert.isFalse(desc.writable, "The length property of a built-in function must not be writable.");
				assert.isFalse(desc.enumerable,"The length property of a built-in function must not be enumerable.");
				/* Since the length property changed from ECMA 5 to ECMA 6, we won't bother to test for it here.
				assert.isFalse(desc.configurable,"The length property of a built-in function must not be configurable.");
				*/
			}

			properties.forEach(function(prop) {
				var desc = Object.getOwnPropertyDescriptor(obj, prop);
				assert.isDefined(desc, "Missing property "+prop+".");
				// accessor properties don't have writable attribute
				if(desc.hasOwnProperty("writable")){
					assert.isTrue(desc.writable,"The "+prop+" property of this built-in function must be writable.");
				}
				assert.isTrue(desc.configurable,"The "+prop
					+" property of this built-in function must be configurable.");
				assert(!desc.enumerable,"The "+prop
					+" property of this built-in function must not be enumerable.");
			});

			// The remaining sections have been moved to the end of the test because
			// unbound non-constructor functions written in JavaScript cannot possibly
			// pass them, and we still want to test JavaScript implementations as much
			// as possible.

			// JCE: This part of the test is therefore intentionally skipped, since
			// our implementation sits on top of the JavaScript implementation.
			// As the original author of the test suite points out, there is no way
			// for us to possibly pass this portion.

			//var exception = undefined;
			//if(isFunction&&!isConstructor){
				// this is not a complete test for the presence of [[Construct]]:
				// if it's absent, the exception must be thrown, but it may also
				// be thrown if it's present and just has preconditions related to
				// arguments or the this value that this statement doesn't meet.
			//	try{
			//		/* jshint newcap:false */
			//		instance = new obj();
			//	}catch(e){
			//		exception = e;
			//	}
			//	assert(exception!==undefined&&exception.name==="TypeError",
			//		"Built-in functions that aren't constructors must throw TypeError when "
			//			+"used in a \"new\" statement.");
			//}

		    //if (isFunction && !isConstructor && obj.hasOwnProperty("prototype")) {
			//	assert(false,"Built-in functions that aren't constructors must not have a prototype property.");
			//}
		}
		return testBuiltInObject;
	});
