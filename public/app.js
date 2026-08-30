import { STORE_CONFIG, CATEGORIES, SERVICES, PRODUCTS, INQUIRY_TYPES } from "/config/store.js";

const app = document.querySelector("#app");
const modalRoot = document.querySelector("#modal-root");
const toastRoot = document.querySelector("#toast-root");
let mobileOpen = false;
let adminTab = "overview";
let adminData = null;
let editingProductId = null;

// Shrinks/compresses a photo in the browser before upload so phone photos
// (often 5-10MB) comfortably fit the server's upload limit.
function resizeImage(file, maxDim = 1400, quality = 0.82) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Couldn't read that file."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Couldn't read that image."));
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          const scale = maxDim / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        canvas.getContext("2d").drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}
let runtime = { store: STORE_CONFIG, products: PRODUCTS, services: SERVICES, reviews: [], gallery: [] };

const nav = [
  ["home", "Home"], ["eyewear", "Eyewear"], ["gallery", "Gallery"], ["services", "Services"], ["eye-test", "Eye Testing"],
  ["about", "About"], ["reviews", "Reviews"], ["contact", "Contact"]
];

function esc(value = "") {
  return String(value).replace(/[&<>'"]/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
}
function href(route) { return route === "home" ? "#/" : `#${route}`; }
function route() { return location.hash.replace(/^#\/?/, "") || "home"; }
function setTitle(title) { document.title = title ? `${title} | ${runtime.store.name}` : `${runtime.store.name} — ${runtime.store.tagline}`; }
function phoneHref() { return `tel:${runtime.store.phone.replace(/\s/g, "")}`; }
function waHref(message) { return `https://wa.me/${runtime.store.whatsapp}?text=${encodeURIComponent(message)}`; }
function defaultMessage(product) { return product ? `Hi, I am interested in the ${product.name}. Could you please tell me if it is available?` : "Hi, I found your optical store website and would like to know more about your eyewear."; }
function activeRoute() { return route().split("/")[0]; }
function getProduct(id) { return runtime.products.find(p => p.id === id); }
function enabledServices() { return runtime.services.filter(service => service.enabled); }

function toast(message, error = false) {
  toastRoot.innerHTML = `<div class="toast ${error ? "error" : ""}" role="status">${esc(message)}</div>`;
  setTimeout(() => { toastRoot.innerHTML = ""; }, 5000);
}

function layout(content, page = activeRoute()) {
  const c = runtime.store;
  return `<div class="page-shell">
    <div class="announcement">${esc(c.announcement)}</div>
    <header class="site-header">
      <nav class="nav container" aria-label="Primary navigation">
        <a class="brand" href="#/" aria-label="${esc(c.name)} home"><span class="brand-mark" aria-hidden="true"></span><span>${esc(c.name)}</span></a>
        <div class="nav-links">${nav.map(([key, label]) => `<a class="${page === key ? "active" : ""}" href="${href(key)}">${label}</a>`).join("")}</div>
        <a class="button button--amber button--small" href="#eye-test">Book eye test</a>
        <button class="mobile-menu" data-action="toggle-menu" aria-expanded="${mobileOpen}" aria-label="Toggle navigation">${mobileOpen ? "×" : "☰"}</button>
      </nav>
    </header>
    <nav class="mobile-drawer ${mobileOpen ? "open" : ""}" aria-label="Mobile navigation">
      ${nav.map(([key, label]) => `<a href="${href(key)}" data-action="close-menu">${label}</a>`).join("")}
      <a class="button button--amber" href="#eye-test" data-action="close-menu">Book eye test</a>
    </nav>
    <main id="main-content">${content}</main>
    ${footer()}
    ${mobileContact()}
  </div>`;
}

function footer() {
  const c = runtime.store;
  return `<footer class="site-footer">
    <div class="container footer-grid">
      <div><a class="brand" href="#/"><span class="brand-mark" aria-hidden="true"></span><span>${esc(c.name)}</span></a><p class="footer-copy">${esc(c.description)}</p></div>
      <div><h2 class="footer-title">Explore</h2><div class="footer-links">${nav.map(([key, label]) => `<a href="${href(key)}">${label}</a>`).join("")}</div></div>
      <div><h2 class="footer-title">Visit or contact us</h2><div class="footer-contact"><a href="${phoneHref()}">${esc(c.phone)}</a><a href="${waHref(defaultMessage())}" target="_blank" rel="noopener">Chat on WhatsApp</a><a href="mailto:${esc(c.email)}">${esc(c.email)}</a><span>${esc(c.address)}</span>${c.openingHours.map(item => `<span>${esc(item[0])}: ${esc(item[1])}</span>`).join("")}</div></div>
    </div>
    <div class="container footer-bottom"><span>© ${new Date().getFullYear()} ${esc(c.name)}. All rights reserved.</span><a href="#privacy">Privacy policy</a><a href="#terms">Terms & conditions</a><a href="#admin">Admin</a></div>
  </footer>`;
}

function mobileContact() {
  const c = runtime.store;
  return `<nav class="mobile-contact" aria-label="Quick contact"><a href="${phoneHref()}"><span>◔</span><span>Call</span></a><a href="${waHref(defaultMessage())}" target="_blank" rel="noopener"><span>◌</span><span>WhatsApp</span></a><a href="${esc(c.mapUrl)}" target="_blank" rel="noopener"><span>⌖</span><span>Directions</span></a></nav>`;
}

function pageHero(eyebrow, heading, text) {
  return `<section class="page-hero"><div class="container"><p class="eyebrow">${esc(eyebrow)}</p><h1>${heading}</h1><p>${esc(text)}</p></div></section>`;
}

function productImageStyle(product) {
  return product.image
    ? `background-image:url('${esc(product.image)}');background-size:cover;background-position:center`
    : `--img-pos:${esc(product.imagePosition)}`;
}
function productCard(product) {
  return `<article class="card product-card">
    <a class="product-image" href="#product/${encodeURIComponent(product.id)}" style="${productImageStyle(product)}" aria-label="View ${esc(product.name)}"></a>
    <div class="product-content"><span class="pill pill--soft">${esc(categoryTitle(product.category))}</span><h3>${esc(product.name)}</h3><p>${esc(product.style)} · ${esc(product.color)}</p><div class="product-meta"><span class="pill pill--warm">${esc(product.availability)}</span></div><button class="button button--ghost button--small" data-action="inquire" data-product="${esc(product.id)}">Ask about this frame</button></div>
  </article>`;
}
function categoryTitle(id) { return CATEGORIES.find(c => c.id === id)?.title || id; }
function categoryCard(category, i) {
  const positions = ["0% 42%", "24% 52%", "48% 55%", "74% 50%", "100% 55%"];
  return `<a href="#eyewear" class="category-card" style="--pos:${positions[i]}"><h3>${esc(category.title)}</h3><p>${esc(category.description)}</p><span class="card-arrow" aria-hidden="true">↗</span></a>`;
}
function reviewList(reviews, compact = false) {
  if (!reviews.length) return `<div class="empty-review"><div><div class="stars" aria-label="No ratings yet">★★★★★</div><h3>Be one of our first customers to share your experience.</h3><p>We only show reviews once the store team has reviewed and approved them.</p><button class="button button--primary" data-action="review">Write a review</button></div></div>`;
  return `<div class="review-list">${reviews.slice(0, compact ? 3 : undefined).map(review => `<article class="card review-card"><div class="stars" aria-label="${review.rating} out of 5 stars">${"★".repeat(review.rating)}${"☆".repeat(5-review.rating)}</div><h3>${esc(review.name)}</h3><p>${esc(review.review)}</p></article>`).join("")}</div>`;
}

function home() {
  const c = runtime.store;
  const reasons = [["◎", "Professional eye testing", "Request a convenient appointment and let our team confirm the details with you."], ["◇", "Eyewear for all ages", "Explore shapes and comfortable fits for kids, adults, and seniors."], ["◌", "Personal frame guidance", "Take your time and get practical help finding the right feel and look."], ["◍", "Quality lens options", "Ask about lens types for your everyday visual needs."], ["⌁", "Local customer support", "Visit, call, or message us whenever you need a hand."]];
  const featured = runtime.products.filter(product => product.featured).slice(0, 4);
  return layout(`
    <section class="hero"><img class="hero-image" src="${c.heroImage}" alt="Customer trying on glasses with guidance inside a modern optical store" fetchpriority="high"><div class="container"><div class="hero-copy"><p class="eyebrow">Local eyewear · ${esc(c.locationLabel)}</p><h1>${c.heroTitle.replace("\n", "<br>")}</h1><p>${esc(c.heroDescription)}</p><div class="hero-actions"><a class="button button--light" href="#eyewear">Explore eyewear <span>↗</span></a><a class="button button--amber" href="#eye-test">Book an eye test</a><a class="button button--ghost" style="color:#fff;border-color:#bfc6bc" href="#contact">Visit our store</a></div></div></div></section>
    <section class="quick-actions" aria-label="Quick contact"><a href="${phoneHref()}"><span class="symbol">◔</span><span>Call us</span></a><a href="${waHref(defaultMessage())}" target="_blank" rel="noopener"><span class="symbol">◌</span><span>WhatsApp</span></a><a href="${c.mapUrl}" target="_blank" rel="noopener"><span class="symbol">⌖</span><span>Directions</span></a></section>
    <section class="section section--paper"><div class="container"><div class="section-heading"><p class="eyebrow">For every face, every day</p><h2>Eyewear that meets you where you are.</h2><p>Start with the people who wear it. Our showroom collection is there to explore in person—never to click and buy online.</p></div><div class="category-grid">${CATEGORIES.map(categoryCard).join("")}</div></div></section>
    <section class="section section--cream"><div class="container"><div class="section-heading"><p class="eyebrow">A better in-store experience</p><h2>Helpful by design.</h2><p>We keep the experience simple: clear options, warm advice, and enough time to decide.</p></div><div class="reason-grid">${reasons.map(([icon,title,text]) => `<article class="card reason"><div class="reason-icon">${icon}</div><h3>${title}</h3><p>${text}</p></article>`).join("")}</div></div></section>
    <section class="section section--paper"><div class="container"><div class="testing-band"><p class="eyebrow">Eye testing</p><h2>Clear next steps for your vision.</h2><p>Send an appointment request online. We’ll contact you to confirm a suitable time—it is never automatically booked.</p><a class="button button--amber" href="#eye-test">Book an eye test</a></div></div></section>
    <section class="section section--cream"><div class="container"><div class="section-heading"><p class="eyebrow">A small preview</p><h2>Frames worth trying on.</h2><p>These are showcase frames, not an online catalogue for purchase. Ask us what’s currently available in store.</p></div><div class="featured-grid">${featured.length ? featured.map(productCard).join("") : emptyProducts()}</div><div style="margin-top:1.3rem"><a class="button button--ghost" href="#eyewear">View all eyewear</a></div></div></section>
    <section class="section section--ink"><div class="container"><div class="section-heading"><p class="eyebrow">How it works</p><h2>Four simple steps, in person.</h2></div><div class="process">${[["Visit the store", "Come in, browse, and tell us what you need."], ["Get your eyes tested", "Request an appointment if an eye test is right for you."], ["Choose your frame", "Try on shapes, materials, and colours at your own pace."], ["Get lens guidance", "Talk through options for your day-to-day comfort."]].map(([title,text]) => `<article class="process-item"><div><h3>${title}</h3><p>${text}</p></div></article>`).join("")}</div></div></section>
    <section class="section section--paper"><div class="container"><div class="section-heading"><p class="eyebrow">Customer reviews</p><h2>Real experiences, when they arrive.</h2></div>${reviewList(runtime.reviews, true)}<div style="margin-top:1.2rem"><a class="button button--ghost" href="#reviews">Read or write a review</a></div></div></section>
    <section class="section section--cream"><div class="container"><div class="store-preview"><div class="store-preview-image" role="img" aria-label="A warm modern optical store interior"></div><div class="store-preview-copy"><p class="eyebrow">Visit Rudra Optical</p><h2>Come find your next frame.</h2><div class="store-details"><div class="store-detail"><span>⌖</span><span>${esc(c.address)}</span></div><div class="store-detail"><span>◔</span><a href="${phoneHref()}">${esc(c.phone)}</a></div><div class="store-detail"><span>◷</span><span>${c.openingHours.map(hours => `${esc(hours[0])}: ${esc(hours[1])}`).join("<br>")}</span></div></div><a class="button button--primary" href="${c.mapUrl}" target="_blank" rel="noopener">Get directions <span>↗</span></a></div></div></div></section>
    <section class="section section--ink"><div class="container final-cta"><p class="eyebrow">A good frame starts with a good conversation</p><h2>Ready to find your perfect frame?</h2><p>Visit us, request an eye test, or start a conversation now.</p><div class="hero-actions"><a class="button button--light" href="#contact">Visit our store</a><a class="button button--amber" href="#eye-test">Book an eye test</a><button class="button button--ghost" style="color:white;border-color:#a2ada3" data-action="inquiry">Contact us</button></div></div></section>
  `, "home");
}

function emptyProducts() { return `<div class="empty-review"><div><h3>Our collection is being updated.</h3><p>Please visit our store or contact us for current availability.</p><button class="button button--primary" data-action="inquiry">Ask a question</button></div></div>`; }

function eyewear() {
  return layout(`${pageHero("Eyewear collection", "Frames to try, not a cart to fill.", "This is a showcase of possible styles. Ask about a frame and our team can tell you whether it is currently available in store.")}
    <section class="section section--cream"><div class="container"><form class="filter-bar" id="product-filters" aria-label="Filter eyewear"><label>Search<input name="query" type="search" placeholder="Search frames"></label><label>Category<select name="category"><option value="">All categories</option>${CATEGORIES.map(c => `<option value="${c.id}">${c.title}</option>`).join("")}</select></label><label>Shape<select name="shape"><option value="">Any shape</option>${[...new Set(runtime.products.map(p => p.shape))].map(x => `<option>${esc(x)}</option>`).join("")}</select></label><label>Material<select name="material"><option value="">Any material</option>${[...new Set(runtime.products.map(p => p.material))].map(x => `<option>${esc(x)}</option>`).join("")}</select></label><label>Age group<select name="ageGroup"><option value="">Any age</option>${[...new Set(runtime.products.map(p => p.ageGroup))].map(x => `<option>${esc(x)}</option>`).join("")}</select></label></form><p class="collection-result" id="collection-result"></p><div id="collection-grid" class="collection-grid"></div></div></section>`, "eyewear");
}

function renderCollection(products = runtime.products) {
  const result = document.querySelector("#collection-result");
  const grid = document.querySelector("#collection-grid");
  if (!grid) return;
  result.textContent = `${products.length} frame${products.length === 1 ? "" : "s"} to explore`;
  grid.innerHTML = products.length ? products.map(productCard).join("") : emptyProducts();
}
function attachCollectionFilters() {
  const filter = document.querySelector("#product-filters");
  if (!filter) return;
  const update = () => {
    const values = Object.fromEntries(new FormData(filter));
    const query = values.query.trim().toLowerCase();
    renderCollection(runtime.products.filter(product => (!query || `${product.name} ${product.style} ${product.color}`.toLowerCase().includes(query)) && (!values.category || product.category === values.category) && (!values.shape || product.shape === values.shape) && (!values.material || product.material === values.material) && (!values.ageGroup || product.ageGroup === values.ageGroup)));
  };
  filter.addEventListener("input", update); filter.addEventListener("change", update); update();
}

function productPage(id) {
  const product = getProduct(id);
  if (!product) return notFound();
  return layout(`<section class="product-page"><div class="container"><a class="back-link" href="#eyewear">← Back to collection</a><div class="product-detail"><div class="product-detail-image" style="${productImageStyle(product)}" role="img" aria-label="${esc(product.name)} showcase frame"></div><div><span class="pill pill--soft">${esc(categoryTitle(product.category))}</span><h1>${esc(product.name)}</h1><p>${esc(product.description)}</p><dl class="spec-list"><div><dt>Age group</dt><dd>${esc(product.ageGroup)}</dd></div><div><dt>Frame shape</dt><dd>${esc(product.shape)}</dd></div><div><dt>Material</dt><dd>${esc(product.material)}</dd></div><div><dt>Colour</dt><dd>${esc(product.color)}</dd></div></dl><p><span class="pill pill--warm">${esc(product.availability)}</span></p><div class="hero-actions"><button class="button button--primary" data-action="inquire" data-product="${esc(product.id)}">Ask about this frame</button><a class="button button--ghost" href="${waHref(defaultMessage(product))}" target="_blank" rel="noopener">WhatsApp us</a></div></div></div></div></section>`, "eyewear");
}

function services() {
  return layout(`${pageHero("Services", "Careful guidance, without the hard sell.", "We explain in-store options clearly, and only list services your store has chosen to provide.")}
    <section class="section section--cream"><div class="container"><div class="service-list">${enabledServices().map(service => `<article class="card service-card"><div class="reason-icon">${service.icon}</div><div><h3>${esc(service.title)}</h3><p>${esc(service.description)}</p></div></article>`).join("")}</div></div></section>
    <section class="section section--ink"><div class="container final-cta"><p class="eyebrow">Let's make it easy</p><h2>Need help deciding where to start?</h2><p>Message us with a question or request a time for an eye test. We’ll respond personally.</p><div class="hero-actions"><button class="button button--light" data-action="inquiry">Ask a question</button><a class="button button--amber" href="#eye-test">Book an eye test</a></div></div></section>`, "services");
}

function appointmentPage() {
  return layout(`${pageHero("Eye-test request", "Choose a time to start the conversation.", "An appointment request is not an automatic booking. Our team will contact you to confirm your preferred time.")}
    <section class="section section--cream"><div class="container form-layout">${appointmentForm()}${contactPanel()}</div></section>`, "eye-test");
}
function appointmentForm() { return `<form class="card form-card" data-form="appointment" novalidate><h2>Request an eye test</h2><p>Tell us when might work. Fields marked * are required.</p><div class="form-grid"><div class="form-grid form-grid--two"><label>Name *<input name="name" autocomplete="name" required><small class="field-error"></small></label><label>Phone *<input name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="Your contact number" required><small class="field-error"></small></label></div><label>Email <span>(optional)</span><input name="email" type="email" autocomplete="email"><small class="field-error"></small></label><div class="form-grid form-grid--two"><label>Preferred date *<input name="preferredDate" type="date" required><small class="field-error"></small></label><label>Preferred time *<select name="preferredTime" required><option value="">Select a time</option><option>Morning</option><option>Afternoon</option><option>Evening</option><option>Flexible</option></select><small class="field-error"></small></label></div><label>Age group *<select name="ageGroup" required><option value="">Select age group</option><option>Kids</option><option>Adults</option><option>Seniors</option></select><small class="field-error"></small></label><label>Anything else we should know?<textarea name="message" placeholder="Optional message"></textarea></label><button class="button button--primary" type="submit">Send appointment request</button></div><p class="form-note">By submitting, you agree that we may use these details to contact you about this appointment request. See our <a href="#privacy"><u>privacy policy</u></a>.</p></form>`; }

function contactPanel() { const c = runtime.store; return `<aside class="contact-panel"><p class="eyebrow">Prefer to talk?</p><h2>We're here.</h2><p>Call or message us for a quicker conversation.</p><div class="store-detail"><span>◔</span><a href="${phoneHref()}">${esc(c.phone)}</a></div><div class="store-detail"><span>⌖</span><span>${esc(c.address)}</span></div><a class="button button--amber" href="${waHref(defaultMessage())}" target="_blank" rel="noopener">Chat on WhatsApp</a><a class="button button--light" href="${c.mapUrl}" target="_blank" rel="noopener">Get directions</a></aside>`; }

function contact() { const c = runtime.store; return layout(`${pageHero("Contact", "Come in, call, or send us a note.", "We’re a local optical store built around in-person support. Use whichever channel feels easiest for you.")}
  <section class="section section--cream"><div class="container form-layout"><div class="contact-panel"><p class="eyebrow">Find us</p><h2>${esc(c.name)}</h2><div class="store-detail"><span>⌖</span><span>${esc(c.address)}</span></div><div class="store-detail"><span>◔</span><a href="${phoneHref()}">${esc(c.phone)}</a></div><div class="store-detail"><span>◌</span><a href="${waHref(defaultMessage())}" target="_blank" rel="noopener">Chat on WhatsApp</a></div><div class="store-detail"><span>✉</span><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div><div class="store-detail"><span>◷</span><span>${c.openingHours.map(hours => `${esc(hours[0])}: ${esc(hours[1])}`).join("<br>")}</span></div><a class="button button--amber" href="${c.mapUrl}" target="_blank" rel="noopener">Get directions</a></div>${inquiryForm()}</div></section>`, "contact"); }
function inquiryForm(product) { return `<form class="card form-card" data-form="inquiry" novalidate><h2>${product ? "Ask about this frame" : "Send an inquiry"}</h2><p>${product ? `Your inquiry will include ${esc(product.name)}.` : "Tell us what you’re looking for. We’ll get back to you soon."}</p><div class="form-grid"><div class="form-grid form-grid--two"><label>Name *<input name="name" autocomplete="name" required><small class="field-error"></small></label><label>Phone number *<input name="phone" type="tel" inputmode="tel" autocomplete="tel" required><small class="field-error"></small></label></div><label>Email *<input name="email" type="email" autocomplete="email" required><small class="field-error"></small></label><label>Inquiry type *<select name="type" required><option value="">Select a type</option>${INQUIRY_TYPES.map(type => `<option ${product && type === "Frame Availability" ? "selected" : ""}>${esc(type)}</option>`).join("")}</select><small class="field-error"></small></label><label>Interested product <span>(optional)</span><input name="product" value="${esc(product?.name || "")}" ${product ? "readonly" : ""} placeholder="Frame name, if applicable"></label><label>Message *<textarea name="message" required placeholder="How can we help?"></textarea><small class="field-error"></small></label><button class="button button--primary" type="submit">Send inquiry</button></div><p class="form-note">We use this information only to respond to your inquiry. <a href="#privacy"><u>Privacy policy</u></a>.</p></form>`; }

function about() { const a = runtime.store.about; return layout(`${pageHero("About us", "A new local space for clearer choices.", "This is intentionally a placeholder story—replace it with the owner’s words before launch.")}
  <section class="section section--cream"><div class="container about-grid"><div class="about-image" role="img" aria-label="Customer looking at eyewear with an optical professional"></div><div class="prose"><section><p class="eyebrow">Our story</p><h2>Starting with a warm welcome.</h2><p>${esc(a.story)}</p></section><section><h2>Our vision</h2><p>${esc(a.vision)}</p></section><section><h2>Our approach</h2><p>${esc(a.approach)}</p></section><section><h2>Eye-care philosophy</h2><p>${esc(a.philosophy)}</p></section></div></div></section>`, "about"); }

function reviews() { const count = runtime.reviews.length; const average = count ? (runtime.reviews.reduce((total, r) => total + r.rating, 0) / count).toFixed(1) : "—"; return layout(`${pageHero("Reviews", "Your experience matters.", "Reviews are submitted to the store team first and only appear here after approval.")}
  <section class="section section--cream"><div class="container form-layout"><div><div class="rating-summary"><strong>${average}</strong><div class="stars">★★★★★</div><p>${count ? `${count} approved review${count === 1 ? "" : "s"}` : "No approved reviews yet"}</p></div>${reviewList(runtime.reviews)}</div><div class="card form-card"><h2>Write a review</h2><p>Thank you for taking the time. Your review will be submitted for approval before it is displayed publicly.</p>${reviewForm()}</div></div></section>`, "reviews"); }
function reviewForm() { return `<form data-form="review" novalidate><div class="form-grid"><label>Name *<input name="name" autocomplete="name" required><small class="field-error"></small></label><label>Rating *<select name="rating" required><option value="">Select a rating</option><option value="5">5 — Excellent</option><option value="4">4 — Very good</option><option value="3">3 — Good</option><option value="2">2 — Fair</option><option value="1">1 — Needs improvement</option></select><small class="field-error"></small></label><label>Review *<textarea name="review" required placeholder="Please share your experience in your own words."></textarea><small class="field-error"></small></label><button class="button button--primary" type="submit">Submit for approval</button></div></form>`; }

const GALLERY_CATEGORIES = ["Store exterior", "Store interior", "Eye-testing room", "Staff", "New collections", "Events"];

function gallery() {
  const items = runtime.gallery || [];
  const categories = ["All", ...GALLERY_CATEGORIES.filter(cat => items.some(item => item.category === cat))];
  return layout(`${pageHero("Gallery", "A glimpse inside Rudra Optical.", "Photos from the store — added and updated any time by the team, no code required.")}
  <section class="section section--cream"><div class="container">
    ${items.length ? `<div class="filter-row">${categories.map(cat => `<button class="chip ${cat === "All" ? "active" : ""}" data-gallery-filter="${esc(cat)}">${esc(cat)}</button>`).join("")}</div>` : ""}
    <div class="gallery-grid" id="gallery-grid">${items.length ? items.map(galleryTile).join("") : `<p class="admin-empty">Photos will appear here once the team adds them from the admin panel.</p>`}</div>
  </div></section>`, "gallery");
}
function galleryTile(item) {
  return `<button class="gallery-item" type="button" data-action="view-gallery-item" data-id="${item.id}" data-category="${esc(item.category || "")}" style="background-image:url('${esc(item.image)}');background-size:cover;background-position:center" aria-label="${esc(item.title || "Gallery photo")}">${!item.title ? "" : `<span>${esc(item.title)}</span>`}</button>`;
}
function attachGalleryFilters() {
  const chips = document.querySelectorAll("[data-gallery-filter]");
  chips.forEach(chip => chip.addEventListener("click", () => {
    const category = chip.dataset.galleryFilter;
    chips.forEach(c => c.classList.toggle("active", c === chip));
    document.querySelectorAll("#gallery-grid .gallery-item").forEach(tile => {
      tile.style.display = category === "All" || tile.dataset.category === category ? "" : "none";
    });
  }));
}
function galleryModal(item) {
  return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" data-modal-content><div class="modal-top"><h2>${esc(item.title || "Gallery photo")}</h2><button class="close-modal" data-action="close-modal" aria-label="Close">×</button></div><div style="width:100%;aspect-ratio:4/3;background-image:url('${esc(item.image)}');background-size:cover;background-position:center;border-radius:.75rem"></div>${item.description ? `<p style="margin-top:1rem">${esc(item.description)}</p>` : ""}</div></div>`;
}

function legal(kind) { const privacy = kind === "privacy"; return layout(`<section class="section section--paper"><article class="container legal"><p class="eyebrow">${privacy ? "Privacy policy" : "Terms & conditions"}</p><h1>${privacy ? "A simple approach to your information." : "A simple agreement for using this site."}</h1>${privacy ? `<h2>What we collect</h2><p>When you submit an inquiry, appointment request, or review, we collect the details shown on that form. We use them only to respond to your request, manage the appointment or review, and improve store service.</p><h2>How we use it</h2><p>We do not publish reviews until the store team approves them. We do not sell personal information. We may retain submissions for reasonable business record-keeping and customer-service purposes.</p><h2>Contact</h2><p>Contact ${esc(runtime.store.name)} at <a href="mailto:${esc(runtime.store.email)}"><u>${esc(runtime.store.email)}</u></a> if you have a question about your information. Replace this starter text with advice tailored to your local privacy obligations before launch.</p>` : `<h2>Using this website</h2><p>This site provides information about a local optical store, lets visitors request an eye-test appointment, and enables customer inquiries. It does not offer online sales, prices, payments, shipping, or automatic appointment confirmation.</p><h2>Appointment requests</h2><p>An appointment request is not confirmed until the store contacts you directly. Availability may change.</p><h2>Information on this site</h2><p>Frame availability and services can change. Please contact the store or visit in person for current information. Replace this starter text with terms appropriate to your business before launch.</p>`}</article></section>`, kind); }

function notFound() { return layout(`<section class="section section--cream"><div class="container empty-review"><div><p class="eyebrow">Not found</p><h1>That page isn’t here.</h1><p>Try heading back home or exploring the current eyewear showcase.</p><div class="hero-actions" style="justify-content:center"><a class="button button--primary" href="#/">Go home</a><a class="button button--ghost" href="#eyewear">View eyewear</a></div></div></div></section>`); }

function inquiryModal(product) { return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="inquiry-title" data-modal-content><div class="modal-top"><h2 id="inquiry-title">${product ? "Ask about a frame" : "Contact Rudra Optical"}</h2><button class="close-modal" data-action="close-modal" aria-label="Close">×</button></div>${inquiryForm(product)}</div></div>`; }
function reviewModal() { return `<div class="modal-backdrop" data-action="close-modal"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="review-title" data-modal-content><div class="modal-top"><h2 id="review-title">Write a review</h2><button class="close-modal" data-action="close-modal" aria-label="Close">×</button></div><p>We’ll submit this to the store team for approval before it is shown publicly.</p>${reviewForm()}</div></div>`; }
function openModal(html) { modalRoot.innerHTML = html; modalRoot.querySelector("input,select,textarea,button")?.focus(); }
function closeModal() { modalRoot.innerHTML = ""; }

function adminLogin() { return `<div class="admin-shell"><header class="admin-head"><a class="brand" href="#/"><span class="brand-mark"></span><span>${esc(runtime.store.name)}</span></a><a class="button button--light button--small" href="#/">View website</a></header><main class="admin-login"><form class="card form-card" data-form="login" novalidate><p class="eyebrow">Protected area</p><h2>Store admin</h2><p>Sign in to review inquiries, appointments, and customer reviews.</p><div class="form-grid"><label>Admin password<input name="password" type="password" autocomplete="current-password" required><small class="field-error"></small></label><button class="button button--primary" type="submit">Sign in</button></div><p class="form-note">For security, set <code>ADMIN_PASSWORD</code> and <code>TOKEN_SECRET</code> in your server environment before launch.</p></form></main></div>`; }
function admin() { if (!sessionStorage.getItem("visiona-token")) return adminLogin(); if (!adminData) loadAdmin(); const data = adminData || { inquiries: [], appointments: [], reviews: [], products: runtime.products, services: runtime.services, store: runtime.store }; const approved = data.reviews.filter(r => r.status === "approved").length; return `<div class="admin-shell"><header class="admin-head"><a class="brand" href="#/"><span class="brand-mark"></span><span>${esc(runtime.store.name)} · ADMIN</span></a><div style="display:flex;gap:.5rem"><a class="button button--light button--small" href="#/">View site</a><button class="button button--ghost button--small" style="color:white;border-color:#849188" data-action="logout">Sign out</button></div></header><main class="admin-main"><p class="eyebrow">Store workspace</p><h1>Good morning.</h1><div class="admin-tabs">${[["overview","Overview"],["inquiries","Inquiries"],["appointments","Appointments"],["reviews","Reviews"],["products","Products"],["gallery","Gallery"],["services","Services"],["store","Store info"],["content","Site content"]].map(([id,label]) => `<button class="${adminTab===id?"active":""}" data-action="admin-tab" data-tab="${id}">${label}</button>`).join("")}</div>${adminContent(data, approved)}</main></div>`; }
function adminContent(data, approved) { if (adminTab === "overview") return `<div class="metric-grid"><div class="card metric"><strong>${data.inquiries.filter(x=>x.status==="new").length}</strong><span>New inquiries</span></div><div class="card metric"><strong>${data.appointments.filter(x=>x.status==="pending").length}</strong><span>Pending appointments</span></div><div class="card metric"><strong>${data.reviews.filter(x=>x.status==="pending").length}</strong><span>Reviews to review</span></div><div class="card metric"><strong>${approved}</strong><span>Approved reviews</span></div></div><section class="card admin-section"><h2>What needs attention</h2><p class="admin-empty">${data.inquiries.filter(x=>x.status==="new").length || data.appointments.filter(x=>x.status==="pending").length || data.reviews.filter(x=>x.status==="pending").length ? "New customer submissions are ready in their respective tabs." : "Nothing is waiting right now. New customer submissions will appear here."}</p></section>`;
  if (adminTab === "inquiries") return adminTable("Inquiries", data.inquiries, ["Name","Type","Message","Date","Status"], item => `<tr><td><strong>${esc(item.name)}</strong><br>${esc(item.phone)}<br>${esc(item.email)}</td><td>${esc(item.type)}</td><td>${esc(item.product ? `${item.product}: ` : "")}${esc(item.message)}</td><td>${formatDate(item.createdAt)}</td><td><select class="status-select" data-action="update-status" data-kind="inquiries" data-id="${item.id}"><option ${item.status==="new"?"selected":""}>new</option><option ${item.status==="contacted"?"selected":""}>contacted</option><option ${item.status==="resolved"?"selected":""}>resolved</option></select></td></tr>`);
  if (adminTab === "appointments") return adminTable("Appointment requests", data.appointments, ["Visitor","Requested time","Message","Date","Status"], item => `<tr><td><strong>${esc(item.name)}</strong><br>${esc(item.phone)}<br>${esc(item.email || "—")}</td><td>${esc(item.preferredDate)}<br>${esc(item.preferredTime)} · ${esc(item.ageGroup)}</td><td>${esc(item.message || "—")}</td><td>${formatDate(item.createdAt)}</td><td><select class="status-select" data-action="update-status" data-kind="appointments" data-id="${item.id}">${["pending","contacted","confirmed","completed","cancelled"].map(status=>`<option ${item.status===status?"selected":""}>${status}</option>`).join("")}</select></td></tr>`);
  if (adminTab === "reviews") return adminTable("Review moderation", data.reviews, ["Customer","Rating","Review","Submitted","Actions"], item => `<tr><td><strong>${esc(item.name)}</strong></td><td>${"★".repeat(item.rating)}</td><td>${esc(item.review)}</td><td>${formatDate(item.createdAt)}</td><td>${item.status === "pending" ? `<button class="button button--primary button--small" data-action="review-status" data-id="${item.id}" data-status="approved">Approve</button> <button class="button button--ghost button--small" data-action="review-status" data-id="${item.id}" data-status="rejected">Reject</button>` : `<span class="pill ${item.status === "approved" ? "pill--soft" : "pill--red"}">${esc(item.status)}</span>`} <button class="button button--danger button--small" data-action="delete-review" data-id="${item.id}">Delete</button></td></tr>`);
  if (adminTab === "products") {
    const editing = data.products.find(p => p.id === editingProductId);
    return `<section class="card admin-section"><h2>Showcase products</h2><p class="admin-empty">Products are display and inquiry only. They never become products for online purchase.</p><div class="product-admin">${data.products.map(product => `<div class="product-admin-row"><div style="display:flex;gap:.75rem;align-items:center">${product.image ? `<img src="${esc(product.image)}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:.5rem;flex-shrink:0">` : `<div style="width:56px;height:56px;border-radius:.5rem;background:#e7e2d8;flex-shrink:0"></div>`}<div><strong>${esc(product.name)}</strong><p>${esc(categoryTitle(product.category))} · ${esc(product.shape)} · ${esc(product.availability)}</p></div></div><div style="display:flex;gap:.4rem;flex-wrap:wrap"><button class="button button--ghost button--small" data-action="edit-product" data-id="${product.id}">Edit</button><button class="button button--ghost button--small" data-action="toggle-featured" data-id="${product.id}">${product.featured ? "Remove feature" : "Feature"}</button><button class="button button--danger button--small" data-action="delete-product" data-id="${product.id}">Delete</button></div></div>`).join("")}</div></section><section class="card form-card" style="margin-top:1rem"><h2>${editing ? `Edit “${esc(editing.name)}”` : "Add a showcase frame"}</h2><form data-form="product" class="form-grid"><div class="form-grid form-grid--two"><label>Frame name *<input name="name" required value="${editing ? esc(editing.name) : ""}"></label><label>Category *<select name="category">${CATEGORIES.map(c=>`<option value="${c.id}" ${editing?.category===c.id?"selected":""}>${c.title}</option>`).join("")}</select></label></div><div class="form-grid form-grid--two"><label>Shape *<input name="shape" required value="${editing ? esc(editing.shape) : ""}"></label><label>Material *<input name="material" required value="${editing ? esc(editing.material) : ""}"></label></div><div class="form-grid form-grid--two"><label>Colour *<input name="color" required value="${editing ? esc(editing.color) : ""}"></label><label>Age group *<input name="ageGroup" required value="${editing ? esc(editing.ageGroup) : "Adults"}"></label></div><label>Availability<input name="availability" value="${editing ? esc(editing.availability) : "Ask in store"}"></label><label>Description *<textarea name="description" required>${editing ? esc(editing.description) : ""}</textarea></label><label>Photo ${editing?.image ? "<span>(uploading a new one replaces the current photo)</span>" : "<span>(optional — JPEG, PNG, or WEBP, under 4MB)</span>"}<input type="file" name="photo" accept="image/png,image/jpeg,image/webp"></label><div style="display:flex;gap:.6rem"><button class="button button--primary" type="submit">${editing ? "Save changes" : "Add showcase frame"}</button>${editing ? `<button class="button button--ghost" type="button" data-action="cancel-edit-product">Cancel</button>` : ""}</div></form></section>`;
  }
  if (adminTab === "gallery") {
    const items = data.gallery || [];
    return `<section class="card admin-section"><h2>Gallery photos</h2><p class="admin-empty">Only the photo itself is required — title, description, and category are all optional, skip anything you don't want to fill in.</p><div class="product-admin">${items.length ? items.map(item => `<div class="product-admin-row"><div style="display:flex;gap:.75rem;align-items:center"><img src="${esc(item.image)}" alt="" style="width:56px;height:56px;object-fit:cover;border-radius:.5rem;flex-shrink:0"><div><strong>${esc(item.title || "Untitled photo")}</strong><p>${esc(item.category || "No category")}${item.description ? ` · ${esc(item.description)}` : ""}</p></div></div><button class="button button--danger button--small" data-action="delete-gallery-item" data-id="${item.id}">Delete</button></div>`).join("") : `<p class="admin-empty">No photos yet — add the first one below.</p>`}</div></section><section class="card form-card" style="margin-top:1rem"><h2>+ Add photo</h2><form data-form="gallery" class="form-grid"><label>Photo *<input type="file" name="photo" accept="image/png,image/jpeg,image/webp" required></label><label>Title <span>(optional)</span><input name="title" placeholder="e.g. Our new frame wall"></label><label>Description <span>(optional)</span><textarea name="description" placeholder="Optional — a line or two about this photo"></textarea></label><label>Category <span>(optional)</span><select name="category"><option value="">No category</option>${GALLERY_CATEGORIES.map(cat => `<option value="${esc(cat)}">${esc(cat)}</option>`).join("")}</select></label><button class="button button--primary" type="submit">Publish</button></form></section>`;
  } if (adminTab === "services") return `<section class="card admin-section"><h2>Services shown publicly</h2><p class="admin-empty">Only enabled services are shown on the Services page.</p><div class="product-admin">${data.services.map(service => `<div class="product-admin-row"><div><strong>${esc(service.title)}</strong><p>${esc(service.description)}</p></div><button class="button ${service.enabled ? "button--primary" : "button--ghost"} button--small" data-action="toggle-service" data-id="${service.id}">${service.enabled ? "Enabled" : "Disabled"}</button></div>`).join("")}</div></section>`;
  if (adminTab === "content") return `<section class="card form-card"><h2>Homepage content</h2><p>Keep the core message current without changing the site layout.</p><form data-form="store" class="form-grid"><label>Announcement<input name="announcement" value="${esc(data.store.announcement)}"></label><label>Hero title<textarea name="heroTitle">${esc(data.store.heroTitle)}</textarea></label><label>Hero description<textarea name="heroDescription">${esc(data.store.heroDescription)}</textarea></label><button class="button button--primary" type="submit">Save homepage content</button></form></section>`;
  return `<section class="card form-card"><h2>Store information</h2><p>These values are used across the website. For a permanent launch configuration, also update <code>public/config/store.js</code>.</p><form data-form="store" class="form-grid"><div class="form-grid form-grid--two"><label>Store name<input name="name" value="${esc(data.store.name)}"></label><label>Phone<input name="phone" value="${esc(data.store.phone)}"></label></div><div class="form-grid form-grid--two"><label>WhatsApp number<input name="whatsapp" value="${esc(data.store.whatsapp)}"></label><label>Email<input name="email" type="email" value="${esc(data.store.email)}"></label></div><label>Address<input name="address" value="${esc(data.store.address)}"></label><label>Google Maps URL<input name="mapUrl" value="${esc(data.store.mapUrl)}"></label><button class="button button--primary" type="submit">Save store information</button></form></section>`; }
function adminTable(title, items, headers, row) { return `<section class="card admin-section"><h2>${title}</h2>${items.length ? `<div style="overflow-x:auto"><table class="admin-table"><thead><tr>${headers.map(header=>`<th>${header}</th>`).join("")}</tr></thead><tbody>${items.map(row).join("")}</tbody></table></div>` : `<p class="admin-empty">Nothing here yet.</p>`}</section>`; }
function formatDate(date) { return new Date(date).toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }); }

async function api(path, options = {}) { const headers = { "Content-Type": "application/json", ...(options.headers || {}) }; const token = sessionStorage.getItem("visiona-token"); if (token) headers.Authorization = `Bearer ${token}`; const response = await fetch(path, { ...options, headers }); const payload = await response.json().catch(() => ({})); if (!response.ok) throw new Error(payload.message || "Something went wrong. Please try again."); return payload; }
function validateForm(form) { let valid = true; form.querySelectorAll("[required]").forEach(input => { const error = input.closest("label")?.querySelector(".field-error"); let message = ""; if (!input.value.trim()) message = "This field is required."; else if (input.type === "email" && !input.validity.valid) message = "Enter a valid email address."; else if (input.name === "phone" && input.value.replace(/\D/g, "").length < 7) message = "Enter a valid phone number."; if (error) error.textContent = message; if (message) valid = false; }); return valid; }
async function submitCustomerForm(form) { if (!validateForm(form)) { toast("Please check the highlighted fields.", true); return; } const kind = form.dataset.form; const endpoint = kind === "appointment" ? "/api/appointments" : kind === "review" ? "/api/reviews" : "/api/inquiries"; const data = Object.fromEntries(new FormData(form)); const button = form.querySelector("button[type=submit]"); button.disabled = true; button.textContent = "Sending…"; try { const result = await api(endpoint, { method: "POST", body: JSON.stringify(data) }); form.reset(); closeModal(); toast(result.message || "Thanks! Your submission has been received."); } catch (error) { toast(error.message, true); } finally { button.disabled = false; button.textContent = kind === "appointment" ? "Send appointment request" : kind === "review" ? "Submit for approval" : "Send inquiry"; } }
async function submitLogin(form) { if (!validateForm(form)) return; const button = form.querySelector("button"); button.disabled = true; try { const result = await api("/api/auth/login", { method: "POST", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); sessionStorage.setItem("visiona-token", result.token); adminData = null; render(); toast("Signed in."); } catch (error) { toast(error.message, true); } finally { button.disabled = false; } }
async function submitProduct(form) {
  if (!validateForm(form)) return;
  const button = form.querySelector("button[type=submit]");
  const originalLabel = button.textContent;
  button.disabled = true;
  try {
    const formData = new FormData(form);
    const fileInput = form.querySelector('input[name="photo"]');
    const file = fileInput?.files?.[0];
    formData.delete("photo");
    const data = Object.fromEntries(formData);
    if (file) {
      button.textContent = "Processing photo…";
      data.imageData = await resizeImage(file);
    }
    if (editingProductId) {
      await api(`/api/admin/products/${editingProductId}`, { method: "PATCH", body: JSON.stringify(data) });
      toast("Showcase frame updated.");
    } else {
      await api("/api/admin/products", { method: "POST", body: JSON.stringify(data) });
      toast("Showcase frame added.");
    }
    editingProductId = null;
    await loadAdmin();
  } catch (error) {
    toast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
}
async function submitStore(form) { try { const saved = await api("/api/admin/store", { method: "PATCH", body: JSON.stringify(Object.fromEntries(new FormData(form))) }); runtime.store = saved.store; await loadAdmin(); toast("Store information saved."); } catch (error) { toast(error.message, true); } }
async function loadRuntime() { try { const data = await api("/api/public"); runtime = { ...runtime, ...data }; setSchema(); } catch { /* Static design remains visible if the server is not running. */ } }
async function loadAdmin() { try { adminData = await api("/api/admin"); render(); } catch (error) { if (/author/i.test(error.message)) { sessionStorage.removeItem("visiona-token"); adminData = null; render(); } else toast(error.message, true); } }
function setSchema() { document.querySelector("#local-business-schema").textContent = JSON.stringify({ "@context": "https://schema.org", "@type": "Optician", name: runtime.store.name, description: runtime.store.description, telephone: runtime.store.phone, email: runtime.store.email, address: runtime.store.address, openingHours: runtime.store.openingHours.map(x => `${x[0]} ${x[1]}`) }); }

function render() {
  const current = route();
  if (current === "admin") { app.innerHTML = admin(); return; }
  let content;
  if (current === "home") content = home();
  else if (current === "eyewear") content = eyewear();
  else if (current.startsWith("product/")) content = productPage(decodeURIComponent(current.split("/")[1] || ""));
  else if (current === "services") content = services();
  else if (current === "eye-test") content = appointmentPage();
  else if (current === "contact") content = contact();
  else if (current === "about") content = about();
  else if (current === "reviews") content = reviews();
  else if (current === "gallery") content = gallery();
  else if (current === "privacy" || current === "terms") content = legal(current);
  else content = notFound();
  app.innerHTML = content;
  if (current === "eyewear") attachCollectionFilters();
  if (current === "gallery") attachGalleryFilters();
  setTitle(current === "home" ? "" : current === "eye-test" ? "Book an eye test" : current.charAt(0).toUpperCase() + current.slice(1));
}

document.addEventListener("click", event => {
  const action = event.target.closest("[data-action]")?.dataset.action;
  if (!action) return;
  const target = event.target.closest("[data-action]");
  if (action === "toggle-menu") { mobileOpen = !mobileOpen; render(); }
  if (action === "close-menu") { mobileOpen = false; }
  if (action === "close-modal" && (!event.target.closest("[data-modal-content]") || event.target.matches("[data-action=close-modal]"))) closeModal();
  if (action === "inquire") openModal(inquiryModal(getProduct(target.dataset.product)));
  if (action === "inquiry") openModal(inquiryModal());
  if (action === "review") openModal(reviewModal());
  if (action === "view-gallery-item") { const item = (runtime.gallery || []).find(g => g.id === target.dataset.id); if (item) openModal(galleryModal(item)); }
  if (action === "logout") { sessionStorage.removeItem("visiona-token"); adminData = null; location.hash = "#/"; toast("Signed out."); }
  if (action === "admin-tab") { adminTab = target.dataset.tab; render(); }
  if (action === "review-status") updateReview(target.dataset.id, target.dataset.status);
  if (action === "delete-review") deleteReview(target.dataset.id);
  if (action === "toggle-featured") toggleFeatured(target.dataset.id);
  if (action === "delete-product") deleteProduct(target.dataset.id);
  if (action === "delete-gallery-item") deleteGalleryItem(target.dataset.id);
  if (action === "edit-product") { editingProductId = target.dataset.id; render(); document.querySelector('[data-form="product"]')?.scrollIntoView({ behavior: "smooth", block: "start" }); }
  if (action === "cancel-edit-product") { editingProductId = null; render(); }
  if (action === "toggle-service") toggleService(target.dataset.id);
});
document.addEventListener("change", event => { const item = event.target; if (item.dataset.action === "update-status") updateStatus(item.dataset.kind, item.dataset.id, item.value); });
document.addEventListener("submit", event => { const form = event.target.closest("form[data-form]"); if (!form) return; event.preventDefault(); if (["inquiry", "appointment", "review"].includes(form.dataset.form)) submitCustomerForm(form); if (form.dataset.form === "login") submitLogin(form); if (form.dataset.form === "product") submitProduct(form); if (form.dataset.form === "gallery") submitGallery(form); if (form.dataset.form === "store") submitStore(form); });
async function updateStatus(kind, id, status) { try { await api(`/api/admin/${kind}/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); await loadAdmin(); toast("Status updated."); } catch (error) { toast(error.message, true); } }
async function updateReview(id, status) { try { await api(`/api/admin/reviews/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }); await loadAdmin(); toast(`Review ${status}.`); } catch (error) { toast(error.message, true); } }
async function deleteReview(id) { if (!confirm("Delete this review permanently?")) return; try { await api(`/api/admin/reviews/${id}`, { method: "DELETE" }); await loadAdmin(); toast("Review deleted."); } catch (error) { toast(error.message, true); } }
async function toggleFeatured(id) { const product = adminData?.products.find(item => item.id === id); if (!product) return; try { await api(`/api/admin/products/${id}`, { method: "PATCH", body: JSON.stringify({ featured: !product.featured }) }); await loadAdmin(); toast("Product updated."); } catch (error) { toast(error.message, true); } }
async function submitGallery(form) {
  if (!validateForm(form)) return;
  const button = form.querySelector("button[type=submit]");
  const originalLabel = button.textContent;
  button.disabled = true;
  try {
    const formData = new FormData(form);
    const fileInput = form.querySelector('input[name="photo"]');
    const file = fileInput?.files?.[0];
    formData.delete("photo");
    const data = Object.fromEntries(formData);
    if (!file) { toast("Please choose a photo.", true); return; }
    button.textContent = "Uploading…";
    data.imageData = await resizeImage(file);
    await api("/api/admin/gallery", { method: "POST", body: JSON.stringify(data) });
    toast("Photo published.");
    await loadAdmin();
  } catch (error) {
    toast(error.message, true);
  } finally {
    button.disabled = false;
    button.textContent = originalLabel;
  }
}
async function deleteGalleryItem(id) {
  if (!confirm("Delete this photo permanently?")) return;
  try {
    await api(`/api/admin/gallery/${id}`, { method: "DELETE" });
    await loadAdmin();
    toast("Photo deleted.");
  } catch (error) {
    toast(error.message, true);
  }
}

async function deleteProduct(id) { if (!confirm("Delete this showcase frame permanently?")) return; try { await api(`/api/admin/products/${id}`, { method: "DELETE" }); if (editingProductId === id) editingProductId = null; await loadAdmin(); toast("Showcase frame deleted."); } catch (error) { toast(error.message, true); } }
async function toggleService(id) { const service = adminData?.services.find(item => item.id === id); if (!service) return; try { await api(`/api/admin/services/${id}`, { method: "PATCH", body: JSON.stringify({ enabled: !service.enabled }) }); await loadAdmin(); toast("Service visibility updated."); } catch (error) { toast(error.message, true); } }
window.addEventListener("hashchange", () => { closeModal(); mobileOpen = false; render(); });
setSchema();
await loadRuntime();
render();
