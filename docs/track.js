/* ---------------------------------------------------------------
   Click tracking

   Loaded on every page. Each tracked click is reported twice,
   best-effort:
     1. Clicky ("Actions" report), when its script has loaded.
     2. The self-hosted iplog worker, which stores the event in D1 and
        shows it on the dashboard under "Paper downloads (PDF)" and
        "Top clicks":
          /p.gif?e=click&c=<category>&a=<action>&l=<label>&p=<path>
   --------------------------------------------------------------- */

const TRACK_PIXEL = "https://iplog.netsecurelab.org/p.gif";

function trackEvent(category, action, label) {
  const path = `/click/${[category, action, label].filter(Boolean).join("/")}`;

  try {
    if (window.clicky && typeof window.clicky.log === "function") {
      window.clicky.log(path, `${category}: ${action}${label ? ` (${label})` : ""}`, "click");
    }
  } catch (error) {
    /* analytics must never break the page */
  }

  try {
    const params = new URLSearchParams({
      e: "click",
      c: category,
      a: action,
      p: window.location.pathname,
      t: String(Date.now())
    });
    if (label) params.set("l", label);

    const pixel = new Image();
    pixel.referrerPolicy = "no-referrer-when-downgrade";
    pixel.src = `${TRACK_PIXEL}?${params.toString()}`;
  } catch (error) {
    /* analytics must never break the page */
  }
}

function describeClick(target) {
  if (!target || typeof target.closest !== "function") return null;

  const element = target.closest("a, button, summary");
  if (!element) return null;

  const text = (element.textContent || "").trim().slice(0, 60);
  const pub = element.dataset ? element.dataset.pub : "";

  if (pub) {
    // PDF / Link / Slides / Data / Software / Talk / BibTeX on a publication
    return { category: "pub", action: text || "link", label: pub };
  }

  if (element.closest("#sidebar-links") || element.id === "nav-cv") {
    return { category: "sidebar", action: text };
  }

  if (element.closest(".topnav")) {
    return { category: "nav", action: text };
  }

  if (element.closest("#bio-toggle")) {
    return { category: "toggle", action: "bio", label: element.dataset.mode };
  }

  if (element.closest("#publication-toggle")) {
    return { category: "toggle", action: "publications", label: element.dataset.mode };
  }

  if (element.tagName === "A") {
    const href = element.getAttribute("href") || "";

    if (href.startsWith("mailto:")) {
      return { category: "email", action: "mailto" };
    }

    if (/^https?:/i.test(href)) {
      let destination = href;
      try {
        const url = new URL(href, window.location.href);
        if (url.host === window.location.host) return null;
        destination = `${url.host}${url.pathname}`;
      } catch (error) {
        /* keep the raw href */
      }
      return { category: "outbound", action: destination.slice(0, 120), label: text };
    }
  }

  return null;
}

function setupClickTracking() {
  document.addEventListener(
    "click",
    (event) => {
      const target = event.target;
      const element =
        target && typeof target.closest === "function"
          ? target.closest("a, button, summary")
          : null;

      // A <details> summary fires on both open and close; only count opens.
      if (element && element.tagName === "SUMMARY") {
        const details = element.closest("details");
        if (details && details.open) return;
      }

      const info = describeClick(event.target);
      if (!info) return;

      trackEvent(info.category, info.action, info.label);
    },
    true
  );
}

document.addEventListener("DOMContentLoaded", setupClickTracking);
