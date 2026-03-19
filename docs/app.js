const DATA_FILES = {
  profile: "data/profile.json",
  students: "data/students.json",
  publications: "data/publications.json",
  updates: "data/updates.json",
  grants: "data/fundings.json",
  service: "data/service.json",
  courses: "data/courses.json"
};

const ADVISEES = new Set([
  "Mohammad Ishtiaq Ashiq Khan",
  "Weitong Li",
  "Munshi Rejwan Ala Muid",
  "Hoang Tran",
  "Muhammad Hamza",
  "Yongzhe Xu",
  "Protick Bhowmick",
  "Syed Muhammad Farhan",
  "Hyeonmin Lee",
  "Minhyeock Kang",
  "Olivier Hureau",
  "Eeshan Umrani"
]);

const publicationView = {
  mode: "year"
};

document.addEventListener("DOMContentLoaded", init);

async function init() {
  try {
    if (window.location.protocol === "file:") {
      throw new Error("Serve this folder over HTTP to load the JSON files.");
    }

    const data = await loadAllData();
    const publications = normalizePublications(data.publications);
    const updates = normalizeUpdates(data.updates);
    const grants = normalizeGrants(data.grants);
    const service = normalizeService(data.service);

    renderHeader(data.profile);
    setupPublicationToggle(publications);
    renderSidebar(data.profile, updates);
    renderAbout(data.profile);
    renderPublications(publications);
    renderGrants(grants);
    renderStudents(data.students);
    renderTeaching(data.courses);
    renderService(service);
    setupCollapsibleSections();
    setupScrollSpy();

    // When navigating from a different page with a hash (e.g. index.html#publications),
    // the browser attempts to scroll before the async DOM is built.
    // We manually scroll to the anchor here after rendering is complete.
    if (window.location.hash) {
      setTimeout(() => {
        // Use document.getElementById to safely query id based on hash (remove the '#')
        const hashId = window.location.hash.substring(1);
        const target = document.getElementById(hashId);
        if (target) {
          target.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  } catch (error) {
    renderError(error);
    console.error(error);
  }
}

async function loadAllData() {
  const entries = await Promise.all(
    Object.entries(DATA_FILES).map(async ([key, path]) => {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load ${path}`);
      }

      return [key, await response.json()];
    })
  );

  return Object.fromEntries(entries);
}

function renderHeader(profile) {
  const brandAffiliation = document.getElementById("brand-affiliation");
  if (brandAffiliation) brandAffiliation.textContent = "";

  const brandName = document.getElementById("brand-name");
  if (brandName) brandName.textContent = profile.name;

  const cvLink = profile.links.find((item) => item.label === "CV");
  if (cvLink) {
    const navCv = document.getElementById("nav-cv");
    if (navCv) {
      navCv.href = cvLink.url;
      navCv.target = "_blank";
      navCv.rel = "noopener";
    }
  }
}

function renderSidebar(profile, updates) {
  document.getElementById("sidebar-title").textContent = "";
  document.getElementById(
    "sidebar-affiliation"
  ).textContent = `${profile.title}, ${profile.affiliation}`;

  const emailLink = document.getElementById("sidebar-email");
  emailLink.textContent = profile.email;
  emailLink.href = `mailto:${profile.email}`;

  const sidebarLinks = document.getElementById("sidebar-links");
  sidebarLinks.innerHTML = profile.links
    .filter((item) => ["Google Scholar", "CV", "Current Site"].includes(item.label))
    .map(
      (item) =>
        `<a href="${item.url}" target="_blank" rel="noopener">${escapeHtml(item.label)}</a>`
    )
    .join("");

  renderUpdates(updates);
}

function renderAbout(profile) {
  const about = document.getElementById("about-copy");

  about.innerHTML = `
    <p>${profile.bio}</p>
  `;
}

function renderUpdates(updates) {
  const items = updates.slice(0, 10);
  document.getElementById("sidebar-updates").innerHTML = items
    .map((item) => {
      if (!item.dateObject) {
        return `<li>${item.text}</li>`;
      }

      return `<li><strong>${escapeHtml(formatShortDate(item.dateObject))}:</strong> ${item.text}</li>`;
    })
    .join("");
}

function renderGrants(grants) {
  const root = document.getElementById("grants-content");
  if (!root) return;

  const grouped = groupBy(grants, (item) => item.agency);
  const agencies = Object.keys(grouped).sort((a, b) => {
    const isNsfa = a.includes("National Science");
    const isNsfb = b.includes("National Science");
    if (isNsfa && !isNsfb) return -1;
    if (isNsfb && !isNsfa) return 1;
    return a.localeCompare(b);
  });

  root.innerHTML = agencies
    .map((agency) => {
      return `
        <div class="year-block">
          <h3 class="topic-heading">${escapeHtml(agency)}</h3>
          <ul class="simple-list">
            ${grouped[agency]
          .map((grant) => {
            const title = grant.link
              ? `<a href="${grant.link}" target="_blank" rel="noopener"><em>${escapeHtml(
                grant.title
              )}</em></a>`
              : `<em>${escapeHtml(grant.title)}</em>`;
            const collaborators = grant.pis?.length
              ? ` Joint with ${escapeHtml(grant.pis.join(", "))}.`
              : "";

            return `<li>${title}${grant.number ? `, ${escapeHtml(grant.number)}` : ""
              }, ${escapeHtml(grant.start)}${grant.end ? `-${escapeHtml(grant.end)}` : ""}. ${escapeHtml(
                grant.role
              )}.${collaborators} ${escapeHtml(formatCurrency(grant.amount))}.</li>`;
          })
          .join("")}
          </ul>
        </div>
      `;
    })
    .join("");
}

function renderStudents(students) {
  const groups = [
    ["Postdocs", students.postdocs],
    ["Ph.D. Students", students.phd],
    ["Alumni and Interns", students.alumni]
  ];

  document.getElementById("students-content").innerHTML = groups
    .map(
      ([title, items]) => `
        <div class="student-group">
          <h3>${title}</h3>
          <ul>
            ${items
          .map((item) => {
            const name = item.url
              ? `<a href="${item.url}" target="_blank" rel="noopener">${escapeHtml(
                item.name
              )}</a>`
              : escapeHtml(item.name);

            return `<li>${name}${item.note ? `, ${escapeHtml(item.note)}` : ""}</li>`;
          })
          .join("")}
          </ul>
        </div>
      `
    )
    .join("");
}

function renderService(service) {
  const root = document.getElementById("service-list");
  const grouped = groupBy(service, (item) => item.yearNumber);
  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  root.innerHTML = years
    .map(
      (year) => `
        <li class="service-year-block">
          <div class="service-year">${year}</div>
          <ul>
            ${grouped[year]
          .map(
            (item) =>
              `<li>${escapeHtml(item.role)}, ${escapeHtml(item.venue)}</li>`
          )
          .join("")}
          </ul>
        </li>
      `
    )
    .join("");
}

function renderTeaching(courses) {
  const root = document.getElementById("teaching-list");
  if (!root || !courses) return;

  root.innerHTML = courses
    .map((course) => {
      const titleText = `<strong>${escapeHtml(course.title)}</strong>`;
      const termsText = course.terms ? `(${escapeHtml(course.terms.join(", "))})` : "";
      const noteText = course.note ? ` <em>[${escapeHtml(course.note)}]</em>` : "";

      return `<li>${titleText} ${termsText}${noteText}</li>`;
    })
    .join("");
}

function renderPublications(publications) {
  const root = document.getElementById("publications-content");

  if (publicationView.mode === "topic") {
    const groupedByTopic = {};
    publications.forEach((item) => {
      const categories = normalizeCategories(item.category);
      const topics = categories.length ? categories : ["Others"];
      topics.forEach((topic) => {
        if (!groupedByTopic[topic]) {
          groupedByTopic[topic] = [];
        }
        groupedByTopic[topic].push(item);
      });
    });

    const topics = Object.keys(groupedByTopic).sort((a, b) => {
      if (a === "Others") return 1;
      if (b === "Others") return -1;
      return a.localeCompare(b);
    });

    root.innerHTML = topics
      .map(
        (topic) => `
          <div class="year-block">
            <h3 class="topic-heading">${escapeHtml(topic)}</h3>
            <ul class="year-publication-list">
              ${groupedByTopic[topic].map(renderPublicationItem).join("")}
            </ul>
          </div>
        `
      )
      .join("");

    return;
  }

  const grouped = groupBy(publications, (item) => item.yearNumber);
  const years = Object.keys(grouped)
    .map(Number)
    .sort((a, b) => b - a);

  root.innerHTML = years
    .map(
      (year) => `
        <div class="year-block">
          <h3 class="publication-year">${year}</h3>
          <ul class="year-publication-list">
            ${grouped[year].map(renderPublicationItem).join("")}
          </ul>
        </div>
      `
    )
    .join("");
}

function renderPublicationItem(item) {
  const categories = normalizeCategories(item.category);
  const categoryText =
    categories.length && !(categories.length === 1 && categories[0] === "Others")
      ? `<span class="publication-topic-inline">{ ${escapeHtml(categories.join(" · "))} }</span>`
      : "";

  return `
    <li>
      <div class="publication-title-line">${categoryText}<span class="publication-title">${escapeHtml(
    item.title
  )}</span></div>
      <div class="publication-authors">${renderAuthors(item.author)}</div>
      <div class="publication-venue">${escapeHtml(renderVenue(item))}</div>
      <div class="pub-links">${renderPublicationLinks(item)}</div>
    </li>
  `;
}

function renderPublicationLinks(item) {
  const links = [];

  if (item.file) {
    links.push(
      `<a class="pub-tag" href="https://taejoong.github.io/files/publications/${item.file}.pdf" target="_blank" rel="noopener">PDF</a>`
    );
  }

  if (item.note) {
    links.push(
      `<a class="pub-tag pub-tag--orange" href="${item.note}" target="_blank" rel="noopener">Link</a>`
    );
  }

  links.push(renderBibtexDetails(item));

  if (item.slides) {
    links.push(
      `<a class="pub-tag pub-tag--stone" href="${item.slides}" target="_blank" rel="noopener">Slides</a>`
    );
  }

  if (item.dataset) {
    links.push(
      `<a class="pub-tag pub-tag--orange" href="${item.dataset}" target="_blank" rel="noopener">Data</a>`
    );
  }

  if (item.software) {
    links.push(
      `<a class="pub-tag pub-tag--stone" href="${item.software}" target="_blank" rel="noopener">Software</a>`
    );
  }

  if (item.talk) {
    links.push(
      `<a class="pub-tag pub-tag--talk" href="${item.talk}" target="_blank" rel="noopener">Talk</a>`
    );
  }

  if (item.award) {
    links.push(`<span class="pub-tag pub-tag--award">${escapeHtml(item.award)}</span>`);
  }

  return links.join("");
}

function renderAuthors(authors) {
  return authors
    .map((author) => {
      if (author === "Taejoong Chung") {
        return `<strong class="self-name">${escapeHtml(author)}</strong>`;
      }

      if (ADVISEES.has(author)) {
        return `<span class="advisee-name">${escapeHtml(author)}</span>`;
      }

      return escapeHtml(author);
    })
    .join(", ");
}

function renderVenue(item) {
  let result = "";

  if (item.booktitle_long) {
    const pieces = [item.booktitle_long];
    if (item.city || item.country) {
      pieces.push([item.city, item.country].filter(Boolean).join(", "));
    }
    if (item.month || item.year) {
      pieces.push([item.month, item.year].filter(Boolean).join(" "));
    }
    result = pieces.join(". ");
  } else if (item.journal_long) {
    result = [item.journal_long, item.month, item.year].filter(Boolean).join(", ");
  } else {
    result = [item.howpublished, item.month, item.year].filter(Boolean).join(", ");
  }

  const shortName = item.booktitle_short || item.journal_short;
  if (shortName && shortName !== "Internet Draft") {
    if (item.year) {
      const shortYear = String(item.year).slice(-2);
      result += ` (${escapeHtml(shortName)}'${escapeHtml(shortYear)})`;
    } else {
      result += ` (${escapeHtml(shortName)})`;
    }
  }

  return result;
}

function normalizePublications(items) {
  return items
    .map((item) => ({
      ...item,
      yearNumber: Number.parseInt(item.year, 10) || 0,
      monthOrder: monthOrder(item.month)
    }))
    .filter((item) => item.yearNumber > 0)
    .sort((a, b) => {
      if (b.yearNumber !== a.yearNumber) {
        return b.yearNumber - a.yearNumber;
      }
      if (b.monthOrder !== a.monthOrder) {
        return b.monthOrder - a.monthOrder;
      }
      return String(a.title).localeCompare(String(b.title));
    });
}

function normalizeCategories(value) {
  if (!value) {
    return [];
  }

  const items = Array.isArray(value) ? value : [value];
  return items
    .flatMap((item) => String(item).split(","))
    .map((item) => item.trim())
    .filter(Boolean);
}

function setupPublicationToggle(publications) {
  const buttons = document.querySelectorAll("#publication-toggle button");
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      publicationView.mode = button.dataset.mode;
      buttons.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");
      renderPublications(publications);
    });
  });
}

function normalizeUpdates(items) {
  return items
    .map((item) => ({
      ...item,
      dateObject: parseUsDate(item.date),
      pinPriority: getUpdatePinPriority(item)
    }))
    .filter((item) => item.dateObject || item.pinPriority > 0)
    .sort((a, b) => {
      if (b.pinPriority !== a.pinPriority) {
        return b.pinPriority - a.pinPriority;
      }

      const aTime = a.dateObject ? a.dateObject.getTime() : 0;
      const bTime = b.dateObject ? b.dateObject.getTime() : 0;
      return bTime - aTime;
    });
}

function normalizeGrants(items) {
  return items
    .map((item) => ({
      ...item,
      startDate: parseMonthYear(item.start),
      endDate: parseMonthYear(item.end)
    }))
    .sort((a, b) => (b.startDate?.getTime() || 0) - (a.startDate?.getTime() || 0));
}

function normalizeService(items) {
  return items
    .map((item) => ({
      ...item,
      yearNumber: Number(item.year) || 0
    }))
    .filter((item) => item.yearNumber > 0)
    .sort((a, b) => {
      if (b.yearNumber !== a.yearNumber) {
        return b.yearNumber - a.yearNumber;
      }
      return String(a.venue).localeCompare(String(b.venue));
    });
}

function groupBy(items, fn) {
  return items.reduce((accumulator, item) => {
    const key = fn(item);
    if (!accumulator[key]) {
      accumulator[key] = [];
    }
    accumulator[key].push(item);
    return accumulator;
  }, {});
}

function parseUsDate(value) {
  const [month, day, year] = String(value).split("/").map(Number);
  if (!month || !day || !year) {
    return null;
  }
  return new Date(year, month - 1, day);
}

function parseMonthYear(value) {
  if (!value) {
    return null;
  }
  const [month, year] = String(value).split("/").map(Number);
  if (!month || !year) {
    return null;
  }
  return new Date(year, month - 1, 1);
}

function monthOrder(month) {
  const order = {
    january: 1,
    february: 2,
    march: 3,
    april: 4,
    may: 5,
    june: 6,
    july: 7,
    august: 8,
    september: 9,
    october: 10,
    november: 11,
    december: 12
  };
  return order[String(month || "").toLowerCase()] || 0;
}

function formatShortDate(date) {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  }).format(date);
}

