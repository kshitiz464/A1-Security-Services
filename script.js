(function () {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navigation = document.getElementById("primary-navigation");

  if (header && navToggle && navigation) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      header.classList.toggle("is-open", !isOpen);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        navToggle.setAttribute("aria-expanded", "false");
        header.classList.remove("is-open");
      }
    });
  }

  document.querySelectorAll("[data-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-carousel-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-carousel-dot]"));
    const previous = carousel.querySelector("[data-carousel-prev]");
    const next = carousel.querySelector("[data-carousel-next]");
    let activeIndex = 0;

    if (!slides.length) {
      return;
    }

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;

      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
      });

      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeIndex;
        dot.classList.toggle("is-active", isActive);
        dot.setAttribute("aria-selected", String(isActive));
      });
    };

    previous?.addEventListener("click", () => showSlide(activeIndex - 1));
    next?.addEventListener("click", () => showSlide(activeIndex + 1));
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => showSlide(dotIndex));
    });

    showSlide(activeIndex);
  });

  document.querySelectorAll("[data-secure-form]").forEach((form) => {
    form.addEventListener("submit", (event) => {
      const status = form.querySelector("[data-form-status]");
      const honeypot = form.querySelector('input[name="botcheck"]');

      if (honeypot instanceof HTMLInputElement && honeypot.checked) {
        event.preventDefault();
        return;
      }

      if (!form.checkValidity()) {
        event.preventDefault();
        status.textContent = "Please complete the required fields before sending.";
        form.reportValidity();
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      status.textContent = "Sending your enquiry securely...";
    });
  });

  const year = document.querySelector("[data-year]");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
