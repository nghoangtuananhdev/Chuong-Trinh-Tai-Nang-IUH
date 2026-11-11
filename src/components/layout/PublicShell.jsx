import { PublicHeader } from "./PublicHeader.jsx";
import { navigate } from "../../app/router.js";

/** Khung trang công khai phụ (kết quả, tra cứu, chi tiết đợt). */
export function PublicShell({ children, width = "max-w-5xl" }) {
  return (
    <div className="min-h-screen bg-ink-50">
      <PublicHeader onOpenLogin={() => navigate("/dang-nhap")} />
      <main className={`mx-auto ${width} space-y-6 px-4 py-8 sm:px-6 lg:px-8`}>{children}</main>
    </div>
  );
}
