require.config({
	baseUrl : "/ecma402"
});
define("IntlShim", [], function () {
	//
	// Shim for native vs. ecma402 package implementation of the Intl object.
	//
	var __globalObject = Function("return this;")();

	// -----------------------------------------------------------------------------

	if (__globalObject.Intl !== undefined) {
		return __globalObject.Intl;
	}
	var IntlShim = {};
	require([ "Intl" ], function (ecma402Intl) {
		// Always use the browser's Collator if possible, since we didn't implement it.
		if (__globalObject.Intl !== undefined) {
			IntlShim.Collator = __globalObject.Intl.Collator;
		} else {
			IntlShim.Collator = ecma402Intl.Collator;
		}
		IntlShim.NumberFormat = ecma402Intl.NumberFormat;
		IntlShim.DateTimeFormat = ecma402Intl.DateTimeFormat;
	});
	return IntlShim;
});
