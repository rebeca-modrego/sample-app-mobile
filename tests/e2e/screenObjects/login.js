import { getTextOfElement, languageSelectors } from '../helpers/utils';
import Base from './base';
import { DEFAULT_PIN, DEFAULT_TIMEOUT, INCORRECT_PIN } from '../helpers/e2eConstants';

class LoginScreen extends Base {
	constructor() {
		super(`~test-${ languageSelectors().login.screen }`);
	}

	get SELECTORS() {
		return languageSelectors();
	}

	get screen() {
		return $(`~test-${ this.SELECTORS.login.screen }`);
	}

	get username() {
		return $(`~test-${ this.SELECTORS.login.username }`);
	}

	get password() {
		return $(`~test-${ this.SELECTORS.login.password }`);
	}

	get biometryButton() {
		return $(`~test-${ this.SELECTORS.login.biometry }`);
	}

	get faceRecognition() {
		return $(`~test-${ this.SELECTORS.login.faceRecognition }`);
	}

	get loginButton() {
		return $(`~test-${ this.SELECTORS.login.loginButton }`);
	}

	get errorMessage() {
		return $(`~test-${ this.SELECTORS.login.errors.container }`);
	}

	get errorMessageLocked() {
		return $(`~test-${ this.SELECTORS.login.errors.lockedOut }`);
	}

	get standardUser() {
		return $(`~test-${ this.SELECTORS.login.loginText.standard }`);
	}

	get lockedUser() {
		return $(`~test-${ this.SELECTORS.login.loginText.locked }`);
	}

	get problemUser() {
		return $(`~test-${ this.SELECTORS.login.loginText.problem }`);
	}

	///////////////////////////////////////////////////////
	// These selectors are in English because these are the
	// system selectors
	///////////////////////////////////////////////////////
	get iosAllowBiometry() {
		return $('~Don’t Allow');
	}

	get allowBiometry() {
		return $('~OK');
	}

	get iosRetryBiometry() {
		// Sauce Labs (Legacy) RDC mocks iOS in a different then the normal iOS mocking,
		// so it also needs to be treated differently
		if (process.env.RDC) {
			return $('~Cancel');
		}

		return $('~Try Again');
	}

	get androidBiometryAlert() {
		return $('android=new UiSelector().textContains("Please sign in")');
	}

	/**
	 * Submit biometric login
	 *
	 * @param {boolean} successful
	 */
	submitBiometricLogin(successful) {
		// Touch / Face ID needs to be triggered differently on iOS
		if (driver.isIOS) {
			// Determine Face / Touch ID
			return this.submitIosBiometricLogin(successful);
		}

		return this.submitAndroidBiometricLogin(successful ? DEFAULT_PIN : INCORRECT_PIN);
	}

	/**
	 * Verify that the biometric login failed
	 *
	 * return {boolean}
	 */
	isBiometryAlertShown() {
		if (driver.isIOS) {
			return this.iosRetryBiometry.waitForDisplayed({
				// On RDC the alert will not be shown again,
				// so we need to search the reverse here
				reverse: process.env.RDC,
			});
		}

		return this.androidBiometryAlert.waitForDisplayed();
	}

	/**
	 * Submit iOS biometric login
	 *
	 * @param {boolean} successful
	 */
	submitIosBiometricLogin(successful) {
		// Sauce Labs (Legacy) RDC mocks iOS in a different then the normal iOS mocking,
		// so it also needs to be treated differently
		if (process.env.RDC) {
			return driver.touchId(successful);
		}

		this.allowIosBiometricUsage();

		return driver.execute(
			'mobile:sendBiometricMatch',
			{
				type: this.isFaceId() ? 'faceId' : 'touchId',
				match: successful,
			},
		);
	}

