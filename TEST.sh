#!/usr/bin/env bash
# Chạy toàn bộ kiểm tra prototype, không cần pnpm và không thay đổi dist/.
set -Eeuo pipefail

project_dir="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
cd -- "$project_dir"

if ! command -v node >/dev/null 2>&1; then
  printf 'Lỗi: chưa tìm thấy Node.js. Hãy cài Node.js 22 LTS trở lên.\n' >&2
  exit 1
fi

if ! node -e 'if (Number(process.versions.node.split(".")[0]) < 20) process.exit(1)'; then
  printf 'Lỗi: cần Node.js >= 20. Khuyến nghị Node.js 22 LTS trở lên.\n' >&2
  exit 1
fi

if [[ ! -f node_modules/vite/bin/vite.js || ! -d node_modules/react ]]; then
  printf 'Lỗi: thiếu dependency. Hãy cài dependency của dự án trước khi chạy test.\n' >&2
  exit 1
fi

build_dir=''
cleanup() {
  local status=$?
  trap - EXIT
  if [[ -n "$build_dir" ]]; then
    rm -rf -- "$build_dir" || true
  fi
  if (( status != 0 )); then
    printf '\nKIỂM TRA THẤT BẠI (mã thoát %s). Xem lỗi phía trên.\n' "$status" >&2
  fi
  exit "$status"
}
trap cleanup EXIT

printf 'Thư mục dự án: %s\nNode.js: %s\n' "$project_dir" "$(node --version)"

# Bash mở rộng danh sách tệp để tương thích cả Node.js 20.
shopt -s globstar nullglob
test_files=(src/**/*.test.js)
if (( ${#test_files[@]} == 0 )); then
  printf 'Lỗi: không tìm thấy tệp test trong src/.\n' >&2
  exit 1
fi

printf '\n[1/4] Chạy test nghiệp vụ và mock backend…\n'
node --test "${test_files[@]}"

printf '\n[2/4] Kiểm tra render trang chủ…\n'
node coding_plan/verify-render.mjs

printf '\n[3/4] Kiểm tra render các route và vai trò…\n'
node coding_plan/verify-routes.mjs

printf '\n[4/4] Build production cho 7 trang HTML…\n'
build_dir="$(mktemp -d "${TMPDIR:-/tmp}/kstn-test-build.XXXXXX")"
node node_modules/vite/bin/vite.js build --outDir "$build_dir"

printf '\nTẤT CẢ KIỂM TRA ĐÃ ĐẠT. Thư mục dist/ được giữ nguyên.\n'
printf 'Lưu ý: kiểm tra render không thay thế UAT giao diện trên trình duyệt.\n'
