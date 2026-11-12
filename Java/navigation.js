(function () {
  const IMG = "/IMGS/Navigation images/";

  const logo = {
    src: IMG + "PLATŌ Forest Green Logo.png",
    alt: "PLATŌ – home",
    href: "/index.html",
  };

  const links = [
    { label: "Home",          href: "/index.html",         icon: "Home.png" },
    { label: "Find Location", href: "/html/Find-Location.html", icon: "Map pin.png" },
    { label: "Shopping",      href: "/html/shopping.html",      icon: "Shopping bag.png" },
    { label: "Account",       href: "/html/Account.html",       icon: "User.png" },
  ];

  const tools = [
    { label: "Search", href: "#",              icon: "Search.png" },
    { label: "Cart",   href: "/Shopping.html", icon: "Shopping cart.png" },
  ];

  const page = (path) =>
    (path || "").split("/").pop().toLowerCase() || "index.html";

  const current = page(window.location.pathname);

  const icon = (file) => `<img src="${encodeURI(IMG + file)}" alt="">`;

  const centreLinks = links
    .map((l) => {
      const active = page(l.href) === current;
      return `
        <li>
          <a class="nav-link${active ? " is-active" : ""}" href="${l.href}"${active ? ' aria-current="page"' : ""}>
            ${icon(l.icon)}
            <span>${l.label}</span>
          </a>
        </li>`;
    })
    .join("");

  const toolButtons = tools
    .map(
      (t) => `
        <a class="nav-tool" href="${t.href}" aria-label="${t.label}">
          ${icon(t.icon)}
        </a>`
    )
    .join("");

  const html = `
    <a class="skip-link" href="#main">Skip to content</a>
    <header class="site-header">
      <a class="site-logo" href="${logo.href}">
        <img src="${encodeURI(logo.src)}" alt="${logo.alt}">
      </a>
      <nav class="site-nav" aria-label="Main">
        <ul>${centreLinks}</ul>
      </nav>
      <div class="site-tools">${toolButtons}</div>
    </header>`;

  document.body.insertAdjacentHTML("afterbegin", html);
})();