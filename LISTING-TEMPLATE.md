# Listing Page Template

The shared pattern behind [services.html](services.html), [schemes.html](schemes.html),
[jobs.html](jobs.html) and [tourism.html](tourism.html). Use `services.html` as the
literal copy-paste starting point for any new listing page — it has every piece below.

Builds on the base design system: see [DESIGN-SYSTEM.md](DESIGN-SYSTEM.md) for colors,
type scale, and the general `<head>`/navbar/footer contract every page follows.

## Structure

1. **Utility bar + navbar** — copied verbatim from `home.html`, only the `aria-current`/
   `.active` class moves to whichever nav link matches the current page.
2. **Breadcrumb** — inside either a `.page-hero` banner (services/schemes/jobs) or
   overlaid on a photo hero (tourism):
   ```html
   <nav class="breadcrumb" aria-label="Breadcrumb">
     <a href="home.html">Home</a><span class="sep">/</span><span class="current">Services</span>
   </nav>
   ```
3. **Search + filter card** — one `.card` holding a `.form-control` search input and a
   `.filter-bar` of `.filter-chip` buttons (`role="group"`, one `data-filter="All"` chip
   plus one per category, `aria-pressed` tracks the active one).
4. **Card grid** — `<div id="...Grid" class="grid sm:grid-cols-2 gap-4">` of `.listing-card
   .card .card-hover` items, each tagged `data-category="X"` for filtering. `data-aos="fade-up"`
   gives the scroll-in animation.
5. **Empty state** — a `hidden` `.empty-state` paragraph, shown automatically when a
   search/filter combination matches nothing.
6. **Pagination** — an empty `<nav class="pagination">`, populated automatically once
   there's more than one page.
7. **Sidebar** (`aside`, `lg:grid-cols-[1fr_300px]` next to the main column) — three
   `.sidebar-card`s: Quick links, Related, and a `.help-card` (navy, gold heading) with a
   support CTA.
8. **Footer** — copied verbatim from `home.html`.

## Wiring the JS (`listing-common.js`)

One call per listing block, right after the `listing-common.js` `<script>` tag:

```html
<script src="listing-common.js"></script>
<script>
  initListing({
    gridSelector: '#servicesGrid',       // the grid wrapper
    cardSelector: '.listing-card',       // each card inside it
    searchInputSelector: '#serviceSearch',
    filterBarSelector: '#serviceFilters',   // omit if the page has no filter chips
    countSelector: '#serviceCount',         // omit if there's no "N results" label
    emptyStateSelector: '#serviceEmpty',    // omit if there's no empty-state message
    paginationSelector: '#servicePagination', // omit for an unpaginated page
    pageSize: 6,                              // omit to show everything on one page
    itemLabel: 'service',                     // singular noun for the count text
  });
</script>
```

It reads each card's visible text for the search match and its `data-category` for the
filter match — no other markup is required. Multiple `initListing()` calls can run on one
page if it has more than one independent listing (not currently needed).

## Adding a new listing page

1. Copy `services.html`.
2. Update `<title>`, the breadcrumb's current-page text, the page-hero heading/lead, and
   which nav link gets `.active`.
3. Replace the filter chips' `data-filter` values with that page's real categories.
4. Replace the card grid with real cards (`data-category` matching a chip, plus whatever
   content fits — see `jobs.html` for a wider card layout with a CTA button instead of
   the default `.card-link`).
5. Update the `initListing({...})` call's selectors and `itemLabel`.
6. Update the sidebar's Quick links / Related entries to point at genuinely related pages.
