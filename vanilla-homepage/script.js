/* =====================================================================
   Government Services Portal — homepage behaviour
   Vanilla JS, no dependencies, no external API calls.
   ===================================================================== */

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Mobile nav toggle ---------- */
  var navToggle = document.getElementById('navToggle');
  var primaryNav = document.getElementById('primaryNav');
  if (navToggle && primaryNav) {
    navToggle.addEventListener('click', function () {
      var open = !primaryNav.classList.contains('open');
      primaryNav.classList.toggle('open', open);
      navToggle.setAttribute('aria-expanded', String(open));
      navToggle.innerHTML = open
        ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
    });
    // Close the mobile menu after choosing a link
    primaryNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        if (window.innerWidth < 900) {
          primaryNav.classList.remove('open');
          navToggle.setAttribute('aria-expanded', 'false');
          navToggle.innerHTML = '<i class="fa-solid fa-bars" aria-hidden="true"></i>';
        }
      });
    });
  }

  /* ---------- Service search / filter ---------- */
  var searchForm = document.getElementById('searchForm');
  var searchInput = document.getElementById('serviceSearch');
  var serviceCards = Array.prototype.slice.call(document.querySelectorAll('.service-card'));
  var noResults = document.getElementById('noResults');
  var noResultsQuery = document.getElementById('noResultsQuery');
  var clearSearchBtn = document.getElementById('clearSearch');

  function filterServices(rawQuery) {
    var query = rawQuery.trim().toLowerCase();
    var visibleCount = 0;

    serviceCards.forEach(function (card) {
      var name = (card.dataset.name || '').toLowerCase();
      var match = query === '' || name.indexOf(query) !== -1;
      card.hidden = !match;
      if (match) visibleCount++;
    });

    if (noResults) {
      var showEmpty = query !== '' && visibleCount === 0;
      noResults.hidden = !showEmpty;
      if (showEmpty && noResultsQuery) noResultsQuery.textContent = rawQuery.trim();
    }

    // Scroll the results into view once a search has actually been run
    if (query !== '') {
      var servicesSection = document.getElementById('services');
      if (servicesSection) servicesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  if (searchForm && searchInput) {
    searchForm.addEventListener('submit', function (e) {
      e.preventDefault();
      filterServices(searchInput.value);
    });
    // Live-filter as the visitor types, once they've started on the page
    // (kept light — no debounce needed for a client-side list this small)
    searchInput.addEventListener('input', function () {
      filterServices(searchInput.value);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', function () {
      searchInput.value = '';
      filterServices('');
      searchInput.focus();
    });
  }

  // Popular-search chips fill and run the search
  document.querySelectorAll('.chip[data-query]').forEach(function (chip) {
    chip.addEventListener('click', function () {
      searchInput.value = chip.dataset.query;
      filterServices(chip.dataset.query);
      searchInput.focus();
    });
  });

  /* ---------- FAQ accordion (single-open) ---------- */
  var accordion = document.getElementById('faqAccordion');
  if (accordion) {
    var triggers = Array.prototype.slice.call(accordion.querySelectorAll('.accordion-trigger'));
    triggers.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var panel = document.getElementById(btn.getAttribute('aria-controls'));
        var isOpen = btn.getAttribute('aria-expanded') === 'true';

        // Close every other panel first (classic single-open accordion)
        triggers.forEach(function (otherBtn) {
          if (otherBtn === btn) return;
          otherBtn.setAttribute('aria-expanded', 'false');
          var otherPanel = document.getElementById(otherBtn.getAttribute('aria-controls'));
          if (otherPanel) otherPanel.hidden = true;
        });

        btn.setAttribute('aria-expanded', String(!isOpen));
        if (panel) panel.hidden = isOpen;
      });
    });
  }

  /* ---------- Animated stat counters ---------- */
  var statEls = Array.prototype.slice.call(document.querySelectorAll('.stat'));
  var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounter(statEl) {
    var counterEl = statEl.querySelector('.counter');
    var target = parseFloat(statEl.dataset.target, 10);
    var suffix = statEl.dataset.suffix || '';
    if (!counterEl || isNaN(target)) return;

    if (reducedMotion) {
      counterEl.textContent = formatNumber(target) + suffix;
      return;
    }

    // setTimeout rather than requestAnimationFrame: a fixed-interval timer
    // doesn't depend on the page actively compositing paint frames (some
    // embedded/backgrounded browser contexts throttle or fully suspend
    // rAF), and a value-counting animation doesn't need paint-sync anyway.
    var duration = 1400;
    var frameMs = 16;
    var totalFrames = Math.round(duration / frameMs);
    var frame = 0;

    var timer = setInterval(function () {
      frame++;
      var progress = Math.min(frame / totalFrames, 1);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      counterEl.textContent = formatNumber(target * eased) + suffix;
      if (progress >= 1) {
        counterEl.textContent = formatNumber(target) + suffix;
        clearInterval(timer);
      }
    }, frameMs);
  }

  function formatNumber(n) {
    // Whole numbers get thousands separators; decimals (e.g. 99.9) keep one place
    if (Number.isInteger(n)) return Math.round(n).toLocaleString('en-IN');
    return n.toFixed(1);
  }

  // Scroll-based visibility check rather than IntersectionObserver: just as
  // effective for a handful of elements, and doesn't depend on IO firing
  // promptly in every environment (some embedded/automated browsers delay
  // or skip IO callbacks even when the element is genuinely on screen).
  var pendingStats = statEls.slice();

  function hasReachedViewport(el) {
    // Fires once the element's top has scrolled up to (or past) the visible
    // area — deliberately does NOT also require rect.bottom > 0, so a large
    // single scroll jump that skips straight past the element (e.g. a fast
    // scroll, an anchor-link jump, or a resize) still counts as "seen"
    // instead of leaving the counter stuck at 0 forever.
    var rect = el.getBoundingClientRect();
    var viewportH = window.innerHeight || document.documentElement.clientHeight;
    return rect.top < viewportH * 0.85;
  }

  function checkStats() {
    if (!pendingStats.length) return;
    pendingStats = pendingStats.filter(function (el) {
      if (hasReachedViewport(el)) {
        animateCounter(el);
        return false; // done, stop tracking this one
      }
      return true;
    });
    if (!pendingStats.length) {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    }
  }

  // Simple time-based throttle (not rAF-based — see note above) so a burst
  // of scroll events doesn't run the check more than ~10 times a second.
  var scrollThrottleMs = 100;
  var lastCheck = 0;
  function onScroll() {
    var now = Date.now();
    if (now - lastCheck < scrollThrottleMs) return;
    lastCheck = now;
    checkStats();
  }

  if (statEls.length) {
    checkStats(); // in case stats are already visible on load (e.g. small viewport already scrolled)
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  /* ---------- Announcement ticker: pause/play (WCAG 2.2.2) ---------- */
  var tickerTrack = document.getElementById('tickerTrack');
  var tickerToggle = document.getElementById('tickerToggle');

  if (tickerTrack) {
    // Duplicate the list once so the CSS animation loops seamlessly
    tickerTrack.insertAdjacentHTML('beforeend', tickerTrack.innerHTML);

    if (reducedMotion) tickerTrack.classList.add('paused');
  }

  if (tickerToggle && tickerTrack) {
    var tickerPaused = reducedMotion;
    if (tickerPaused) {
      tickerToggle.innerHTML = '<i class="fa-solid fa-play" aria-hidden="true"></i>';
      tickerToggle.setAttribute('aria-label', 'Play announcements');
    }
    tickerToggle.addEventListener('click', function () {
      tickerPaused = !tickerPaused;
      tickerTrack.classList.toggle('paused', tickerPaused);
      tickerToggle.innerHTML = tickerPaused
        ? '<i class="fa-solid fa-play" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-pause" aria-hidden="true"></i>';
      tickerToggle.setAttribute('aria-label', tickerPaused ? 'Play announcements' : 'Pause announcements');
    });
    // Pause on hover/focus for easier reading, resume on leave (unless user paused it manually)
    var tickerSection = tickerTrack.closest('.ticker-section');
    if (tickerSection) {
      tickerSection.addEventListener('mouseenter', function () { tickerTrack.classList.add('paused'); });
      tickerSection.addEventListener('mouseleave', function () { if (!tickerPaused) tickerTrack.classList.remove('paused'); });
      tickerSection.addEventListener('focusin', function () { tickerTrack.classList.add('paused'); });
      tickerSection.addEventListener('focusout', function () { if (!tickerPaused) tickerTrack.classList.remove('paused'); });
    }
  }

});
