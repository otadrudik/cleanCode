// noinspection JSUnusedGlobalSymbols

class Payout {
  constructor(isDead, isSeparated, isRetired) {
    this.isDead = isDead;
    this.isSeparated = isSeparated;
    this.isRetired = isRetired;
  }

  getPayAmount() {
    let result;
    if (this.isDead) {
      return this.deadAmount();
    }
    if (this.isSeparated) {
      return this.separatedAmount();
    }
    if (this.isRetired) {
      return this.retiredAmount();
    }
    return this.normalPayAmount();
  }

  normalPayAmount() {
    return undefined;
  }

  retiredAmount() {
    return undefined;
  }

  separatedAmount() {
    return undefined;
  }

  deadAmount() {
    return undefined;
  }
}
