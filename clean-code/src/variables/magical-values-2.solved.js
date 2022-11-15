const GRAVITATIONAL_CONSTANT = 9.81;

function getPotentialEnergy(mass, height) {
  return mass * height * GRAVITATIONAL_CONSTANT;
}