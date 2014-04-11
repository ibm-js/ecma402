//
// Shim for native vs. ecma402 package implementation of the Intl object.
//
var __globalObject = Function("return this;")();
var dependencies = [];
if (__globalObject.Intl === undefined) {
	dependencies.push("Intl");
}
require.config({
	baseUrl : "/ecma402",
	paths : {
		"require" : "/ecma402/requirejs/require",
	}
});
define("IntlShim", dependencies, function (Intl) {
	if (__globalObject.Intl !== undefined) {
		return __globalObject.Intl;
	}
	return Intl;
});
