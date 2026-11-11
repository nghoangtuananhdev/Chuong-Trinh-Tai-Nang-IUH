import { useBackend } from "../mock/backend.jsx";
import { AuthPage } from "../features/auth/AuthPages.jsx";
import { StatePage } from "../components/ui/StatePage.jsx";
import { buildHref } from "./router.js";
import { PAGE_PERMISSION } from "./menus.js";
export function AuthGate({ route, children }) {
  const { me, activeRole, can } = useBackend();
  if (!me)
    return (
      <StatePage title="Vui lòng đăng nhập">
        <a
          href={buildHref(
            `/dang-nhap?returnTo=${encodeURIComponent(route.path)}`,
          )}
          className="text-link"
        >
          Đăng nhập để tiếp tục
        </a>
      </StatePage>
    );
  if (me.mustChangePassword) return <AuthPage route={route} forced />;
  const page = route.segments[1],
    permission = PAGE_PERMISSION[page];
  if (
    (permission && !can(permission)) ||
    (page === "approvals" &&
      !["HEAD", "DEAN", "TRAINING", "LECTURER"].includes(activeRole.role))
  )
    return (
      <StatePage tone="danger" title="Không có quyền truy cập">
        Bạn không có quyền thực hiện thao tác này trong phạm vi hiện tại.
      </StatePage>
    );
  return children;
}
