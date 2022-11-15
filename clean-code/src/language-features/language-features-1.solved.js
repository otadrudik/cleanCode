// noinspection JSUnusedGlobalSymbols

async function checkArtifactConnection(ctx) {
  const listByBDtoIn = { id: ctx.mainEntity.artifactId };
  const { itemList } = await ctx.createObject(UuArtifactIfc).listByArtifactB(listByBDtoIn);
  //  3.1.1
  //  3.1.1.1.A
  const nonFinalArt = itemList.find((artifact) => artifact.artifactAStateType !== ArtifactStates.FINAL);
  //  3.1.1.1.A.1
  if (nonFinalArt) {
    throw new ctx.errors.AtLeastOneRelatedArtifactIsNotInFinalState({ uuAppErrorMap: ctx.uuAppErrorMap }, { id: nonFinalArt.id });
  }
}
