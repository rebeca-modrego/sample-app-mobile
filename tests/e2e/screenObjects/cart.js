import { getTextOfElement, languageSelectors } from '../helpers/utils';
import Base from './base';
import Gestures from '../helpers/Gestures';

class CartContent extends Base {
	constructor() {
		super(`~test-${ languageSelectors().cartContent.screen }`);
	}

	get SELECTORS() {
		return languageSelectors();
	}

	get screen() {
		return $(`~test-${ this.SELECTORS.cartContent.screen }`);
	}

	get checkoutButton() {
		return $(`~test-${ this.SELECTORS.cartContent.checkout }`);
	}

	get continueShoppingButton() {
		return $(`~test-${ this.SELECTORS.cartContent.continueShopping }`);
	}

	get swagItems() {
		return $$(`~test-${ this.SELECTORS.cartContent.cartItem.itemContainer }`);
	}

	/**
	 * Get a cart Item based on a search string or a number of the visible items
	 *
	 * @param {number|string} needle
	 *
	 * @return the selected cart item
	 */
	async swagItem(needle) {
		if (typeof needle === 'string') {
			return this.swagItems.find(cartItem => getTextOfElement(cartItem).includes(needle));
		}

		return this.swagItems[ needle ];
	}

	/**
	 * Get the text of the cart item text
	 *
	 * @param {number|string} needle
	 *
	 * @return {string}
	 */
	async getSwagItemText(needle) {
        const item = await this.swagItem(needle);
        if (!item) return '';
        return (await getTextOfElement(item).catch(() => '')) || '';
    }

    async getSwagItemCount() {
        // small pause to allow UI update after mutating actions
        await driver.pause(200);
        const items = await $$(`~test-${ this.SELECTORS.cartContent.cartItem.itemContainer }`).catch(() => []);
        return (items && items.length) || 0;
    }

	/**
	 * Remove the first item from the cart
	 *
	 * @return {void}
	 */
	async removeSwagItem() {
		return this.swagItems[ 0 ].$(`~test-${ this.SELECTORS.cartContent.cartItem.remove }`).click();
	}

	/**
	 * Delete the first item from the cart
	 *
	 * @return {void}
	 */
	async deleteSwagItem() {
		return $(`~test-${ this.SELECTORS.cartContent.cartItem.delete }`).click();
	}

	/**
	 * Open the delete option with a swipe to left
	 */
	async swipeToOpenDeleteButton() {
		Gestures.swipeItemLeft(this.swagItems[ 0 ]);

		// Wait for the animation
		return driver.pause(500);
	}

	/**
	 * Continue shopping
	 *
	 * @return {void}
	 */
	async continueShopping() {
		Gestures.scrollToElement({element: this.continueShoppingButton, swipeDirection: 'up' });

		return this.continueShoppingButton.click();
	}

	/**
	 * Go to the checkout process
	 *
	 * @return {void}
	 */
	async goToCheckout() {
		Gestures.scrollToElement({ element: this.checkoutButton, swipeDirection: 'up' });

		return this.checkoutButton.click();
	}
}

export default new CartContent();
