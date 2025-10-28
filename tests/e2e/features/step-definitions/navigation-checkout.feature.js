const { Given, When, Then, Before } = require('@cucumber/cucumber');
const { languageSelectors, restartApp } = require('../../helpers/utils.js');
const { LOGIN_USERS, PERSONAL_INFO } = require('../../helpers/e2eConstants.js');
const LoginScreen = require('../../screenObjects/login.js');
const InventoryListScreen = require('../../screenObjects/inventoryList.js');
const AppHeader = require('../../screenObjects/appHeader');
const CartContent = require('../../screenObjects/cart.js');
const CheckoutPageOne = require('../../screenObjects/checkoutPageOne.js');
const CheckoutPageTwo = require('../../screenObjects/checkoutPageTwo.js');

Before(async function () {
  this.SELECTORS = languageSelectors(driver.config);
});

Given('the app is restarted', async () => {
  await restartApp();
  await LoginScreen.waitForIsShown();
});

When('I attempt to sign in with user type {string}', async (userKey) => {
  await LoginScreen.clearCredentials?.();
  await LoginScreen.signIn(LOGIN_USERS[userKey]);
});

Then('I should see a login error containing {string}', async (expected) => {
  await browser.waitUntil(async () => {
    const t = await LoginScreen.getErrorMessage({ timeout: 10000 });
    return typeof t === 'string' && t.includes(expected);
  }, { timeout: 15000 });
});

When('I login as {string}', async (userKey) => {
  await LoginScreen.clearCredentials?.();
  await LoginScreen.signIn(LOGIN_USERS[userKey]);
  await InventoryListScreen.waitForIsShown();
});

When('I add backpack and bikeLight to cart', async () => {
  const sel = this.SELECTORS.products;
  await InventoryListScreen.addSwagItemToCart(sel.backpack.name);
  await InventoryListScreen.addSwagItemToCart(sel.bikeLight.name);
});

When('I open the cart', async () => {
  await AppHeader.openCart();
  await CartContent.waitForIsShown();
});

When('I remove {string} from the cart', async (productKey) => {
  const name = this.SELECTORS.products[productKey]?.name || productKey;
  await CartContent.removeSwagItem(name);
  await browser.waitUntil(async () => (await CartContent.getSwagItemCount()) < 2, { timeout: 5000 });
});

When('I go to checkout and submit personal info', async () => {
  await CartContent.goToCheckout();
  await CheckoutPageOne.waitForIsShown();
  await CheckoutPageOne.submitPersonalInfo(PERSONAL_INFO.STANDARD);
  await CheckoutPageTwo.waitForIsShown();
  await CheckoutPageTwo.finishCheckout();
});

Then('I should see the checkout complete screen', async () => {
  await CheckoutComplete.waitForIsShown();
});