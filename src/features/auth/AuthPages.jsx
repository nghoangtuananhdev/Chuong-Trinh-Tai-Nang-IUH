import { Countdown } from "../../components/ui/Countdown.jsx";
import { Stepper } from "../../components/ui/Stepper.jsx";
import { useState } from "react";
import { useBackend } from "../../mock/backend.jsx";
import { Field, Input } from "../../components/ui/Form.jsx";
import { Button } from "../../components/ui/Button.jsx";
import {
  PasswordInput,
  PasswordStrength,
} from "../../components/ui/PasswordInput.jsx";
import { OtpInput } from "../../components/ui/OtpInput.jsx";
import { Callout } from "../../components/ui/Display.jsx";
import { Panel } from "../../components/ui/Panel.jsx";
import { IdentityHeader } from "../../components/ui/IdentityHeader.jsx";
import { AuthShell } from "../../components/layout/AuthShell.jsx";
import { navigate, buildHref } from "../../app/router.js";
export function AuthPage({ route, forced = false, embedded = false }) {
  const { call, db, now } = useBackend();
  const [form, setForm] = useState({
    username: "",
    password: "",
    newPassword: "",
    confirmation: "",
    oldPassword: "",
    studentCode: "",
    email: "",
    phone: "",
    code: "",
  });
  const [step, setStep] = useState(1),
    [challenge, setChallenge] = useState(null),
    [verified, setVerified] = useState(null),
    [error, setError] = useState(null),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState("");
  const page = forced ? "doi-mat-khau" : route.segments[0];
  const title = {
    "dang-nhap": "Đăng nhập",
    "dang-ky": "Đăng ký tài khoản sinh viên",
    "quen-mat-khau": "Quên mật khẩu",
    "dat-lai-mat-khau": "Đặt lại mật khẩu",
    "doi-mat-khau": forced ? "Đổi mật khẩu để tiếp tục" : "Đổi mật khẩu",
  }[page];
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  const input = (key, label, type = "text", required = true) => (
    <div>
      <Field
        label={label}
        required={required}
        error={error?.details?.field === key ? error.message : undefined}
      >
        {type === "password" ? (
          <PasswordInput
            value={form[key]}
            onChange={(e) => set(key, e.target.value)}
            autoComplete={
              page === "dang-nhap" || key === "oldPassword"
                ? "current-password"
                : "new-password"
            }
          />
        ) : (
          <Input
            type={type}
            value={form[key]}
            onChange={(e) => set(key, e.target.value)}
          />
        )}
      </Field>
      {type === "password" &&
        key !== "oldPassword" &&
        key !== "confirmation" &&
        page !== "dang-nhap" && <PasswordStrength value={form[key]} />}
    </div>
  );
  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (page === "dang-nhap") {
        await call("auth.login", form);
        navigate(
          route.query.returnTo?.startsWith("/app/")
            ? route.query.returnTo
            : "/app/dashboard",
        );
      }
      if (page === "dang-ky") {
        if (step === 1) {
          const r = await call("otp.request", { ...form, purpose: "REGISTER" });
          setChallenge(r.challengeId);
          setMessage(r.message);
          setStep(2);
        } else if (step === 2) {
          const r = await call("otp.verify", {
            challengeId: challenge,
            code: form.code,
          });
          setVerified(r);
          if (r.accountExists) {
            setMessage(
              "MSSV này đã có tài khoản. Vui lòng đăng nhập hoặc khôi phục mật khẩu.",
            );
          }
          setStep(3);
        } else {
          if (form.password !== form.confirmation)
            throw new Error("Mật khẩu nhập lại chưa khớp.");
          await call("account.registerStudent", {
            otpToken: verified.otpToken,
            password: form.password,
            phone: form.phone,
          });
          navigate(
            route.query.returnTo?.startsWith("/app/")
              ? route.query.returnTo
              : "/app/dashboard",
          );
        }
      }
      if (page === "quen-mat-khau") {
        const r = await call("auth.forgotPassword", form);
        setMessage(r.message);
      }
      if (["dat-lai-mat-khau", "doi-mat-khau"].includes(page)) {
        if (form.newPassword !== form.confirmation)
          throw new Error("Mật khẩu nhập lại chưa khớp.");
        await call(
          page === "doi-mat-khau"
            ? "auth.changePassword"
            : "auth.resetPassword",
          { ...form, token: route.query.token },
        );
        navigate(page === "doi-mat-khau" ? "/app/dashboard" : "/dang-nhap");
      }
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };
  const feedback = (
    <>
      {message && <Callout>{message}</Callout>}
      {error && (
        <Callout tone="danger" role="alert">
          {error.message}
        </Callout>
      )}
    </>
  );
  const formPanel = (
    <Panel>
      <form onSubmit={submit} className="space-y-5">
        {page === "dang-nhap" && (
          <>
            {input("username", "Tên đăng nhập (MSSV / mã GV / email)")}
            {input("password", "Mật khẩu", "password")}
          </>
        )}
        {page === "dang-ky" && (
          <>
            <div className="border-b border-ink-200 pb-5">
              <Stepper
                steps={[
                  { title: "Xác thực email IUH" },
                  { title: "Nhập mã OTP" },
                  { title: "Hoàn tất tài khoản" },
                ]}
                current={step - 1}
                onStep={(i) => {
                  if (i === 0) setStep(1);
                }}
                canGoTo={(i) => i === 0}
              />
            </div>
            {step === 1 && (
              <>
                {input("studentCode", "MSSV")}
                {input("email", "Email IUH", "email")}
                <p className="text-body-sm text-ink-600">
                  Email @student.iuh.edu.vn phải chứa đúng MSSV.
                </p>
              </>
            )}
            {step === 2 && (
              <>
                <div className="relative">
                  {db.otpChallenges.find((c) => c.id === challenge) && (
                    <div className="absolute right-0 top-0">
                      <Countdown
                        now={now}
                        until={
                          db.otpChallenges.find((c) => c.id === challenge)
                            .expiresAt
                        }
                      />
                    </div>
                  )}
                  <Field label="Mã xác thực OTP">
                    <OtpInput
                      value={form.code}
                      onChange={(v) => set("code", v)}
                    />
                  </Field>
                </div>
                <Button variant="tertiary" onClick={() => setStep(1)}>
                  Yêu cầu mã mới
                </Button>
              </>
            )}
            {step === 3 && verified?.accountExists && (
              <Callout tone="warning">
                MSSV này đã có tài khoản. Dùng liên kết Đăng nhập hoặc Quên mật
                khẩu bên dưới.
              </Callout>
            )}
            {step === 3 && !verified?.accountExists && (
              <>
                <div className="rounded-control bg-ink-25 p-3">
                  <IdentityHeader
                    name={verified?.profile?.fullName}
                    meta={`${verified?.profile?.dob} · ${verified?.profile?.homeClass}`}
                  />
                </div>
                {input("phone", "Số điện thoại", "tel", false)}
                {input(
                  "password",
                  "Mật khẩu (ít nhất 8 ký tự, có chữ và số)",
                  "password",
                )}
                {input("confirmation", "Nhập lại mật khẩu", "password")}
              </>
            )}
          </>
        )}
        {page === "quen-mat-khau" &&
          input("username", "Tên đăng nhập hoặc email")}
        {page === "doi-mat-khau" &&
          input("oldPassword", "Mật khẩu hiện tại", "password")}
        {["dat-lai-mat-khau", "doi-mat-khau"].includes(page) && (
          <>
            {input(
              "newPassword",
              "Mật khẩu mới (ít nhất 8 ký tự, có chữ và số)",
              "password",
            )}
            {input("confirmation", "Nhập lại mật khẩu mới", "password")}
          </>
        )}
        <Button
          type="submit"
          fullWidth
          size="lg"
          loading={busy}
          disabled={page === "dang-ky" && step === 3 && verified?.accountExists}
        >
          {page === "dang-ky"
            ? step === 1
              ? "Gửi mã OTP"
              : step === 2
                ? "Xác nhận OTP"
                : "Tạo tài khoản"
            : "Xác nhận"}
        </Button>
      </form>
    </Panel>
  );
  if (embedded)
    return (
      <div className="max-w-xl space-y-5">
        {feedback}
        {formPanel}
      </div>
    );
  const footerLinks = (
      <div className="flex flex-wrap gap-x-5 gap-y-2 text-body-sm">
        <a
          className="text-link"
          href={buildHref(
            `/dang-nhap${route.query.returnTo ? "?returnTo=" + encodeURIComponent(route.query.returnTo) : ""}`,
          )}
        >
          Đăng nhập
        </a>
        <a
          className="text-link"
          href={buildHref(
            `/dang-ky${route.query.returnTo ? "?returnTo=" + encodeURIComponent(route.query.returnTo) : ""}`,
          )}
        >
          Đăng ký bằng email IUH
        </a>
        <a className="text-link" href={buildHref("/quen-mat-khau")}>Quên mật khẩu?</a>
      </div>
  );
  return (
    <AuthShell title={title} footer={footerLinks}>
      {feedback}
      {formPanel}
    </AuthShell>
  );
}
