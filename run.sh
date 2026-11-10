#!/usr/bin/env bash
# Khởi động giao diện phát triển bằng Node.js, không cần pnpm.
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
  printf 'Lỗi: thiếu dependency. Hãy cài dependency của dự án trước khi chạy.\n' >&2
  exit 1
fi

kstn_port="${KSTN_PORT:-5173}"
if [[ ! "$kstn_port" =~ ^[0-9]{1,5}$ ]] || (( 10#$kstn_port < 1 || 10#$kstn_port > 65535 )); then
  printf 'Lỗi: KSTN_PORT phải là số từ 1 đến 65535.\n' >&2
  exit 1
fi

printf 'Khởi động giao diện CN/KSTN IUH…\n'
printf 'Địa chỉ: http://127.0.0.1:%s/\n' "$kstn_port"
printf 'Nhấn Ctrl+C để dừng. Nếu cổng đang bận, dùng KSTN_PORT=5174 bash run.sh\n\n'

exec node node_modules/vite/bin/vite.js --host 127.0.0.1 --port "$kstn_port" --strictPort "$@"
