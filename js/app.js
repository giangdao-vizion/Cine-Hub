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
    filterInput: $("#filter-input"),
    sortSelect: $("#sort-select"),
    statusFilter: $("#status-filter"),
    listStatus: $("#list-status"),
    listEmpty: $("#list-empty"),
    listResults: $("#list-results"),
    btnExport: $("#btn-export"),
    importFile: $("#import-file"),
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

  function renderListCard(movie) {
    const card = document.createElement("article");
    card.className = "card";
    const statusClass = `card__status--${movie.status || "want"}`;
    card.innerHTML = `
      <div class="card__poster-wrap">
        ${posterMarkup(movie.poster, movie.title)}
        <span class="card__badge">${movie.myRating ?? "—"}/10</span>
        <span class="card__status ${statusClass}">${STATUS_LABELS[movie.status] || STATUS_LABELS.want}</span>
      </div>
      <div class="card__body">
        <h3 class="card__title">${escapeHtml(movie.title)}</h3>
        <p class="card__meta">${movie.year || "—"}</p>
      </div>
    `;
    card.addEventListener("click", () => openEditModal(movie));
    return card;
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
    const status = els.statusFilter.value;
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
    const filtered = filterMovies(
      sortMovies(all, els.sortSelect.value)
    );

    els.listResults.innerHTML = "";
    showStatus(els.listStatus, "");

    if (all.length === 0) {
      els.listEmpty.hidden = false;
      return;
    }

    els.listEmpty.hidden = true;

    if (filtered.length === 0) {
      showStatus(els.listStatus, "Không có phim khớp bộ lọc.", "info");
      return;
    }

    const frag = document.createDocumentFragment();
    filtered.forEach((m) => frag.appendChild(renderListCard(m)));
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

    showStatus(els.listStatus, "Đã lưu phim.", "success");
    setTimeout(() => showStatus(els.listStatus, ""), 2500);
  }

  function handleModalDelete() {
    const m = modalContext.movie;
    if (!m || !confirm(`Xóa "${m.title}" khỏi danh sách?`)) return;
    Storage.removeMovie(m.id);
    updateListCount();
    closeMovieModal();
    renderList();
  }

  function handleExport() {
    const data = Storage.exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `cinehub-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
    showStatus(els.listStatus, "Đã xuất file JSON.", "success");
    setTimeout(() => showStatus(els.listStatus, ""), 2500);
  }

  function handleImport(e) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        const merge = confirm(
          "Chọn OK để gộp với danh sách hiện tại.\nChọn Hủy để thay thế hoàn toàn."
        );
        const n = Storage.importData(data, merge);
        updateListCount();
        renderList();
        showStatus(els.listStatus, `Đã nhập ${n} phim.`, "success");
        setTimeout(() => showStatus(els.listStatus, ""), 3000);
      } catch (err) {
        showStatus(els.listStatus, err.message || "Không đọc được file.", "error");
      }
    };
    reader.readAsText(file);
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
    els.statusFilter.addEventListener("change", renderList);
    els.btnExport.addEventListener("click", handleExport);
    els.importFile.addEventListener("change", handleImport);

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
