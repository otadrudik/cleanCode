const ActivationType = {
  SCHEDULED_ACTIVATION: "SA",
  DIRECT_ACTIVATION: "DA",
};
Object.freeze(ActivationType);

// Example usage:
let scheduledActivation = ActivationType.SCHEDULED_ACTIVATION;

// Trying to add new colors fails silently:
ActivationType.ILLEGAL_ACTIVATION = "IA";
console.log(ActivationType);
