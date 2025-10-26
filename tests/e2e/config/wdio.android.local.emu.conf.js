const { join } = require('path');
const { argv } = require('yargs');
const fs = require('fs');
const { execSync } = require('child_process');
const { config } = require('./wdio.appium.local.shared');

// Define the app path
const appPath =
  process.env.APK_PATH ||
  '/Users/rmodrego/src/sample-app-mobile/apps/Android.SauceLabs.Mobile.Sample.app.2.7.1.apk';

// =======================
// Specs
// =======================
config.specs = ['./tests/e2e/spec/**/*.spec.js'];

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
config.beforeSession = function (config, capabilities, specs) {
  const serial = process.env.ANDROID_SERIAL; // optional if only one emulator is connected

  if (appPath && fs.existsSync(appPath) && serial) {
    try {
      console.log(`Installing app from ${appPath} on device ${serial}...`);
      execSync(`adb -s ${serial} install -r "${appPath}"`, { stdio: 'inherit' });
      console.log('App installed successfully.');
    } catch (err) {
      console.warn('App installation failed or skipped:', err.message);
    }
  }

  global.driverConfig = {
    language: capabilities['appium:language'] || 'en',
    locale: capabilities['appium:locale'] || 'US',
  };
};

// Export config
exports.config = config;
