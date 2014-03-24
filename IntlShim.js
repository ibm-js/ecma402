define(
	[ "./Intl" ],
	function(ecma402Intl) {
		//
		// Shim for native vs. ecma402 package implementation of the Intl object.
		//
		var __globalObject = Function("return this;")();

		//-----------------------------------------------------------------------------
		
		var IntlShim = {};
		
		IntlShim.setNative = function(native) {
			if (native && __globalObject.Intl !== undefined) {
				IntlShim.Collator = __globalObject.Intl.Collator;
				IntlShim.NumberFormat = __globalObject.Intl.NumberFormat;
				IntlShim.DateTimeFormat = __globalObject.Intl.DateTimeFormat;								
			} else {
				if (__globalObject.Intl !== undefined) { // Always use the browser's Collator if possible, since we didn't implement it.
					IntlShim.Collator = __globalObject.Intl.Collator;
				} else {
					IntlShim.Collator = ecma402Intl.Collator;
				}
				IntlShim.NumberFormat = ecma402Intl.NumberFormat;
				IntlShim.DateTimeFormat = ecma402Intl.DateTimeFormat;				
			}
		};
	
		IntlShim.setNative(false);		
		return IntlShim;
	});