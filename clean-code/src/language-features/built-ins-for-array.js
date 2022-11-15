const animals = [`Forrest lion`, `Forrest cat`, `Home cat`];

console.log(`All animals:`);
animals.forEach((a) => console.log(a));
console.log(`\n`);

const inForestAnimals = animals.filter((a) => a.indexOf(`Forrest`) >= 0);
console.log(`inForestAnimals (filter): ${inForestAnimals}`);

const inForestAnimal = animals.find((a) => a.indexOf(`Forrest`) >= 0);
console.log(`inForestAnimal (find): ${inForestAnimal}`);

const forrestCatAnimalExists = animals.includes(`Forrest cat`);
console.log(`forrestCatAnimalExists (includes): ${forrestCatAnimalExists}`);

const homeAnimalExists = animals.some((a) => a.indexOf(`Home `) >= 0);
console.log(`homeAnimalExists (some): ${homeAnimalExists}`);

let mappedAnimals = animals.map((a) => {
  return {
    name: a,
    type: `Mammal`,
  };
});
console.log(`mappedAnimals: `);
console.log(mappedAnimals);

animals.sort();
console.log(`Animals after sort: ` + animals);

const initialAllAnimalsLetterCount = 0;

function sumReducer(sum, val) {
  return sum + val;
}

const allAnimalsLetterCount = animals.map((a) => a.length).reduce(sumReducer, initialAllAnimalsLetterCount);
console.log(`allAnimalsLetterCount: ${allAnimalsLetterCount}`);
