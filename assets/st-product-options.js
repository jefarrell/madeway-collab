/**
 *  Custom Product Options
 */

// Product Options Class

class ProductOptions extends HTMLElement {
    constructor() {
        super();

        this.selectors = {
            inputId: ".js-st-input-id",
            option: ".js-st-input-options",
            atcButton: ".js-st-atc-button",
            form: "[data-product-form]",
            jsonWrapper: "[data-section-type='static-product']"
        }

        this.container = this
        this.input = this.container.querySelector(this.selectors.inputId)
        this.button = document.querySelector(this.selectors.atcButton)
        this.form = this.container.closest(this.selectors.form)
        this.product = JSON.parse(document.querySelector(this.selectors.jsonWrapper).textContent).product
    }

    connectedCallback() {
        this.container.addEventListener("change", this._handleChange.bind(this))
    }
    
    /*
		Event Listener Callback
	*/
    _handleChange(e) {
        const target = e.target

        // Only continue if we have a valid variant option
        // and valid form
        if (!this.select && !this.form) return

        const currentVariant = this._getVariant(this.form, this.product).variant

        // Proceed if we have a valid Variant Id
        if (currentVariant === false) return

        // Update selected variant id input
        // This update should activate the "Shop Pay" button
        this.input.value = currentVariant.id

        // Re-initialize Shopify Payment Button
        if (window.Shopify && Shopify.PaymentButton) {
            Shopify.PaymentButton.init();
        }

        // Send data to "Atlantic theme" for update of images, price and url
        const variantUpdate = new CustomEvent("stVariant:update", {
            bubbles: true,
            detail: { 
                variant: currentVariant
            },
        });

        target.dispatchEvent(variantUpdate);
    
    }


    /**
     * Gets the current product variant from the selected
     * product option in the form.
     *
     * @param {Node} form - The product form
     * @param {Object} product - The product data
     * @returns {Object} - Object with the form and the new variant, which is either an object or boolean.
     */

    _getVariant(form, product) {
        const values = { option1: null, option2: null, option3: null }

        let returnedData = {
            form: form,
            variant: false
        }

        for (const option of form.querySelectorAll(this.selectors.option)) {
            values[option.getAttribute("name")] = decodeURIComponent(option.value)
        }

        // Returns variant when it finds a match
        if (product.variants.length == 1) {
            returnedData["variant"] = product.variants[0]
        } else {
            for (const variant of product.variants) {
                if (variant.option1 === values.option1 && variant.option2 === values.option2 && variant.option3 === values.option3) {
                    returnedData["variant"] = variant
                }
            }
        }

        return returnedData
        
    }

}

customElements.define('st-product-options', ProductOptions);