(() => {
  const homeNav = document.querySelector(".top-nav--home");
  const hero = document.getElementById("hero");

  if (homeNav && hero) {
    const toggleHomeNav = () => {
      const threshold = hero.offsetHeight * 0.7;
      const show = window.scrollY > threshold;
      homeNav.classList.toggle("top-nav--revealed", show);
      homeNav.classList.toggle("top-nav--hidden", !show);
    };

    toggleHomeNav();
    window.addEventListener("scroll", toggleHomeNav, { passive: true });
    window.addEventListener("resize", toggleHomeNav);
  }

  const testimonials = [
    {
      name: "Northbridge FC",
      role: "Football Club",
      quote:
        "Exortium transformed our digital presence and doubled season ticket enquiries in one quarter.",
    },
    {
      name: "Helios Taverna",
      role: "Greek Restaurant",
      quote:
        "Our booking flow and campaign strategy now drive consistent weekday reservations and stronger repeat traffic.",
    },
    {
      name: "Summit Ridge Roofing",
      role: "Roofing Company",
      quote:
        "Lead quality jumped dramatically after launch, and our sales team finally has a pipeline we can trust.",
    },
  ];

  const prev = document.getElementById("testimonial-prev");
  const next = document.getElementById("testimonial-next");
  const name = document.getElementById("testimonial-name");
  const role = document.getElementById("testimonial-role");
  const quote = document.getElementById("testimonial-quote");

  if (!prev || !next || !name || !role || !quote) return;

  let idx = 0;

  function render() {
    const t = testimonials[idx];
    name.textContent = t.name;
    role.textContent = t.role;
    quote.textContent = t.quote;
  }

  prev.addEventListener("click", () => {
    idx = (idx - 1 + testimonials.length) % testimonials.length;
    render();
  });

  next.addEventListener("click", () => {
    idx = (idx + 1) % testimonials.length;
    render();
  });

  render();
})();
