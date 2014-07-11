/* global Intl */
/**
  * Shim for native vs. ecma402 package implementation of the Intl object.
  * By default, using IntlShim will leverage any support for Intl that exists
  * natively in the browser.  If the browser does not have support for Intl,
  * then the JavaScript implementation from this package is used instead.
  * 
  * Loads ./Intl.js only if necessary
  * 
  * @constructor
  */
define(["./features!intl-api?:./Intl"], function (IntlShim) {
	return IntlShim || Intl;
});
