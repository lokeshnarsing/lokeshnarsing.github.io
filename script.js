/* =========================================================
   Narsing Lokesh — Portfolio interactions
   ========================================================= */
(function () {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  root.classList.add("js");

  /* ---------- Storage helpers (may throw in private mode) ---------- */
  const store = {
    get(key) {
      try { return localStorage.getItem(key); } catch (e) { return null; }
    },
    set(key, value) {
      try { localStorage.setItem(key, value); } catch (e) { /* ignore */ }
    },
  };

  /* ---------- Theme toggle ---------- */
  const savedTheme = store.get("theme");
  if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;

  document.getElementById("theme-toggle").addEventListener("click", () => {
    const isDark = root.dataset.theme
      ? root.dataset.theme === "dark"
      : window.matchMedia("(prefers-color-scheme: dark)").matches;
    const next = isDark ? "light" : "dark";
    root.dataset.theme = next;
    store.set("theme", next);
  });

  /* ---------- Header: scrolled state ---------- */
  const header = document.getElementById("header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 10);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile menu ---------- */
  const menuBtn = document.getElementById("menu-toggle");
  const navLinks = document.getElementById("nav-links");

  const setMenu = (open) => {
    navLinks.classList.toggle("open", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  };
  menuBtn.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
  navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

  /* ---------- Active nav link on scroll ---------- */
  const links = [...navLinks.querySelectorAll("a")];
  const sections = links.map((a) => document.querySelector(a.getAttribute("href")));

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id));
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => s && spy.observe(s));

  /* ---------- Typing effect ---------- */
  const typed = document.getElementById("typed");
  const phrases = [
    "Java backends.",
    "Spring Boot APIs.",
    "EV charging platforms.",
    "reliable software.",
  ];

  if (reduceMotion) {
    typed.textContent = phrases[0];
  } else {
    let p = 0;
    let i = 0;
    let deleting = false;
    typed.textContent = "";

    const tick = () => {
      const word = phrases[p];
      i += deleting ? -1 : 1;
      typed.textContent = word.slice(0, i);

      let delay = deleting ? 40 : 85;
      if (!deleting && i === word.length) {
        deleting = true;
        delay = 1800;
      } else if (deleting && i === 0) {
        deleting = false;
        p = (p + 1) % phrases.length;
        delay = 350;
      }
      setTimeout(tick, delay);
    };
    setTimeout(tick, 600);
  }

  /* ---------- Hero charge bar ---------- */
  const chargeFill = document.getElementById("charge-fill");
  const chargePct = document.getElementById("charge-pct");
  const setCharge = (pct) => {
    chargeFill.style.width = pct + "%";
    chargePct.textContent = pct;
  };
  setTimeout(() => setCharge(92), 400);
  if (!reduceMotion) {
    setInterval(() => setCharge(84 + Math.round(Math.random() * 14)), 3200);
  }

  /* ---------- Counters ---------- */
  const animateCounter = (el) => {
    const target = parseFloat(el.dataset.target);
    const decimals = parseInt(el.dataset.decimals || "0", 10);
    if (reduceMotion) {
      el.textContent = target.toFixed(decimals);
      return;
    }
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (t < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  /* ---------- Reveal on scroll ---------- */
  const revealer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        entry.target.querySelectorAll(".counter").forEach(animateCounter);
        revealer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
  );

  document.querySelectorAll(".reveal").forEach((el) => {
    // Stagger siblings inside grids for a smoother cascade
    const siblings = el.parentElement ? [...el.parentElement.children].filter((c) => c.classList.contains("reveal")) : [];
    const idx = siblings.indexOf(el);
    if (idx > 0) el.style.transitionDelay = Math.min(idx * 70, 420) + "ms";
    revealer.observe(el);
  });

  /* ---------- Load management demo ---------- */
  const PORT_MAX_KW = 22;
  const ports = [
    { name: "Port A1", on: true },
    { name: "Port A2", on: true },
    { name: "Port B1", on: true },
    { name: "Port B2", on: false },
    { name: "Port C1", on: true },
    { name: "Port C2", on: false },
  ];

  const portsEl = document.getElementById("lm-ports");
  const limitInput = document.getElementById("lm-limit");
  const limitLabel = document.getElementById("lm-limit-label");
  const summary = document.getElementById("lm-summary");

  const portButtons = ports.map((port, idx) => {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "lm-port";
    btn.innerHTML =
      '<span class="lm-port-name"></span><span class="lm-port-kw"></span><span class="lm-bar"><span></span></span>';
    btn.querySelector(".lm-port-name").textContent = port.name;
    btn.addEventListener("click", () => {
      ports[idx].on = !ports[idx].on;
      renderLoad();
    });
    portsEl.appendChild(btn);
    return btn;
  });

  const renderLoad = () => {
    const limit = Number(limitInput.value);
    const active = ports.filter((p) => p.on).length;
    const share = active ? Math.min(limit / active, PORT_MAX_KW) : 0;
    const total = share * active;

    limitLabel.textContent = limit + " kW";

    portButtons.forEach((btn, idx) => {
      const on = ports[idx].on;
      const kw = on ? share : 0;
      btn.setAttribute("aria-pressed", String(on));
      btn.setAttribute("aria-label", ports[idx].name + (on ? ", charging at " + kw.toFixed(1) + " kilowatts" : ", idle"));
      btn.querySelector(".lm-port-kw").textContent = on ? kw.toFixed(1) + " kW" : "idle";
      btn.querySelector(".lm-bar span").style.width = (kw / PORT_MAX_KW) * 100 + "%";
    });

    summary.innerHTML = "";
    const parts = [
      ["active ports", String(active)],
      ["per port", share.toFixed(1) + " kW"],
      ["total", total.toFixed(1) + " / " + limit + " kW"],
    ];
    parts.forEach(([label, value], k) => {
      const b = document.createElement("b");
      b.textContent = value;
      summary.append(label + " ", b, k < parts.length - 1 ? "  ·  " : "");
    });
  };

  limitInput.addEventListener("input", renderLoad);
  renderLoad();

  /* ---------- Toast ---------- */
  const toast = document.getElementById("toast");
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  };

  /* ---------- Copy buttons ---------- */
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const value = btn.dataset.copy;
      try {
        await navigator.clipboard.writeText(value);
        showToast("Copied " + value);
      } catch (e) {
        showToast("Couldn't copy — " + value);
      }
    });
  });

  /* ---------- Contact form (mailto) ---------- */
  const form = document.getElementById("contact-form");
  const formError = document.getElementById("form-error");

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const fields = {
      name: document.getElementById("cf-name"),
      email: document.getElementById("cf-email"),
      message: document.getElementById("cf-message"),
    };
    const name = fields.name.value.trim();
    const email = fields.email.value.trim();
    const message = fields.message.value.trim();

    Object.values(fields).forEach((f) => f.classList.remove("invalid"));

    const missing = [];
    if (!name) missing.push(fields.name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) missing.push(fields.email);
    if (!message) missing.push(fields.message);

    if (missing.length) {
      missing.forEach((f) => f.classList.add("invalid"));
      formError.textContent = "Please fill in your name, a valid email and a message.";
      missing[0].focus();
      return;
    }

    formError.textContent = "";
    const subject = encodeURIComponent("Portfolio enquiry from " + name);
    const body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
    window.location.href = "mailto:narsinglokesh1998@gmail.com?subject=" + subject + "&body=" + body;
    showToast("Opening your email app…");
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
})();
