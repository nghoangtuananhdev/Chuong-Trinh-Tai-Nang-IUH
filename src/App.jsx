import { useState, useEffect, useRef, lazy, Suspense } from "react";
import { MockBackendProvider, useBackend } from "./mock/backend.jsx";
import { ToastProvider } from "./components/ui/ToastProvider.jsx";
import { PublicHome } from "./features/public/PublicHome.jsx";
import { DemoPanel } from "./features/demo/DemoPanel.jsx";
import { Dashboard } from "./features/dashboard/Dashboard.jsx";
const OperationsPage = lazy(() =>
  import("./features/operations/OperationsPage.jsx").then((module) => ({
    default: module.OperationsPage,
  })),
);
import { RecordsPage } from "./features/operations/RecordsPage.jsx";
import { ResultPages } from "./features/public/ResultPages.jsx";
import { isKnownRoute } from "./app/routes.jsx";
import { ReviewsPage } from "./features/reviews/ReviewsPage.jsx";
import { ApprovalsPage } from "./features/approvals/ApprovalsPage.jsx";
import { StudentPortal } from "./features/student-portal/StudentPortal.jsx";
import { RoundsPage } from "./features/rounds/RoundsPage.jsx";
import { CriteriaPage } from "./features/criteria/CriteriaPage.jsx";
import { ManagementPage } from "./features/catalog/ManagementPage.jsx";
import { AuthPage } from "./features/auth/AuthPages.jsx";
import { NotificationsPage } from "./features/notifications/NotificationsPage.jsx";
import { ProfilePage } from "./features/profile/ProfilePage.jsx";
import { AuthGate } from "./app/AuthGate.jsx";
import { WorkspaceLayout } from "./app/WorkspaceLayout.jsx";
import { useHashRoute, navigate } from "./app/router.js";
import { Callout } from "./components/ui/Display.jsx";
function WorkspacePage({ route }) {
  const { activeRole } = useBackend();
  const page = route.segments[1];
  if (page === "dashboard" && activeRole?.role !== "STUDENT")
    return <Dashboard />;
  if (["reports", "audit", "email-outbox", "settings"].includes(page))
    return (
      <Suspense fallback={<Callout>Đang tải màn hình vận hành…</Callout>}>
        <OperationsPage key={page} page={page} roundId={route.query.round} />
      </Suspense>
    );
  if (page === "records" && route.segments[2] !== "application")
    return <RecordsPage id={route.segments[2]} />;
  if (page === "reviews")
    return <ReviewsPage id={route.segments[2]} roundId={route.query.round} />;
  if (page === "approvals") return <ApprovalsPage id={route.segments[2]} />;
  if (page === "records" && route.segments[2] === "application")
    return <ReviewsPage id={route.segments[3]} readOnly />;
  if (
    activeRole?.role === "STUDENT" &&
    [
      "dashboard",
      "apply",
      "my-applications",
      "maintenance",
      "open-rounds",
    ].includes(page)
  )
    return <StudentPortal page={page} id={route.segments[2]} />;
  if (page === "rounds") return <RoundsPage id={route.segments[2]} />;
  if (page === "criteria")
    return (
      <CriteriaPage key={route.segments[2] ?? "list"} id={route.segments[2]} />
    );
  if (
    [
      "catalog",
      "programs",
      "classes",
      "lecturers",
      "students",
      "student-passwords",
      "permissions",
    ].includes(page)
  )
    return <ManagementPage key={page} page={page} id={route.segments[2]} />;
  if (page === "notifications") return <NotificationsPage />;
  if (page === "profile") return <ProfilePage />;
  if (page === "doi-mat-khau")
    return <AuthPage route={{ ...route, segments: ["doi-mat-khau"] }} />;
  return <Callout tone="danger">Không tìm thấy trang.</Callout>;
}
function Prototype({ roleKey, initialHash }) {
  const [demoOpen, setDemoOpen] = useState(false);
  const route = useHashRoute(initialHash);
  const { call, db, me, activeRole } = useBackend();
  const booted = useRef(false);
  useEffect(() => {
    if (booted.current) return;
    booted.current = true;
    const username = {
      admin: "quantri",
      training: "GV900",
      dean: "GV004",
      head: "GV005",
      lecturer: "GV001",
      student: "21094501",
    }[roleKey];
    if (username) {
      const user = db.users.find((u) => u.username === username);
      call("system.demoLogin", { userId: user.id })
        .then(() => navigate("/app/dashboard"))
        .catch(() => {});
    }
  }, [roleKey, call, db.users]);
  let content;
  if (!isKnownRoute(route))
    content = (
      <Callout tone="danger" title="Không tìm thấy trang">
        Vui lòng kiểm tra đường dẫn.
      </Callout>
    );
  else if (route.segments[0] === "dot")
    content = (
      <div className="mx-auto max-w-6xl p-5">
        <RoundsPage id={route.segments[1]} publicView />
      </div>
    );
  else if (route.segments[0] === "ket-qua" || route.segments[0] === "tra-cuu")
    content = (
      <ResultPages
        key={route.path}
        roundId={
          route.segments[0] === "ket-qua" ? route.segments[1] : undefined
        }
      />
    );
  else if (route.segments[0] === "app")
    content = (
      <AuthGate route={route}>
        {me && (
          <WorkspaceLayout route={route}>
            <WorkspacePage key={activeRole?.id} route={route} />
          </WorkspaceLayout>
        )}
      </AuthGate>
    );
  else if (
    ["dang-nhap", "dang-ky", "quen-mat-khau", "dat-lai-mat-khau"].includes(
      route.segments[0],
    )
  )
    content = <AuthPage key={route.path} route={route} />;
  else
    content = (
      <PublicHome
        onLogin={() => navigate("/dang-nhap")}
        onApply={(id) =>
          navigate(
            me
              ? `/app/apply/${id}`
              : `/dang-nhap?returnTo=${encodeURIComponent("/app/apply/" + id)}`,
          )
        }
        onLookup={() => navigate("/tra-cuu")}
        onDetail={(id) => navigate(`/dot/${id}`)}
        onResults={(id) => navigate(`/ket-qua/${id}`)}
      />
    );
  return (
    <>
      {content}
      <DemoPanel
        open={demoOpen}
        onOpenChange={setDemoOpen}
        onLogin={() => navigate("/app/dashboard")}
      />
    </>
  );
}
export default function App({ roleKey = "public", initialState, initialHash }) {
  return (
    <ToastProvider>
      <MockBackendProvider initialState={initialState}>
        <Prototype roleKey={roleKey} initialHash={initialHash} />
      </MockBackendProvider>
    </ToastProvider>
  );
}
