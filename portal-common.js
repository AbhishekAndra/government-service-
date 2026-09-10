// Shared behaviour for every Citizen Services Portal page.
// Every module below is defensive: it looks for the DOM elements it needs
// and does nothing if they aren't on the current page, so this one file can
// be included unchanged on every page without extra config.
//
// Modules:
//   - text-size controls, skip-to-search shortcut, accessibility panel (existing)
//   - mobile slide-out navigation drawer
//   - animated statistic counters              [data-counter]
//   - FAQ accordion with smooth animation + search   .faq-widget
//   - newsletter signup (validated, saved to localStorage)  #newsletterForm
//   - application status tracker (demo data)   #trackerForm
//   - scheme eligibility checker (demo data)   #eligibilityForm
//
// Service search/filter/pagination for catalogue pages (services.html,
// schemes.html, jobs.html, tourism.html) lives in listing-common.js —
// see LISTING-TEMPLATE.md. It isn't duplicated here to avoid two competing
// implementations of the same feature.

(function () {
  var root = document.documentElement;
  var MIN = 80, MAX = 130, STEP = 10, DEFAULT = 100;

  function applyScale(pct) {
    root.style.fontSize = pct + '%';
    try { localStorage.setItem('govFontScale', pct); } catch (e) {}
  }

  // Apply any previously saved text size as soon as this script runs.
  try {
    var saved = parseInt(localStorage.getItem('govFontScale'), 10);
    if (saved) applyScale(saved);
  } catch (e) {}

  document.addEventListener('DOMContentLoaded', function () {
    // Text size controls (A- / A / A+) in the utility bar.
    document.querySelectorAll('[data-fontsize]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var current = parseInt(root.style.fontSize, 10) || DEFAULT;
        var action = btn.dataset.fontsize;
        var next = action === 'inc' ? Math.min(MAX, current + STEP)
                 : action === 'dec' ? Math.max(MIN, current - STEP)
                 : DEFAULT;
        applyScale(next);
      });
    });

    // Header search shortcut: on services.html it focuses the search box in
    // place; on every other page it's a plain link to services.html?focus=search.
    var searchBtn = document.getElementById('headerSearch');
    var serviceSearch = document.getElementById('serviceSearch');
    if (searchBtn && serviceSearch) {
      searchBtn.addEventListener('click', function (e) {
        e.preventDefault();
        serviceSearch.scrollIntoView({ behavior: 'smooth', block: 'center' });
        serviceSearch.focus();
      });
    }
    if (serviceSearch && /[?&]focus=search/.test(window.location.search)) {
      serviceSearch.scrollIntoView({ behavior: 'smooth', block: 'center' });
      serviceSearch.focus();
    }

    // Accessibility panel: opened from the utility-bar toggle or the
    // floating accessibility button, wherever either is present on the page.
    var a11yPanel = document.getElementById('a11yPanel');
    var a11yToggle = document.getElementById('a11yToggle');
    var a11yFab = document.getElementById('a11yFab');
    function toggleA11yPanel(scrollTo) {
      if (!a11yPanel) return;
      var willOpen = a11yPanel.hidden;
      a11yPanel.hidden = !willOpen;
      if (a11yToggle) a11yToggle.setAttribute('aria-expanded', String(willOpen));
      if (willOpen && scrollTo) a11yPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    if (a11yToggle) a11yToggle.addEventListener('click', function () { toggleA11yPanel(false); });
    if (a11yFab) a11yFab.addEventListener('click', function () { toggleA11yPanel(true); });

    initMobileMenu();
    initStatCounters();
    initFaqWidgets();
    initNewsletterForm();
    initStatusTracker();
    initEligibilityChecker();
  });

  // ===================================================================
  // Mobile slide-out navigation drawer
  // ===================================================================
  function initMobileMenu() {
    var toggle = document.getElementById('navToggle');
    var desktopNav = document.getElementById('primaryNav');
    if (!toggle || !desktopNav) return;

    // Hide any legacy inline mobile dropdown left over in the page markup —
    // the drawer built below replaces it.
    var legacyMobileNav = document.getElementById('primaryNavMobile');
    if (legacyMobileNav) legacyMobileNav.hidden = true;

    var backdrop = document.createElement('div');
    backdrop.className = 'mobile-drawer-backdrop';

    var drawer = document.createElement('div');
    drawer.className = 'mobile-drawer';
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-label', 'Site navigation');

    var header = document.createElement('div');
    header.className = 'mobile-drawer-header';
    var title = document.createElement('span');
    // Styled via ".mobile-drawer-header span" in styles.css — no class needed here.
    title.textContent = 'Menu';
    var closeBtn = document.createElement('button');
    closeBtn.type = 'button';
    closeBtn.className = 'mobile-drawer-close';
    closeBtn.setAttribute('aria-label', 'Close menu');
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark" aria-hidden="true"></i>';
    header.appendChild(title);
    header.appendChild(closeBtn);

    var nav = document.createElement('nav');
    nav.className = 'mobile-drawer-nav';
    nav.setAttribute('aria-label', 'Primary mobile');
    Array.prototype.slice.call(desktopNav.querySelectorAll('a')).forEach(function (link) {
      nav.appendChild(link.cloneNode(true));
    });

    drawer.appendChild(header);
    drawer.appendChild(nav);
    document.body.appendChild(backdrop);
    document.body.appendChild(drawer);

    function openDrawer() {
      drawer.classList.add('open');
      backdrop.classList.add('open');
      toggle.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';
      closeBtn.focus();
    }
    function closeDrawer() {
      drawer.classList.remove('open');
      backdrop.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }

    toggle.addEventListener('click', function () {
      if (drawer.classList.contains('open')) closeDrawer(); else openDrawer();
    });
    closeBtn.addEventListener('click', function () { closeDrawer(); toggle.focus(); });
    backdrop.addEventListener('click', closeDrawer);
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', closeDrawer); // close on item click
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && drawer.classList.contains('open')) { closeDrawer(); toggle.focus(); }
    });
  }

  // ===================================================================
  // Animated statistic counters — <div data-counter data-target="500000"
  // data-suffix="+"><span class="counter">0</span></div>
  // ===================================================================
  function initStatCounters() {
    var statEls = Array.prototype.slice.call(document.querySelectorAll('[data-counter]'));
    if (!statEls.length) return;
    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function formatNumber(n) {
      if (Number.isInteger(n)) return Math.round(n).toLocaleString('en-IN');
      return n.toFixed(1);
    }

    function animateCounter(el) {
      var counterEl = el.querySelector('.counter');
      var target = parseFloat(el.dataset.target, 10);
      var suffix = el.dataset.suffix || '';
      if (!counterEl || isNaN(target)) return;

      if (reducedMotion) {
        counterEl.textContent = formatNumber(target) + suffix;
        return;
      }

      // setInterval rather than requestAnimationFrame: a value-counting
      // animation doesn't need paint-sync, and a fixed-interval timer keeps
      // working even in contexts that throttle rAF (some embedded views).
      var duration = 1400, frameMs = 16;
      var totalFrames = Math.round(duration / frameMs);
      var frame = 0;
      var timer = setInterval(function () {
        frame++;
        var progress = Math.min(frame / totalFrames, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        counterEl.textContent = formatNumber(target * eased) + suffix;
        if (progress >= 1) {
          counterEl.textContent = formatNumber(target) + suffix;
          clearInterval(timer);
        }
      }, frameMs);
    }

    var pending = statEls.slice();
    function hasReachedViewport(el) {
      var rect = el.getBoundingClientRect();
      var viewportH = window.innerHeight || document.documentElement.clientHeight;
      return rect.top < viewportH * 0.85;
    }
    function checkStats() {
      if (!pending.length) return;
      pending = pending.filter(function (el) {
        if (hasReachedViewport(el)) { animateCounter(el); return false; }
        return true;
      });
      if (!pending.length) {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('resize', onScroll);
      }
    }
    var lastCheck = 0;
    function onScroll() {
      var now = Date.now();
      if (now - lastCheck < 100) return;
      lastCheck = now;
      checkStats();
    }
    checkStats();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  // ===================================================================
  // FAQ accordion (smooth expand/collapse) + optional search
  // Markup: <div class="faq-widget"> <input class="faq-widget-search">
  //   <div class="faq-list"><details class="faq-item"><summary>Q</summary>
  //   <div class="faq-panel"><div class="faq-panel-inner">A</div></div>
  //   </details>...</div><p class="faq-no-results">No matches.</p></div>
  // ===================================================================
  function initFaqWidgets() {
    document.querySelectorAll('.faq-widget').forEach(function (widget) {
      var items = Array.prototype.slice.call(widget.querySelectorAll('.faq-item'));

      items.forEach(function (item) {
        var summary = item.querySelector('summary');
        var panel = item.querySelector('.faq-panel');
        if (!summary || !panel) return;

        function setOpen(isOpen, animate) {
          // setTimeout(fn, 0) rather than requestAnimationFrame to force the
          // browser to apply the starting style before the transition target
          // is set — a plain timer keeps working in contexts that throttle
          // or suspend rAF, where a transition-triggering rAF callback can
          // simply never run.
          if (isOpen) {
            item.setAttribute('open', '');
            var h = panel.scrollHeight;
            if (animate) {
              panel.style.maxHeight = '0px';
              window.setTimeout(function () { panel.style.maxHeight = h + 'px'; }, 0);
            } else {
              panel.style.maxHeight = h + 'px';
            }
          } else {
            panel.style.maxHeight = panel.scrollHeight + 'px';
            window.setTimeout(function () { panel.style.maxHeight = '0px'; }, 0);
            window.setTimeout(function () { item.removeAttribute('open'); }, 230);
          }
        }

        setOpen(item.hasAttribute('open'), false);
        summary.addEventListener('click', function (e) {
          e.preventDefault();
          setOpen(!item.hasAttribute('open'), true);
        });
        // Keep the answer's max-height correct if the viewport is resized
        // (e.g. text reflows to more lines) while it's open.
        window.addEventListener('resize', function () {
          if (item.hasAttribute('open')) panel.style.maxHeight = panel.scrollHeight + 'px';
        });
      });

      var searchInput = widget.querySelector('.faq-widget-search');
      var noResults = widget.querySelector('.faq-no-results');
      if (searchInput) {
        searchInput.addEventListener('input', function () {
          var q = searchInput.value.trim().toLowerCase();
          var anyVisible = false;
          items.forEach(function (item) {
            var match = !q || item.textContent.toLowerCase().indexOf(q) !== -1;
            item.hidden = !match;
            if (match) anyVisible = true;
          });
          if (noResults) noResults.classList.toggle('show', !anyVisible);
        });
      }
    });
  }

  // ===================================================================
  // Newsletter signup — validated, de-duplicated, saved to localStorage
  // Markup: <form id="newsletterForm"><input type="email" id="newsletterEmail">
  //   <button type="submit">Subscribe</button></form>
  //   <p id="newsletterMsg" hidden></p>
  // ===================================================================
  function initNewsletterForm() {
    var form = document.getElementById('newsletterForm');
    var emailInput = document.getElementById('newsletterEmail');
    var msg = document.getElementById('newsletterMsg');
    if (!form || !emailInput) return;

    var LS_KEY = 'govPortalNewsletterSubscribers';
    var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    function showMsg(text, tone) {
      if (!msg) return;
      msg.hidden = false;
      msg.className = 'newsletter-msg ' + tone;
      msg.innerHTML = '<i class="fa-solid ' + (tone === 'success' ? 'fa-circle-check' : 'fa-circle-exclamation') + '" aria-hidden="true"></i> ' + text;
    }

    function getSubscribers() {
      try { return JSON.parse(localStorage.getItem(LS_KEY)) || []; } catch (e) { return []; }
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = emailInput.value.trim();

      if (!email) {
        showMsg('Please enter your email address.', 'error');
        emailInput.focus();
        return;
      }
      if (!EMAIL_RE.test(email)) {
        showMsg('That doesn’t look like a valid email address.', 'error');
        emailInput.focus();
        return;
      }

      var subscribers = getSubscribers();
      var already = subscribers.some(function (s) { return s.toLowerCase() === email.toLowerCase(); });
      if (already) {
        showMsg('You’re already subscribed with that address.', 'error');
        return;
      }

      subscribers.push(email);
      try { localStorage.setItem(LS_KEY, JSON.stringify(subscribers)); } catch (e) {}
      showMsg('You’re subscribed! Watch for updates in your inbox.', 'success');
      form.reset();
    });
  }

  // ===================================================================
  // Application status tracker — demo data only, no backend.
  // Markup: <form id="trackerForm"><input id="trackerRef"><button>...</button></form>
  //   <p id="trackerError" hidden role="alert"></p>
  //   <section id="trackerResult" hidden>
  //     <span id="trackerResultRef"></span> <span id="trackerResultService"></span>
  //     <span id="trackerStatusBadge"></span>
  //     <ol id="trackerTimeline"></ol>
  //     <p id="trackerEta"></p>  <p id="trackerRemark" hidden></p>
  //   </section>
  // ===================================================================
  function initStatusTracker() {
    var form = document.getElementById('trackerForm');
    var refInput = document.getElementById('trackerRef');
    if (!form || !refInput) return;

    var errorEl = document.getElementById('trackerError');
    var resultEl = document.getElementById('trackerResult');
    var resultRefEl = document.getElementById('trackerResultRef');
    var resultServiceEl = document.getElementById('trackerResultService');
    var badgeEl = document.getElementById('trackerStatusBadge');
    var timelineEl = document.getElementById('trackerTimeline');
    var etaEl = document.getElementById('trackerEta');
    var remarkEl = document.getElementById('trackerRemark');

    // Curated demo records — always return the same result for these IDs.
    var DEMO = {
      'GOV-2026-1842': { service: 'Income certificate', status: 'approved', submitted: '20 Aug 2026', eta: '27 Aug 2026' },
      'GOV-2026-2044': { service: 'Passport renewal', status: 'processing', submitted: '02 Sep 2026', eta: '17 Sep 2026' },
      'GOV-2026-3310': { service: 'Driving licence renewal', status: 'submitted', submitted: '08 Sep 2026', eta: '15 Sep 2026' },
      'GOV-2026-4090': { service: 'Business registration', status: 'rejected', submitted: '25 Aug 2026', eta: null, remark: 'Address proof submitted was more than 3 months old — please resubmit a recent document.' },
    };
    // For any other reference: a small set of plausible fallback records,
    // picked deterministically from the reference text so the same ID
    // always shows the same demo result.
    var FALLBACK = [
      { service: 'Identity and address update', status: 'submitted', etaDays: 5 },
      { service: 'Vital records request', status: 'processing', etaDays: 3 },
      { service: 'Certificate application', status: 'approved', etaDays: 0 },
    ];

    function hashCode(str) {
      var h = 0;
      for (var i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
      return Math.abs(h);
    }
    function formatDateOffset(days) {
      var d = new Date();
      d.setDate(d.getDate() + days);
      return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    }
    function lookup(ref) {
      var key = ref.trim().toUpperCase();
      if (DEMO[key]) return Object.assign({ ref: key }, DEMO[key]);
      var template = FALLBACK[hashCode(key) % FALLBACK.length];
      return Object.assign({ ref: key }, template, { submitted: formatDateOffset(-4), eta: template.etaDays === 0 ? null : formatDateOffset(template.etaDays) });
    }

    var STATUS_META = {
      submitted:  { label: 'Submitted',  pillClass: 'status-pending',  icon: 'fa-inbox' },
      processing: { label: 'Processing', pillClass: 'status-review',   icon: 'fa-gears' },
      approved:   { label: 'Approved',   pillClass: 'status-approved', icon: 'fa-circle-check' },
      rejected:   { label: 'Rejected',   pillClass: 'status-rejected', icon: 'fa-circle-xmark' },
    };

    function renderTimeline(status) {
      var stages = ['submitted', 'processing', status === 'rejected' ? 'rejected' : 'approved'];
      var stageLabels = { submitted: 'Application submitted', processing: 'Processing & document review', approved: 'Approved', rejected: 'Rejected' };
      var reachedIndex = { submitted: 0, processing: 1, approved: 2, rejected: 2 }[status];

      timelineEl.innerHTML = stages.map(function (stage, i) {
        var cls = i < reachedIndex ? 'done' : i === reachedIndex ? (stage === 'rejected' ? 'rejected' : 'current') : '';
        var dotContent = i < reachedIndex
          ? '<i class="fa-solid fa-check" aria-hidden="true"></i>'
          : (i === reachedIndex && stage === 'rejected' ? '<i class="fa-solid fa-xmark" aria-hidden="true"></i>' : (i + 1));
        return '<li class="tracker-step ' + cls + '">' +
          '<span class="tracker-dot">' + dotContent + '</span>' +
          '<div><p class="font-semibold" style="color:var(--gray-900)">' + stageLabels[stage] + '</p>' +
          '<p class="text-sm" style="color:var(--gray-500)">' + (i <= reachedIndex ? 'Complete' : 'Pending') + '</p></div>' +
          '</li>';
      }).join('');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var value = refInput.value.trim();
      if (value.length < 6) {
        if (errorEl) errorEl.hidden = false;
        if (resultEl) resultEl.hidden = true;
        refInput.focus();
        return;
      }
      if (errorEl) errorEl.hidden = true;

      var record = lookup(value);
      var meta = STATUS_META[record.status];

      if (resultRefEl) resultRefEl.textContent = record.ref;
      if (resultServiceEl) resultServiceEl.textContent = record.service;
      if (badgeEl) {
        badgeEl.className = 'status-pill ' + meta.pillClass;
        badgeEl.innerHTML = '<i class="fa-solid ' + meta.icon + '" aria-hidden="true"></i> ' + meta.label;
      }
      renderTimeline(record.status);
      if (etaEl) {
        etaEl.innerHTML = record.eta
          ? '<i class="fa-solid fa-calendar-days" aria-hidden="true"></i> Estimated completion: <strong>' + record.eta + '</strong>'
          : '';
        etaEl.hidden = !record.eta;
      }
      if (remarkEl) {
        remarkEl.hidden = !record.remark;
        if (record.remark) remarkEl.textContent = record.remark;
      }

      if (resultEl) {
        resultEl.hidden = false;
        resultEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // ===================================================================
  // Scheme eligibility checker — simple rule-based demo matcher.
  // Markup: <form id="eligibilityForm"> with #eqAge, #eqEmployment,
  //   #eqIncome selects and #eqDisability/#eqGirlChild/#eqWidow checkboxes,
  //   plus <div id="eligibilityResults" hidden></div>
  // ===================================================================
  function initEligibilityChecker() {
    var form = document.getElementById('eligibilityForm');
    var resultsEl = document.getElementById('eligibilityResults');
    if (!form || !resultsEl) return;

    var SCHEMES = [
      { name: 'Old Age Pension Scheme', benefit: 'Monthly financial support for senior citizens with limited income.', href: 'application-status.html', match: function (a) { return a.age === '60plus'; } },
      { name: 'Small Business Support Grant', benefit: 'One-time grant for registering a new small business or micro-enterprise.', href: 'application-status.html', match: function (a) { return a.employment === 'selfemployed'; } },
      { name: 'Merit Scholarship for Students', benefit: 'Tuition support for students from low-income households with strong academic records.', href: 'application-status.html', match: function (a) { return a.employment === 'student'; } },
      { name: 'Health Insurance for Families', benefit: 'Cashless hospital treatment coverage for eligible low-income families.', href: 'application-status.html', match: function (a) { return a.income === 'low'; } },
      { name: 'Skill Development Training', benefit: 'Free vocational training and job placement support for jobseekers.', href: 'jobs.html', match: function (a) { return a.employment === 'unemployed' || a.employment === 'student'; } },
      { name: 'Disability Support Allowance', benefit: 'Monthly allowance and equipment support for persons with certified disabilities.', href: 'application-status.html', match: function (a) { return a.disability; } },
      { name: 'Widow & Single-Parent Support', benefit: 'Monthly income support and priority access to housing schemes.', href: 'application-status.html', match: function (a) { return a.widow; } },
      { name: 'Farmer Crop Insurance Subsidy', benefit: 'Subsidised crop insurance premiums for registered smallholder farmers.', href: 'application-status.html', match: function (a) { return a.employment === 'farmer'; } },
      { name: 'Girl Child Education Incentive', benefit: 'Cash incentive paid at key school milestones to support girls’ education.', href: 'application-status.html', match: function (a) { return a.girlchild; } },
    ];

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var answers = {
        age: (document.getElementById('eqAge') || {}).value,
        employment: (document.getElementById('eqEmployment') || {}).value,
        income: (document.getElementById('eqIncome') || {}).value,
        disability: !!(document.getElementById('eqDisability') || {}).checked,
        girlchild: !!(document.getElementById('eqGirlChild') || {}).checked,
        widow: !!(document.getElementById('eqWidow') || {}).checked,
      };

      var matches = SCHEMES.filter(function (s) { return s.match(answers); });

      resultsEl.hidden = false;
      if (!matches.length) {
        resultsEl.innerHTML =
          '<div class="empty-state"><i class="fa-solid fa-magnifying-glass" style="display:block" aria-hidden="true"></i>' +
          'No specific matches for these answers — <a href="schemes.html" style="color:var(--gov-blue); font-weight:600">browse all schemes</a> to see the full list.</div>';
      } else {
        resultsEl.innerHTML =
          '<p class="font-semibold mb-3" style="color:var(--gray-900)">' + matches.length + ' scheme' + (matches.length === 1 ? '' : 's') + ' you may be eligible for:</p>' +
          '<div style="display:flex; flex-direction:column; gap:.75rem">' +
          matches.map(function (s) {
            return '<div class="card eligibility-result-card"><h3 class="card-title">' + s.name + '</h3>' +
              '<p class="card-text mt-1">' + s.benefit + '</p>' +
              '<a href="' + s.href + '" class="card-link">Check eligibility &amp; apply <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div>';
          }).join('') +
          '</div>' +
          '<p class="text-xs mt-3" style="color:var(--gray-400)">This is a simplified demo check — final eligibility is confirmed during the actual application.</p>';
      }
      resultsEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
})();
