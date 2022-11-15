let animalObj = {
  name: "Cat",
  type: "Mammal",
  origin: {
    country: "USA",
  },
};

console.log("Country: " + animalObj.origin?.country);
console.log("Owner's firstname: " + animalObj.owner?.firstname);
