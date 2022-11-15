// noinspection JSUnusedGlobalSymbols

class Basket {
  products = [];

  addProduct(product) {
    if (this.products.length === 3) {
      throw new Error("Max 3 products allowed");
    }
    this.products.push(product);
  }
}

class Shipment {
  products = [];

  addProduct(product) {
    if (this.products.length === 3) {
      throw new Exception("Max 3 products allowed");
    }
    this.products.push(product);
  }
}
