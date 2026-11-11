import { scopeLabel } from "../../domain/selectors.js";
import { useBackend } from "../../mock/backend.jsx";
import { ROLE_LABEL } from "../../domain/constants.js";
import { Select } from "../ui/Form.jsx";
import { useToast } from "../ui/ToastProvider.jsx";
import { navigate } from "../../app/router.js";
export function RoleSwitcher() {
  const { roles, activeRole, call, db } = useBackend(),
    { showToast } = useToast();
  return roles.length > 1 ? (
    <label className="flex min-w-0 items-center gap-2">
      <span className="hidden text-body-sm text-ink-600 xl:inline">Vai trò đang làm việc</span>
      <Select
        aria-label="Vai trò đang làm việc"
        className="h-9 min-h-9 max-w-64 py-1"
        value={activeRole.id}
        onChange={async (e) => {
          try {
            await call("auth.switchRole", { roleId: e.target.value });
            navigate("/app/dashboard");
            showToast("Đã chuyển vai trò làm việc.");
          } catch (err) {
            showToast(err.message, "error");
          }
        }}
      >
        {roles.map((r) => (
          <option key={r.id} value={r.id}>
            {ROLE_LABEL[r.role]} · {scopeLabel(db, r)}
          </option>
        ))}
      </Select>
    </label>
  ) : (
    <span className="hidden text-body-sm md:inline">{ROLE_LABEL[activeRole.role]}</span>
  );
}
