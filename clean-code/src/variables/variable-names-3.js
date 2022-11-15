function hasDiscount(order) {
  const basePrice = order.basePrice();
  return basePrice > 1000;
}