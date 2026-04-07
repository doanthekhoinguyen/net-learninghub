# Net Learning Hub — Tổng Quan Project

## 1. Mục tiêu
Nền tảng học lập trình .NET trực tuyến, hiển thị 72 bài học markdown từ thư mục `../net-learning-road-map/`, với syntax highlighting (Shiki), theo dõi tiến độ, đánh dấu bookmark, ghi chú, dark/light mode, tìm kiếm fuzzy.

## 2. Cấu trúc thư mục

```
net-learning-hub/
├── src/
│   ├── app/                        # Next.js App Router
│   │   ├── layout.tsx              # Root layout (ThemeProvider + AppShell)
│   │   ├── page.tsx                # Dashboard trang chủ
│   │   ├── not-found.tsx           # Trang 404
│   │   ├── globals.css             # Tailwind + custom scrollbar + markdown styles
│   │   ├── search/page.tsx         # Trang tìm kiếm
│   │   ├── lesson/[...slug]/        # Dynamic lesson pages (nested slug)
│   │   │   └── page.tsx
│   │   └── api/lessons/route.ts    # API: trả lesson list + content cho client
│   │
│   ├── components/
│   │   ├── providers/
│   │   │   └── ThemeProvider.tsx   # next-themes Provider (Client Component)
│   │   ├── AppShell.tsx            # Layout shell (sidebar + header + main)
│   │   ├── Header.tsx              # Top header với search trigger
│   │   ├── Sidebar.tsx             # Sidebar điều hướng theo section
│   │   ├── Dashboard.tsx           # Dashboard home (Client Component)
│   │   ├── SearchModal.tsx         # Modal tìm kiếm Cmd+K (Client Component)
│   │   ├── LessonCard.tsx          # Card hiển thị lesson trong section
│   │   ├── ProgressBar.tsx          # Thanh tiến độ section
│   │   ├── MarkdownRenderer.tsx     # Render markdown với custom heading boxes
│   │   ├── CodeBlock.tsx            # Code block với Shiki highlighting
│   │   ├── Breadcrumb.tsx           # Breadcrumb navigation
│   │   ├── LessonActions.tsx        # Gộp ProgressCheckbox + BookmarkButton + NotePanel
│   │   ├── ProgressCheckbox.tsx     # Checkbox hoàn thành bài (Client, localStorage)
│   │   ├── BookmarkButton.tsx       # Nút bookmark (Client, localStorage)
│   │   ├── NotePanel.tsx            # Panel ghi chú cho từng bài (Client, localStorage)
│   │   ├── SupplementaryFiles.tsx   # File bổ sung (ExtraNotes, Exercises...)
│   │   ├── ThemeToggle.tsx          # Toggle dark/light mode
│   │   └── LessonActions.tsx        # Gộp các action buttons
│   │
│   ├── lib/
│   │   ├── lessons.ts               # Server: đọc markdown từ fs, parse frontmatter
│   │   ├── sections.ts              # Static section definitions (SECTION_MAP)
│   │   ├── shiki.ts                 # Shiki highlighter singleton (JS regex engine)
│   │   ├── storage.ts               # Client: localStorage helpers (progress, bookmark, notes)
│   │   └── utils.ts                 # Utility: cn() (clsx + tailwind-merge)
│   │
│   └── types/
│       └── index.ts                 # Shared TypeScript types (LessonMeta, SectionMeta)
│
├── next.config.mjs                  # Next.js config (Turbopack root, shiki transpile)
├── tailwind.config.ts               # Tailwind với custom primary color + dark: class
├── postcss.config.js
├── tsconfig.json
└── package.json                      # Next.js 15.5.14, React 19, Shiki 1.29.2, framer-motion
```

## 3. Data Source

Dữ liệu nằm ở thư mục **sibling** `../net-learning-road-map/`, có cấu trúc:

```
net-learning-road-map/
├── 1.CSharpBasic/
│   ├── L101HelloWorld/
│   │   ├── README.md              ← frontmatter metadata + nội dung
│   │   ├── ExtraNotes.md          ← file bổ sung (hiển thị tab)
│   │   └── Exercises.md
│   ├── L102Variables/
│   │   └── README.md
│   └── README.md
├── 2.OOP/
│   └── ...
└── 10.Advanced/
    └── ...
```

## 4. Key Technical Decisions

### Server vs Client Component Boundary
- **Server Components** (`lessons.ts`, `sections.ts`, pages): dùng `fs.readdirSync`, `gray-matter` — chỉ chạy trên server.
- **Client Components** (Dashboard, SearchModal, ProgressCheckbox, BookmarkButton, NotePanel, CodeBlock): dùng `localStorage`, `useTheme`, `fetch('/api/lessons')` — chạy trên browser.

### Shiki Highlighting — JS Regex Engine
Vì `@shikijs/engine-oniguruma` chứa file WASM binary (`wasm-inlined.mjs`) bị lỗi parse trên Windows/Turbopack, ta dùng `createJavaScriptRegexEngine()` thay thế. Cấu hình trong `next.config.mjs` alias `@shikijs/engine-oniguruma` → `@shikijs/engine-javascript`.

### Routing
- Lesson page: `src/app/lesson/[...slug]/page.tsx` — dùng `[...slug]` để hỗ trợ nested paths như `1.CSharpBasic/L101HelloWorld`
- Supplementary files: dùng `::` separator trong URL, ví dụ: `lesson/1.CSharpBasic/L101HelloWorld::ExtraNotes`

### Search
- `SearchModal` client component → fetch `/api/lessons` → dùng **Fuse.js** fuzzy search
- Search index gồm: lesson title (weight 2), section name (weight 1), full content (weight 0.5)

### Storage (localStorage)
- `progress`: Set of completed lesson slugs
- `bookmarks`: Set of bookmarked lesson slugs
- `notes`: Record of `{ [slug]: string }`
- `lastVisit`: Last visited timestamp

## 5. API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/lessons` | GET | Trả về `{ lessons: LessonMeta[], content: { slug, content }[] }` |

## 6. Environment Variables

Không cần biến môi trường. Dữ liệu được đọc trực tiếp từ filesystem (`../net-learning-road-map/`).

## 7. Dependencies chính

| Package | Version | Purpose |
|---|---|---|
| `next` | 15.5.14 | Framework |
| `react` / `react-dom` | 19 | UI |
| `shiki` | 1.29.2 | Syntax highlighting |
| `@shikijs/engine-javascript` | 1.29.2 | Regex-based tokenizer (thay WASM) |
| `fuse.js` | 7 | Fuzzy search |
| `framer-motion` | 11 | Animations |
| `next-themes` | 0.4 | Dark/light mode |
| `gray-matter` | 4 | Parse markdown frontmatter |
| `react-markdown` + `remark-gfm` | 9 / 4 | Render markdown |
| `lucide-react` | 0.400 | Icons |
| `clsx` + `tailwind-merge` | 2.1 / 2.4 | Utility: class merging |
