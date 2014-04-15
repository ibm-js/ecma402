//
// Shim for native vs. ecma402 package implementation of the Intl object.
// Loads ./Intl.js only if necessary
//

define(typeof Intl === "undefined" || !Intl.NumberFormat || !Intl.DateTimeFormat ? ["./Intl"] : [],
		function (ecma402Intl) {
	return ecma402Intl || Intl;
});
