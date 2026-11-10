import * as operations from "./services/operations.js";
import * as applications from "./services/applications.js";
import * as rounds from "./services/rounds.js";
import * as criteria from "./services/criteria.js";
import * as catalog from "./services/catalog.js";
import * as users from "./services/users.js";
import * as roles from "./services/roles.js";
import * as me from "./services/me.js";
import * as reviews from "./services/reviews.js";
import * as auth from "./services/auth.js";
import * as otp from "./services/otp.js";
import * as account from "./services/account.js";
import * as lists from "./services/lists.js";
import * as system from "./services/system.js";
import * as publicPortal from "./services/publicPortal.js";
const namespaces = {
  operations,
  applications,
  rounds,
  criteria,
  catalog,
  users,
  roles,
  me,
  reviews,
  auth,
  otp,
  account,
  lists,
  system,
  public: publicPortal,
};
export const services = Object.fromEntries(
  Object.entries(namespaces).flatMap(([namespace, methods]) =>
    Object.entries(methods)
      .filter(
        ([, method]) => typeof method === "function" && method.serviceName,
      )
      .flatMap(([name, method]) => [
        [`${namespace}.${name}`, method],
        [method.serviceName, method],
      ]),
  ),
);
