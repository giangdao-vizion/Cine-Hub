# Cine-Hub

Sổ phim cá nhân — tìm phim trên TMDB, lưu danh sách offline (localStorage), chấm điểm và ghi chú theo sở thích.

## Tính năng

- Trang chủ: phim nổi bật hôm nay / tuần / tháng (TMDB)
- Tìm phim theo từ khóa (TMDB API, cần mạng)
- Thêm phim vào danh sách — metadata lưu local, xem offline
- Điểm 1–10, trạng thái (muốn xem / đang xem / đã xem), ghi chú
- Xem, sắp xếp, lọc danh sách đã lưu (giao diện danh sách tối ưu)

## Chạy app

1. Mở `index.html` trong trình duyệt (hoặc dùng Live Server / `npx serve .`)

TMDB API key đã được mã hóa sẵn trong `js/config.js`.

## Logo & icon

**`assets/logo/`** — logo đầy đủ (header, empty state):

| File | Dùng cho |
|------|----------|
| `logo-header` / `@2x` | Header (PNG + WebP) |
| `logo-medium` | Empty state |
| `logo-full` | Kích thước lớn |

**`assets/icon/`** — biểu tượng C + play (favicon, shortcut):

| File | Dùng cho |
|------|----------|
| `favicon.ico` | Tab trình duyệt (16/32/48) |
| `icon-16.png`, `icon-32.png` | Favicon PNG |
| `apple-touch-icon.png` | iOS “Thêm vào Màn hình chính” (180×180) |
| `icon-192.png`, `icon-512.png` | PWA / manifest (nếu thêm sau) |

## Cấu trúc

```
Cine-Hub/
├── assets/logo/
├── assets/icon/
├── index.html
├── css/styles.css
└── js/
    ├── config.js
    ├── storage.js
    ├── api.js
    └── app.js
```

Không cần build hay server backend.

## Lưu ý

- Chỉ **tìm kiếm** cần internet; danh sách đã lưu đọc từ localStorage.
- Poster có thể không hiển thị khi offline (URL ảnh từ TMDB).
