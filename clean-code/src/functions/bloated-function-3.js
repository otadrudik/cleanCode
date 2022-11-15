// noinspection JSUnusedGlobalSymbols

async function listByCriteria(awid, filterMap = {}, pageInfo = {}) {
  let query = { awid: awid };

  if (filterMap["productionDeviceBusinessId"]) {
    if (!Array.isArray(filterMap.productionDeviceBusinessId)) {
      let list = [];
      list.push(filterMap.productionDeviceBusinessId);
      filterMap.productionDeviceBusinessId = list;
    }
    query.productionDeviceBusinessId = {
      $in: filterMap.productionDeviceBusinessId,
    };
  }

  if (filterMap["period"]) {
    this._addPeriodQueryCriteria(filterMap, query);
  }

  if (filterMap["issuedScheme"] && filterMap["issuedScheme"].includes("NONE")) {
    query.$or = [
      { issued: { $exists: false } },
      { issued: { $exists: true, $size: 0 } },
    ];
  } else {
    if (filterMap["unissuedScheme"]) {
      query.$or = [
        { issued: { $exists: false } },
        { ["issued.scheme"]: { $ne: filterMap.unissuedScheme } },
      ];
    }

    if (filterMap["issuedScheme"]) {
      if (!query.$and) {
        query.$and = [];
      }
      query.$and.push(
        { issued: { $exists: true } },
        { ["issued.scheme"]: { $in: filterMap.issuedScheme } }
      );
    }
  }

  if (filterMap["statusList"]) {
    if (!query.$and) {
      query.$and = [];
    }
    if (!query.$or) {
      query.$or = [];
    }
    if (filterMap["statusList"].find((item) => item.status === "ISSUED")) {
      query.$and.push({ issued: { $exists: true } });
      let statusIssued = filterMap["statusList"].filter(
        (item) => item.status === "ISSUED"
      );
      if (statusIssued.length > 1) {
        for (let statusObject of statusIssued) {
          if (statusObject.scheme) {
            if (statusObject.withErrors !== undefined) {
              if (statusObject.withErrors) {
                query.$or.push({
                  $and: [
                    { ["issued.scheme"]: { $eq: statusObject.scheme } },
                    { ["issued.withErrors"]: { $eq: statusObject.withErrors } },
                  ],
                });
              } else {
                query.$or.push({
                  $and: [
                    { ["issued.scheme"]: { $eq: statusObject.scheme } },
                    {
                      $or: [
                        {
                          ["issued.withErrors"]: {
                            $eq: statusObject.withErrors,
                          },
                        },
                        { ["issued.withErrors"]: { $exists: false } },
                      ],
                    },
                  ],
                });
              }
            }
          } else if (statusObject.withErrors !== undefined) {
            query.$or.push({
              ["issued.withErrors"]: { $eq: statusObject.withErrors },
            });
          }
        }
      } else {
        if (statusIssued[0].scheme) {
          query.$and.push({
            ["issued.scheme"]: { $eq: statusIssued[0].scheme },
          });
        }
        if (statusIssued[0].withErrors !== undefined) {
          if (statusIssued[0].withErrors) {
            query.$and.push({
              ["issued.withErrors"]: { $eq: statusIssued[0].withErrors },
            });
          } else {
            query.$or.push(
              { ["issued.withErrors"]: { $eq: statusIssued[0].withErrors } },
              { ["issued.withErrors"]: { $exists: false } }
            );
          }
        }
      }
    }

    if (filterMap["statusList"].find((item) => item.status === "OPEN")) {
      let statusIssued = filterMap["statusList"].filter(
        (item) => item.status === "OPEN"
      );
      if (statusIssued[0].scheme) {
        query.$or.push(
          { issued: { $exists: false } },
          { issued: { $exists: true, $size: 0 } },
          { ["issued.scheme"]: { $ne: statusIssued[0].scheme } }
        );
      } else {
        query.$or.push(
          { issued: { $exists: false } },
          { issued: { $exists: true, $size: 0 } }
        );
      }
    }
  }

  return await super.find(query, pageInfo);
}
