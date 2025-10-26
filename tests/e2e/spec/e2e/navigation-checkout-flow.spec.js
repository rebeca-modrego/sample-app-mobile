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

  it('User logs in', async () => {
    await restartApp();
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