function formatCurrency(amount) {
  const value = Number(amount) || 0;
  return `$${new Intl.NumberFormat("en-US").format(value)}`;
}

function isGrantActive(item) {
  const now = new Date();
  if (item.startDate && item.startDate > now) {
    return false;
  }
  if (item.endDate && item.endDate < now) {
    return false;
  }
  return true;
}

function getUpdatePinPriority(item) {
  if (
    isTruthyPin(item.all_top) ||
    isTruthyPin(item["all-top"]) ||
    isTruthyPin(item.always_top) ||
    isTruthyPin(item["always-top"])
  ) {
    return 2;
  }

  if (isTruthyPin(item.top)) {
    return 1;
  }

  return 0;
}

function isTruthyPin(value) {
  if (value === true) {
    return true;
  }

  return ["true", "yes", "top", "always"].includes(String(value || "").toLowerCase());
}

function renderBibtexDetails(item) {
  const bibtex = buildBibtex(item);
  if (!bibtex) {
    return "";
  }

  return `
    <details>
      <summary class="pub-tag-summary pub-tag--stone">BibTeX</summary>
      <pre class="bibtex-pre">${escapeHtml(bibtex)}</pre>
    </details>
  `;
}

function buildBibtex(item) {
  const key = (item.file || `${item.title}-${item.year || ""}`)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const authors = Array.isArray(item.author) ? item.author.join(" and ") : "";
  if (!key || !authors || !item.title) {
    return "";
  }

  const type = item.type || "misc";
  const lines = [`@${type}{${key},`, `  author = {${authors}},`, `  title = {{${item.title}}},`];

  if (type === "inproceedings") {
    const booktitle = item.booktitle_long || "";
    const address = [item.city, item.state, item.country].filter(Boolean).join(", ");
    if (booktitle) {
      lines.push(`  booktitle = {${booktitle}},`);
    }
    if (address) {
      lines.push(`  address = {${address}},`);
    }
    if (item.month) {
      lines.push(`  month = {${item.month}},`);
    }
    if (item.year) {
      lines.push(`  year = {${item.year}}`);
    }
  } else if (type === "article") {
    if (item.journal_long) {
      lines.push(`  journal = {${item.journal_long}},`);
    }
    if (item.volume) {
      lines.push(`  volume = {${item.volume}},`);
    }
    if (item.number) {
      lines.push(`  number = {${item.number}},`);
    }
    if (item.month) {
      lines.push(`  month = {${item.month}},`);
    }
    if (item.year) {
      lines.push(`  year = {${item.year}}`);
    }
  } else if (type === "misc") {
    if (item.howpublished) {
      lines.push(`  howpublished = {${item.howpublished}},`);
    }
    if (item.month) {
      lines.push(`  month = {${item.month}},`);
    }
    if (item.year) {
      lines.push(`  year = {${item.year}}`);
    }
  } else {
    if (item.year) {
      lines.push(`  year = {${item.year}}`);
    }
  }

  if (lines[lines.length - 1].endsWith(",")) {
    lines[lines.length - 1] = lines[lines.length - 1].slice(0, -1);
  }

  lines.push("}");
  return lines.join("\n");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderError(error) {
  document.querySelector(".content").innerHTML = `
    <section class="content-section">
      <h2 class="section-title">Preview error</h2>
      <p>${escapeHtml(error.message)}</p>
      <p>Run a static server in this folder, then open the page in a browser.</p>
    </section>
  `;
}

function setupCollapsibleSections() {
  const sections = document.querySelectorAll(".content-section, .sidebar-section");
  sections.forEach((section) => {
    const heading = section.querySelector("h2");
    if (!heading) return;

    heading.classList.add("collapsible-heading");

    const icon = document.createElement("span");
    icon.className = "collapse-icon";
    icon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>`;

    heading.appendChild(document.createTextNode(" "));
    heading.appendChild(icon);

    heading.addEventListener("click", () => {
      section.classList.toggle("is-collapsed");
    });
  });
}

function setupScrollSpy() {
  const sections = document.querySelectorAll("main.content section[id]");
  const navLinks = document.querySelectorAll(".topnav a[href^='#']");

  if (!sections.length || !navLinks.length) return;

  const observerOptions = {
    root: null,
    rootMargin: "-20% 0px -70% 0px", // Trigger when the section is near the top of the viewport
    threshold: 0
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute("id");
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === `#${id}`) {
            link.classList.add("is-current");
            link.setAttribute("aria-current", "page");
          } else {
            link.classList.remove("is-current");
            link.removeAttribute("aria-current");
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    observer.observe(section);
  });
}
