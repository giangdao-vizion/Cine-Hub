const Storage = {
  getApiKey() {
    const fromStorage = localStorage.getItem(CONFIG.STORAGE_KEY_API);
    if (fromStorage) return fromStorage;
    return CONFIG.TMDB_API_KEY || "";
  },

  setApiKey(key) {
    localStorage.setItem(CONFIG.STORAGE_KEY_API, key.trim());
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

  exportData() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      movies: this.getMovies(),
    };
  },

  importData(data, merge = false) {
    if (!data || !Array.isArray(data.movies)) {
      throw new Error("File JSON không hợp lệ.");
    }
    if (merge) {
      const existing = this.getMovies();
      const byId = new Map(existing.map((m) => [m.id, m]));
      for (const m of data.movies) {
        byId.set(m.id, { ...byId.get(m.id), ...m });
      }
      this.saveMovies([...byId.values()]);
    } else {
      this.saveMovies(data.movies);
    }
    return data.movies.length;
  },
};
