(function($) {
    $.Shop = function(element) {
        this.$element = $(element);
        this.init();
    };

    $.Shop.prototype = {
        init: function() {

            // properties

            this.cartPrefix = "yourpotions-"; // prefix string to be prepended to the cart's name in the session storage
            this.cartName = this.cartPrefix + "potions"; // cart name in the session storage
            this.shippingRates = this.cartPrefix + "shippingrates"; // shipping rates key in the session storage
            this.total = this.cartPrefix + "total"; // total in session storage
            this.storage = sessionStorage;


            this.$formAddToCart = $(".addtocart"); // adding items to the cart
            this.$formCart = $("#potionscart"); // cart form
            this.$checkoutCart = $("#checkoutcart"); // finds final cart
            this.$checkoutAddressForm = $("#checkoutaddressform"); // checkoutform magic
            this.$shipping = $("#sshipping"); //shipping rates
            this.$subTotal = $("#stotal"); //  subtotal charges
            this.$shoppingCartActions = $("#potionscartactions"); // cart actions links
            this.$updateCartBtn = this.$shoppingCartActions.find("#updatecart"); // update cart button
            this.$emptyCartBtn = this.$shoppingCartActions.find("#emptycart"); // empty cart button
            this.$userDetails = $("#userdetails"); //  user information
            this.$paypalForm = $("#paypalform"); // pp form


            this.currency = "&#36;"; // HTML entity
            this.currencyString = "$"; // Currency symbol as string for pp
            this.paypalCurrency = "CAD"; // PayPal's currency code
            this.paypalEmail = "sb-5ur3j2682912@business.example.com"; // pp email
            this.paypalURL = "https://www.sandbox.paypal.com/cgi-bin/webscr"; // pp form address

            // form validation QQ
            this.requiredFields = {
                expression: {
                    value: /^([\w-\.]+)@((?:[\w]+\.)+)([a-z]){2,4}$/
                },

                str: {
                    value: ""
                }

            };

            // invocation

            this.createCart();
            this.handleAddToCartForm();
            this.handleCheckoutAddressForm();
            this.emptyCart();
            this.updateCart();
            this.displayCart();
            this.deletePotions();
            this.displayUserAddress();
            this.populatePayPalForm();


        },

        // public method

        // session storage

        createCart: function() {
            if (this.storage.getItem(this.cartName) == null) {

                var cart = {};
                cart.items = [];

                this.storage.setItem(this.cartName, this._toJSONString(cart));
                this.storage.setItem(this.shippingRates, "0");
                this.storage.setItem(this.total, "0");
            }
        },

        // grabs fancy hidden paypal magic

        populatePayPalForm: function() {
            var self = this;
            if (self.$paypalForm.length) {
                var $form = self.$paypalForm;
                var cart = self._toJSONObject(self.storage.getItem(self.cartName));
                var shipping = self.storage.getItem(self.shippingRates);
                var numShipping = self._convertString(shipping);
                var cartItems = cart.items;
                var singShipping = Math.floor(numShipping / cartItems.length);

                $form.attr("action", self.paypalURL);
                $form.find("input[name='business']").val(self.paypalEmail);
                $form.find("input[name='currency_code']").val(self.paypalCurrency);

                for (var i = 0; i < cartItems.length; ++i) {
                    var cartItem = cartItems[i];
                    var n = i + 1;
                    var name = cartItem.product;
                    var price = cartItem.price;
                    var qty = cartItem.qty;

                    $("<div/>").html("<input type='hidden' name='quantity_" + n + "' value='" + qty + "'/>").
                    insertBefore("#paypalbtn");
                    $("<div/>").html("<input type='hidden' name='item_name_" + n + "' value='" + name + "'/>").
                    insertBefore("#paypalbtn");
                    $("<div/>").html("<input type='hidden' name='item_number_" + n + "' value='SKU " + name + "'/>").
                    insertBefore("#paypalbtn");
                    $("<div/>").html("<input type='hidden' name='amount_" + n + "' value='" + self._formatNumber(price, 2) + "'/>").
                    insertBefore("#paypalbtn");
                    $("<div/>").html("<input type='hidden' name='shipping_" + n + "' value='" + self._formatNumber(singShipping, 2) + "'/>").
                    insertBefore("#paypalbtn");

                }



            }
        },

        // user info magic

        displayUserAddress: function() {
            if (this.$userDetails.length) {
                if (this.storage.getItem("shippingname") == null) {
                    var name = this.storage.getItem("billingname");
                    var email = this.storage.getItem("billingemail");
                    var city = this.storage.getItem("billingcity");
                    var address = this.storage.getItem("billingaddress");
                    var postal = this.storage.getItem("billingpostal");
                    var country = this.storage.getItem("billingcountry");

                    var html = "<div class='detail'>";
                    html += "<h2>Billing and Shipping</h2>";
                    html += "<ul>";
                    html += "<li>" + name + "</li>";
                    html += "<li>" + email + "</li>";
                    html += "<li>" + city + "</li>";
                    html += "<li>" + address + "</li>";
                    html += "<li>" + postal + "</li>";
                    html += "<li>" + country + "</li>";
                    html += "</ul></div>";

                    this.$userDetails[0].innerHTML = html;
                } else {
                    var name = this.storage.getItem("billingname");
                    var email = this.storage.getItem("billingemail");
                    var city = this.storage.getItem("billingcity");
                    var address = this.storage.getItem("billingaddress");
                    var postal = this.storage.getItem("billingpostal");
                    var country = this.storage.getItem("billingcountry");

                    var sName = this.storage.getItem("shippingname");
                    var sEmail = this.storage.getItem("shippingemail");
                    var sCity = this.storage.getItem("shippingcity");
                    var sAddress = this.storage.getItem("shippingaddress");
                    var sPostal = this.storage.getItem("shippingpostal");
                    var sCountry = this.storage.getItem("shippingcountry");

                    var html = "<div class='detail'>";
                    html += "<h2>Billing</h2>";
                    html += "<ul>";
                    html += "<li>" + name + "</li>";
                    html += "<li>" + email + "</li>";
                    html += "<li>" + city + "</li>";
                    html += "<li>" + address + "</li>";
                    html += "<li>" + postal + "</li>";
                    html += "<li>" + country + "</li>";
                    html += "</ul></div>";

                    html += "<div class='detail right'>";
                    html += "<h2>Shipping</h2>";
                    html += "<ul>";
                    html += "<li>" + sName + "</li>";
                    html += "<li>" + sEmail + "</li>";
                    html += "<li>" + sCity + "</li>";
                    html += "<li>" + sAddress + "</li>";
                    html += "<li>" + sPostal + "</li>";
                    html += "<li>" + sCountry + "</li>";
                    html += "</ul></div>";

                    this.$userDetails[0].innerHTML = html;

                }
            }
        },

        // Delete a product from the shopping cart

        deletePotions: function() {
            var self = this;
            if (self.$formCart.length) {
                var cart = this._toJSONObject(this.storage.getItem(this.cartName));
                var items = cart.items;

                $(document).on("click", ".pdelete a", function(e) {
                    e.preventDefault();
                    var productName = $(this).data("product");
                    var newItems = [];
                    for (var i = 0; i < items.length; ++i) {
                        var item = items[i];
                        var product = item.product;
                        if (product == productName) {
                            items.splice(i, 1);
                        }
                    }
                    newItems = items;
                    var updatedCart = {};
                    updatedCart.items = newItems;

                    var updatedTotal = 0;
                    var totalQty = 0;
                    if (newItems.length == 0) {
                        updatedTotal = 0;
                        totalQty = 0;
                    } else {
                        for (var j = 0; j < newItems.length; ++j) {
                            var prod = newItems[j];
                            var sub = prod.price * prod.qty;
                            updatedTotal += sub;
                            totalQty += prod.qty;
                        }
                    }

                    self.storage.setItem(self.total, self._convertNumber(updatedTotal));
                    self.storage.setItem(self.shippingRates, self._convertNumber(self._calculateShipping(totalQty)));

                    self.storage.setItem(self.cartName, self._toJSONString(updatedCart));
                    $(this).parents("tr").remove();
                    self.$subTotal[0].innerHTML = self.currency + " " + self.storage.getItem(self.total);
                });
            }
        },

        // Displays the shopping cart

        displayCart: function() {
            if (this.$formCart.length) {
                var cart = this._toJSONObject(this.storage.getItem(this.cartName));
                var items = cart.items;
                var $tableCart = this.$formCart.find(".potionscart");
                var $tableCartBody = $tableCart.find("tbody");

                if (items.length == 0) {
                    $tableCartBody.html("");
                } else {


                    for (var i = 0; i < items.length; ++i) {
                        var item = items[i];
                        var product = item.product;
                        var price = this.currency + " " + item.price;
                        var qty = item.qty;
                        var html = "<tr><td class='pname'>" + product + "</td>" + "<td class='pqty'><input type='text' value='" + qty + "' class='qty'/></td>";
                        html += "<td class='pprice'>" + price + "</td><td class='pdelete'><a href='' data-product='" + product + "'>&times;</a></td></tr>";

                        $tableCartBody.html($tableCartBody.html() + html);
                    }

                }

                if (items.length == 0) {
                    this.$subTotal[0].innerHTML = this.currency + " " + 0.00;
                } else {

                    var total = this.storage.getItem(this.total);
                    this.$subTotal[0].innerHTML = this.currency + " " + total;
                }
            } else if (this.$checkoutCart.length) {
                var checkoutCart = this._toJSONObject(this.storage.getItem(this.cartName));
                var cartItems = checkoutCart.items;
                var $cartBody = this.$checkoutCart.find("tbody");

                if (cartItems.length > 0) {

                    for (var j = 0; j < cartItems.length; ++j) {
                        var cartItem = cartItems[j];
                        var cartProduct = cartItem.product;
                        var cartPrice = this.currency + " " + cartItem.price;
                        var cartQty = cartItem.qty;
                        var cartHTML = "<tr><td class='pname'>" + cartProduct + "</td>" + "<td class='pqty'>" + cartQty + "</td>" + "<td class='pprice'>" + cartPrice + "</td></tr>";

                        $cartBody.html($cartBody.html() + cartHTML);
                    }
                } else {
                    $cartBody.html("");
                }

                if (cartItems.length > 0) {

                    var cartTotal = this.storage.getItem(this.total);
                    var cartShipping = this.storage.getItem(this.shippingRates);
                    var subTot = this._convertString(cartTotal) + this._convertString(cartShipping);

                    this.$subTotal[0].innerHTML = this.currency + " " + this._convertNumber(subTot);
                    this.$shipping[0].innerHTML = this.currency + " " + cartShipping;
                } else {
                    this.$subTotal[0].innerHTML = this.currency + " " + 0.00;
                    this.$shipping[0].innerHTML = this.currency + " " + 0.00;
                }

            }
        },

        // empty cart yo

        emptyCart: function() {
            var self = this;
            if (self.$emptyCartBtn.length) {
                self.$emptyCartBtn.on("click", function() {
                    self._emptyCart();
                });
            }
        },

        // update cart yo

        updateCart: function() {
            var self = this;
            if (self.$updateCartBtn.length) {
                self.$updateCartBtn.on("click", function() {
                    var $rows = self.$formCart.find("tbody tr");
                    var cart = self.storage.getItem(self.cartName);
                    var shippingRates = self.storage.getItem(self.shippingRates);
                    var total = self.storage.getItem(self.total);

                    var updatedTotal = 0;
                    var totalQty = 0;
                    var updatedCart = {};
                    updatedCart.items = [];

                    $rows.each(function() {
                        var $row = $(this);
                        var pname = $.trim($row.find(".pname").text());
                        var pqty = self._convertString($row.find(".pqty > .qty").val());
                        var pprice = self._convertString(self._extractPrice($row.find(".pprice")));

                        var cartObj = {
                            product: pname,
                            price: pprice,
                            qty: pqty
                        };

                        updatedCart.items.push(cartObj);

                        var subTotal = pqty * pprice;
                        updatedTotal += subTotal;
                        totalQty += pqty;
                    });

                    self.storage.setItem(self.total, self._convertNumber(updatedTotal));
                    self.storage.setItem(self.shippingRates, self._convertNumber(self._calculateShipping(totalQty)));
                    self.storage.setItem(self.cartName, self._toJSONString(updatedCart));

                });
            }
        },

        // adds potions to cart

        handleAddToCartForm: function() {
            var self = this;
            self.$formAddToCart.each(function() {
                var $form = $(this);
                var $product = $form.parent();
                var price = self._convertString($product.data("price"));
                var name = $product.data("name");

                $form.on("submit", function() {
                    var qty = self._convertString($form.find(".qty").val());
                    var subTotal = qty * price;
                    var total = self._convertString(self.storage.getItem(self.total));
                    var sTotal = total + subTotal;
                    self.storage.setItem(self.total, sTotal);
                    self._addToCart({
                        product: name,
                        price: price,
                        qty: qty
                    });
                    var shipping = self._convertString(self.storage.getItem(self.shippingRates));
                    var shippingRates = self._calculateShipping(qty);
                    var totalShipping = shipping + shippingRates;

                    self.storage.setItem(self.shippingRates, totalShipping);
                });
            });
        },

        // validation magic to session storage

        handleCheckoutAddressForm: function() {
            var self = this;
            if (self.$checkoutAddressForm.length) {
                var $sameAsBilling = $("#sameasbilling");
                $sameAsBilling.on("change", function() {
                    var $check = $(this);
                    if ($check.prop("checked")) {
                        $("#fieldsetshipping").slideUp("normal");
                    } else {
                        $("#fieldsetshipping").slideDown("normal");
                    }
                });

                self.$checkoutAddressForm.on("submit", function() {
                    var $form = $(this);
                    var valid = self._validateForm($form);

                    if (!valid) {
                        return valid;
                    } else {
                        self._saveFormData($form);
                    }
                });
            }
        },

        // private methods


        // clear session storage

        _emptyCart: function() {
            this.storage.clear();
        },

        /* formats numbers
         */



        _formatNumber: function(num, places) {
            var n = num.toFixed(places);
            return n;
        },

        /* takes/extracts number from string
         */


        _extractPrice: function(element) {
            var self = this;
            var text = element.text();
            var price = text.replace(self.currencyString, "").replace(" ", "");
            return price;
        },

        /* converts number string to number this made me very confused for a long time i think it works?
         */

        _convertString: function(numStr) {
            var num;
            if (/^[-+]?[0-9]+\.[0-9]+$/.test(numStr)) {
                num = parseFloat(numStr);
            } else if (/^\d+$/.test(numStr)) {
                num = parseInt(numStr, 10);
            } else {
                num = Number(numStr);
            }

            if (!isNaN(num)) {
                return num;
            } else {
                console.warn(numStr + " cannot be converted into a number");
                return false;
            }
        },

        /* converts num to string
         */

        _convertNumber: function(n) {
            var str = n.toString();
            return str;
        },

        /* JSON to JS object
         */

        _toJSONObject: function(str) {
            var obj = JSON.parse(str);
            return obj;
        },

        /* JS object to JSON
         */


        _toJSONString: function(obj) {
            var str = JSON.stringify(obj);
            return str;
        },


        /* add JSON object to cart
         */


        _addToCart: function(values) {
            var cart = this.storage.getItem(this.cartName);

            var cartObject = this._toJSONObject(cart);
            var cartCopy = cartObject;
            var items = cartCopy.items;
            items.push(values);

            this.storage.setItem(this.cartName, this._toJSONString(cartCopy));
        },

        /* shipping rate stuff why did i do this
         */

        _calculateShipping: function(qty) {
            var shipping = 0;
            if (qty >= 6) {
                shipping = 10;
            }
            if (qty >= 12 && qty <= 30) {
                shipping = 20;
            }

            if (qty >= 30 && qty <= 60) {
                shipping = 30;
            }

            if (qty > 60) {
                shipping = 0;
            }

            return shipping;

        },

        /* validates checkout form
         */



        _validateForm: function(form) {
            var self = this;
            var fields = self.requiredFields;
            var $visibleSet = form.find("fieldset:visible");
            var valid = true;

            form.find(".message").remove();

            $visibleSet.each(function() {

                $(this).find(":input").each(function() {
                    var $input = $(this);
                    var type = $input.data("type");
                    var msg = $input.data("message");

                    if (type == "string") {
                        if ($input.val() == fields.str.value) {
                            $("<span class='message'/>").text(msg).
                            insertBefore($input);

                            valid = false;
                        }
                    } else {
                        if (!fields.expression.value.test($input.val())) {
                            $("<span class='message'/>").text(msg).
                            insertBefore($input);

                            valid = false;
                        }
                    }

                });
            });

            return valid;

        },

        /* save data from checkout form
         */


        _saveFormData: function(form) {
            var self = this;
            var $visibleSet = form.find("fieldset:visible");

            $visibleSet.each(function() {
                var $set = $(this);
                if ($set.is("#fieldsetbilling")) {
                    var name = $("#name", $set).val();
                    var email = $("#email", $set).val();
                    var city = $("#city", $set).val();
                    var address = $("#address", $set).val();
                    var postal = $("#postal", $set).val();
                    var country = $("#country", $set).val();

                    self.storage.setItem("billingname", name);
                    self.storage.setItem("billingemail", email);
                    self.storage.setItem("billingcity", city);
                    self.storage.setItem("billingaddress", address);
                    self.storage.setItem("billingpostal", postal);
                    self.storage.setItem("billingcountry", country);
                } else {
                    var sName = $("#sname", $set).val();
                    var sEmail = $("#semail", $set).val();
                    var sCity = $("#scity", $set).val();
                    var sAddress = $("#saddress", $set).val();
                    var sPostal = $("#szip", $set).val();
                    var sCountry = $("#scountry", $set).val();

                    self.storage.setItem("shippingname", sName);
                    self.storage.setItem("shippingemail", sEmail);
                    self.storage.setItem("shippingcity", sCity);
                    self.storage.setItem("shippingaddress", sAddress);
                    self.storage.setItem("shippingpostal", sPostal);
                    self.storage.setItem("shippingcountry", sCountry);

                }
            });
        }
    };

    $(function() {
        var shop = new $.Shop("#site");
    });

})(jQuery);

//live-server to activate npm live server