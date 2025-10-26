import { languageSelectors, restartApp } from '../../helpers/utils';
import { LOGIN_USERS } from '../../helpers/e2eConstants';
import LoginScreen from '../../screenObjects/login';
import InventoryListScreen from '../../screenObjects/inventoryList';
import AppHeader from '../../screenObjects/appHeader';
import CartContent from '../../screenObjects/cart';
import CheckoutPageOne from '../../screenObjects/checkoutPageOne';
import CheckoutPageTwo from '../../screenObjects/checkoutPageTwo';
import CheckoutComplete from '../../screenObjects/checkoutComplete';
import { PERSONAL_INFO } from '../../helpers/e2eConstants';

describe('Navigation / Checkout flow', () => {
  let SELECTORS;
  jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

  beforeEach(async () => {
    SELECTORS = languageSelectors(driver.config);
  });

  it('should show an error when no username is provided', async () => {
      await restartApp();
      await LoginScreen.signIn(LOGIN_USERS.NO_USER_DETAILS);
      let errorText;
      errorText = await LoginScreen.getErrorMessage2();
      console.log('errorText:', errorText);
      expect(errorText).toContain(SELECTORS.login.errors.username);
  });

  it('should show an error when no password is provided', async () => {
      await LoginScreen.signIn(LOGIN_USERS.NO_PASSWORD);
      let errorText;
      errorText = await LoginScreen.getErrorMessage2(10000, true);
      console.log('errorText:', errorText);
      expect(errorText).toContain(SELECTORS.login.errors.password);
      });

  it('should not be able to login with a locked user', async () => {
      //await restartApp();
      await LoginScreen.signIn(LOGIN_USERS.LOCKED);
      let errorText;
      errorText = await LoginScreen.getErrorMessage2();
      expect(errorText).toContain(SELECTORS.login.errors.lockedOut);
  });

  it('should show an error when no match is found', async () => {
      await LoginScreen.signIn(LOGIN_USERS.NO_MATCH);
      let errorText;
      errorText = await LoginScreen.getErrorMessage2();
      expect(errorText).toContain(SELECTORS.login.errors.noMatch);
  });

  it('User logs in with standard user', async () => {
    await LoginScreen.signIn(LOGIN_USERS.STANDARD);
    await InventoryListScreen.waitForIsShown();
  });

  it('User adds items to the cart', async () => {
    await InventoryListScreen.addSwagItemToCart(SELECTORS.products.backpack.name);
    await InventoryListScreen.addSwagItemToCart(SELECTORS.products.bikeLight.name);
  });

  it('User opens the cart', async () => {
    await AppHeader.openCart();
    await CartContent.waitForIsShown();
    expect(await CartContent.getSwagItemCount()).toBe(2);
  });

  it('User removes an item from the cart', async () => {
    await CartContent.removeSwagItem(SELECTORS.products.backpack.name);
    await driver.pause(500); // small pause to allow UI update
    expect(await CartContent.getSwagItemCount()).toBe(1);
    console.log('DEBUG after remove count:', await CartContent.getSwagItemCount());
  });

  it('User navigates to checkout', async () => {
    await CartContent.goToCheckout();
    await CheckoutPageOne.waitForIsShown();
  });

  it('User fills in checkout info and submits', async () => {
    await CheckoutPageOne.submitPersonalInfo(PERSONAL_INFO.STANDARD);
    await CheckoutPageTwo.waitForIsShown();
  });

  it('User completes the checkout', async () => {
    await CheckoutPageTwo.finishCheckout();
    await CheckoutComplete.waitForIsShown();
    //await driver.pause(3000);
  });
});