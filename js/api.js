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

  async _request(path, extraParams = {}) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("Chưa có TMDB_API_KEY_ENCODED hợp lệ trong js/config.js.");
    }

    const params = new URLSearchParams({
      api_key: apiKey,
      language: "vi-VN",
      ...extraParams,
    });

    const url = `${CONFIG.TMDB_BASE_URL}${path}?${params}`;
    let res;
    try {
      res = await fetch(url);
    } catch {
      throw new Error("Không kết nối được. Kiểm tra mạng và thử lại.");
    }

    if (res.status === 401) {
      throw new Error("API key không hợp lệ. Kiểm tra TMDB_API_KEY_ENCODED trong js/config.js.");
    }

    if (!res.ok) {
      throw new Error(`Lỗi TMDB (${res.status}). Thử lại sau.`);
    }

    return res.json();
  },

  _mapResults(data, limit = 12) {
    return (data.results || []).slice(0, limit).map((item) => this.snapshotFromResult(item));
  },

  /** TMDB: /trending/movie/day | week */
  async getTrending(timeWindow) {
    const data = await this._request(`/trending/movie/${timeWindow}`);
    return this._mapResults(data);
  },

  /**
   * TMDB không có trending/month — dùng discover phổ biến 30 ngày qua.
   */
  async getTrendingMonth() {
    const to = new Date();
    const from = new Date(to);
    from.setDate(from.getDate() - 30);

    const data = await this._request("/discover/movie", {
      sort_by: "popularity.desc",
      include_adult: "false",
      "primary_release_date.gte": from.toISOString().slice(0, 10),
      "primary_release_date.lte": to.toISOString().slice(0, 10),
      page: "1",
    });
    return this._mapResults(data);
  },

  async searchMovies(query) {
    const data = await this._request("/search/movie", {
      query: query.trim(),
      include_adult: "false",
    });
    return this._mapResults(data, 20);
  },
};
