// Learn more about configuring this file at <https://github.com/theintern/intern/wiki/Configuring-Intern>.
// These default settings work OK for most people. The options that *must* be changed below are the
// packages, suites, excludeInstrumentation, and (if you want functional tests) functionalSuites.
define({
	// Browsers to run integration testing against. Note that version numbers must be strings if used with Sauce
	// OnDemand. Options that will be permutated are browserName, version, platform, and platformVersion; any other
	// capabilities options specified for an environment will be copied as-is
	environments: [
		{ browserName: "internet explorer", version: "11", platform: "Windows 8.1", name: "ecma402" },
		{ browserName: "internet explorer", version: "10", platform: "Windows 8", name: "ecma402" },
		{ browserName: "internet explorer", version: "9", platform: "Windows 7", name: "ecma402" },
		{ browserName: "firefox", version: "24", platform: [ "OS X 10.6", "Windows 7", "Linux" ], name: "ecma402" },
		{ browserName: "firefox", version: "29", platform: [ "OS X 10.6", "Windows 7", "Linux" ], name: "ecma402" },
		{ browserName: "chrome", version: "32", platform: [ "OS X 10.6", "Windows 7", "Linux" ], name: "ecma402" },
		{ browserName: "safari", version: "6", platform: "OS X 10.8", name: "ecma402" },
		{ browserName: "safari", version: "7", platform: "OS X 10.9", name: "ecma402" }/*,
		{ browserName: "", platform: "OS X 10.9", version: "7.1", deviceName: "iPhone",
			app: "safari", device: "iPhone Simulator", name: "ecma402" },
		{ browserName: "", platform: "OS X 10.9", version: "7.1", deviceName: "iPad",
			app: "safari", device: "iPad Simulator", name: "ecma402" },
		{ browserName: "", platform: "OS X 10.9", version: "7.0", deviceName: "iPhone",
			app: "safari", device: "iPhone Simulator", name: "ecma402" },
		{ browserName: "", platform: "OS X 10.9", version: "7.0", deviceName: "iPad",
			app: "safari", device: "iPad Simulator", name: "ecma402" }*/
	],

	// Maximum number of simultaneous integration tests that should be executed on the remote WebDriver service
	maxConcurrency: 3,

	// Whether or not to start Sauce Connect before running tests
	tunnel: "SauceLabsTunnel",
	
	// The desired AMD loader to use when running unit tests (client.html/client.js). Omit to use the default Dojo
	// loader
	useLoader: {
		"host-node": "requirejs",
		"host-browser": "../../../requirejs/require.js"
	},

	// Configuration options for the module loader; any AMD configuration options supported by the specified AMD loader
	// can be used here
	loader: {
		baseUrl: "..",
		config : { 
			"ecma402/locales" : /^(ar|de(-CH)?|el|en(-(GB|NZ))?|es|fr|he|hi|id|ja|pt.*|sl|sr(-Latn)?|th|zh.*)$/ 
		}
	},
	
	// Non-functional test suite(s) to run in each browser
	suites : [  "ecma402/tests/unitTests/testAbstractOperations",
	            "ecma402/tests/unitTests/testDateTimeFormat",
	            "ecma402/tests/unitTests/testNumberFormat",
	            "ecma402/tests/unitTests/testShim",
	            "ecma402/tests/unitTests/testBuddhistCalendar",
	            "ecma402/tests/unitTests/testHebrewCalendar",
	            "ecma402/tests/unitTests/testIslamicCalendar",
	            "ecma402/tests/unitTests/testJapaneseCalendar",
	            "ecma402/tests/unitTests/testROCCalendar",
	            "ecma402/tests/intl402/suite/ch06/6.2",
                "ecma402/tests/intl402/suite/ch06/6.3",
                "ecma402/tests/intl402/suite/ch06/6.4",
                "ecma402/tests/intl402/suite/ch08/8.0",
                "ecma402/tests/intl402/suite/ch09/9.1",
                "ecma402/tests/intl402/suite/ch09/9.2",
                "ecma402/tests/intl402/suite/ch11/11.1",
                "ecma402/tests/intl402/suite/ch11/11.2",
                "ecma402/tests/intl402/suite/ch11/11.3",
                "ecma402/tests/intl402/suite/ch11/11.4",
                "ecma402/tests/intl402/suite/ch12/12.1",	
                "ecma402/tests/intl402/suite/ch12/12.2",
                "ecma402/tests/intl402/suite/ch12/12.3",
                "ecma402/tests/intl402/suite/ch12/12.4",
                "ecma402/tests/intl402/suite/ch13/13.2",
                "ecma402/tests/intl402/suite/ch13/13.3"],

	// A regular expression matching URLs to files that should not be included in code coverage analysis
	excludeInstrumentation: /^(?:ecma402\/tests|requirejs)/
});
