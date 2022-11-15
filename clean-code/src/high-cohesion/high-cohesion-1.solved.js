// noinspection JSUnusedGlobalSymbols

class UserService {
  createUser(userDto) {}

  updateUser(userDto) {}

  getUser(userId) {}

  deleteUser(user) {}

  listUsers(filterParams) {}
}

class AuthenticationService {
  login(credentials) {}

  logout() {}
}

class ReportService {
  generateActiveUsersReport(reportParams) {}
}

class PermissionService {
  createUserPermission(user, permission) {}

  removeUserPermission(user, permission) {}

  listPermissions(user) {}
}

class BillingService {
  getBillingInfoForUser(user) {}

  generateBillForUser(user, billingPeriod) {}
}
