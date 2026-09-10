# 🐸 Cóc Task

Hệ thống quản lý công việc và dự án dành cho **CLB Truyền thông Cóc Sài Gòn**.

Cóc Task tập trung các hoạt động quản lý task, project, thành viên và dữ liệu vận hành vào một ứng dụng thống nhất, sử dụng được trên web và có cấu trúc hỗ trợ ứng dụng iOS thông qua Capacitor.

## Tính năng hiện có

- Dashboard tổng quan
- Quản lý công việc
- Quản lý dự án
- Quản lý thành viên
- Quản lý dữ liệu
- Analytics
- Đăng nhập và kiểm soát quyền truy cập
- Thông báo trong hệ thống
- Đồng bộ dữ liệu với Supabase
- Giao diện responsive cho desktop và mobile

## Tech stack

| Phần | Công nghệ |
|---|---|
| Frontend | JavaScript ES Modules |
| Build tool | Vite |
| Database & Auth | Supabase |
| Web deployment | Vercel |
| Native wrapper | Capacitor |
| iOS | Capacitor iOS |
| Analytics | Vercel Analytics |
| Icons | Lucide |
| Font | Inter |

## Cấu trúc project

```text
csg-tool/
├── ios/                    # Native iOS project
├── public/                 # Static assets
├── resources/              # App resources
├── scripts/                # Utility scripts
│
├── src/
│   ├── components/         # UI components dùng chung
│   ├── data/
│   │   ├── sampleData.js
│   │   ├── store.js        # State và data logic chính
│   │   └── supabase.js     # Supabase client/config
│   │
│   ├── pages/
│   │   ├── Analytics.js
│   │   ├── Dashboard.js
│   │   ├── Data.js
│   │   ├── Members.js
│   │   ├── Projects.js
│   │   └── Tasks.js
│   │
│   ├── styles/
│   ├── utils/
│   └── main.js             # Entry point và app orchestration
│
├── index.html
├── supabase_schema.sql
├── capacitor.config.json
├── vite.config.js
├── vercel.json
├── package.json
└── package-lock.json
```

## Chạy project local

### 1. Yêu cầu

Cần cài:

- Node.js
- npm

Project hiện chưa cố định phiên bản Node.js trong repository.

### 2. Cài dependencies

```bash
npm install
```

### 3. Cấu hình Supabase

Tạo file `.env.local` tại root project:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Ứng dụng hiện cũng hỗ trợ các biến:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Ưu tiên sử dụng nhóm `VITE_*` cho project hiện tại.

> Không commit file `.env`, `.env.local` hoặc secret lên repository.

Chỉ sử dụng key dành cho client như Supabase anon/publishable key. Không đưa service role key hoặc secret backend vào frontend.

### 4. Chạy development server

```bash
npm run dev
```

Development server hiện được cấu hình chạy trên port:

```text
5173
```

### 5. Build

```bash
npm run build
```

Build output được tạo trong:

```text
dist/
```

### 6. Preview production build

```bash
npm run preview
```

## Database

Cóc Task sử dụng Supabase làm lớp database và authentication.

Schema hiện tại được lưu tại:

```text
supabase_schema.sql
```

Repository cũng chứa một số SQL/script hỗ trợ dữ liệu và migration.

Không chạy trực tiếp SQL hoặc migration lên database đang sử dụng thật nếu chưa kiểm tra:

- thay đổi schema
- dữ liệu hiện có
- quyền truy cập
- RLS policy
- tác động lên ứng dụng

Các thay đổi có khả năng xoá hoặc thay đổi dữ liệu cần được review trước khi thực thi.

## Authentication & Authorization

Ứng dụng sử dụng Supabase Auth kết hợp với thông tin thành viên trong hệ thống để xác định người dùng và quyền truy cập.

Các quyền như Admin/Master hiện cũng được xử lý ở application layer.

> Quyền hiển thị ở frontend không thay thế cho bảo mật ở database.

Những bảng chứa dữ liệu thành viên hoặc dữ liệu nội bộ cần có Supabase Row Level Security (RLS) và policy phù hợp trước khi mở rộng phạm vi sử dụng.

## Web deployment

Project hiện có cấu hình dành cho **Vercel** trong:

```text
vercel.json
```

Các route của ứng dụng được rewrite về `index.html` để hỗ trợ client-side navigation.

Static assets build được cấu hình cache dài hạn trên Vercel.

## iOS

Project đã tích hợp **Capacitor** với:

```text
appId: com.coctask.app
appName: Cóc Task
webDir: dist
```

Native iOS project nằm trong:

```text
ios/
```

Quy trình build, ký app và phát hành iOS hiện chưa được document đầy đủ trong repository và nên được bổ sung khi workflow native được ổn định.

## Testing

Repository hiện có một số test script ở root, bao gồm test cho login, dashboard và các page.

Tuy nhiên, tại thời điểm hiện tại `package.json` chưa khai báo `npm test` hoặc một test workflow chuẩn.

Do đó test automation vẫn được xem là phần cần chuẩn hóa trong quá trình phát triển tiếp theo.

## Security

Khi phát triển Cóc Task:

- Không commit secret hoặc credential.
- Không sử dụng Supabase service role key trong frontend.
- Không xem kiểm tra quyền ở UI là lớp bảo mật cuối cùng.
- Review RLS trước khi thêm hoặc thay đổi bảng.
- Cẩn thận khi xử lý dữ liệu cá nhân của thành viên.
- Không log credential hoặc dữ liệu cá nhân không cần thiết.
- Backup dữ liệu trước migration có khả năng ảnh hưởng dữ liệu hiện tại.

## Nguyên tắc khi tiếp tục phát triển

Trước khi sửa một feature hiện có:

1. Hiểu hành vi hiện tại trước khi thay đổi.
2. Xác định page, component và data logic liên quan.
3. Không tự ý thay đổi database schema hoặc quyền truy cập.
4. Giữ tương thích với luồng hiện tại nếu chưa có quyết định thay đổi rõ ràng.
5. Build và kiểm tra lại các luồng liên quan sau khi sửa.

Ưu tiên thay đổi nhỏ, có thể kiểm chứng độc lập thay vì refactor diện rộng không cần thiết.

## Product documentation

Các tài liệu định hướng sản phẩm và thiết kế được quản lý **tách khỏi source repository**.

Bao gồm:

```text
project-overview-prd.md
design-guidelines.md
development-plan.md
```

Các tài liệu này là nguồn context khi lập kế hoạch phát triển hoặc giao task lớn cho AI coding agent, nhưng không bắt buộc commit vào repository này.

`README.md` chịu trách nhiệm mô tả **repository và cách vận hành project**.

PRD và design documentation chịu trách nhiệm mô tả **sản phẩm cần làm gì và trải nghiệm cần hoạt động như thế nào**.

## Trạng thái

Cóc Task đang được tiếp tục phát triển và cải thiện phục vụ hoạt động nội bộ của CLB Truyền thông Cóc Sài Gòn.
