/**
 * Sao chép thành config.js, rồi mã hóa key:
 *   node scripts/encode-key.js "your_tmdb_api_key"
 */
const CONFIG = {
  TMDB_API_KEY_ENCODED: "your_encoded_key_here",
  TMDB_BASE_URL: "https://api.themoviedb.org/3",
  TMDB_IMAGE_BASE: "https://image.tmdb.org/t/p/w500",
  STORAGE_KEY_MOVIES: "cinehub_movies",
  STORAGE_KEY_TRENDING: "cinehub_trending_cache",
  TRENDING_CACHE_TTL_MS: 24 * 60 * 60 * 1000,
};

CONFIG.TMDB_API_KEY = ConfigCodec.decode(CONFIG.TMDB_API_KEY_ENCODED);
