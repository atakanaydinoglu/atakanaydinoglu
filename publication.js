(function () {
  const content = window.siteContent;
  const posts = content.posts;
  const categories = content.categories;
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const params = new URLSearchParams(window.location.search);
  const postId = params.get("id");
  const post = posts.find((item) => item.id === postId);

  const publicationHero = document.querySelector("#publicationHero");
  const publicationTitle = document.querySelector("#publicationTitle");
  const publicationKicker = document.querySelector("#publicationKicker");
  const publicationSummary = document.querySelector("#publicationSummary");
  const publicationTags = document.querySelector("#publicationTags");
  const publicationFacts = document.querySelector("#publicationFacts");
  const publicationBody = document.querySelector("#publicationBody");
  const relatedSection = document.querySelector("#relatedSection");
  const relatedGrid = document.querySelector("#relatedGrid");

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

  function formatDate(dateString) {
    return new Intl.DateTimeFormat("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    }).format(new Date(`${dateString}T12:00:00`));
  }

  function getCategory(item) {
    return categoryMap.get(item.category) || categories[0];
  }

  function getPostUrl(item) {
    return `yayin.html?id=${encodeURIComponent(item.id)}`;
  }

  function renderNotFound() {
    document.title = "Yayın bulunamadı | Atakan Aydınoğlu";
    publicationHero.classList.add("is-missing");
    publicationTitle.textContent = "Yayın bulunamadı";
    publicationSummary.textContent =
      "Aradığınız yayın taşınmış, silinmiş veya bağlantı eksik olabilir.";
    publicationFacts.innerHTML = '<a class="button primary" href="index.html#arsiv">Arşive dön</a>';
  }

  function renderFacts(item, category) {
    const facts = [
      ["Tür", category.label],
      ["Alt sınıf", item.classification],
      ["Biçim", item.format],
      ["Tarih", formatDate(item.date)],
      ["Dil", item.language],
      ["Okuma", item.readTime],
      ["Durum", item.status]
    ];

    publicationFacts.innerHTML = `
      <dl>
        ${facts
          .map(
            ([label, value]) => `
              <div>
                <dt>${escapeHtml(label)}</dt>
                <dd>${escapeHtml(value)}</dd>
              </div>
            `
          )
          .join("")}
      </dl>
    `;
  }

  function renderPoem(item) {
    publicationBody.innerHTML = `
      <div class="poem-layout">
        <article class="poem-sheet">
          <div class="poem-lines">
            ${item.poemLines
              .map((line) =>
                line
                  ? `<p>${escapeHtml(line)}</p>`
                  : '<div class="poem-break" aria-hidden="true"></div>'
              )
              .join("")}
          </div>
        </article>
        <aside class="poem-note">
          <span>Şiir notu</span>
          <p>${escapeHtml(item.note || item.summary)}</p>
        </aside>
      </div>
    `;
  }

  function renderStory(item) {
    publicationBody.innerHTML = `
      <div class="story-layout">
        <aside class="chapter-index" aria-label="Chapter listesi">
          <p>Chapterlar</p>
          ${item.chapters
            .map(
              (chapter) => `
                <a href="#chapter-${escapeHtml(chapter.number)}">
                  <strong>${escapeHtml(chapter.number)}</strong>
                  <span>${escapeHtml(chapter.title)}</span>
                </a>
              `
            )
            .join("")}
        </aside>
        <article class="story-reader">
          ${item.chapters
            .map(
              (chapter) => `
                <section class="chapter-panel" id="chapter-${escapeHtml(chapter.number)}">
                  <p class="chapter-number">Chapter ${escapeHtml(chapter.number)}</p>
                  <h2>${escapeHtml(chapter.title)}</h2>
                  <p class="chapter-summary">${escapeHtml(chapter.summary)}</p>
                  ${chapter.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
                </section>
              `
            )
            .join("")}
        </article>
      </div>
    `;
  }

  function renderTranslation(item) {
    // İçerikte özel bir link belirtilmişse onu kullanır, yoksa boş (#) kalır.
    const projectLink = item.link || item.videoUrl || "#";
    // Butonun üzerinde yazacak metin
    const buttonLabel = item.linkLabel || "Videoyu İzle / Projeyi Görüntüle";

    publicationBody.innerHTML = `
      <div class="translation-layout">
        <aside class="translation-context">
          <span>Çeviri bilgisi</span>
          <dl>
            <div>
              <dt>Kaynak</dt>
              <dd>${escapeHtml(item.source || "Kaynak eklenecek")}</dd>
            </div>
            <div>
              <dt>Rol</dt>
              <dd>${escapeHtml(item.role || item.format)}</dd>
            </div>
          </dl>
          ${item.rights ? `<p class="rights-note">${escapeHtml(item.rights)}</p>` : ""}
        </aside>

        <article class="translation-showcase">
          <h2 class="showcase-title">${escapeHtml(item.title)}</h2>
          <p class="translation-intro">${escapeHtml(item.translationIntro || item.summary)}</p>
          
          <div class="translation-action">
            <a href="${escapeHtml(projectLink)}" target="_blank" rel="noopener noreferrer" class="button primary showcase-btn">
              ${escapeHtml(buttonLabel)}
            </a>
          </div>
        </article>
      </div>
    `;
  }

  function renderArticle(item) {
    const isPaper = item.category === "paper";
    publicationBody.innerHTML = `
      <div class="article-layout">
        <aside class="article-aside">
          ${
            item.abstract
              ? `
                <span>Özet</span>
                <p>${escapeHtml(item.abstract)}</p>
              `
              : `
                <span>Dosya</span>
                <p>${escapeHtml(item.summary)}</p>
              `
          }
          ${
            item.keywords
              ? `
                <div class="keyword-list">
                  ${item.keywords.map((keyword) => `<span>${escapeHtml(keyword)}</span>`).join("")}
                </div>
              `
              : ""
          }
        </aside>
        <article class="essay-reader">
          ${item.sections
            .map(
              (section) => `
                <section>
                  <h2>${escapeHtml(section.heading)}</h2>
                  ${section.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}
                </section>
              `
            )
            .join("")}
          ${
            isPaper && item.bibliography
              ? `
                <section class="bibliography">
                  <h2>Kaynakça</h2>
                  <ol>
                    ${item.bibliography.map((source) => `<li>${escapeHtml(source)}</li>`).join("")}
                  </ol>
                </section>
              `
              : ""
          }
        </article>
      </div>
    `;
  }

  function renderRelated(item) {
    const related = posts
      .filter((candidate) => candidate.category === item.category && candidate.id !== item.id)
      .slice(0, 3);

    if (related.length === 0) return;

    relatedSection.hidden = false;
    relatedGrid.innerHTML = related
      .map((candidate) => {
        const category = getCategory(candidate);
        return `
          <a class="related-card" href="${getPostUrl(candidate)}" style="--accent: ${category.color}">
            <span>${escapeHtml(candidate.classification)}</span>
            <strong>${escapeHtml(candidate.title)}</strong>
            <p>${escapeHtml(candidate.summary)}</p>
          </a>
        `;
      })
      .join("");
  }

  function renderPublication(item) {
    const category = getCategory(item);
    document.title = `${item.title} | Atakan Aydınoğlu`;
    document.body.classList.add(`kind-${item.category}`);
    document.documentElement.style.setProperty("--work-accent", category.color);
    document.documentElement.style.setProperty("--work-soft", category.soft);
    publicationHero.style.setProperty("--accent", category.color);
    publicationHero.style.setProperty("--soft", category.soft);

    publicationKicker.textContent = `${category.label} / ${item.classification}`;
    publicationTitle.textContent = item.title;
    publicationSummary.textContent = item.summary;
    publicationTags.innerHTML = item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

    renderFacts(item, category);

    if (item.category === "poem") {
      renderPoem(item);
    } else if (item.category === "story") {
      renderStory(item);
    } else if (item.category === "translation") {
      renderTranslation(item);
    } else {
      renderArticle(item);
    }

    renderRelated(item);
  }

  if (!post) {
    renderNotFound();
    return;
  }

  renderPublication(post);
})();
