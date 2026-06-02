(function () {
  const content = window.siteContent;
  const posts = [...content.posts];
  const categories = content.categories;
  const categoryMap = new Map(categories.map((category) => [category.id, category]));

  const roomGrid = document.querySelector("#roomGrid");
  const postGrid = document.querySelector("#postGrid");
  const filterGroup = document.querySelector("#filterGroup");
  const classificationGroup = document.querySelector("#classificationGroup");
  const searchInput = document.querySelector("#searchInput");
  const sortSelect = document.querySelector("#sortSelect");
  const resultMeta = document.querySelector("#resultMeta");
  const translationRail = document.querySelector("#translationRail");

  const state = {
    kind: "all",
    classification: "all",
    search: "",
    sort: "newest"
  };

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => {
      const map = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      };
      return map[character];
    });
  }

  function normalize(value) {
    return String(value ?? "").toLocaleLowerCase("tr-TR");
  }

  function formatDate(dateString) {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(`${dateString}T12:00:00`));
  }

  function getCategory(post) {
    return categoryMap.get(post.category) || categories[0];
  }

  function getPostUrl(post) {
    return `yayin.html?id=${encodeURIComponent(post.id)}`;
  }

  function getVisibleClassifications() {
    const relevantPosts =
      state.kind === "all" ? posts : posts.filter((post) => post.category === state.kind);
    return [...new Set(relevantPosts.map((post) => post.classification))].sort((a, b) =>
      a.localeCompare(b, "tr-TR")
    );
  }

  function matchesSearch(post) {
    if (!state.search) return true;
    const haystack = [
      post.title,
      post.summary,
      post.classification,
      post.format,
      post.language,
      post.status,
      ...(post.tags || [])
    ]
      .join(" ")
      .toLocaleLowerCase("tr-TR");

    return haystack.includes(normalize(state.search));
  }

  function sortPosts(list) {
    return [...list].sort((a, b) => {
      if (state.sort === "title") {
        return a.title.localeCompare(b.title, "tr-TR");
      }

      if (state.sort === "classification") {
        return a.classification.localeCompare(b.classification, "tr-TR");
      }

      return new Date(b.date) - new Date(a.date);
    });
  }

  function getVisiblePosts() {
    return sortPosts(
      posts.filter((post) => {
        const kindMatch = state.kind === "all" || post.category === state.kind;
        const classificationMatch =
          state.classification === "all" || post.classification === state.classification;
        return kindMatch && classificationMatch && matchesSearch(post);
      })
    );
  }

  function renderStats() {
    const storyCount = posts.filter((post) => post.category === "story").length;
    const translationCount = posts.filter((post) => post.category === "translation").length;

    document.querySelector("#stat-total").textContent = posts.length;
    document.querySelector("#stat-story").textContent = storyCount;
    document.querySelector("#stat-translation").textContent = translationCount;
  }

  function renderRooms() {
    roomGrid.innerHTML = categories
      .map((category) => {
        const categoryPosts = posts.filter((post) => post.category === category.id);
        const classifications = [
          ...new Set(categoryPosts.map((post) => post.classification))
        ].slice(0, 4);

        return `
          <a
            class="room-card"
            href="#arsiv"
            data-room="${escapeHtml(category.id)}"
            style="--accent: ${category.color}; --soft: ${category.soft}"
          >
            <span class="room-count">${categoryPosts.length}</span>
            <h3>${escapeHtml(category.plural)}</h3>
            <p>${escapeHtml(category.description)}</p>
            <div class="room-tags">
              ${classifications.map((item) => `<span>${escapeHtml(item)}</span>`).join("")}
            </div>
          </a>
        `;
      })
      .join("");
  }

  function renderKindFilters() {
    const allCategories = [
      { id: "all", label: "Hepsi", color: "#102f35" },
      ...categories
    ];

    filterGroup.innerHTML = allCategories
      .map((category) => {
        const active = category.id === state.kind;
        return `
          <button
            class="filter-button${active ? " is-active" : ""}"
            type="button"
            data-kind="${escapeHtml(category.id)}"
            aria-pressed="${active}"
          >
            <span style="--swatch-color: ${category.color}"></span>
            ${escapeHtml(category.label)}
          </button>
        `;
      })
      .join("");
  }

  function renderClassificationFilters() {
    const classifications = getVisibleClassifications();
    if (!classifications.includes(state.classification)) {
      state.classification = "all";
    }

    const filters = ["all", ...classifications];
    classificationGroup.innerHTML = filters
      .map((classification) => {
        const active = classification === state.classification;
        const label = classification === "all" ? "Hepsi" : classification;
        return `
          <button
            class="filter-button${active ? " is-active" : ""}"
            type="button"
            data-classification="${escapeHtml(classification)}"
            aria-pressed="${active}"
          >
            ${escapeHtml(label)}
          </button>
        `;
      })
      .join("");
  }

  function renderPosts() {
    const visiblePosts = getVisiblePosts();

    resultMeta.textContent =
      visiblePosts.length === 0
        ? "Eşleşen yayın bulunamadı."
        : `${visiblePosts.length} yayın listeleniyor.`;

    postGrid.innerHTML = visiblePosts
      .map((post) => {
        const category = getCategory(post);
        return `
          <article class="post-card" style="--accent: ${category.color}; --soft: ${category.soft}">
            <div class="card-topline">
              <span class="category-pill">${escapeHtml(category.label)}</span>
              <span class="status-pill">${escapeHtml(post.status)}</span>
            </div>
            <h3>${escapeHtml(post.title)}</h3>
            <p>${escapeHtml(post.summary)}</p>
            <dl class="post-meta">
              <div>
                <dt>Alt sınıf</dt>
                <dd>${escapeHtml(post.classification)}</dd>
              </div>
              <div>
                <dt>Biçim</dt>
                <dd>${escapeHtml(post.format)}</dd>
              </div>
              <div>
                <dt>Tarih</dt>
                <dd>${formatDate(post.date)}</dd>
              </div>
            </dl>
            <div class="tag-list">
              ${post.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
            </div>
            <a class="read-button" href="${getPostUrl(post)}">Yayın sayfası</a>
          </article>
        `;
      })
      .join("");
  }

  function renderTranslations() {
    const translationPosts = posts.filter((post) => post.category === "translation");

    translationRail.innerHTML = translationPosts
      .map((post) => {
        const category = getCategory(post);
        return `
          <article class="translation-card" style="--accent: ${category.color}">
            <span>${escapeHtml(post.language)}</span>
            <h3>${escapeHtml(post.title)}</h3>
            <p>${escapeHtml(post.summary)}</p>
            <dl>
              <div>
                <dt>Alt sınıf</dt>
                <dd>${escapeHtml(post.classification)}</dd>
              </div>
              <div>
                <dt>Rol</dt>
                <dd>${escapeHtml(post.role || post.format)}</dd>
              </div>
            </dl>
            <a class="text-button" href="${getPostUrl(post)}">Karşılaştırmalı oku</a>
          </article>
        `;
      })
      .join("");
  }

  function renderAll() {
    renderKindFilters();
    renderClassificationFilters();
    renderPosts();
  }

  function bindEvents() {
    roomGrid.addEventListener("click", (event) => {
      const room = event.target.closest("[data-room]");
      if (!room) return;
      event.preventDefault();
      state.kind = room.dataset.room;
      state.classification = "all";
      renderAll();
      document.querySelector("#arsiv").scrollIntoView({ behavior: "smooth", block: "start" });
    });

    filterGroup.addEventListener("click", (event) => {
      const button = event.target.closest("[data-kind]");
      if (!button) return;
      state.kind = button.dataset.kind;
      state.classification = "all";
      renderAll();
    });

    classificationGroup.addEventListener("click", (event) => {
      const button = event.target.closest("[data-classification]");
      if (!button) return;
      state.classification = button.dataset.classification;
      renderAll();
    });

    searchInput.addEventListener("input", (event) => {
      state.search = event.target.value.trim();
      renderPosts();
    });

    sortSelect.addEventListener("change", (event) => {
      state.sort = event.target.value;
      renderPosts();
    });
  }

  renderStats();
  renderRooms();
  renderTranslations();
  renderAll();
  bindEvents();
})();

