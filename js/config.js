/**
 * TMDB API key — lưu dạng đã mã hóa (TMDB_API_KEY_ENCODED).
 * Tạo chuỗi mới: node scripts/encode-key.js "your_api_key"
 * Lấy key: https://www.themoviedb.org/settings/api
 */
const CONFIG = {
  TMDB_API_KEY_ENCODED: "dwhfAC5FVjtNDF1SPhJUclFcUHAQUWkSWVRQb08Cdw8=",
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
  TMDB_IMAGE_BASE: "https://image.tmdb.org/t/p/w500",
  STORAGE_KEY_MOVIES: "cinehub_movies",
  STORAGE_KEY_TRENDING: "cinehub_trending_cache",
  /** Thời gian cache trang chủ (ms) — 24 giờ */
  TRENDING_CACHE_TTL_MS: 24 * 60 * 60 * 1000,
};

CONFIG.TMDB_API_KEY = ConfigCodec.decode(CONFIG.TMDB_API_KEY_ENCODED);
