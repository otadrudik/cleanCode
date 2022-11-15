// noinspection JSUnusedGlobalSymbols

class UuFinMan {
  loadAndState(dtoIn = {}) {
    const finMan = await this.load(dtoIn);

    if (finMan.state !== FinManConstants.States.ACTIVE) {
      // HDS 3.2.A
      // HDS 3.2.A.1
      throw new this.ctxData.ucErrors.UuFinManIsNotInActiveState({ uuAppErrorMap: this.ctxData.uuAppErrorMap }, finMan);
    }
    return finMan;
  }
}
