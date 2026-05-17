# Cine-Hub

Sổ phim cá nhân — tìm phim trên TMDB, lưu danh sách offline (localStorage), chấm điểm và ghi chú theo sở thích.

## Tính năng

- Tìm phim theo từ khóa (TMDB API, cần mạng)
- Thêm phim vào danh sách — metadata lưu local, xem offline
- Điểm 1–10, trạng thái (muốn xem / đang xem / đã xem), ghi chú
- Xem, sắp xếp, lọc danh sách đã lưu
- Xuất / nhập JSON (backup)

## Chạy app

1. Lấy **TMDB API key** miễn phí: [themoviedb.org/settings/api](https://www.themoviedb.org/settings/api)
2. Mở `index.html` trong trình duyệt (hoặc dùng Live Server / `npx serve .`)
3. Lần đầu mở **Cài đặt** (⚙) và dán API key — key lưu trong localStorage

Tùy chọn: điền key sẵn trong `js/config.js`:

```js
const CONFIG = {
  TMDB_API_KEY: "your_key_here",
  // ...
};
```

## Cấu trúc

```
Cine-Hub/
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
- API key trên frontend có thể bị lộ — phù hợp dùng cá nhân / local.
