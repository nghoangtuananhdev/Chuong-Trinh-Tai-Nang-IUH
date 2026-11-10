import { useBackend } from "../mock/backend.jsx";
import { AuthPage } from "../features/auth/AuthPages.jsx";
import { Callout } from "../components/ui/Display.jsx";
import { buildHref } from "./router.js";
import { PAGE_PERMISSION } from "./menus.js";
export function AuthGate({ route, children }) {
  const { me, activeRole, can } = useBackend();
  if (!me)
    return (
      <div className="mx-auto max-w-xl p-8">
        <Callout title="Vui lòng đăng nhập">
          <a
            href={buildHref(
              `/dang-nhap?returnTo=${encodeURIComponent(route.path)}`,
            )}
            className="text-brand-600 underline"
          >
            Đăng nhập để tiếp tục
          </a>
        </Callout>
      </div>
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
      <Callout tone="danger" title="Không có quyền truy cập">
        Bạn không có quyền thực hiện thao tác này trong phạm vi hiện tại.
      </Callout>
    );
  return children;
}
