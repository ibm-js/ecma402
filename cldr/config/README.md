#ecma402 - CLDR Configuration

This directory contains the configuration files for creating the JSON data for ecma402, using the Ldml2JsonConverter utility
which is published as part of Unicode CLDR. We use a customized set of configuration files to filter down the
resulting JSON to only those fields that are actually used by our ECMA-402 implementation. The JSON files from the
CLDR distrubution ARE use the same naming and keys as we do here, so it is possible to use JSON directly from CLDR's
json.zip or json_full.zip.  Doing so will simply result in some wasted space and possible a slower data load, as
there are many fields in the CLDR's JSON that we cimply don't use.

CLDR Version = CLDR 26 ( Released 2014-09-18 )

## Covered Locales

The package currently contains support for 163 locales from the CLDR, which, although not as complete as the CLDR itself, provides a robust
set of locales.

Like ICU, we only use CLDR data if it is draft status "contributed" or "approved".

## How to Generate the JSON

In addition to the arguments outlined below, you will also need to specify where the source directory ( CLDR's common directory ) and the 
target directory ( where you want the JSON to go ) using the -c and -d arguments.

-c c:\workspace\cldr\common\ -d c:\workspace\GIT\JCEmmons\ecma402\cldr

Currently we create the data in four passes:

1). Currencies - Since the list of currencies is potentially quite large, we only are interested in currencies in the "modern" coverage level
for CLDR.

Ldml2JsonConverter -t main -r true -i false -k ecma402_cldr_currencies_config.txt -s contributed -o false
  -m (${DESIRED_LOCALES}) -l modern

2). Everything else in main...

Ldml2JsonConverter -t main -r true -i false -k ecma402_cldr_config.txt -s contributed -o false
  -m (${DESIRED_LOCALES})


In the first and second pass steps above, ${DESIRED_LOCALES} is a regular expression that matches the locale identifiers from CLDR
for which you want to generate data.

The ${DESIRED_LOCALES} regular expression for the full set (163 locales) is:

 (af(_NA)?|ar(_(AE|BH|DZ|EG|IQ|JO|KW|LB|LY|MA|OM|QA|SA|SD|SY|TN|YE))?|a[msz]|b[eg]|bn(_IN)?|c[asy]|da|de(_(AT|LU|CH))?|
 e[lu]|en(_(AU|BE|CM|CA|GB|GH|HK|IE|IN|KE|MU|NG|NZ|PH|SG|ZA|ZM))?|es(_(AR|BO|CL|CO|CR|DO|EC|GT|HN|MX|NI|PA|PE|PR|PY|SV|US|UY|VE))?|
 fil?|fr(_(BE|CA|CD|CH|CI|CM|DZ|LU|MR|MA|SN|TN))?|g[lu]|h[aeiruy]|i[dgs]|it(_CH)?|ja|k[akmn]|kok?|l[gtv]|m[klnrst]|
 n[bn]|ne(_IN)?|nl(_BE)?|o[mr]|p[al]|pt(_(AO|MZ|PT))?|r[ouw]|root|s[iklqv]|sr(_Latn)?|sw(_KE)?|
 t[aehr]|uk|ur(_IN)?|uz(_Cyrl)?|vi|yo|zh(_(Hans(_SG)?|Hant(_HK)?))?)

3). Supplemental data (currency data and language tag canonicalization data).

Ldml2JsonConverter -t supplemental -i false -k ecma402_cldr_config.txt -s contributed -o false

4). Data for non-Gregorian Calendars.

For each of the supported non-Gregorian calendars, we generate calendar data only for those locale that need it. If you are generating
data for a new CLDR release and the calendar preference data has changed ( supplemental/calendarPreferenceData.json ), then you may
have to adjust the "-m" argument to correspond to the locales that need this data.

For the current CLDR 26 release, the commands are as follows:

Buddhist: Ldml2JsonConverter -t main -r true -i false -s contributed -o false -k ecma402_cldr_ca_buddhist_config.txt -m th
Hebrew: Ldml2JsonConverter -t main -r true -i false -s contributed -o false -k ecma402_cldr_ca_hebrew_config.txt -m he
Islamic: Ldml2JsonConverter -t main -r true -i false -s contributed -o false -k ecma402_cldr_ca_islamic_config.txt
                            -m ar_(AE|BH|DZ|EG|IQ|JO|KW|LB|LY|MA|OM|QA|SA|SD|SY|TN|YE)|fr_(MR|MA|TN|DZ)|ar|he
Umalqura: -t main -r true -i false -s contributed -o false -k ecma402_cldr_ca_islamic_umalqura_config.txt -m (ar_(AE|BH|KW|QA|SA))
Japanese: -t main -r true -i false -s contributed -o false -k ecma402_cldr_ca_japanese_config.txt -m ja
ROC: -t main -r true -i false -s contributed -o false -k ecma402_cldr_ca_roc_config.txt -m zh_Hant

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

