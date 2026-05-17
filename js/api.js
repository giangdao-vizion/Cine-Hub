const TmdbApi = {
  getApiKey() {
    return Storage.getApiKey();
  },

  posterUrl(path) {
    if (!path) return null;
    return `${CONFIG.TMDB_IMAGE_BASE}${path}`;
  },

  snapshotFromResult(item) {
    const year = item.release_date
      ? item.release_date.slice(0, 4)
      : null;
    return {
      id: item.id,
      title: item.title,
      year,
      poster: this.posterUrl(item.poster_path),
      overview: item.overview || "",
      voteAverage: item.vote_average ?? null,
    };
  },

  async searchMovies(query) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("Chưa có API key. Mở Cài đặt (⚙) để nhập TMDB API key.");
    }

    const params = new URLSearchParams({
      api_key: apiKey,
      query: query.trim(),
      language: "vi-VN",
      include_adult: "false",
    });

    const url = `${CONFIG.TMDB_BASE_URL}/search/movie?${params}`;
    let res;
    try {
      res = await fetch(url);
    } catch {
      throw new Error("Không kết nối được. Kiểm tra mạng và thử lại.");
    }

    if (res.status === 401) {
      throw new Error("API key không hợp lệ. Kiểm tra lại trong Cài đặt.");
    }

    if (!res.ok) {
      throw new Error(`Lỗi TMDB (${res.status}). Thử lại sau.`);
    }

    const data = await res.json();
    return (data.results || []).map((item) => this.snapshotFromResult(item));
  },
};
