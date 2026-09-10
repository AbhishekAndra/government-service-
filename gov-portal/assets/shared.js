/* ===========================================================
   Shared runtime — Citizen Services Portal (PROTOTYPE)
   Provides: header/footer injection, accessibility toolbar,
   language toggle, mock auth, mock data store (localStorage),
   and a canned-answer chatbot widget.
   NOTE: everything here is a client-side simulation. There is
   no real backend, no real Aadhaar/UIDAI/payment integration.
=========================================================== */

const GOV = (function () {
  const LS_APPLICATIONS = 'gov_portal_applications';
  const LS_USER = 'gov_portal_user';
  const LS_LANG = 'gov_portal_lang';
  const LS_A11Y = 'gov_portal_a11y';
  const LS_TICKETS = 'gov_portal_tickets';

  // ---------- i18n (demo subset only) ----------
  const DICT = {
    en: {
      home: 'Home', services: 'Services', dashboard: 'Dashboard', track: 'Track Application',
      vault: 'Document Vault', grievance: 'Grievance', admin: 'Admin', login: 'Login', logout: 'Log out',
      search_ph: 'Search services, forms, documents…', help: 'Help', contact: 'Contact Us', feedback: 'Feedback',
      skip: 'Skip to main content', national_portal: 'National Portal of India', copyright: 'Content owned by the Department of Citizen Services (prototype).',
    },
    hi: {
      home: 'होम', services: 'सेवाएँ', dashboard: 'डैशबोर्ड', track: 'आवेदन ट्रैक करें',
      vault: 'दस्तावेज़ वॉल्ट', grievance: 'शिकायत', admin: 'व्यवस्थापक', login: 'लॉगिन', logout: 'लॉग आउट',
      search_ph: 'सेवाएँ, फॉर्म, दस्तावेज़ खोजें…', help: 'सहायता', contact: 'संपर्क करें', feedback: 'प्रतिक्रिया',
      skip: 'मुख्य सामग्री पर जाएँ', national_portal: 'भारत का राष्ट्रीय पोर्टल', copyright: 'सामग्री नागरिक सेवा विभाग (प्रोटोटाइप) के स्वामित्व में है।',
    },
  };

  function getLang() { return localStorage.getItem(LS_LANG) || 'en'; }
  function setLang(l) { localStorage.setItem(LS_LANG, l); applyLang(); }
  function t(key) { const d = DICT[getLang()] || DICT.en; return d[key] || DICT.en[key] || key; }
  function applyLang() {
    document.documentElement.lang = getLang();
    document.querySelectorAll('[data-i18n]').forEach(el => {
      el.textContent = t(el.getAttribute('data-i18n'));
    });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => {
      el.setAttribute('placeholder', t(el.getAttribute('data-i18n-ph')));
    });
    const sel = document.getElementById('langToggle');
    if (sel) sel.value = getLang();
  }

  // ---------- Accessibility toolbar ----------
  function getA11y() { try { return JSON.parse(localStorage.getItem(LS_A11Y)) || { size: 0, contrast: false }; } catch { return { size: 0, contrast: false }; } }
  function setA11y(a) { localStorage.setItem(LS_A11Y, JSON.stringify(a)); applyA11y(); }
  function applyA11y() {
    const a = getA11y();
    document.documentElement.classList.remove('a11y-large', 'a11y-larger');
    if (a.size === 1) document.documentElement.classList.add('a11y-large');
    if (a.size >= 2) document.documentElement.classList.add('a11y-larger');
    document.documentElement.classList.toggle('a11y-contrast', !!a.contrast);
  }

  // ---------- Mock auth ----------
  function getUser() { try { return JSON.parse(localStorage.getItem(LS_USER)); } catch { return null; } }
  function setUser(u) { localStorage.setItem(LS_USER, JSON.stringify(u)); }
  function logout() { localStorage.removeItem(LS_USER); window.location.href = 'index.html'; }

  // ---------- Mock applications data store ----------
  function seedApplications() {
    if (localStorage.getItem(LS_APPLICATIONS)) return;
    const seed = [
      { id: 'APP-88231', service: 'Income Certificate', applicant: 'Demo Citizen', date: '2026-09-05', status: 'Under Review', dept: 'Revenue Department', timeline: [
        { date: '2026-09-05 10:02', label: 'Application submitted', by: 'Citizen' },
        { date: '2026-09-06 14:20', label: 'Assigned to Revenue Officer', by: 'System' },
        { date: '2026-09-07 11:45', label: 'Under document verification', by: 'R. Nambiar (OF-1187)' },
      ]},
      { id: 'APP-88190', service: 'Domicile Certificate', applicant: 'Demo Citizen', date: '2026-08-20', status: 'Approved', dept: 'Revenue Department', timeline: [
        { date: '2026-08-20 09:15', label: 'Application submitted', by: 'Citizen' },
        { date: '2026-08-22 16:00', label: 'Approved', by: 'S. Iyer (OF-2043)' },
      ]},
      { id: 'APP-88104', service: 'Trade License', applicant: 'Demo Citizen', date: '2026-08-02', status: 'Rejected', dept: 'Municipal Corporation', timeline: [
        { date: '2026-08-02 12:00', label: 'Application submitted', by: 'Citizen' },
        { date: '2026-08-05 10:30', label: 'Rejected — incomplete address proof', by: 'K. Bose (OF-1560)' },
      ]},
    ];
    localStorage.setItem(LS_APPLICATIONS, JSON.stringify(seed));
  }
  function getApplications() { seedApplications(); try { return JSON.parse(localStorage.getItem(LS_APPLICATIONS)) || []; } catch { return []; } }
  function saveApplications(list) { localStorage.setItem(LS_APPLICATIONS, JSON.stringify(list)); }
  function addApplication(app) {
    const list = getApplications();
    list.unshift(app);
    saveApplications(list);
  }
  function updateApplicationStatus(id, status, note, officer) {
    const list = getApplications();
    const app = list.find(a => a.id === id);
    if (!app) return;
    app.status = status;
    app.timeline = app.timeline || [];
    app.timeline.push({ date: new Date().toISOString().slice(0, 16).replace('T', ' '), label: `${status}${note ? ' — ' + note : ''}`, by: officer || 'Officer' });
    saveApplications(list);
  }

  // ---------- Mock grievance tickets ----------
  function seedTickets() {
    if (localStorage.getItem(LS_TICKETS)) return;
    localStorage.setItem(LS_TICKETS, JSON.stringify([
      { id: 'TCK-5521', subject: 'Payment deducted but receipt not generated', status: 'In Progress', date: '2026-09-04' },
    ]));
  }
  function getTickets() { seedTickets(); try { return JSON.parse(localStorage.getItem(LS_TICKETS)) || []; } catch { return []; } }
  function addTicket(ticket) { const list = getTickets(); list.unshift(ticket); localStorage.setItem(LS_TICKETS, JSON.stringify(list)); }

  function genId(prefix) { return prefix + '-' + Math.floor(10000 + Math.random() * 89999); }

  // ---------- Header / Footer ----------
  function headerHTML(active) {
    const user = getUser();
    const nav = [
      ['index.html', 'home', 'Home'],
      ['services.html', 'services', 'Services'],
      ['dashboard.html', 'dashboard', 'Dashboard'],
      ['track.html', 'track', 'Track Application'],
      ['vault.html', 'vault', 'Document Vault'],
      ['grievance.html', 'grievance', 'Grievance'],
    ];
    const navHTML = nav.map(([href, key, label]) => `
      <a href="${href}" data-i18n="${key}"
         class="focus-ring px-3 py-2 text-sm font-medium rounded-md ${active === key ? 'bg-white/15 text-white' : 'text-blue-100 hover:text-white hover:bg-white/10'}">${label}</a>
    `).join('');

    return `
    <div class="demo-banner">⚠ PROTOTYPE — Demonstration only. Not an official Government of India website. No real Aadhaar, payment, or government data is used.</div>
    <div class="tricolor-strip"></div>
    <header class="bg-[var(--gov-navy)] text-white sticky top-0 z-40 shadow-md">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4 flex-wrap">
        <a href="index.html" class="flex items-center gap-3">
          <span class="emblem-badge" aria-hidden="true">
            <svg viewBox="0 0 24 24" class="w-5 h-5 text-white" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2.2" fill="currentColor" stroke="none"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" /></svg>
          </span>
          <span class="leading-tight">
            <span class="block text-[11px] tracking-wide text-blue-100 uppercase">Government of Bharatpradesh (Demo)</span>
            <span class="block text-base font-bold">Citizen Services Portal</span>
          </span>
        </a>
        <nav aria-label="Primary" class="hidden xl:flex items-center gap-1">${navHTML}</nav>
        <div class="flex items-center gap-2">
          <select id="langToggle" aria-label="Choose language" class="focus-ring text-xs bg-white/10 border border-white/20 rounded-md px-2 py-1.5 text-white">
            <option value="en">EN</option>
            <option value="hi">हिंदी</option>
          </select>
          ${user
            ? `<span class="hidden sm:inline text-xs text-blue-100">Hi, <strong class="text-white">${user.name}</strong></span>
               <button id="logoutBtn" data-i18n="logout" class="focus-ring bg-white/10 hover:bg-white/20 border border-white/20 rounded-md px-3 py-2 text-xs font-semibold">Log out</button>`
            : `<a href="login.html" data-i18n="login" class="focus-ring bg-[var(--gov-saffron)] hover:brightness-95 text-slate-900 rounded-md px-3 py-2 text-xs font-bold">Login</a>`
          }
        </div>
      </div>
      <nav aria-label="Primary mobile" class="xl:hidden flex flex-wrap gap-1 px-4 pb-2 -mt-1">${navHTML}</nav>
    </header>
    <div class="bg-slate-100 border-b border-slate-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-1.5 flex items-center justify-between text-xs text-slate-500 flex-wrap gap-1">
        <div class="flex items-center gap-3">
          <button id="a11yBtn" class="focus-ring underline decoration-dotted hover:text-[var(--gov-blue)]" aria-haspopup="true" aria-expanded="false">Accessibility ⚙</button>
          <a href="help.html" data-i18n="help" class="hover:underline">Help</a>
          <a href="contact.html" data-i18n="contact" class="hover:underline">Contact Us</a>
        </div>
        <a href="https://www.india.gov.in" target="_blank" rel="noopener" class="hover:underline flex items-center gap-1" data-i18n="national_portal">
          National Portal of India ↗
        </a>
      </div>
    </div>
    <div id="a11yPanel" hidden class="max-w-7xl mx-auto px-4 sm:px-6 mt-2">
      <div class="bg-white border border-slate-300 rounded-lg shadow-lg p-3 flex flex-wrap items-center gap-3 text-sm">
        <span class="font-semibold text-slate-600">Text size:</span>
        <button data-a11y-size="0" class="focus-ring px-2 py-1 border rounded">A</button>
        <button data-a11y-size="1" class="focus-ring px-2 py-1 border rounded text-lg">A</button>
        <button data-a11y-size="2" class="focus-ring px-2 py-1 border rounded text-xl">A</button>
        <span class="w-px h-5 bg-slate-200"></span>
        <button id="a11yContrast" class="focus-ring px-3 py-1 border rounded font-semibold">High contrast</button>
        <span class="text-xs text-slate-400">WCAG 2.1 AA · keyboard &amp; screen-reader friendly</span>
      </div>
    </div>`;
  }

  function footerHTML() {
    return `
    <footer class="bg-[var(--gov-navy-dark)] text-blue-100 mt-16">
      <div class="tricolor-strip"></div>
      <div class="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-1 sm:grid-cols-4 gap-8 text-sm">
        <div>
          <p class="font-bold text-white mb-3">Citizen Services Portal</p>
          <p class="text-blue-200/80 leading-relaxed">A single window for permits, licenses, certificates, tax payments and public records. (Demo instance.)</p>
        </div>
        <div>
          <p class="font-semibold text-white mb-3">Quick Links</p>
          <ul class="space-y-2 text-blue-200/80">
            <li><a href="services.html" class="hover:text-white hover:underline">All Services</a></li>
            <li><a href="track.html" class="hover:text-white hover:underline">Track Application</a></li>
            <li><a href="grievance.html" class="hover:text-white hover:underline">Grievance Redressal</a></li>
            <li><a href="admin.html" class="hover:text-white hover:underline">Admin / Officer Login</a></li>
          </ul>
        </div>
        <div>
          <p class="font-semibold text-white mb-3">Policies</p>
          <ul class="space-y-2 text-blue-200/80">
            <li><a href="#" class="hover:text-white hover:underline">Terms of Use</a></li>
            <li><a href="#" class="hover:text-white hover:underline">Privacy Policy (DPDP Act 2023)</a></li>
            <li><a href="#" class="hover:text-white hover:underline">Accessibility Statement</a></li>
            <li><a href="#" class="hover:text-white hover:underline">Copyright Policy</a></li>
            <li><a href="#" class="hover:text-white hover:underline">Website Policies (GIGW 3.0)</a></li>
          </ul>
        </div>
        <div>
          <p class="font-semibold text-white mb-3">Contact</p>
          <ul class="space-y-2 text-blue-200/80">
            <li>Helpline: 1800-XXX-XXXX (toll-free, 24×7)</li>
            <li>Email: helpdesk@example-gov-demo.in</li>
            <li><a href="contact.html" class="hover:text-white hover:underline">Contact Us form</a></li>
            <li><a href="feedback.html" class="hover:text-white hover:underline">Send Feedback</a></li>
          </ul>
        </div>
      </div>
      <div class="border-t border-white/10">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-blue-200/70">
          <p data-i18n="copyright">Content owned by the Department of Citizen Services (prototype).</p>
          <p>Last updated: 09 Sep 2026 · Best viewed on all modern browsers · <a href="#" class="underline">Site Map</a></p>
        </div>
      </div>
    </footer>`;
  }

  function mount() {
    const h = document.getElementById('site-header');
    const f = document.getElementById('site-footer');
    if (h) h.outerHTML = headerHTML(h.dataset.active || '');
    if (f) f.outerHTML = footerHTML();

    applyLang();
    applyA11y();

    const langSel = document.getElementById('langToggle');
    if (langSel) { langSel.value = getLang(); langSel.addEventListener('change', e => setLang(e.target.value)); }

    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) logoutBtn.addEventListener('click', logout);

    const a11yBtn = document.getElementById('a11yBtn');
    const a11yPanel = document.getElementById('a11yPanel');
    if (a11yBtn && a11yPanel) {
      a11yBtn.addEventListener('click', () => {
        const open = a11yPanel.hidden;
        a11yPanel.hidden = !open;
        a11yBtn.setAttribute('aria-expanded', String(open));
      });
      a11yPanel.querySelectorAll('[data-a11y-size]').forEach(btn => {
        btn.addEventListener('click', () => setA11y({ ...getA11y(), size: Number(btn.dataset.a11ySize) }));
      });
      const contrastBtn = document.getElementById('a11yContrast');
      contrastBtn.addEventListener('click', () => setA11y({ ...getA11y(), contrast: !getA11y().contrast }));
    }

    initChatbot();
  }

  // ---------- Chatbot widget ----------
  const FAQ = [
    { k: ['track', 'status'], a: 'You can track any application from the "Track Application" page using your Application ID (e.g. APP-88231).' },
    { k: ['document', 'upload'], a: 'Accepted formats are PDF, JPG and PNG, up to 5 MB per file. All uploads are scanned before being stored in your Document Vault.' },
    { k: ['payment', 'pay', 'fee'], a: 'Payments can be made via UPI, debit/credit card or net banking. A receipt is generated instantly after a successful payment.' },
    { k: ['login', 'otp', 'aadhaar'], a: 'You can sign in with your mobile OTP, Aadhaar-based OTP, or biometric verification at supported centres.' },
    { k: ['grievance', 'complaint'], a: 'Raise a grievance from the "Grievance" page — you\'ll get a ticket ID and can track its resolution status there.' },
    { k: ['language', 'hindi'], a: 'Use the language switch (EN / हिंदी) at the top-right of every page.' },
  ];
  function faqAnswer(msg) {
    const m = msg.toLowerCase();
    const hit = FAQ.find(f => f.k.some(k => m.includes(k)));
    return hit ? hit.a : 'I can help with tracking applications, document uploads, payments, login/OTP, grievances and language settings. Could you rephrase your question, or visit the Help page for full guidance?';
  }
  function initChatbot() {
    if (document.getElementById('chatbotRoot')) return;
    const root = document.createElement('div');
    root.id = 'chatbotRoot';
    root.innerHTML = `
      <button id="chatbotToggle" aria-label="Open citizen support chat" class="focus-ring fixed bottom-5 right-5 z-50 w-14 h-14 rounded-full bg-[var(--gov-blue)] hover:bg-blue-800 text-white shadow-xl flex items-center justify-center">
        <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-9 8.4A8.5 8.5 0 1 1 21 11.5Z"/></svg>
      </button>
      <div id="chatbotPanel" hidden class="fixed bottom-24 right-5 z-50 w-[92vw] max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 flex flex-col chat-bubble-enter" style="height:26rem;">
        <div class="bg-[var(--gov-navy)] text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
          <div>
            <p class="font-semibold text-sm">Citizen Support Assistant</p>
            <p class="text-[11px] text-blue-200">Available 24×7 · AI-assisted (demo)</p>
          </div>
          <button id="chatbotClose" aria-label="Close chat" class="focus-ring w-8 h-8 rounded-full hover:bg-white/10 flex items-center justify-center">
            <svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
          </button>
        </div>
        <div id="chatbotMessages" class="flex-1 overflow-y-auto p-3 space-y-2 text-sm bg-slate-50"></div>
        <form id="chatbotForm" class="border-t border-slate-200 p-2 flex gap-2">
          <label for="chatbotInput" class="sr-only">Type your question</label>
          <input id="chatbotInput" type="text" placeholder="Ask about services, status, payments…" class="focus-ring flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"/>
          <button type="submit" class="focus-ring px-3 py-2 rounded-lg bg-[var(--gov-blue)] text-white text-sm font-semibold">Send</button>
        </form>
      </div>`;
    document.body.appendChild(root);

    const panel = document.getElementById('chatbotPanel');
    const msgs = document.getElementById('chatbotMessages');
    function addMsg(text, who) {
      const bubble = document.createElement('div');
      bubble.className = who === 'bot'
        ? 'bg-white border border-slate-200 rounded-lg rounded-tl-none px-3 py-2 max-w-[85%]'
        : 'bg-[var(--gov-blue)] text-white rounded-lg rounded-tr-none px-3 py-2 max-w-[85%] ml-auto';
      bubble.textContent = text;
      msgs.appendChild(bubble);
      msgs.scrollTop = msgs.scrollHeight;
    }
    document.getElementById('chatbotToggle').addEventListener('click', () => {
      panel.hidden = !panel.hidden;
      if (!panel.hidden && !msgs.childElementCount) {
        addMsg('Namaste! I\'m your citizen support assistant. Ask me about applications, documents, payments or grievances.', 'bot');
      }
    });
    document.getElementById('chatbotClose').addEventListener('click', () => { panel.hidden = true; });
    document.getElementById('chatbotForm').addEventListener('submit', e => {
      e.preventDefault();
      const input = document.getElementById('chatbotInput');
      const val = input.value.trim();
      if (!val) return;
      addMsg(val, 'user');
      input.value = '';
      setTimeout(() => addMsg(faqAnswer(val), 'bot'), 350);
    });
  }

  function toast(message, tone = 'default') {
    let host = document.getElementById('gov-toast-host');
    if (!host) {
      host = document.createElement('div');
      host.id = 'gov-toast-host';
      host.className = 'fixed top-4 right-4 z-[60] flex flex-col gap-2';
      host.setAttribute('role', 'status');
      host.setAttribute('aria-live', 'polite');
      document.body.appendChild(host);
    }
    const tones = { default: 'bg-slate-800', success: 'bg-emerald-600', warning: 'bg-orange-500', danger: 'bg-red-600' };
    const el = document.createElement('div');
    el.className = `${tones[tone]} text-white text-sm px-4 py-3 rounded-lg shadow-lg max-w-xs`;
    el.textContent = message;
    host.appendChild(el);
    setTimeout(() => { el.style.opacity = '0'; el.style.transition = 'opacity .3s'; setTimeout(() => el.remove(), 300); }, 3200);
  }

  document.addEventListener('DOMContentLoaded', mount);

  return {
    t, getLang, setLang, getUser, setUser, logout,
    getApplications, saveApplications, addApplication, updateApplicationStatus,
    getTickets, addTicket, genId, toast,
  };
})();
