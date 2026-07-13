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

  const languagePage = document.querySelector("[data-language-page]");
  if (languagePage) {
    const panels = Array.from(document.querySelectorAll("[data-language-panel]"));
    const languageButtons = Array.from(document.querySelectorAll("[data-language-switch]"));
    const translatableText = Array.from(document.querySelectorAll("[data-lang-hi][data-lang-en]"));

    const setLanguage = (language) => {
      const activeLanguage = language === "en" ? "en" : "hi";

      document.documentElement.lang = activeLanguage;
      languagePage.setAttribute("data-active-language", activeLanguage);

      panels.forEach((panel) => {
        const panelLanguage = panel.getAttribute("data-language-panel");
        panel.hidden = panelLanguage !== activeLanguage;
      });

      languageButtons.forEach((button) => {
        const isActive = button.getAttribute("data-language-switch") === activeLanguage;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });

      translatableText.forEach((element) => {
        const translation = element.getAttribute(`data-lang-${activeLanguage}`);
        if (translation) {
          element.textContent = translation;
        }
      });
    };

    languageButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setLanguage(button.getAttribute("data-language-switch"));
      });
    });

    setLanguage(languagePage.getAttribute("data-active-language"));
  }

  const mobileActionBar = document.querySelector(".mobile-action-bar");
  if (mobileActionBar) {
    const syncMobileActionBar = () => {
      mobileActionBar.classList.toggle("is-visible", window.scrollY > 320);
    };

    syncMobileActionBar();
    window.addEventListener("scroll", syncMobileActionBar, { passive: true });
    window.addEventListener("resize", syncMobileActionBar);
  }

  const serviceSelect = document.querySelector("[data-service-select]");
  if (serviceSelect instanceof HTMLSelectElement) {
    const requestedService = new URLSearchParams(window.location.search).get("service");
    const hasRequestedOption = Array.from(serviceSelect.options).some(
      (option) => option.value === requestedService
    );

    if (requestedService && hasRequestedOption) {
      serviceSelect.value = requestedService;
    }
  }

  document.querySelectorAll("[data-hero-carousel]").forEach((carousel) => {
    const slides = Array.from(carousel.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(carousel.querySelectorAll("[data-hero-dot]"));
    const previous = carousel.querySelector("[data-hero-prev]");
    const next = carousel.querySelector("[data-hero-next]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let activeIndex = 0;
    let timer;

    if (slides.length < 2) {
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

    const stopAutoPlay = () => window.clearInterval(timer);
    const startAutoPlay = () => {
      stopAutoPlay();
      if (!reduceMotion) {
        timer = window.setInterval(() => showSlide(activeIndex + 1), 6500);
      }
    };

    previous?.addEventListener("click", () => {
      showSlide(activeIndex - 1);
      startAutoPlay();
    });
    next?.addEventListener("click", () => {
      showSlide(activeIndex + 1);
      startAutoPlay();
    });
    dots.forEach((dot, dotIndex) => {
      dot.addEventListener("click", () => {
        showSlide(dotIndex);
        startAutoPlay();
      });
    });
    carousel.addEventListener("mouseenter", stopAutoPlay);
    carousel.addEventListener("mouseleave", startAutoPlay);
    carousel.addEventListener("focusin", stopAutoPlay);
    carousel.addEventListener("focusout", startAutoPlay);
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        stopAutoPlay();
      } else {
        startAutoPlay();
      }
    });

    showSlide(0);
    startAutoPlay();
  });

  const labelledSections = Array.from(document.querySelectorAll("[data-section-label]"));
  const main = document.querySelector("main");
  if (header && main && labelledSections.length) {
    const indicator = document.createElement("div");
    indicator.className = "mobile-section-indicator";
    indicator.setAttribute("aria-live", "polite");
    indicator.innerHTML = '<span data-section-current></span>';
    header.insertAdjacentElement("afterend", indicator);

    const currentLabel = indicator.querySelector("[data-section-current]");
    let activeLabel = "";
    let framePending = false;
    let changeTimer;

    const isVisible = (element) => !element.hidden && element.getClientRects().length > 0;
    const updateSectionIndicator = () => {
      framePending = false;
      const visibleSections = labelledSections.filter(isVisible);
      if (!visibleSections.length) {
        return;
      }

      const activationLine = indicator.getBoundingClientRect().bottom + 16;
      let activeSection = visibleSections[0];
      visibleSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= activationLine) {
          activeSection = section;
        }
      });

      const nextLabel = activeSection.getAttribute("data-section-label") || "";
      if (!nextLabel || nextLabel === activeLabel) {
        return;
      }

      activeLabel = nextLabel;
      window.clearTimeout(changeTimer);
      indicator.classList.add("is-changing");
      changeTimer = window.setTimeout(() => {
        currentLabel.textContent = nextLabel;
        indicator.classList.remove("is-changing");
      }, currentLabel.textContent ? 120 : 0);
    };

    const requestIndicatorUpdate = () => {
      if (!framePending) {
        framePending = true;
        window.requestAnimationFrame(updateSectionIndicator);
      }
    };

    window.addEventListener("scroll", requestIndicatorUpdate, { passive: true });
    window.addEventListener("resize", requestIndicatorUpdate);
    document.querySelectorAll("[data-language-switch]").forEach((button) => {
      button.addEventListener("click", () => window.setTimeout(requestIndicatorUpdate, 0));
    });
    updateSectionIndicator();
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
