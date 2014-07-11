#ecma402 - CLDR Configuration

This directory contains the configuration files for creating the JSON data for ecma402, using the Ldml2JsonConverter utility
which is published as part of Unicode CLDR.

CLDR Version = CLDR 25 ( Released 2014-03-19 )

## Covered Locales

The package currently contains support for 163 locales from the CLDR, which, although not as complete as the CLDR itself, provides a robust
set of locales.

Like ICU, we only use CLDR data if it is draft status "contributed" or "approved".

## How to Generate the JSON

Currently we create the data in three passes:

1). Currencies - Since the list of currencies is potentially quite large, we only are interested in currencies in the "modern" coverage level
for CLDR.

Ldml2JsonConverter -t main -r true -i false -k ecma402_cldr_currencies_config.txt -s contributed -o false
  -m (${DESIRED_LOCALES}) -l modern

2). Everything else in main...

Ldml2JsonConverter -t main -r true -i false -k ecma402_cldr_config.txt -s contributed -o false
  -m (${DESIRED_LOCALES})

Third pass: Supplemental data (currency data and language tag canonicalization data).

Ldml2JsonConverter -t supplemental -i false -k ecma402_cldr_config.txt -s contributed -o false

In the first and second pass steps above, ${DESIRED_LOCALES} is a regular expression that matches the locale identifiers from CLDR
for which you want to generate data.

The ${DESIRED_LOCALES} regular expression for the full set (163 locales) is:

 (af(_NA)?|ar(_(AE|BH|DZ|EG|IQ|JO|KW|LB|LY|MA|OM|QA|SA|SD|SY|TN|YE))?|a[msz]|b[eg]|bn(_IN)?|c[asy]|da|de(_(AT|LU|CH))?|
 e[lu]|en(_(AU|BE|CM|CA|GB|GH|HK|IE|IN|KE|MU|NG|NZ|PH|SG|ZA|ZM))?|es(_(AR|BO|CL|CO|CR|DO|EC|GT|HN|MX|NI|PA|PE|PR|PY|SV|US|UY|VE))?|
 fil?|fr(_(BE|CA|CD|CH|CI|CM|DZ|LU|MR|MA|SN|TN))?|g[lu]|h[aeiruy]|i[dgs]|it(_CH)?|ja|k[akmn]|kok?|l[gtv]|m[klnrst]|
 n[bn]|ne(_IN)?|nl(_BE)?|o[mr]|p[al]|pt(_(AO|MZ|PT))?|r[ouw]|root|s[iklqv]|sr(_Latn)?|sw(_KE)?|
 t[aehr]|uk|ur(_IN)?|uz(_Cyrl)?|vi|yo|zh(_(Hans(_SG)?|Hant(_HK)?))?)


## How to add JSON for a new locale

1).   Follow steps #1 and #2 above, to generate the JSON for the desired locale.  There should be three files per locale, as follows:
	ca-gregorian.json
	currencies.json
	numbers.json
	
	Put these files in a directory named cldr/${LOCALE_ID}, where ${LOCALE_ID} is the locale identifier.

For most new locales, if the language you are adding is the "default content" locale for the language, then
you will only need to add the language locale and not language-territory.  For example, you will notice that
"en" is present, but "en-US" is not, because en-US is the "default content" for English.

If you need to add a new locale to the package and don't want to mess with the Java tools, you can just take the JSON files
directly from the CLDR distribution and drop them into place.  The JSON data from the CLDR distribution will contain some
fields that are not used by our ECMA-402 implementation, which will result in slower loading, but the keys ARE compatible.
	
2). Add the new locale entry to availableLocales.json in this directory. (cldr/config)

## How to remove a locale:

1). Remove the locale entry from availableLocales.json in this directory (cldr/config)
2). Remove the data from cldr/${LOCALE_ID}, where ${LOCALE_ID} is the locale identifier.

Be sure to follow the guidelines in ECMA 402 regarding addition and deletion of locales.  Specifically, if you add a locale
called xx-YY, you also have to add a locale named xx in order to be compliant with ECMA 402.
Refer to ECMA 402 section 9.1 (Internal Properties of Service Constructors), first bullet item named
[[availableLocales]] for more information.

