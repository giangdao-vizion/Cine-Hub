const Storage = {
  getApiKey() {
    return CONFIG.TMDB_API_KEY || "";
  },

  getTrendingCache() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY_TRENDING);
      if (!raw) return null;

      const data = JSON.parse(raw);
      const apiKey = this.getApiKey();
      if (!data.cachedAt || data.apiKey !== apiKey || !Array.isArray(data.sections)) {
        return null;
      }

      const age = Date.now() - new Date(data.cachedAt).getTime();
      if (age < 0 || age > CONFIG.TRENDING_CACHE_TTL_MS) return null;

      return data;
    } catch {
      return null;
    }
  },

  setTrendingCache(sections) {
    localStorage.setItem(
      CONFIG.STORAGE_KEY_TRENDING,
      JSON.stringify({
        apiKey: this.getApiKey(),
        cachedAt: new Date().toISOString(),
        sections,
      })
    );
  },

  clearTrendingCache() {
    localStorage.removeItem(CONFIG.STORAGE_KEY_TRENDING);
  },

  getMovies() {
    try {
      const raw = localStorage.getItem(CONFIG.STORAGE_KEY_MOVIES);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data.movies) ? data.movies : [];
    } catch {
      return [];
    }
  },

  saveMovies(movies) {
    localStorage.setItem(
      CONFIG.STORAGE_KEY_MOVIES,
      JSON.stringify({ movies, updatedAt: new Date().toISOString() })
    );
  },

  getMovieById(id) {
    return this.getMovies().find((m) => m.id === id);
  },

  upsertMovie(movie) {
    const movies = this.getMovies();
    const idx = movies.findIndex((m) => m.id === movie.id);
    if (idx >= 0) {
      movies[idx] = { ...movies[idx], ...movie };
    } else {
      movies.push({
        ...movie,
        addedAt: movie.addedAt || new Date().toISOString(),
      });
    }
    this.saveMovies(movies);
    return movie;
  },

  removeMovie(id) {
    const movies = this.getMovies().filter((m) => m.id !== id);
    this.saveMovies(movies);
  },

  isInList(id) {
    return this.getMovies().some((m) => m.id === id);
  },
};
