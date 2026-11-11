import { useState, useEffect } from "react";
import { useBackend } from "../../mock/backend.jsx";
import { useAction, DataList } from "../shared/FeatureKit.jsx";
import { Field, Input } from "../../components/ui/Form.jsx";
import { Button } from "../../components/ui/Button.jsx";
import { OtpInput } from "../../components/ui/OtpInput.jsx";
import { Callout } from "../../components/ui/Display.jsx";
import { StatusBadge } from "../../components/ui/StatusBadge.jsx";
import { buildHref } from "../../app/router.js";
export function ResultPages({ roundId }) {
  const { call, db } = useBackend(),
    action = useAction();
  const [rows, setRows] = useState([]),
    [studentCode, setStudentCode] = useState(""),
    [email, setEmail] = useState(""),
    [code, setCode] = useState(""),
    [challenge, setChallenge] = useState(null),
    [looked, setLooked] = useState(false);
  useEffect(() => {
    if (roundId)
      action.run("public.results", { roundId }, "").then((r) => {
        if (r.ok)
          setRows(
            r.result.map((row, index) => ({ ...row, id: `result_${index}` })),
          );
      });
  }, [roundId]);
  return (
    <main className="mx-auto max-w-5xl space-y-5 px-4 py-10">
      <a href={buildHref("/")} className="text-brand-600">
        Về trang chủ
      </a>
      <h1 data-page-heading tabIndex={-1} className="text-title-1">
        {roundId ? "Kết quả công khai" : "Tra cứu kết quả cá nhân"}
      </h1>
      {roundId ? (
        <>
          <p>{db.rounds.find((r) => r.id === roundId)?.name}</p>
          <Callout>
            Danh sách hiển thị tối thiểu để bảo vệ dữ liệu cá nhân. Tra cứu cá
            nhân bằng MSSV và OTP.
          </Callout>
          <DataList
            rows={rows}
            columns={[
              { key: "code", header: "MSSV (che)", cell: (r) => r.studentCode },
              { key: "name", header: "Họ tên viết tắt", cell: (r) => r.name },
            ]}
          />
        </>
      ) : (
        <>
          <form
            className="max-w-xl space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!challenge) {
                const r = await action.run(
                  "otp.request",
                  { studentCode, email, purpose: "LOOKUP" },
                  "Nếu thông tin hợp lệ, OTP đã được gửi đến email IUH.",
                );
                if (r.ok) setChallenge(r.result.challengeId);
              } else {
                const v = await action.run(
                  "otp.verify",
                  { challengeId: challenge, code },
                  "",
                );
                if (v.ok) {
                  const r = await action.run(
                    "public.lookup",
                    { otpToken: v.result.otpToken },
                    "",
                  );
                  if (r.ok) {
                    setRows(r.result.map((x, i) => ({ ...x, id: String(i) })));
                    setLooked(true);
                  }
                }
              }
            }}
          >
            {!challenge ? (
              <>
                <Field label="MSSV" required>
                  <Input
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                  />
                </Field>
                <Field label="Email sinh viên IUH" required>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Field>
              </>
            ) : (
              <Field label="Mã OTP">
                <OtpInput value={code} onChange={setCode} />
              </Field>
            )}
            <Button type="submit" loading={action.busy}>
              {challenge ? "Xác nhận và tra cứu" : "Gửi mã OTP"}
            </Button>
            {challenge && (
              <Button
                variant="secondary"
                onClick={() => {
                  setChallenge(null);
                  setCode("");
                }}
              >
                Gửi lại mã
              </Button>
            )}
          </form>
          {looked && (
            <DataList
              rows={rows}
              columns={[
                { key: "round", header: "ĐXT", cell: (r) => r.roundName },
                {
                  key: "status",
                  header: "Trạng thái",
                  cell: (r) => (
                    <StatusBadge domain="application">{r.status}</StatusBadge>
                  ),
                },
                {
                  key: "score",
                  header: "Điểm chính thức (sau công bố)",
                  cell: (r) => r.officialScore ?? "Chưa công bố",
                },
                {
                  key: "message",
                  header: "Yêu cầu bổ sung",
                  cell: (r) => r.message,
                },
              ]}
              actions={(r) =>
                r.status === "needs_update" && (
                  <a href={buildHref("/dang-nhap")}>Đăng nhập để bổ sung</a>
                )
              }
            />
          )}
        </>
      )}
      {action.error && (
        <Callout tone="danger" role="alert">
          {action.error.message}
        </Callout>
      )}
    </main>
  );
}
