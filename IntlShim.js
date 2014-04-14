//
// Shim for native vs. ecma402 package implementation of the Intl object.
//
var __globalObject = (function(){return this;});
var dependencies = [];
if (__globalObject.Intl === undefined) {
	dependencies.push("./Intl");
}
define(dependencies, function (Intl) {
	if (__globalObject.Intl !== undefined) {
		return __globalObject.Intl;
	}
	return Intl;
});
