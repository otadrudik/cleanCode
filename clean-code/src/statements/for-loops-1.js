// noinspection JSUnusedGlobalSymbols

_prepareSearchStoreSorterMap(dtoIn, searchBuilder) {
  const issuing = "LastIssuingDate";
  const issue = "LastIssueDate";
  const accountHolderForScheme = "AccountHolderForScheme";
  let newSorterList = [];
  if (dtoIn.sorterList) {
    let sorterMap = new Map();

    let scheme;

    dtoIn.sorterList.forEach(sorter => {
      if (sorter.key.endsWith(issuing)) {
        scheme = sorter.key.substr(0, sorter.key.length - issuing.length);
        sorterMap.set(`${scheme}LastIssuingDate`, `lastIssuing.${scheme}.lastIssuingDate`);
      }
      if (sorter.key.endsWith(issue)) {
        scheme = sorter.key.substr(0, sorter.key.length - issue.length);
        sorterMap.set(`${scheme}LastIssueDate`, `lastIssuing.${scheme}.lastIssueDate`);
      }
      if (sorter.key.endsWith(accountHolderForScheme)) {
        scheme = sorter.key.substr(0, sorter.key.length - accountHolderForScheme.length);
        sorterMap.set(`${scheme}AccountHolderForScheme`, `issuingAccounts.${scheme}.accountHolderName`);
      }
    });

    sorterMap.set("productionDeviceName", "name");
    sorterMap.set("versionStart", "versionStartDate");
    sorterMap.set("versionEnd", "versionEndDate");
    sorterMap.set("technologyCode", "typeOfInstallation");
    sorterMap.set("fuelCode", "energySource");

    dtoIn.sorterList.forEach(sorterItem => {
      if (sorterMap.get(sorterItem.key)) {
        if (sorterItem.key.endsWith(accountHolderForScheme)) {
          newSorterList.push({
            key: sorterMap.get(sorterItem.key),
            descending: sorterItem.descending,
            nested: this._prepareNestedParam(sorterMap.get(sorterItem.key), {})
          });
        } else {
          newSorterList.push({
            key: sorterMap.get(sorterItem.key),
            descending: sorterItem.descending
          });
        }
      } else {
        newSorterList.push(sorterItem);
      }
    });
  }
  return newSorterList;
}