	  async findErrorElement() {
        const container = this.SELECTORS?.login?.errors?.container || 'Error message';
        const accId = `test-${container}`;

        // candidate selectors (accessibility id, UiSelector by description, xpath by content-desc, xpath by visible text)
        const candidates = [
            `~${accId}`,
            `android=new UiSelector().description("${accId}")`,
            `//*[@content-desc="${accId}"]`,
            // fallback: look for known error text(s)
            `//*[contains(@text, "${this.SELECTORS?.login?.errors?.lockedOut || 'locked out'}")]`,
            `//*[contains(@text, "${this.SELECTORS?.login?.errors?.password || 'Password is required'}")]`
        ];

        for (const sel of candidates) {
            try {
                const el = await $(sel);
                if (await el.isExisting()) return el;
            } catch (e) {
                // ignore and try next
            }
        }

        // not found
        return null;
    }

	/**
	 * Allow biometric usage on iOS if it isn't already accepted
	 */
	allowIosBiometricUsage() {
		// Wait for the alert
		try {
			this.iosAllowBiometry.waitForDisplayed({ timeout: 3000 });
			this.allowBiometry.click();
		} catch (e) {
			// This means that allow using touch/facID has already been accepted
		}
	}

	async waitForLoginScreen() {
    // this.screen already returns a WebdriverIO element — don't pass it into $()
    await this.screen.waitForDisplayed({
        timeout: 60000,
        timeoutMsg: 'Login screen did not appear after 60s',
    });
	}

	async getErrorMessage2() {
		this.errorMessage.waitForDisplayed({ timeout: DEFAULT_TIMEOUT });

		return getTextOfElement(this.errorMessage);
	}

	/**
	 * Check if the error message is displayed
	 *
	 * @return {boolean}
	 */
	isErrorMessageIsShown() {
		return this.isShown(this.errorMessage);
	}


	/**
	 * Check if this is the biometric login supports FaceID
	 *
	 * @return {boolean}
	 */
	isFaceId() {
		return this.faceRecognition.isDisplayed();
	}

	/**
	 * Submit Android biometric login
	 *
	 * @param {number} fingerprintId
	 */
	submitAndroidBiometricLogin(fingerprintId) {
		this.androidBiometryAlert.waitForDisplayed();

		return driver.fingerPrint(fingerprintId);
	}

	/**
	 * Sign in
	 *
	 * @param {object} userDetails
	 * @param {string} userDetails.username
	 * @param {string} userDetails.password
	 */

async signIn(userDetails = {}) {
	await this.waitForLoginScreen();
    const { password, username } = userDetails;

    // Wait and fill username
    if (username && username !== '') {
        await this.username.waitForDisplayed({ timeout: 30000 });
        await this.username.waitForEnabled({ timeout: 30000 });
        await this.username.setValue(username);
    }

    // Wait and fill password
    if (password && password !== '') {
        await this.password.waitForDisplayed({ timeout: 30000 });
        await this.password.waitForEnabled({ timeout: 30000 });
        await this.password.setValue(password);
    }

    // Click the login button and await navigation / error
    await this.loginButton.waitForDisplayed({ timeout: 10000 });
    await this.loginButton.click();
	// detect error flow — wait a little longer for error to be populated
        try {
            const err = await this.getErrorMessage(5000, false);
            if (err && err.length) {
                // error shown (locked/invalid credentials)
                return false;
            }
        } catch (e) {
            // if getErrorMessage throws with diagnostics, rethrow for visibility
            if (e && e.message) throw e;
        }

    // success flow: wait for inventory list
    //await this.waitForInventoryListScreen();
    return true;

}

async logingButtonClick() {
	await this.loginButton.click();

}

async waitForInventoryListScreen() {
    console.log('[InventoryListPage] Waiting for inventory list screen...');
    const selector = `~test-${this.SELECTORS.inventoryListPage.screen}`;
    const container = await $(selector);
    await container.waitForDisplayed({
        timeout: 30000,
        timeoutMsg: `Inventory list screen (${selector}) did not appear after 30s`,
    });
    console.log('[InventoryListPage] Screen loaded!');
}

	/**
	 * Get the text or the error message container
	 *
	 * @return {string}
	 */
	async getErrorMessage() {
		this.errorMessage.waitForDisplayed({ timeout: DEFAULT_TIMEOUT });

		return getTextOfElement(this.errorMessage);
	}

	/**
	 * Check if the error message is displayed
	 *
	 * @return {boolean}
	 */
	isErrorMessageIsShown() {
		return this.isShown(this.errorMessage);
	}
}

export default new LoginScreen();
