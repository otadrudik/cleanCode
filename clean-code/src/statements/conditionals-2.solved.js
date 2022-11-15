// noinspection JSUnusedGlobalSymbols
const STATE = {
  UNITED_STATES: {
    code: "US",
    discount: 0.85,
  },
  RUSSIA: {
    code: "RU",
    discount: 0.75,
  },
  CANADA: {
    code: "CN",
    discount: 0.9,
  },
};

class Order {
  constructor(products, user) {
    this._products = products;
    this._user = user;
  }

  calculateTotal() {
    let total = 0;
    for (const product of this._products) {
      total += product.quantity * product.price;
    }

    return this.applyRegionalDiscounts(total);
  }

  applyRegionalDiscounts(total) {
    total *= this._user.getCountry().discount;
    return total;
  }
}
