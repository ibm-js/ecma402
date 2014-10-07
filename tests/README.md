# Ecma402 Tests

This directory contains the tests for ecma402.

##### Table of content

- [Initial setup](#initial-setup)
- [Running the tests](#running-the-tests)

## Initial Setup

To be able to run ecma402 automated tests, you need to install ecma402 dependencies. To do that, run:

```
$ npm install
$ bower install
```

Then you have the choice between:

1. running the tests on Sauce Labs, see [Sauce Labs configuration](#sauce-labs-configuration).
1. running the tests locally on desktop browsers, see [Selenium / Webdriver installation](#selenium--webdriver-installation)

#### Sauce Labs configuration

If you don't already have a Sauce Labs account, you can create one on their website, choosing the scheme that best fit your situation (Note that they ofer a free one for OSS developpers, [Open Sauce](https://saucelabs.com/opensauce)):

1. Navigate to https://saucelabs.com/signup in your browser;
2. Select the subscription plan you want and fill up the form to create your account.

Once your account has been created, setup your `SAUCE_USERNAME` and `SAUCE_ACCESS_KEY` environment variables as they are listed
on https://saucelabs.com/appium/tutorial/3.

#### Selenium / Webdriver installation

To run the tests locally (which is faster than running the tests on Sauce Labs but restricts the list of browsers the test run into to the list of browsers
that are installed on your computer), you first need to install the following resources:

1. Java JRE version 6
1. From the [Selenium download page](http://www.seleniumhq.org/download/):
  1. Selenium Server
  1. Drivers for the browsers installed on your computer. After you've downloaded the browser drivers, make sure that they are referenced in your $PATH (or %PATH% on Windows):
    1. Firefox driver: included with Selenium Server, no extra download needed
    1. Internet explorer driver: use the link provided in section _The Internet Explorer Driver Server_ of http://www.seleniumhq.org/download/
    1. Chrome driver: https://code.google.com/p/chromedriver/
    1. Safari driver: included with Selenium Server, no extra download needed

## Running the tests

You have two options to run the tests:

1. Run locally in desktop browsers
1. Run in Sauce Labs browsers

When running tests using the command line, you can also adjust the list of reports generated for the test execution.

### Running the unit and functional tests locally in desktop browsers

1. Starts the selenium server on the default port (4444) (requires selenium server. See [installation instructions](#selenium--webdriver-installation)):

   ```
   $ java -jar selenium-server-standalone-2.XX.0.jar
   ```

2. Edit the [intern.local.js](./intern.local.js) configuration to list which browsers to use for the tests

3. In the ecma402 directory, type the following command:

   ```
   $ grunt test:local
   ```

### Running the unit and functional tests in Sauce Labs browsers

In the ecma402 directory, type the following command (requires Sauce Labs environment variables. See [Sauce Labs configuration instructions](#sauce-labs-configuration)):

```
$ grunt test:remote
```

Note that you can update the [intern.js](./intern.js) configuration file if you need to customize the list of browsers to run the tests into.

To monitor the tests execution and access the Sauce Labs reports, you will need to [login to Sauce Labs](https://saucelabs.com/login). 

### Adjusting reports

Optional reports can be added via grunt flags e.g.

    $ grunt test:local:console // run the console reporter for a local test
    $ grunt test:remote:lcovhtml // run the console reporter for a remote (saucelabs) test with the lcovhtml coverage reporter
    $ grunt test:local:console:lcovhtml // multiple reporters can be specified

The following reporters are currently provided as optional flags
   * `lcovhtml`: this HTML report is generated at `ecma402/html-report/index.html` and provides detailed information about what sections of the widgets code are executed during the tests and, more importantly, what sections are not.
   * `console`