// ==========================================
      // 1. OKSİJEN SİMÜLATÖRÜ KODU (Aktarım Birimi)
      // ==========================================
      const oxySlider = document.querySelector("#oxySlider");
      const oxyLabel = document.querySelector("#oxyLabel");
      const oxyText = document.querySelector("#oxyText");
      const oxyNote = document.querySelector("#oxyNote");

      if (oxySlider) {
        const oxyData = [
          {
            label: "SUBSIDIUM BÖLGESİ (%17.0)",
            color: "#f87171", // Kırmızımtırak (Tehlike/Yorgunluk)
            text: '"Ciğerlerinde paslı bir ağırlık."',
            note: 'Fiziksel iş gücü için tasarlanmış düşük seviye. Dikkat dağınıklığını engeller ama uzun vadede hafızayı bulanıklaştırır.'
          },
          {
            label: "VERITAS BÖLGESİ (%19.0)",
            color: "#4ade80", // Yeşil (Optimal/Denge)
            text: '"Düşünceler net, nefes ritmik."',
            note: 'Bilişsel denge için optimal sınır. Bilgi akışının ve günlük bürokrasinin sürdürüldüğü standart yaşam alanı.'
          },
          {
            label: "ORDIUM BÖLGESİ (%21.0)",
            color: "#60a5fa", // Mavi (Saf/Elit)
            text: '"Hafiflik, öfori ve keskin bir zihin."',
            note: 'Yönetim ve akademi için tam stabilizasyon. Hücresel yenilenmeyi hızlandırır, kişiye geçici bir yenilmezlik hissi verir.'
          }
        ];

        oxySlider.addEventListener("input", (event) => {
          const value = event.target.value;
          const data = oxyData[value];

          oxyText.style.opacity = 0;
          oxyNote.style.opacity = 0;

          setTimeout(() => {
            oxyLabel.textContent = data.label;
            oxyLabel.style.color = data.color;
            oxyText.textContent = data.text;
            
            oxyNote.innerHTML = `<strong style="color: ${data.color};">Klinik Etki:</strong> ${data.note}`;

            oxyText.style.opacity = 1;
            oxyNote.style.opacity = 1;
          }, 150);
        });
      }