// noinspection JSUnusedGlobalSymbols
/**
 * Creates new sprintMan instance.
 * @return sprintMan ID as UUID
 */
async function create(uri, dtoIn, session, uuAppErrorMap = {}) {
  const awid = uri.getAwid();

  // HDS 1
  const uuSprintMan = await this.uuSprintmanDao.getByAwid(awid);
  if (!uuSprintMan) {
    // A1
    throw new Errors.Create.UuSprintManDoesNotExist({ uuAppErrorMap }, { awid });
  }

  if (uuSprintMan.state === States.closed || uuSprintMan.state === States.passive) {
    // A2
    throw new Errors.Create.UuSprintManIsNotInProperState({ uuAppErrorMap }, { uuSprintMan: { state: uuSprintMan.state } });
  }

  // HDS 2
  // HDS 2, 2.1, 2.2, 2.3
  const validationResult = this.validator.validate("sprintRequestCreateDtoInType", dtoIn);
  // A3, A4
  uuAppErrorMap = ValidationHelper.processValidationResult(dtoIn, validationResult, WARNINGS.create.unsupportedKeys.code, Errors.Create.InvalidDtoIn);

  // HDS 2.4
  if (!dtoIn.planStartDate && !dtoIn.previous) {
    // A5
    throw new Errors.Create.MissingPeriodDefinitionAttributes({
      uuAppErrorMap,
    });
  }

  // HDS 3
  const now = DateTimeHelper.now();
  let previousSprint = null;
  const anchoredTimezone = uuSprintMan.anchoredTimezone ? uuSprintMan.anchoredTimezone : DefaultAnchoredTimezone;
  const endOfDay = DateTimeHelper.getEndOfDay(now, anchoredTimezone);
  if (dtoIn.planStartDate && dtoIn.planEndDate) {
    // HDS 3.1
    // HDS 3.1.1
    dtoIn.planStartDate = DateTimeHelper.getStartOfDay(dtoIn.planStartDate, anchoredTimezone);
    // Get start of the next day of planEndDate
    dtoIn.planEndDate = DateTimeHelper.getStartOfDay(DateTimeHelper.getNextDay(dtoIn.planEndDate, anchoredTimezone), anchoredTimezone);
    // HDS 3.1.2
    if (dtoIn.planStartDate >= dtoIn.planEndDate) {
      // A6
      throw new Errors.Create.EndIsBeforeStart({ uuAppErrorMap }, { planStartDate: dtoIn.planStartDate, planEndDate: dtoIn.planEndDate });
    }
  } else if (dtoIn.planStartDate) {
    // HDS 3.2.1
    dtoIn.planStartDate = DateTimeHelper.getStartOfDay(dtoIn.planStartDate, anchoredTimezone);
    let planEndDate = DateTimeHelper.getNextDay(dtoIn.planStartDate, anchoredTimezone, uuSprintMan.defaultSprintLength);
    dtoIn.planEndDate = DateTimeHelper.getStartOfDay(planEndDate, anchoredTimezone);
  } else {
    // HDS 3.3.1
    previousSprint = await this.dao.get(awid, dtoIn.previous);
    if (!previousSprint) {
      // A7
      throw new Errors.Create.PreviousSprintDoesNotExist({ uuAppErrorMap }, { previous: dtoIn.previous });
    }

    // HDS 3.3.2
    dtoIn.planStartDate = previousSprint.planEndDate;
    // Get start of the next day of planEndDate
    let planEndDate = DateTimeHelper.getNextDay(dtoIn.planStartDate, anchoredTimezone, uuSprintMan.defaultSprintLength);
    dtoIn.planEndDate = DateTimeHelper.getStartOfDay(planEndDate, anchoredTimezone);
  }

  // HDS 4
  const overlaps = await this.dao.findDateOverlaps(awid, dtoIn.planStartDate, dtoIn.planEndDate);
  if (overlaps.itemList.length > 0) {
    // A8
    const sprints = overlaps.itemList.map((item) => {
      return {
        name: item.name,
        planStartDate: item.planStartDate,
        planEndDate: item.planEndDate,
      };
    });
    throw new Errors.Create.ExistsOverlappingSprints({ uuAppErrorMap }, { sprints });
  }

  // HDS 5, A9
  if (!previousSprint) previousSprint = await this.dao.findPreviousByStartDate(awid, dtoIn.planStartDate);

  // HDS 6
  if (!dtoIn.state) {
    //HDS 6.1
    if (dtoIn.planStartDate > endOfDay) dtoIn.state = States.waiting;
    //HDS 6.2
    else if (dtoIn.planStartDate <= endOfDay && dtoIn.planEndDate >= now) {
      // A10
      const currentSprint = await this.dao.findCurrentSprint(awid);
      if (currentSprint) throw new Errors.Create.CurrentSprintAlreadyExists({ uuAppErrorMap }, { sprint: currentSprint.id });
      dtoIn.state = States.current;
    }
    //HDS 6.3
    else if (dtoIn.planEndDate < now) dtoIn.state = States.toAssessment;
  }

  // HDS 7
  const number = await this.uuSprintmanDao.incrementSprintCount(awid);
  dtoIn.code = SprintCodeGenerator.generateCode(uuSprintMan.code, number);

  // HDS 8
  const aarDtoIn = AARHelper.takeAarAttributes(dtoIn);
  dtoIn.awid = awid;
  dtoIn.totalInitialEstimation = 0;
  dtoIn.totalRemainingEstimation = 0;
  delete dtoIn.previous;

  // HDS 9
  const orderOptions = {};
  if (previousSprint) {
    // HDS 9.1
    orderOptions.previous = previousSprint.id;
  } else {
    // HDS 9.2
    const nextSprint = await this.dao.findNextByEndDate(awid, dtoIn.planEndDate);
    if (nextSprint) orderOptions.next = nextSprint.id;
  }

  // HDS 10
  let sprint = null;
  try {
    sprint = await this.dao.create(dtoIn);
  } catch (e) {
    // A11
    throw new Errors.Create.SprintDaoCreateFailed({ uuAppErrorMap }, e);
  }

  // HDS 11
  try {
    await SprintOrderAbl.insertSprintToOrderInternal(awid, sprint.id, orderOptions);
  } catch (e) {
    // A12.1
    try {
      await this.dao.delete(sprint);
    } catch (e2) {
      this.logger.error(e.message, e);
      // A13
      throw new Errors.Create.SprintDaoCreateRollbackFailed({ uuAppErrorMap }, e2);
    }

    // A12.2
    throw new Errors.Create.InsertSprintToSprintOrderFailed({ uuAppErrorMap }, e);
  }

  // HDS 12
  let uuArtifactRelation = {};
  if (uuSprintMan.authorizationStrategy === AuthorizationStrategies.artifact) {
    // HDS 12.1
    const sysIdentitySession = await AuthenticationService.authenticateSystemIdentity();
    const appTokenHandler = new AppTokenHandler(uri, uuSprintMan.btBaseUri);
    const uuFolder = new UuFolderAPI(appTokenHandler);
    const mainFolderAttributes = UriBuilder.parse(uuSprintMan.sprintsFolderUri).getParameters();

    // HDS 12.2
    const uuSprintManVersionCode = Folders.getSprintManMainCode(uuSprintMan);
    const targetYearFolderAttributes = Folders.baseFolders.getSprintsYearAttributes(uuSprintManVersionCode, dtoIn.planStartDate, awid);

    let targetYearFolder = await uuFolder.getIfExists({ code: targetYearFolderAttributes.code }, session);
    if (!targetYearFolder) {
      //A14
      let sprintFolderLocationAttributes = {
        ...targetYearFolderAttributes,
        responsibleRoleCode: `${awid}-uuAwidEe`,
        location: mainFolderAttributes[Attributes.id],
        explicitPermissionList: uuFolder.prepareExplicitPermissions(uuSprintMan.folderExplicitRights),
      };
      try {
        targetYearFolder = await uuFolder.create(sprintFolderLocationAttributes, session);
      } catch (e) {
        //A15
        //A15.1 and inner A16 and A17
        await RollbacksHelper.rollbacksSprintCreate(awid, sprint.id, Errors.Create, uuAppErrorMap);
        //A15.2
        throw new Errors.Create.CreateFolderFailed({ uuAppErrorMap }, e);
      }
    }

    // HDS 12.3
    let sprintFolder = null;
    let sprintFolderLocationAttributes = {
      name: sprint.name,
      responsibleRoleCode: `${awid}-uuAwidEe`,
      location: targetYearFolder[Attributes.id],
      explicitPermissionList: uuFolder.prepareExplicitPermissions(uuSprintMan.folderExplicitRights),
    };

    try {
      sprintFolder = await uuFolder.create(sprintFolderLocationAttributes, session);
    } catch (e) {
      // A18
      // A18.1 and inner A20 and A21
      await RollbacksHelper.rollbacksSprintCreate(awid, sprint.id, Errors.Create, uuAppErrorMap);
      // A18.2
      throw new Errors.Create.CreateFolderFailed({ uuAppErrorMap }, e);
    }

    // HDS 12.4
    let sprintLogFolder = null;
    const sprintLogFolderLocationAttributes = {
      name: "Sprint log",
      responsibleRoleCode: `${awid}-uuAwidEe`,
      location: sprintFolder.id,
      explicitPermissionList: uuFolder.prepareExplicitPermissions(uuSprintMan.folderExplicitRights),
    };

    try {
      sprintLogFolder = await uuFolder.create(sprintLogFolderLocationAttributes, session);
    } catch (e) {
      // A21
      // A21.1 and inner A22 and A23
      await RollbacksHelper.rollbacksSprintCreate(awid, sprint.id, Errors.Create, uuAppErrorMap);
      // A21.2 and inner A24
      await RollbacksHelper.rollbackDeleteFolder(uuFolder, sprint.id, session, Errors.Create.DeleteFolderFailed, uuAppErrorMap);
      // A21.3
      throw new Errors.Create.CreateFolderFailed({ uuAppErrorMap }, e);
    }

    // HDS 12.5
    const createObcAttributes = {
      uuObUri: SprintRouteHelper.getStringRoute(uri, sprint.id),
      uuObId: sprint.id,
      typeCode: `${AppCodes.uuSprintmanCode}/${Entities.sprint.code}`,
      location: sprintFolder.id,
      name: dtoIn.name,
      code: dtoIn.code,
      desc: dtoIn.desc,
      state: dtoIn.state,
    };

    const uuObcApi = new UuObcAPI(appTokenHandler);
    let uuObc = null;

    try {
      uuObc = await uuObcApi.create(createObcAttributes, sysIdentitySession);
    } catch (e) {
      // A25
      // A25.1 inner A26 and A27
      await RollbacksHelper.rollbacksSprintCreate(awid, sprint.id, Errors.Create, uuAppErrorMap);
      // A25.2 and inner A28
      await RollbacksHelper.rollbackDeleteFolder(uuFolder, sprint.id, sysIdentitySession, Errors.Create.DeleteFolderFailed, uuAppErrorMap);
      // A25.3 and inner A29
      await RollbacksHelper.rollbackDeleteFolder(uuFolder, sprint.id, sysIdentitySession, Errors.Create.DeleteFolderFailed, uuAppErrorMap);
      // A25.4
      throw new Errors.Create.CallUuObcCreateFailed({ uuAppErrorMap }, e);
    }

    // HDS 12.6
    sprint.artifactId = uuObc.id;
    sprint.code = uuObc.code;
    sprint.typeCode = uuObc.typeCode;
    sprint.unit = uuObc.unit;
    sprint.folder = uuObc.folder;
    sprint.responsibleRole = uuObc.responsibleRole;
    sprint.category = uuObc.category;
    sprint.icon = uuObc.icon;
    sprint.version = uuObc.version;
    sprint.sprintLogLocation = sprintLogFolder.id;

    try {
      sprint = await this.dao.update(sprint);
    } catch (e) {
      // A30
      throw new Errors.Create.SprintDaoUpdateFailed({ uuAppErrorMap }, e);
    }

    // HDS 12.7
    if (aarDtoIn.artifactB) {
      aarDtoIn.relationKey = AARTypes.general;
      aarDtoIn.id = sprint.artifactId;
      try {
        uuArtifactRelation = await uuObcApi.createAar(aarDtoIn, sysIdentitySession);
      } catch (e) {
        // A31
        throw new Errors.Create.UuObcCreateAarFailed({ uuAppErrorMap }, e);
      }
    }
  }

  // HDS 13
  const adjacentSprints = await SprintOrderAbl.getAdjacentSprintsInternal(awid, sprint.id);

  // HDS 14
  return {
    ...sprint,
    ...adjacentSprints,
    uuArtifactRelation,
    uuSprintMan,
    uuAppErrorMap,
  };
}
