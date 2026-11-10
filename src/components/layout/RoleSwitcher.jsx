import { scopeLabel } from "../../domain/selectors.js";
import { useBackend } from "../../mock/backend.jsx";
import { ROLE_LABEL } from "../../domain/constants.js";
import { Select, Field } from "../ui/Form.jsx";
import { useToast } from "../ui/ToastProvider.jsx";
import { navigate } from "../../app/router.js";
export function RoleSwitcher() {
  const { roles, activeRole, call, db } = useBackend(),
    { showToast } = useToast();
  return roles.length > 1 ? (
    <Field label="Vai trò đang làm việc" className="min-w-0 max-w-full">
      <Select
        className="max-w-72"
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
    </Field>
  ) : (
    <span className="text-body-sm">{ROLE_LABEL[activeRole.role]}</span>
  );
}
