/* ===========================================================
   Shared listing-page controller — search, category filter chips,
   and pagination for a grid of cards. Used by services.html,
   schemes.html, jobs.html and tourism.html (see LISTING-TEMPLATE.md).

   Markup contract for each card: a wrapping element with
     data-category="Some Category"   (matched against filter chips)
   Its visible text is used for the search match.

   Usage (once per listing block on a page):
     initListing({
       gridSelector: '#servicesGrid',
       cardSelector: '.listing-card',
       searchInputSelector: '#serviceSearch',
       filterBarSelector: '#serviceFilters',   // optional
       countSelector: '#serviceCount',         // optional
       emptyStateSelector: '#serviceEmpty',    // optional
       paginationSelector: '#servicePagination', // optional
       pageSize: 6,                             // optional, default 9999 (no pagination)
       itemLabel: 'service',                    // for the "N services" count text
     });
=========================================================== */

function initListing(opts) {
  var grid = document.querySelector(opts.gridSelector);
  if (!grid) return;

  var cards = Array.prototype.slice.call(grid.querySelectorAll(opts.cardSelector));
  var searchInput = opts.searchInputSelector ? document.querySelector(opts.searchInputSelector) : null;
  var filterBar = opts.filterBarSelector ? document.querySelector(opts.filterBarSelector) : null;
  var countEl = opts.countSelector ? document.querySelector(opts.countSelector) : null;
  var emptyEl = opts.emptyStateSelector ? document.querySelector(opts.emptyStateSelector) : null;
  var paginationEl = opts.paginationSelector ? document.querySelector(opts.paginationSelector) : null;
  var pageSize = opts.pageSize || 9999;
  var itemLabel = opts.itemLabel || 'result';

  var activeCategory = 'All';
  var currentPage = 1;

  function matchingCards() {
    var q = searchInput ? searchInput.value.trim().toLowerCase() : '';
    return cards.filter(function (card) {
      var text = card.textContent.toLowerCase();
      var cat = card.dataset.category || 'All';
      var matchesText = !q || text.indexOf(q) !== -1;
      var matchesCat = activeCategory === 'All' || cat === activeCategory;
      return matchesText && matchesCat;
    });
  }

  function render() {
    var matches = matchingCards();
    var totalPages = Math.max(1, Math.ceil(matches.length / pageSize));
    if (currentPage > totalPages) currentPage = totalPages;
    var start = (currentPage - 1) * pageSize;
    var pageItems = matches.slice(start, start + pageSize);

    cards.forEach(function (card) {
      card.hidden = pageItems.indexOf(card) === -1;
    });

    if (countEl) {
      countEl.textContent = matches.length + ' ' + itemLabel + (matches.length === 1 ? '' : 's');
    }
    if (emptyEl) {
      emptyEl.hidden = matches.length !== 0;
    }
    if (paginationEl) renderPagination(totalPages);
  }

  function renderPagination(totalPages) {
    if (totalPages <= 1) { paginationEl.innerHTML = ''; paginationEl.hidden = true; return; }
    paginationEl.hidden = false;

    var html = '';
    html += '<button type="button" class="pagination-btn" data-page="prev" ' + (currentPage === 1 ? 'disabled' : '') + ' aria-label="Previous page">' +
            '<i class="fa-solid fa-chevron-left" aria-hidden="true"></i></button>';
    for (var p = 1; p <= totalPages; p++) {
      html += '<button type="button" class="pagination-btn" data-page="' + p + '" ' +
              (p === currentPage ? 'aria-current="page"' : '') + '>' + p + '</button>';
    }
    html += '<button type="button" class="pagination-btn" data-page="next" ' + (currentPage === totalPages ? 'disabled' : '') + ' aria-label="Next page">' +
            '<i class="fa-solid fa-chevron-right" aria-hidden="true"></i></button>';
    paginationEl.innerHTML = html;

    paginationEl.querySelectorAll('[data-page]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var val = btn.dataset.page;
        if (val === 'prev') currentPage = Math.max(1, currentPage - 1);
        else if (val === 'next') currentPage = Math.min(totalPages, currentPage + 1);
        else currentPage = Number(val);
        render();
        grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  if (searchInput) {
    searchInput.addEventListener('input', function () { currentPage = 1; render(); });
  }

  if (filterBar) {
    var chips = Array.prototype.slice.call(filterBar.querySelectorAll('.filter-chip'));
    chips.forEach(function (chip) {
      chip.addEventListener('click', function () {
        chips.forEach(function (c) { c.setAttribute('aria-pressed', 'false'); });
        chip.setAttribute('aria-pressed', 'true');
        activeCategory = chip.dataset.filter || 'All';
        currentPage = 1;
        render();
      });
    });
  }

  render();
}
