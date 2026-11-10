export const WORKSPACE_PAGES = new Set([
  "dashboard",
  "catalog",
  "programs",
  "classes",
  "lecturers",
  "students",
  "student-passwords",
  "permissions",
  "rounds",
  "criteria",
  "reviews",
  "approvals",
  "records",
  "reports",
  "audit",
  "email-outbox",
  "settings",
  "notifications",
  "profile",
  "doi-mat-khau",
  "open-rounds",
  "maintenance",
  "my-applications",
  "apply",
]);
export const PUBLIC_PAGES = new Set([
  "dang-nhap",
  "dang-ky",
  "quen-mat-khau",
  "dat-lai-mat-khau",
  "dot",
  "ket-qua",
  "tra-cuu",
]);
export function isKnownRoute(route) {
  if (route.path === "/") return true;
  if (route.segments[0] === "app")
    return (
      WORKSPACE_PAGES.has(route.segments[1]) &&
      route.segments.length <= (route.segments[1] === "records" ? 4 : 3)
    );
  return (
    PUBLIC_PAGES.has(route.segments[0]) &&
    route.segments.length <=
      (["dot", "ket-qua"].includes(route.segments[0]) ? 2 : 1)
  );
}
