# Citizen Services Portal — Prototype

**⚠ This is a non-official, front-end-only demonstration.** It is not affiliated with any real
government, does not use real Aadhaar/UIDAI, NPCI, or payment data, and must not be deployed
as-is or presented as an official government service. Every "government" name, emblem, and
domain reference in these files (`Government of Bharatpradesh`, `.gov.in` styling, etc.) is a
placeholder for layout purposes only.

## What this is

A static HTML + Tailwind CSS prototype of a citizen services portal, covering the citizen-facing
journey and an admin/officer backoffice, wired together with `localStorage` so the flows feel
connected (no server, no database, no real integrations).

Open [`index.html`](index.html) in a browser to start.

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Home page — search, service categories, announcements |
| `login.html` | Simulated SSO with method choice (Aadhaar OTP / mobile OTP / biometric / password) + OTP step |
| `dashboard.html` | Citizen dashboard — application stats, recent applications, notifications, vault preview |
| `services.html` | Service catalog with search + category filters |
| `apply.html` | 5-step application wizard: applicant details → document upload → review/declaration → payment → confirmation, with draft save/restore |
| `track.html` | Application status tracker with a visual timeline |
| `vault.html` | Digital document vault — upload, "virus scan" simulation, verified/pending badges |
| `payment.html` | Standalone bill payment (e.g. property tax) with UPI/card/net-banking tabs and a receipt |
| `grievance.html` | Grievance submission + ticket status tracking |
| `admin.html` | Backoffice: role switcher (Super Admin / Dept Admin / Officer), application approve/reject/escalate, CMS announcements, a rules-engine form, users & roles, audit trail |
| `help.html`, `contact.html`, `feedback.html` | Supporting pages linked from every page's header/footer |

Shared header, footer, language toggle (EN/HI demo), accessibility toolbar, chatbot widget, and
the mock data layer live in `assets/shared.js` / `assets/shared.css`.

## What's real vs. simulated

**Implemented in this prototype:**
- Full UI/UX for every flow listed above, responsive (mobile/tablet/desktop)
- Client-side "backend": applications, documents, tickets and audit log persist in
  `localStorage`, so submitting an application in `apply.html` shows up in `dashboard.html`,
  `track.html`, and can be approved/rejected in `admin.html`
- Basic accessibility: skip link, semantic landmarks, ARIA labels, visible focus rings, a
  text-size/high-contrast toolbar, status shown as icon+text+color (not color alone)
- A canned-answer chatbot widget (keyword matching, not a real AI/LLM call)
- A language switch demonstrating i18n structure (`data-i18n` attributes) for a small string set

**Deliberately NOT implemented** (needs real infrastructure, credentials, or legal authorization
that this session doesn't have):
- Real Aadhaar/UIDAI e-KYC, NPCI/UPI, or any payment gateway — all payments/OTPs are simulated
- Any backend service, database, message queue, or cloud deployment
- Real virus scanning, digital signatures (eSign), or SMS/email delivery
- Real authentication/session security (MFA is a UI flow only — there's no token, no server session)
- A `.gov.in` domain, CDN, load balancers, or monitoring stack
- Formal STQC certification, penetration testing, or legal DPDP/GIGW compliance sign-off — the
  checklist below shows what a real team would need to satisfy each requirement

## Architecture plan (for a real implementation)

If this prototype becomes a real project, a reasonable next step is:

- **Frontend**: Next.js (React) rebuilding these pages as components, PWA-enabled for offline
  form drafts
- **Backend**: microservices (Node.js or Java Spring Boot) behind an API gateway — separate
  services for applications, documents, payments, notifications, and identity
- **Data**: PostgreSQL (primary), Redis (session/cache), S3-compatible object storage for
  documents (with server-side AES-256 encryption)
- **Async**: Kafka or RabbitMQ for notification fan-out and document virus-scan jobs
- **Identity**: integrate with UIDAI's Aadhaar e-KYC APIs only under a formal AUA/KUA agreement;
  NPCI/UPI and a PCI-DSS-compliant payment aggregator for payments
- **Infra**: containerized (Docker/Kubernetes) on an empanelled cloud (MeitY-empanelled CSP for
  a real Indian government deployment), with staging + production environments, CI/CD
  (GitHub Actions), and Prometheus/Grafana + ELK for monitoring
- **Data residency**: all citizen data hosted in India-region infrastructure, per DPDP Act 2023

## Compliance checklist (status against this prototype)

| Requirement | Status here | To reach production |
|---|---|---|
| WCAG 2.1 AA | Partially addressed (focus states, ARIA, skip link, contrast toolbar, resizable text) | Full axe/Lighthouse/NVDA/JAWS audit, captions for any media, keyboard-only QA pass |
| GIGW 3.0 | Structural conventions followed (footer policies, help/contact links, National Portal link, no "under construction" pages) | Legal/editorial review against the full GIGW 3.0 checklist |
| DPDP Act 2023 | Placeholder privacy policy link only | Real consent flows, data minimization, grievance officer designation, data localization |
| Security (TLS, MFA, WAF, rate limiting) | UI simulation only | Real TLS termination, MFA with a real IdP, WAF/DDoS protection, pen testing, STQC certification |
| Data residency | N/A (no server) | India-region hosting for all citizen data stores and backups |

## Running it

No build step — open `index.html` directly, or serve the `gov-portal/` folder with any static
file server for cleaner relative links (recommended, since `localStorage` and file:// links work
best over `http://localhost`).

```bash
npx serve gov-portal
```
