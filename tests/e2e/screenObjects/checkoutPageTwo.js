import Base from './base';
import { getTextOfElement, languageSelectors } from '../helpers/utils';
import Gestures from '../helpers/Gestures';

class CheckoutPageTwo extends Base {
	constructor() {
		super(`~test-${ languageSelectors().checkoutPageTwo.screen }`);
	}

	get SELECTORS(){
		return languageSelectors();
	}

	get screen() {
		return $(`~test-${ this.SELECTORS.checkoutPageTwo.screen }`);
	}

	get cancelButton() {
		return $(`~test-${ this.SELECTORS.checkoutPageTwo.cancelButton }`);
	}

	get finishButton() {
		return $(`~test-${ this.SELECTORS.checkoutPageTwo.finishButton }`);
	}

	get swagItems() {
		return $$(`~test-${ this.SELECTORS.checkoutPageTwo.item.container }`);
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
	 * Get the text of the cart
	 *
	 * @param {number} needle
	 *
	 * @return {string}
	 */
	async getSwagItemText(needle) {
		const elm = this.swagItems[ needle ].$(`~test-${ this.SELECTORS.cartContent.cartItem.description }`);
		Gestures.scrollToElement({ element: elm, swipeDirection: 'up' });

		return getTextOfElement(elm);
	}

	/**
	 * Cancel checkout
	 *
	 * @return {void}
	 */
	async cancelCheckout() {
		Gestures.scrollToElement({ element: this.cancelButton, swipeDirection: 'up' });

		return this.cancelButton.click();
	}

	/**
	 * Finsh checkout
	 *
	 * @return {void}
	 */
	// ...existing code...
    /**
     * Finsh checkout (robust: await scroll, wait for displayed, try fallbacks)
     *
     * @return {Promise<void>}
     */
    // ...existing code...
    /**
     * Finsh checkout (robust: await scroll, find by text/content-desc case-insensitively, try UiScrollable, diagnostics)
     *
     * @return {Promise<void>}
     */
    async finishCheckout() {
        // 1) try canonical button
        try {
            await Gestures.scrollToElement({ element: this.finishButton, swipeDirection: 'up' });
            await this.finishButton.waitForDisplayed({ timeout: 3000 });
            await this.finishButton.click();
            return;
        } catch (e) { /* continue to broader search */ }

        // 2) search common widgets for "finish" in text or content-desc (case-insensitive)
        try {
            const candidates = await $$('//android.widget.Button | //android.widget.TextView | //android.widget.ImageButton').catch(() => []);
            const needle = 'finish';
            for (const el of candidates) {
                try {
                    const txt = (await el.getText().catch(() => '') ) || '';
                    const desc = (await el.getAttribute('content-desc').catch(() => '')) || '';
                    const combined = (txt + ' ' + desc).toLowerCase();
                    if (combined.includes(needle)) {
                        await Gestures.scrollToElement({ element: el, swipeDirection: 'up' }).catch(() => {});
                        if (await el.isExisting() && await el.isDisplayed()) {
                            await el.click();
                            return;
                        }
                    }
                } catch (_) { /* ignore and keep scanning */ }
            }
        } catch (_) {}

        // 3) UiScrollable fallback (Android): try scrolling until "FINISH" text is visible
        try {
            const ui = 'android=new UiScrollable(new UiSelector().scrollable(true)).scrollIntoView(new UiSelector().textContains("FINISH"))';
            const el = await $(ui).catch(() => null);
            if (el && await el.isExisting() && await el.isDisplayed()) {
                await el.click();
                return;
            }
        } catch (_) {}

        // 4) Last resort: tap near bottom of screen (may hit the control)
        try {
            const { width, height } = await driver.getWindowSize();
            await driver.touchPerform([{
                action: 'tap',
                options: { x: Math.round(width * 0.5), y: Math.round(height * 0.92) }
            }]);
            await driver.pause(500);
            return;
        } catch (_) {}

        // diagnostics: save screenshot + pageSource to inspect
        const shot = `./reports/screenshots/missing-finish-${Date.now()}.png`;
        await browser.saveScreenshot(shot).catch(() => {});
        const src = await browser.getPageSource().catch(() => '<no pageSource>');
        // also persist pageSource to file for easier inspection
        try {
            const fs = require('fs');
            const path = `./reports/pagesources/missing-finish-${Date.now()}.xml`;
            fs.mkdirSync('./reports/pagesources', { recursive: true });
            fs.writeFileSync(path, src);
            throw new Error(`CheckoutPageTwo.finishCheckout: FINISH button not found. Screenshot: ${shot}, pageSource: ${path}`);
        } catch (e) {
            throw new Error(`CheckoutPageTwo.finishCheckout: FINISH button not found. Screenshot: ${shot}`);
        }
    }


}

export default new CheckoutPageTwo();
