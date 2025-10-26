import LoginScreen from '../../screenObjects/login';
import InventoryListScreen from '../../screenObjects/inventoryList';
import { getTextOfElement, languageSelectors, restartApp } from '../../helpers/utils';
import { LOGIN_USERS } from '../../helpers/e2eConstants';
import Gestures from '../../helpers/Gestures';

describe('Login', () => {
    let SELECTORS;
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 20000;

    beforeEach(async () => {
        await restartApp(); // await restartApp
        SELECTORS = languageSelectors(driver.config);
        //console.log('SELECTORS:', SELECTORS);
      //console.log('driver.config:', driver && driver.config ? driver.config : global.driverConfig);
    });

     it('should be able to login with a standard user', async () => {
      await LoginScreen.waitForIsShown();
      await LoginScreen.signIn(LOGIN_USERS.STANDARD);
      await LoginScreen.waitForInventoryListScreen();
    });

    it('should not be able to login with a locked user', async () => {
    await LoginScreen.waitForIsShown();
    await LoginScreen.signIn(LOGIN_USERS.LOCKED);

    // await the helper and request diagnostics if missing
    let errorText;
    errorText = await LoginScreen.getErrorMessage2();
    //getTextOfElement(errorText, false)
    //let text;
    //text = getTextOfElement(errorText, false);

    console.log('errorText rebecaaaa:', errorText);
    expect(errorText).toContain(SELECTORS.login.errors.lockedOut);
});

    it('should show an error when no username is provided', async () => {
      await LoginScreen.waitForIsShown();
    await LoginScreen.signIn(LOGIN_USERS.NO_USER_DETAILS);

    // await the helper and request diagnostics if missing
    let errorText;
    errorText = await LoginScreen.getErrorMessage2();
    //getTextOfElement(errorText, false)
    //let text;
    //text = getTextOfElement(errorText, false);

    console.log('errorText:', errorText);
    expect(errorText).toContain(SELECTORS.login.errors.username);
    });

    it('should show an error when no password is provided', async () => {
      await LoginScreen.waitForIsShown();
    await LoginScreen.signIn(LOGIN_USERS.NO_PASSWORD);

    // await the helper and request diagnostics if missing
    let errorText;
    errorText = await LoginScreen.getErrorMessage2(10000, true);
    //getTextOfElement(errorText, false)
    //let text;
    //text = getTextOfElement(errorText, false);

    console.log('errorText:', errorText);
    expect(errorText).toContain(SELECTORS.login.errors.password);
    });

    it('should show an error when no match is found', async () => {
      await LoginScreen.waitForIsShown();
      await LoginScreen.signIn(LOGIN_USERS.NO_MATCH);
      await driver.pause(1000);
      // await the helper and request diagnostics if missing
      let errorText;
        try {
            errorText = await LoginScreen.getErrorMessage2();
        } catch (err) {
            const shot = `./reports/screenshots/login-nomatch-fail-${Date.now()}.png`;
            await browser.saveScreenshot(shot).catch(() => {});
            const src = await browser.getPageSource().catch(() => '<no pageSource>');
            console.error('No-match test diagnostics. Screenshot:', shot);
            console.debug(src.slice(0,2000));
            throw err;
        }

        console.log('errorText:', errorText);
        expect(errorText).toContain(SELECTORS.login.errors.noMatch);
    });

    //COMMENTING THIS BLOCK, autofill UI CANNOT BE DONE AS CREDENTIALS ARE NOT SAVED
    /*it('should be able to login with auto filling standard user data', async () => {
        await LoginScreen.waitForIsShown();
        await Gestures.scrollToElement({ element: LoginScreen.standardUser, swipeDirection: 'up' });
        await (await LoginScreen.standardUser).click();
        await Gestures.scrollToElement({ element: LoginScreen.loginButton, swipeDirection: 'down' });
    });*/
});
