(function () {
  /* ------------------------------------------------------------------
   * 1. YOUR ITEMS  (edit these by hand)
   *    img: "" shows a placeholder. Drop in your image path when ready.
   *    cat: which category tab the item lives in.
   *    featured: true also shows it under "Featured".
   * ------------------------------------------------------------------ */
  const IMG = "/IMGS/Product-imgs/";
  const MANUAL = [
    { id: "m-latte",     name: "Iced-Latte",     price: 56, img: "", cat: "coffee",     featured: true },
    { id: "m-americano", name: "Americano",      price: 56, img: "", cat: "coffee",     featured: true },
    { id: "m-cappuccino",name: "Cappuccino",     price: 52, img: "", cat: "coffee" },
    { id: "m-matcha",    name: "Iced Matcha",    price: 62, img: "", cat: "noncoffee" },
    { id: "m-cocoa",     name: "Hot Cocoa",      price: 48, img: "", cat: "noncoffee" },
    { id: "m-croissant", name: "Fresh Croissant",price: 56, img: "", cat: "food",       featured: true },
    { id: "m-cookie",    name: "Choc Chip Cookie",price: 34, img: "", cat: "snacks" },
    { id: "m-berry",     name: "Berry Smoothie", price: 64, img: "", cat: "smoothies" },
  ];

  /* ------------------------------------------------------------------
   * 2. CATEGORIES + which API lists feed each one
   *    TheCocktailDB (drinks) and TheMealDB (food). Free, no key needed.
   *    Cocktail results are filtered to NON-alcoholic only.
   * ------------------------------------------------------------------ */
  // thumb: path to a small category image for the sidebar (blank shows the first letter)
  const CATEGORIES = [
    { key: "featured",  label: "Featured",   thumb: "", api: [] },
    { key: "coffee",    label: "Coffee",     thumb: "", api: [{ src: "drink", c: "Coffee / Tea" }] },
    { key: "noncoffee", label: "Non-Coffee", thumb: "", api: [{ src: "drink", c: "Cocoa" }, { src: "drink", c: "Soft Drink" }] },
    { key: "food",      label: "Food",       thumb: "", api: [{ src: "meal", c: "Breakfast" }, { src: "meal", c: "Side" }] },
    { key: "snacks",    label: "Snacks",     thumb: "", api: [{ src: "meal", c: "Starter" }, { src: "meal", c: "Dessert" }] },
    { key: "smoothies", label: "Smoothies",  thumb: "", api: [{ src: "drink", c: "Shake" }] },
  ];

  const MAX_API_ITEMS = 12;
  const DRINK = "https://www.thecocktaildb.com/api/json/v1/1/";
  const MEAL = "https://www.themealdb.com/api/json/v1/1/";

  const grid = document.getElementById("grid");
  const pills = document.getElementById("categories");
  const catTitle = document.getElementById("catTitle");
  const catCount = document.getElementById("catCount");
  const statusEl = document.getElementById("status");
  if (!grid || !pills) return;

  const hasGsap = !!window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const cache = {};
  let nonAlcoholic = null;
  let current = null;
  let requestId = 0;
  
  const fetchJSON = (url) =>
    fetch(url).then((r) => {
      if (!r.ok) throw new Error(r.status);
      return r.json();
    });

  /* The API has no prices, so make a steady one from the item id (R30 to R85). */
  const priceFor = (id) => 30 + ((Number(id) * 7) % 12) * 5;

  async function getNonAlcoholic() {
    if (!nonAlcoholic) {
      const d = await fetchJSON(DRINK + "filter.php?a=Non_Alcoholic");
      nonAlcoholic = new Set((d.drinks || []).map((x) => x.idDrink));
    }
    return nonAlcoholic;
  }

  async function fetchApiList({ src, c }) {
    const key = src + ":" + c;
    if (cache[key]) return cache[key];
    let items = [];
    if (src === "drink") {
      const [d, safe] = await Promise.all([
        fetchJSON(DRINK + "filter.php?c=" + encodeURIComponent(c)),
        getNonAlcoholic(),
      ]);
      items = (d.drinks || [])
        .filter((x) => safe.has(x.idDrink))
        .map((x) => ({ id: "d" + x.idDrink, name: x.strDrink, price: priceFor(x.idDrink), img: x.strDrinkThumb + "/preview", photo: true }));
    } else {
      const d = await fetchJSON(MEAL + "filter.php?c=" + encodeURIComponent(c));
      items = (d.meals || []).map((x) => ({ id: "f" + x.idMeal, name: x.strMeal, price: priceFor(x.idMeal), img: x.strMealThumb + "/preview", photo: true }));
    }
    cache[key] = items;
    return items;
  }

  async function getItems(cat) {
    const mine = MANUAL.filter((i) => (cat.key === "featured" ? i.featured : i.cat === cat.key));
    if (!cat.api.length) return { items: mine, apiFailed: false };
    try {
      const lists = await Promise.all(cat.api.map(fetchApiList));
      const seen = new Set();
      const extra = lists.flat().filter((i) => !seen.has(i.id) && seen.add(i.id)).slice(0, MAX_API_ITEMS);
      return { items: [...mine, ...extra], apiFailed: false };
    } catch (e) {
      return { items: mine, apiFailed: true };
    }
  }

  /* ---------------------------- rendering ---------------------------- */
  const plusSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"/></svg>';
  const checkSvg = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  function esc(s) {
    const d = document.createElement("div");
    d.textContent = s;
    return d.innerHTML;
  }

  function cardHTML(i) {
    const media = i.img
      ? `<img src="${esc(i.img)}" alt="${esc(i.name)}" loading="lazy" class="${i.photo ? "is-photo" : ""}" onerror="this.replaceWith(Object.assign(document.createElement('div'),{className:'card-ph',textContent:'PLATŌ'}))">`
      : `<div class="card-ph" aria-hidden="true">PLATŌ</div>`;
    return `
      <article class="card" data-id="${esc(i.id)}">
        <div class="card-media">${media}</div>
        <div class="card-body">
          <div>
            <h3 class="card-name">${esc(i.name)}</h3>
            <span class="card-price">R${i.price}</span>
          </div>
          <button class="card-add" type="button" aria-label="Add ${esc(i.name)} to order">${plusSvg}</button>
        </div>
      </article>`;
  }

  function skeletons(n = 8) {
    grid.innerHTML = Array.from({ length: n }, () =>
      `<div class="card is-skeleton"><div class="card-media"></div><div class="sk"></div><div class="sk short"></div></div>`
    ).join("");
  }

  function animateIn() {
    const cards = gsap.utils.toArray(".card", grid);
    if (!hasGsap || reduceMotion) return;
    if (window.ScrollTrigger) ScrollTrigger.getAll().forEach((t) => t.kill());

    gsap.set(cards, { opacity: 0, y: 50, scale: 0.96 });

    if (window.ScrollTrigger) {
      // Staggers each row of cards as they scroll into view; first row plays immediately.
      ScrollTrigger.batch(cards, {
        start: "top 92%",
        once: true,
        onEnter: (batch) =>
          gsap.to(batch, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out", stagger: 0.09, overwrite: true }),
      });
      ScrollTrigger.refresh();
    } else {
      gsap.to(cards, { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power3.out", stagger: 0.09 });
    }
  }

  async function show(cat) {
    const id = ++requestId;
    current = cat.key;
    pills.querySelectorAll(".side-btn").forEach((p) => p.setAttribute("aria-current", p.dataset.key === cat.key));
    catTitle.textContent = cat.label;
    catCount.textContent = "";
    statusEl.textContent = "";
    skeletons();

    const { items, apiFailed } = await getItems(cat);
    if (id !== requestId) return; // a newer tab click won

    if (!items.length) {
      grid.innerHTML = "";
      statusEl.textContent = "Nothing here yet. Try another category.";
      return;
    }
    grid.innerHTML = items.map(cardHTML).join("");
    catCount.textContent = items.length + (items.length === 1 ? " item" : " items");
    if (apiFailed) statusEl.textContent = "Couldn't load extra items right now. Showing the PLATŌ menu.";
    animateIn();
  }

  /* ---------------------------- events ---------------------------- */
  pills.innerHTML = CATEGORIES.map(
    (c) => `<li><button class="side-btn" type="button" data-key="${c.key}" aria-current="false">
      <span class="side-thumb">${c.thumb ? `<img src="${esc(c.thumb)}" alt="">` : c.label[0]}</span>
      <span>${c.label}</span></button></li>`
  ).join("");

  pills.addEventListener("click", (e) => {
    const b = e.target.closest(".side-btn");
    if (!b || b.dataset.key === current) return;
    show(CATEGORIES.find((c) => c.key === b.dataset.key));
    if (window.scrollY > 120) window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });

  grid.addEventListener("click", (e) => {
    const btn = e.target.closest(".card-add");
    const card = e.target.closest(".card");
    if (!btn || !card) return;
    // Other scripts (cart badge etc.) can listen for this.
    document.dispatchEvent(new CustomEvent("plato:add", {
      detail: {
        id: card.dataset.id,
        name: card.querySelector(".card-name").textContent,
        price: card.querySelector(".card-price").textContent,
      },
    }));
    btn.innerHTML = checkSvg;
    btn.classList.add("is-added");
    if (hasGsap && !reduceMotion) gsap.fromTo(btn, { scale: 0.7 }, { scale: 1, duration: 0.4, ease: "back.out(3)" });
    setTimeout(() => { btn.innerHTML = plusSvg; btn.classList.remove("is-added"); }, 1200);
  });

  // One-time intro: sidebar items slide in with a stagger.
  if (hasGsap && !reduceMotion) {
    gsap.from(".side-btn", { opacity: 0, x: -24, duration: 0.5, ease: "power3.out", stagger: 0.07 });
  }

  show(CATEGORIES[0]);
})();