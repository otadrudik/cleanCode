const animals = [`Forrest lion`, `Forrest cat`, `Home cat`];

const [firstAnimal, secondAnimal, thirdAnimal] = animals;
console.log(`firstAnimal: ${firstAnimal}`);

const [onlyFirstAnimal, ...otherAnimals] = animals;
console.log(`onlyFirstAnimal: ${onlyFirstAnimal}`);
console.log(`otherAnimals: ${otherAnimals}`);

function coordinates() {
  return [10, 100];
}

[x, y] = coordinates();
console.log(`x = ${x}`);
