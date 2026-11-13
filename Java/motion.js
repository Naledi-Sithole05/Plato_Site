(function () {
  if (!window.gsap || !window.ScrollTrigger) return;
  gsap.registerPlugin(ScrollTrigger);

  const stage = document.querySelector(".hero-stage");
  const heroImg = document.querySelector(".hero-img");
  const button = document.querySelector(".hero .btn-pill");
  const cups = gsap.utils.toArray(".fly");
  if (!stage || !heroImg || !cups.length) return;

  const settings = {
    scrollLength: "+=200%",
    heroStartOpacity: 0.15,
    cupStartOpacity: 0.35,
    spins: 1,
    flightTime: 0.6,
    fadeOutAt: 0.88,
    scrub: 1,
  };

  const entries = {
    latte:     { x: "-120vw", y: "20vh",   spin: -1, at: 0 },
    matcha:    { x: "10vw",   y: "-120vh", spin: 1,  at: 0.08 },
    cocoa:     { x: "-10vw",  y: "120vh",  spin: -1, at: 0.16 },
    americano: { x: "120vw",  y: "-20vh",  spin: 1,  at: 0.24 },
  };

  const mm = gsap.matchMedia();

  mm.add("(prefers-reduced-motion: no-preference)", () => {
    document.documentElement.classList.add("hero-anim");
    gsap.set(cups, { xPercent: -50, yPercent: -50 });
    cups.forEach((cup) => {
      if (cup.dataset.cut) gsap.set(cup, { clipPath: "inset(0% 0% 0% 0%)" });
    });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: stage,
        start: "top top",
        end: settings.scrollLength,
        pin: true,
        scrub: settings.scrub,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    tl.fromTo(
      heroImg,
      { opacity: settings.heroStartOpacity },
      { opacity: 1, ease: "none", duration: 1 },
      0
    );

    cups.forEach((cup) => {
      const e = entries[cup.dataset.cup];
      if (!e) return;
      tl.fromTo(
        cup,
        {
          x: e.x,
          y: e.y,
          rotation: e.spin * 360 * settings.spins,
          opacity: settings.cupStartOpacity,
        },
        {
          x: 0,
          y: 0,
          rotation: 0,
          opacity: 1,
          duration: settings.flightTime,
          ease: "power2.out",
        },
        e.at
      );

      if (cup.dataset.cut) {
        tl.to(
          cup,
          {
            clipPath: `inset(0% 0% ${cup.dataset.cut}% 0%)`,
            ease: "none",
            duration: settings.flightTime * 0.3,
          },
          e.at + settings.flightTime * 0.7
        );
      }
    });

    tl.to(cups, { opacity: 0, ease: "none", duration: 1 - settings.fadeOutAt }, settings.fadeOutAt);

    if (button) {
      tl.fromTo(button, { opacity: 0 }, { opacity: 1, ease: "none", duration: 0.15 }, 0.85);
    }

    return () => {
      document.documentElement.classList.remove("hero-anim");
    };
  });

  window.addEventListener("load", () => ScrollTrigger.refresh());
})();