#ecma402

This project provides an implementation of the [ECMA-402 JavaScript Internationalization APIs standard](http://www.ecma-international.org/ecma-402/1.0/ECMA-402.pdf)
for number formatting ( Intl.NumberFormat ) and date and time formatting ( Intl.DateTimeFormat ).
Collation ( Intl.Collator ) is not currently supported.

## Status

No official release yet.

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
   }
</script>
<script>
  require(["ecma402/IntlShim"], function(Intl) {
     var nb = Intl.NumberFormat("fr", { style: "percent" });
     console.log(nb.format(24.02));
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
   }
</script>
```

For further documentation on the ECMA-402 standard `Intl` API and how to use it you can check out [MDN](https://developer.mozilla.org/fr/docs/Web/JavaScript/Reference/Objets_globaux/Intl)

