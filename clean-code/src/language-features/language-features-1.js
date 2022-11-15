// noinspection JSUnusedGlobalSymbols

async function chechArtifactConnection(ctx) {
  const listByBDtoIn = { id: ctx.mainEntity.artifactId };
  const { itemList } = await ctx.createObject(UuArtifactIfc).listByArtifactB(listByBDtoIn);
  //  3.1.1
  Array.isArray(itemList) &&
    itemList.length &&
    itemList.forEach((art) => {
      //  3.1.1.1.A
      // eslint-disable-next-line no-undef
      if (art.artifactAStateType !== ArtifactStates.FINAL) {
        //  3.1.1.1.A.1
        throw new ctx.errors.AtLeastOneRelatedArtifactIsNotInFinalState({ uuAppErrorMap: ctx.uuAppErrorMap }, { id: art.id });
      }
    });
}
