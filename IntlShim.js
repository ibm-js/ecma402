//
// Shim for native vs. ecma402 package implementation of the Intl object.
// Loads ./Intl.js only if necessary
//
/* global Intl */
define(["./features!intl-api?:./Intl"], function (IntlShim) {
	return IntlShim || Intl;
});
