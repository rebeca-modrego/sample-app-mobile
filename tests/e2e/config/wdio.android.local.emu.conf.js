const { join } = require('path');
const { argv } = require('yargs');
const fs = require('fs');
const { execSync } = require('child_process');
const { config } = require('./wdio.appium.local.shared');
const rawSpec = argv.spec || (Array.isArray(argv._) && argv._.length ? argv._[0] : '');
let specArg = Array.isArray(rawSpec) ? rawSpec[0] : (rawSpec || '');
specArg = String(specArg);

// Define the app path
const appPath =
  process.env.APK_PATH ||
  '/Users/rmodrego/src/sample-app-mobile/apps/Android.SauceLabs.Mobile.Sample.app.2.7.1.apk';

// =======================
// Services
// =======================
config.services = [
  [
    'appium',
    {
      args: {
        address: '127.0.0.1',
        port: 4723,
      },
    },
  ],
];

// =======================
// Capabilities
// =======================
config.capabilities = [
  {
    platformName: 'Android',
    'appium:deviceName': 'Android Emulator',
    'appium:avd': process.env.AVD_NAME || 'Pixel_3_API_29',
    'appium:avdArgs': '-no-snapshot-load -no-boot-anim',
    'appium:automationName': 'UiAutomator2',
    'appium:platformVersion': '10.0',
    'appium:orientation': 'PORTRAIT',
    'appium:app': appPath,
    'appium:appWaitActivity': 'com.swaglabsmobileapp.MainActivity',
    'appium:noReset': true,
    'appium:autoGrantPermissions': true,
    'appium:newCommandTimeout': 300,
    'appium:adbExecTimeout': 600000,
    'appium:uiautomator2ServerLaunchTimeout': 60000,
    'appium:language': 'en',
    'appium:locale': 'US',
  },
];

// =======================
// Hooks
// =======================
config.beforeSession = function (capabilities) {

  global.driverConfig = {
    language: capabilities['appium:language'] || 'en',
    locale: capabilities['appium:locale'] || 'US',
  };
};

// resolve features/step-defs relative to this config file so the tests-runner can run it
if (specArg.includes('.feature')) {
  config.specs = [
    join(__dirname, '..', 'features', '**', '*.feature')
  ];
  config.framework = 'cucumber';
  config.cucumberOpts = {
    require: [
      join(__dirname, '..', 'features', 'step-definitions', '**', '*.js')
    ],
    timeout: 300000
  };
  // ensure jasmine settings removed
  if (config.jasmineNodeOpts) delete config.jasmineNodeOpts;
} else {
  // default to jasmine for .spec.js runs
  config.specs = [
    join(__dirname, '..', 'spec', 'e2e', '**', '*.spec.js')
  ];
  config.framework = 'jasmine';
  // make sure cucumber options are removed
  if (config.cucumberOpts) delete config.cucumberOpts;
}

// Export config
exports.config = config;
