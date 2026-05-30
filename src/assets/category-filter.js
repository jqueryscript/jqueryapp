// Category page filter — search + tag chips
// Works on any category page with data-tags on tool cards
// Progressive enhancement: all tools visible without JS
(function () {
  const grid = document.querySelector(".tool-grid");
  const cards = grid ? [...grid.querySelectorAll(".tool-card")] : [];
  const taggedCards = cards.filter(c => c.dataset.tags);
  if (!taggedCards.length) return;

  // Build search + filter UI
  const container = document.createElement("div");
  container.className = "tool-filters";
  const toolCount = taggedCards.length;
  container.innerHTML = `
    <input type="search" id="cat-search" class="filter-search" placeholder="Search ${toolCount} tools..." autocomplete="off">
    <div class="filter-chips" id="cat-chips"></div>
  `;

  // Wrap in a .wrap div so the filter aligns with other page content
  const filterWrap = document.createElement("div");
  filterWrap.className = "wrap";
  filterWrap.appendChild(container);

  // Insert as a sibling of the grid's .wrap parent (before the grid)
  const gridWrap = grid.parentNode; // .wrap.tool-grid
  gridWrap.parentNode.insertBefore(filterWrap, gridWrap);

  const searchInput = container.querySelector("#cat-search");
  const chipsContainer = container.querySelector("#cat-chips");

  // Collect unique tags from all tagged cards
  const allTags = [...new Set(taggedCards.flatMap(c => (c.dataset.tags || "").split(" ").filter(Boolean)))].sort();

  function titleCase(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Build chip buttons
  let activeTag = "";
  function renderChips() {
    chipsContainer.innerHTML = allTags.map(tag =>
      `<button class="chip${activeTag === tag ? " active" : ""}" data-tag="${tag}">${titleCase(tag)}</button>`
    ).join("");
  }
  renderChips();

  // Filter logic
  function filterCards() {
    const query = searchInput.value.toLowerCase().trim();
    let visible = 0;
    cards.forEach(card => {
      const name = (card.dataset.toolName || "").toLowerCase();
      const keywords = (card.dataset.keywords || "").toLowerCase();
      const tags = (card.dataset.tags || "").toLowerCase();
      const tagMatch = !activeTag || tags.split(" ").includes(activeTag);
      const searchMatch = !query || name.includes(query) || keywords.includes(query);
      const show = tagMatch && searchMatch;
      card.style.display = show ? "" : "none";
      if (show) visible++;
    });

    // Update result count
    let countEl = document.getElementById("cat-filter-count");
    if (!countEl) {
      countEl = document.createElement("p");
      countEl.id = "cat-filter-count";
      countEl.className = "filter-count";
      container.appendChild(countEl);
    }
    countEl.textContent = visible === cards.length
      ? `Showing all ${cards.length} tools`
      : `Showing ${visible} of ${cards.length} tools`;
    countEl.setAttribute("aria-live", "polite");
  }

  // Events
  searchInput.addEventListener("input", filterCards);

  chipsContainer.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const tag = chip.dataset.tag;
    activeTag = activeTag === tag ? "" : tag;
    renderChips();
    filterCards();
  });

  // Keyboard: Escape clears
  searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      searchInput.value = "";
      activeTag = "";
      renderChips();
      filterCards();
    }
  });
})();
