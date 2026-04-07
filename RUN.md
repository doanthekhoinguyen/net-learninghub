# Cách chạy project Net Learning Hub

## Quy trình chạy (LUÔN làm theo thứ tự này)

### Bước 1: Dừng server cũ (nếu đang chạy)

```bash
# Tìm PID trên port 3456 (dev) hoặc 3000 (production)
netstat -ano | grep ":3456.*LISTEN"
# hoặc
netstat -ano | grep ":3000.*LISTEN"

# Kill process (thay <PID> bằng số PID lấy được)
taskkill //F //PID <PID>
```

### Bước 2: Xóa cache

```bash
cd "/c/Users/KHOI NGUYEN/Desktop/Learning Again/net-learning-hub"
rm -rf .next
rm -rf node_modules/.cache
```

### Bước 3: Build

```bash
npm run build
```

### Bước 4: Chạy server

**Production (khuyên dùng — ổn định hơn):**
```bash
npm run start
```
→ Mở http://localhost:3000

**Development:**
```bash
npm run dev
```
→ Mở http://localhost:3456

---

## Các lệnh npm

| Lệnh | Mô tả |
|---|---|
| `npm run dev` | Chạy dev server (port 3456) |
| `npm run build` | Build production |
| `npm run start` | Chạy server production (port 3000) |
| `npm run lint` | Kiểm tra lint |

---

## Cấu trúc thư mục

```
net-learning-hub/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Trang chủ (Dashboard)
│   │   ├── search/page.tsx       # Trang tìm kiếm
│   │   ├── lesson/[...slug]/     # Trang bài học
│   │   └── api/lessons/          # API endpoint
│   ├── components/               # UI components
│   ├── lib/                     # Utilities
│   └── types/                   # TypeScript types
├── public/                      # Static assets (favicon.svg)
└── net-learning-road-map/        # Data source (68 bài học markdown)
```

---

## Data source

Dữ liệu nằm ở thư mục sibling: `../net-learning-road-map/`
Mỗi bài học = 1 folder chứa `README.md` + file bổ sung (ExtraNotes, Exercises...)

---

## Khắc phục lỗi thường gặp

| Lỗi | Cách fix |
|---|---|
| `EADDRINUSE: address already in use :::3456` | Kill process trên port đó (xem Bước 1) |
| `Cannot find module './vendor-chunks/...'` | Xóa `.next`, chạy lại `npm run build` |
| Trang chỉ hiện HTML thô / lỗi React Client Manifest | Build trong khi dev server đang chạy → **LUÔN stop server trước khi build** |
| Hydration mismatch | `useState` trong Client Components — khởi tạo rỗng, populate trong `useEffect` |
| Type error (params phải là Promise) | Dùng `params: Promise<>` trong Next.js 15 |

---

## Ports

| Chế độ | Port |
|---|---|
| Production | **3000** |
| Development | **3456** |

---

## Dependencies chính

- `next` 15.x — Framework
- `react` 19 — UI
- `shiki` — Syntax highlighting
- `fuse.js` — Fuzzy search
- `framer-motion` — Animations
- `next-themes` — Dark/light mode
- `gray-matter` — Parse markdown frontmatter
- `react-markdown` — Render markdown
- `lucide-react` — Icons
