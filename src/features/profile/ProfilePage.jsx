import { useState } from "react";
import { useBackend } from "../../mock/backend.jsx";
import { useToast } from "../../components/ui/ToastProvider.jsx";
import { Field, Input } from "../../components/ui/Form.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { Panel } from "../../components/ui/Panel.jsx";
import { IdentityHeader } from "../../components/ui/IdentityHeader.jsx";
export function ProfilePage() {
  const { me, call, db } = useBackend(),
    { showToast } = useToast();
  const [phone, setPhone] = useState(me.phone ?? ""),
    [email, setEmail] = useState(me.email),
    [code, setCode] = useState(""),
    [challenge, setChallenge] = useState(null);
  const run = async () => {
    try {
      let otpToken;
      if (email !== me.email) {
        const v = await call("otp.verify", { challengeId: challenge, code });
        otpToken = v.otpToken;
      }
      await call("me.update", { phone, newEmail: email, otpToken });
      showToast("Đã cập nhật thông tin cá nhân.");
    } catch (e) {
      showToast(e.message, "error");
    }
  };
  return (
    <Panel
      className="max-w-2xl"
      footer={
        <div className="flex justify-end">
          <Button onClick={run}>Lưu thông tin</Button>
        </div>
      }
    >
      <div className="mb-5 border-b border-ink-200 pb-4">
        <IdentityHeader name={me.fullName} size={40} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Tên đăng nhập">
          <Input value={me.username} readOnly />
        </Field>
        <Field label="Số điện thoại">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Email IUH" className="sm:col-span-2">
          <Input
            readOnly={me.kind !== "STUDENT"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Field>
      </div>
      {email !== me.email && (
        <div className="mt-4 space-y-4 rounded-control bg-ink-25 p-4">
          <Button
            variant="secondary"
            onClick={async () => {
              try {
                const p = db.studentProfiles.find((p) => p.userId === me.id);
                const r = await call("otp.request", {
                  studentCode: p?.studentCode,
                  email,
                  purpose: "CHANGE_EMAIL",
                });
                setChallenge(r.challengeId);
                showToast(r.message);
              } catch (e) {
                showToast(e.message, "error");
              }
            }}
          >
            Gửi OTP email mới
          </Button>
          <Field label="Mã OTP">
            <Input value={code} onChange={(e) => setCode(e.target.value)} />
          </Field>
        </div>
      )}
    </Panel>
  );
}
