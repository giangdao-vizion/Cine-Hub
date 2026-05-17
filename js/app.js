(function () {
  const STATUS_LABELS = {
    want: "Muốn xem",
    watching: "Đang xem",
    watched: "Đã xem",
  };

  const PLACEHOLDER_POSTER = "🎞️";

  let modalContext = { mode: "add", movie: null };

  const $ = (sel) => document.querySelector(sel);

  const els = {
    tabs: document.querySelectorAll(".tabs__btn"),
    panelSearch: $("#panel-search"),
    panelList: $("#panel-list"),
    searchForm: $("#search-form"),
    searchInput: $("#search-input"),
    searchStatus: $("#search-status"),
    searchResults: $("#search-results"),
    listCount: $("#list-count"),
    listSubtitle: $("#list-subtitle"),
    listStats: $("#list-stats"),
    listControls: $("#list-controls"),
    statTotal: $("#stat-total"),
    statAvg: $("#stat-avg"),
    statWatched: $("#stat-watched"),
    filterInput: $("#filter-input"),
    sortSelect: $("#sort-select"),
    statusChips: document.querySelectorAll(".chip[data-status]"),
    listFilterCount: $("#list-filter-count"),
    listEmpty: $("#list-empty"),
    listNoResults: $("#list-no-results"),
    listResults: $("#list-results"),
    btnSettings: $("#btn-settings"),
    movieModal: $("#movie-modal"),
    movieForm: $("#movie-form"),
    modalTitle: $("#modal-title"),
    modalPoster: $("#modal-poster"),
    modalMeta: $("#modal-meta"),
    modalOverview: $("#modal-overview"),
    modalRating: $("#modal-rating"),
    modalRatingValue: $("#modal-rating-value"),
    modalStatus: $("#modal-status"),
    modalNote: $("#modal-note"),
    modalDelete: $("#modal-delete"),
    modalClose: $("#modal-close"),
    modalCancel: $("#modal-cancel"),
    settingsModal: $("#settings-modal"),
    settingsForm: $("#settings-form"),
    apiKeyInput: $("#api-key-input"),
  };

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str ?? "";
    return div.innerHTML;
  }

  function showStatus(el, message, type = "info") {
    if (!message) {
      el.hidden = true;
      el.textContent = "";
      el.className = "status";
      return;
    }
    el.hidden = false;
    el.textContent = message;
    el.className = `status status--${type}`;
  }

  function posterMarkup(poster, title) {
    if (poster) {
      return `<img class="card__poster" src="${escapeHtml(poster)}" alt="${escapeHtml(title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card__poster card__poster--placeholder\\'>${PLACEHOLDER_POSTER}</div>'" />`;
    }
    return `<div class="card__poster card__poster--placeholder">${PLACEHOLDER_POSTER}</div>`;
  }

  function switchTab(tabId) {
    els.tabs.forEach((btn) => {
      const active = btn.dataset.tab === tabId;
      btn.classList.toggle("tabs__btn--active", active);
      btn.setAttribute("aria-selected", active);
    });
    els.panelSearch.classList.toggle("panel--active", tabId === "search");
    els.panelSearch.hidden = tabId !== "search";
    els.panelList.classList.toggle("panel--active", tabId === "list");
    els.panelList.hidden = tabId !== "list";
    if (tabId === "list") renderList();
  }

  function updateListCount() {
    const count = Storage.getMovies().length;
    els.listCount.textContent = count;
    els.listCount.hidden = count === 0;
  }

  function renderSearchCard(movie) {
    const inList = Storage.isInList(movie.id);
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="card__poster-wrap">
        ${posterMarkup(movie.poster, movie.title)}
      </div>
      <div class="card__body">
        <h3 class="card__title">${escapeHtml(movie.title)}</h3>
        <p class="card__meta">${movie.year || "—"}</p>
        <div class="card__actions">
          <button type="button" class="btn btn--primary btn-add" ${inList ? "disabled" : ""}>
            ${inList ? "Đã có" : "Thêm"}
          </button>
        </div>
      </div>
    `;
    card.querySelector(".btn-add")?.addEventListener("click", (e) => {
      e.stopPropagation();
      openAddModal(movie);
    });
    card.addEventListener("click", () => {
      if (inList) openEditModal(Storage.getMovieById(movie.id));
      else openAddModal(movie);
    });
    return card;
  }

  function listPosterMarkup(poster, title) {
    if (poster) {
      return `<img class="list-item__poster" src="${escapeHtml(poster)}" alt="" loading="lazy" onerror="this.outerHTML='<div class=\\'list-item__poster list-item__poster--placeholder\\'>${PLACEHOLDER_POSTER}</div>'" />`;
    }
    return `<div class="list-item__poster list-item__poster--placeholder">${PLACEHOLDER_POSTER}</div>`;
  }

  function scoreRingHtml(rating) {
    const r = 20;
    const circ = 2 * Math.PI * r;
    const offset = circ - (rating / 10) * circ;
    return `
      <div class="list-item__score" aria-label="Điểm ${rating} trên 10">
        <svg class="list-item__score-ring" viewBox="0 0 48 48" aria-hidden="true">
          <circle class="list-item__score-bg" cx="24" cy="24" r="${r}" />
          <circle class="list-item__score-fill" cx="24" cy="24" r="${r}"
            stroke-dasharray="${circ.toFixed(2)}"
            stroke-dashoffset="${offset.toFixed(2)}" />
        </svg>
        <span class="list-item__score-num">${rating}</span>
      </div>
    `;
  }

  function renderListItem(movie) {
    const status = movie.status || "want";
    const rating = movie.myRating ?? 7;
    const note = movie.note?.trim() || "";

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "list-item";
    btn.innerHTML = `
      ${listPosterMarkup(movie.poster, movie.title)}
      <div class="list-item__main">
        <h3 class="list-item__title">${escapeHtml(movie.title)}</h3>
        <div class="list-item__meta">
          ${movie.year ? `<span class="list-item__year">${escapeHtml(String(movie.year))}</span>` : ""}
          <span class="list-item__badge list-item__badge--${status}">${STATUS_LABELS[status]}</span>
        </div>
      </div>
      ${scoreRingHtml(rating)}
      ${note ? `<p class="list-item__note">${escapeHtml(note)}</p>` : ""}
      <svg class="list-item__chevron" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="m9 18 6-6-6-6"/>
      </svg>
    `;
    btn.addEventListener("click", () => openEditModal(movie));
    return btn;
  }

  function getActiveStatus() {
    const active = document.querySelector(".chip.chip--active");
    return active?.dataset.status || "all";
  }

  function updateListStats(movies) {
    const total = movies.length;
    els.statTotal.textContent = total;
    els.statWatched.textContent = movies.filter((m) => m.status === "watched").length;

    const rated = movies.filter((m) => m.myRating != null);
    els.statAvg.textContent = rated.length
      ? (rated.reduce((s, m) => s + m.myRating, 0) / rated.length).toFixed(1)
      : "—";

    els.listSubtitle.textContent =
      total === 0
        ? "Chưa có phim nào"
        : `${total} phim trong bộ sưu tập`;

    els.listStats.hidden = total === 0;
    els.listControls.hidden = total === 0;
  }

  function sortMovies(movies, sortBy) {
    const copy = [...movies];
    switch (sortBy) {
      case "rating-desc":
        return copy.sort((a, b) => (b.myRating ?? 0) - (a.myRating ?? 0));
      case "rating-asc":
        return copy.sort((a, b) => (a.myRating ?? 0) - (b.myRating ?? 0));
      case "title-asc":
        return copy.sort((a, b) => (a.title || "").localeCompare(b.title || "", "vi"));
      case "added-desc":
      default:
        return copy.sort(
          (a, b) => new Date(b.addedAt || 0) - new Date(a.addedAt || 0)
        );
    }
  }

  function filterMovies(movies) {
    const q = els.filterInput.value.trim().toLowerCase();
    const status = getActiveStatus();
    return movies.filter((m) => {
      if (status !== "all" && (m.status || "want") !== status) return false;
      if (!q) return true;
      const hay = `${m.title} ${m.note || ""} ${m.year || ""}`.toLowerCase();
      return hay.includes(q);
    });
  }

  function renderList() {
    updateListCount();
    const all = Storage.getMovies();
    updateListStats(all);

    const filtered = filterMovies(sortMovies(all, els.sortSelect.value));

    els.listResults.innerHTML = "";
    els.listEmpty.hidden = true;
    els.listNoResults.hidden = true;

    if (all.length === 0) {
      els.listEmpty.hidden = false;
      els.listFilterCount.textContent = "";
      return;
    }

    if (filtered.length === 0) {
      els.listNoResults.hidden = false;
      els.listFilterCount.textContent = "0 phim";
      return;
    }

    const label =
      filtered.length === all.length
        ? `${filtered.length} phim`
        : `${filtered.length} / ${all.length} phim`;
    els.listFilterCount.textContent = label;

    const frag = document.createDocumentFragment();
    filtered.forEach((m) => frag.appendChild(renderListItem(m)));
    els.listResults.appendChild(frag);
  }

  async function handleSearch(e) {
    e.preventDefault();
    const query = els.searchInput.value.trim();
    if (!query) return;

    els.searchResults.innerHTML = "";
    showStatus(els.searchStatus, "Đang tìm...", "info");

    try {
      const results = await TmdbApi.searchMovies(query);
      showStatus(els.searchStatus, "");

      if (results.length === 0) {
        showStatus(els.searchStatus, "Không tìm thấy phim nào.", "info");
        return;
      }

      const frag = document.createDocumentFragment();
      results.forEach((m) => frag.appendChild(renderSearchCard(m)));
      els.searchResults.appendChild(frag);
    } catch (err) {
      showStatus(els.searchStatus, err.message, "error");
    }
  }

  function fillModal(movie) {
    els.modalTitle.textContent = movie.title;
    els.modalMeta.textContent = [movie.year, movie.voteAverage != null ? `TMDB: ${movie.voteAverage.toFixed(1)}` : ""]
      .filter(Boolean)
      .join(" · ");
    els.modalOverview.textContent = movie.overview || "Không có mô tả.";
    if (movie.poster) {
      els.modalPoster.src = movie.poster;
      els.modalPoster.alt = movie.title;
      els.modalPoster.hidden = false;
    } else {
      els.modalPoster.hidden = true;
    }
    els.modalRating.value = movie.myRating ?? 7;
    els.modalRatingValue.textContent = els.modalRating.value;
    els.modalStatus.value = movie.status || "want";
    els.modalNote.value = movie.note || "";
  }

  function openAddModal(snapshot) {
    modalContext = {
      mode: "add",
      movie: {
        ...snapshot,
        myRating: 7,
        status: "want",
        note: "",
      },
    };
    els.modalDelete.hidden = true;
    els.modalTitle.textContent = "Thêm vào danh sách";
    fillModal(modalContext.movie);
    els.movieModal.showModal();
  }

  function openEditModal(movie) {
    modalContext = { mode: "edit", movie: { ...movie } };
    els.modalDelete.hidden = false;
    els.modalTitle.textContent = "Chỉnh sửa phim";
    fillModal(modalContext.movie);
    els.movieModal.showModal();
  }

  function closeMovieModal() {
    els.movieModal.close();
    modalContext = { mode: "add", movie: null };
  }

  function handleModalSave(e) {
    e.preventDefault();
    const m = modalContext.movie;
    if (!m) return;

    const updated = {
      ...m,
      myRating: Number(els.modalRating.value),
      status: els.modalStatus.value,
      note: els.modalNote.value.trim(),
    };

    Storage.upsertMovie(updated);
    updateListCount();
    closeMovieModal();

    if (els.panelList.classList.contains("panel--active")) {
      renderList();
    } else {
      const query = els.searchInput.value.trim();
      if (query) handleSearch(new Event("submit"));
    }

  }

  function handleModalDelete() {
    const m = modalContext.movie;
    if (!m || !confirm(`Xóa "${m.title}" khỏi danh sách?`)) return;
    Storage.removeMovie(m.id);
    updateListCount();
    closeMovieModal();
    renderList();
  }

  function openSettings() {
    els.apiKeyInput.value = Storage.getApiKey();
    els.settingsModal.showModal();
  }

  function handleSettingsSave(e) {
    e.preventDefault();
    Storage.setApiKey(els.apiKeyInput.value);
    els.settingsModal.close();
    if (!Storage.getApiKey()) {
      showStatus(
        els.searchStatus,
        "Chưa có API key — tìm kiếm sẽ không hoạt động.",
        "error"
      );
    }
  }

  function init() {
    updateListCount();

    if (!Storage.getApiKey()) {
      setTimeout(openSettings, 400);
    }

    els.tabs.forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    document.querySelectorAll("[data-goto]").forEach((btn) => {
      btn.addEventListener("click", () => switchTab(btn.dataset.goto));
    });

    els.searchForm.addEventListener("submit", handleSearch);
    els.filterInput.addEventListener("input", renderList);
    els.sortSelect.addEventListener("change", renderList);
    els.statusChips.forEach((chip) => {
      chip.addEventListener("click", () => {
        els.statusChips.forEach((c) => c.classList.toggle("chip--active", c === chip));
        renderList();
      });
    });

    els.btnSettings.addEventListener("click", openSettings);
    els.settingsForm.addEventListener("submit", handleSettingsSave);
    document.querySelectorAll("[data-close-settings]").forEach((btn) => {
      btn.addEventListener("click", () => els.settingsModal.close());
    });

    els.movieForm.addEventListener("submit", handleModalSave);
    els.modalDelete.addEventListener("click", handleModalDelete);
    els.modalClose.addEventListener("click", closeMovieModal);
    els.modalCancel.addEventListener("click", closeMovieModal);
    els.modalRating.addEventListener("input", () => {
      els.modalRatingValue.textContent = els.modalRating.value;
    });

    els.movieModal.addEventListener("click", (e) => {
      if (e.target === els.movieModal) closeMovieModal();
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
