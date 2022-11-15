// noinspection JSUnusedGlobalSymbols

async function computeAsync(uri, dtoIn, session) {
  const awid = uri.getAwid();
  // 1. Validation of dtoIn.
  const uuAppErrorMap = DtoInValidationHelper.validateDtoIn(
    dtoIn,
    Errors.ComputeAsync.InvalidDtoIn,
    Warnings.computeAsync.unsupportedKeys,
    "beAfrrRequestComputeAsyncDtoInType"
  );

  // 2. Check computation request.
  const computationRequest = await this._checkAndGetComputationRequest(awid, dtoIn, uuAppErrorMap);

  // 3. Get computation type.
  const beAfrrComputationType = this._getBeAfrrComputationType(computationRequest.viewFullCode, uuAppErrorMap);

  // 4. Process computation request.
  await this._processComputationRequest(awid, dtoIn, beAfrrComputationType, computationRequest, uri, session, uuAppErrorMap);

  // 5. Returns properly filled dtoOut.
  return {
    uuAppErrorMap,
  };
}
