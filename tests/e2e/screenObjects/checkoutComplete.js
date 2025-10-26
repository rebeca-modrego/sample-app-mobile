import Base from './base';
import Gestures from '../helpers/Gestures';
import { languageSelectors } from '../helpers/utils';

class CheckoutComplete extends Base {
	constructor() {
		super(`~test-${ languageSelectors().checkoutCompletePage.screen }`);
	}

	get SELECTORS() {
		return languageSelectors();
	}

	get screen() {
		return $(`~test-${ this.SELECTORS.checkoutCompletePage.screen }`);
	}

	get continuesShoppingButton() {
		return $(`~test-${ this.SELECTORS.checkoutCompletePage.goToButton }`);
	}

	/**
	 * Continue shopping by scrolling to the button and click on it.
	 * The button is not visible on all screens
	 */
	async continueShopping() {
        // scroll down to reveal the button
        await Gestures.scrollToElement({
            element: this.continuesShoppingButton,
            maxScrolls: 4,
            swipeDirection: 'down',
        });

        // wait for it to be visible then click
        await this.continuesShoppingButton.waitForDisplayed({ timeout: 3000 });
        return this.continuesShoppingButton.click();
    }

	/**
     * Wait until the complete screen is shown
     * @param {number} timeout
     */
    async waitForIsShown(timeout = 5000) {
        const el = await this.screen;
        await el.waitForDisplayed({ timeout });
        return true;
    }

    /**
     * Return boolean whether complete screen is visible
     */
    async isShown() {
        const el = await this.screen;
        return (await el.isExisting()) && (await el.isDisplayed());
    }
}

export default new CheckoutComplete();
