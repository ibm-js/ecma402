# ecma402 [![Build Status](https://travis-ci.org/ibm-js/ecma402.png?branch=master)](https://travis-ci.org/ibm-js/ecma402)

This project provides an implementation of the [ECMA-402 JavaScript Internationalization APIs standard](http://www.ecma-international.org/ecma-402/1.0/ECMA-402.pdf)
for number formatting ( Intl.NumberFormat ) and date and time formatting ( Intl.DateTimeFormat ).
Collation ( Intl.Collator ) is not currently supported.

## Status
Current release is version 1.0, published 2015-07-08.

## Licensing

This project is distributed by the Dojo Foundation and licensed under the ["New" BSD License](./LICENSE).
All contributions require a [Dojo Foundation CLA](http://dojofoundation.org/about/claForm).

## Dependencies

This project requires the following other projects to run:
 * requirejs (git clone https://github.com/jrburke/requirejs.git)
 * requirejs-text
 * requirejs-dplugins

## Installation

_Bower_ release installation:

    $ bower install ecma402

_Manual_ master installation:

    $ git clone git://github.com/ibm-js/ecma402.git

Then install dependencies with bower (or manually from github if you prefer to):

	$ cd ecma402
	$ bower install

## Documentation

Once installed, you should first include RequireJS AMD loader in your appication:

```html
<script src="bower_components/requirejs/require.js"></script>
```

Then you can load `Intl` through the `ecma402/IntlShim` module and use it:

```html
<script>
   // configuring RequireJS
   require.config({
     // where to find ecma402 package
     baseUrl: "bower_components",
     // which locales do I want to be available in addition to default browser locale
     config: {
        "ecma402/locales": /^(en|de|fr)$/
     }
   });
</script>
<script>
  require(["ecma402/IntlShim"], function(Intl) {
     var nf = Intl.NumberFormat("fr", { style: "percent" });
     console.log(nf.format(24.02));
  });
</script>
```

Note that by default `IntlShim` will use native implementation if available in the browser, if not available it will
load its own JavaScript CLDR-based implementation. In order to force the JavaScript implementation you can force
the `intl-api` flag to false in the RequireJS config as follows:

```html
<script>
   // configuring RequireJS
   require.config({
     // where to find ecma402 package
     baseUrl: "bower_components",
     config: {
       "requirejs-dplugins/has": {
       	  "intl-api": false
       }
     }
   });
</script>
```

Alternatively, if you always want to use the `Intl` as provided through this package, and not attempt to leverage the
native support in the browser, you can load the `ecma402/Intl` module directly, as follows:

```html
<script>
   // configuring RequireJS
   require.config({
     // where to find ecma402 package
     baseUrl: "bower_components",
     // which locales do I want to be available in addition to default browser locale
     config: {
        "ecma402/locales": /^(en|de|fr)$/
     }
   });
</script>
<script>
  require(["ecma402/Intl"], function(Intl) {
     var nf = Intl.NumberFormat("fr", { style: "percent" });
     console.log(nf.format(24.02));
  });
</script>
```

For further documentation on the ECMA-402 standard `Intl` API and how to use it you can check out
the information available at [MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)

## Locale configuration using ecma402/locales

This package contains locale data for a large number of locales as defined by Unicode [CLDR](http://cldr.unicode.org)
For many run time environments, it is not necessary to load the data for all possible locales, but instead, only for the
default locale as defined by the settings in the browser.  In order to keep the data load time to a minimum, by default only
data associated with the default locale is loaded at run time unless additional locales are specified using the config
option "ecma402/locales" as in the above example.  The argument can be either a regular expression, a string (for a
single locale), or an array of strings.
