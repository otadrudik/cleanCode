function calculatePrice(quantity, itemPrice) {
  const basePrice = quantity * itemPrice;
  const quantityDiscount = Math.max(0, quantity - 500) * itemPrice * 0.05;
  const shipping = Math.min(basePrice * 0.1, 100.0);
  return basePrice - quantityDiscount + shipping;
}