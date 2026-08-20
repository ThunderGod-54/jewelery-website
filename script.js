(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;

  /* ---------------------------------------------------------
     LOADER
  --------------------------------------------------------- */
  const loader = document.getElementById("loader");
  window.addEventListener("load", () => {
    setTimeout(() => loader && loader.classList.add("hidden"), 500);
  });
  // Fallback in case 'load' fires late or already fired
  setTimeout(() => loader && loader.classList.add("hidden"), 2200);

  /* ---------------------------------------------------------
     THEME TOGGLE (persisted)
  --------------------------------------------------------- */
  const themeToggle = document.getElementById("themeToggle");
  const THEME_KEY = "ratnavali-theme";

  function getStoredTheme() {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch (e) {
      return null;
    }
  }
  function storeTheme(value) {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch (e) {
      /* ignore */
    }
  }
  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeToggle && themeToggle.setAttribute("aria-pressed", theme === "light");
    storeTheme(theme);
  }

  const prefersLight = window.matchMedia(
    "(prefers-color-scheme: light)",
  ).matches;
  applyTheme(getStoredTheme() || (prefersLight ? "light" : "dark"));

  themeToggle &&
    themeToggle.addEventListener("click", () => {
      const next =
        root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(next);
    });

  /* ---------------------------------------------------------
     NAV: scrolled state + mobile drawer
  --------------------------------------------------------- */
  const nav = document.getElementById("siteNav");
  const onScrollNav = () => {
    if (window.scrollY > 40) nav.classList.add("scrolled");
    else nav.classList.remove("scrolled");
  };
  onScrollNav();
  window.addEventListener("scroll", onScrollNav, { passive: true });

  const hamburger = document.getElementById("hamburger");
  const drawer = document.getElementById("mobileDrawer");
  function closeDrawer() {
    hamburger.classList.remove("open");
    drawer.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  }
  hamburger &&
    hamburger.addEventListener("click", () => {
      const isOpen = drawer.classList.toggle("open");
      hamburger.classList.toggle("open", isOpen);
      hamburger.setAttribute("aria-expanded", String(isOpen));
    });
  drawer &&
    drawer
      .querySelectorAll("a")
      .forEach((a) => a.addEventListener("click", closeDrawer));

  /* ---------------------------------------------------------
     SMOOTH ANCHOR SCROLL (accounts for fixed nav height)
  --------------------------------------------------------- */
  const navHeight = () => nav.offsetHeight;
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      const id = link.getAttribute("href");
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top =
        target.getBoundingClientRect().top + window.scrollY - (navHeight() - 1);
      window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    });
  });

  /* ---------------------------------------------------------
     SCROLL REVEAL (IntersectionObserver)
  --------------------------------------------------------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.16, rootMargin: "0px 0px -8% 0px" },
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in-view"));
  }

  /* ---------------------------------------------------------
     HERO GEM — mouse parallax + scroll-linked rotation
  --------------------------------------------------------- */
  const gemWrap = document.getElementById("gemWrap");
  const gemGroup = document.getElementById("gemGroup");
  const hero = document.getElementById("hero");

  let mouseX = 0,
    mouseY = 0,
    curX = 0,
    curY = 0;

  if (gemWrap && !reduceMotion) {
    hero.addEventListener("pointermove", (e) => {
      const rect = hero.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    });

    function animateGem() {
      curX += (mouseX - curX) * 0.06;
      curY += (mouseY - curY) * 0.06;
      const scrollY = window.scrollY;
      const rotate = curX * 10;
      const tiltY = curY * 6;
      const drift = Math.min(scrollY * 0.18, 120);
      gemWrap.style.transform = `translateY(calc(-50% + ${drift}px)) translateX(${curX * 14}px) rotate(${rotate * 0.3}deg)`;
      gemGroup.style.transform = `rotate(${rotate}deg) skewY(${tiltY}deg)`;
      requestAnimationFrame(animateGem);
    }
    requestAnimationFrame(animateGem);
  }

  /* ---------------------------------------------------------
     CONTACT FORM — inline success state (no backend wired)
  --------------------------------------------------------- */
  const form = document.getElementById("contactForm");
  form &&
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const btn = form.querySelector(".form-submit");
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      btn.classList.add("sent");
      btn.disabled = true;
      setTimeout(() => {
        form.reset();
        btn.classList.remove("sent");
        btn.disabled = false;
      }, 2600);
    });
})();
