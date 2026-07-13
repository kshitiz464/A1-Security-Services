(function () {
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector("[data-nav-toggle]");
  const navigation = document.getElementById("primary-navigation");
  let requestSectionHeaderUpdate = () => {};

  if (header && navToggle && navigation) {
    navToggle.addEventListener("click", () => {
      const isOpen = navToggle.getAttribute("aria-expanded") === "true";
      navToggle.setAttribute("aria-expanded", String(!isOpen));
      header.classList.toggle("is-open", !isOpen);
      window.requestAnimationFrame(requestSectionHeaderUpdate);
    });

    navigation.addEventListener("click", (event) => {
      if (event.target instanceof HTMLAnchorElement) {
        navToggle.setAttribute("aria-expanded", "false");
        header.classList.remove("is-open");
        window.requestAnimationFrame(requestSectionHeaderUpdate);
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
        timer = window.setInterval(() => showSlide(activeIndex + 1), 5200);
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
    indicator.innerHTML = '<span data-section-current></span><button type="button" class="mobile-section-menu" aria-label="Open site navigation"><span aria-hidden="true"></span></button>';
    header.insertAdjacentElement("afterend", indicator);

    const currentLabel = indicator.querySelector("[data-section-current]");
    const sectionMenu = indicator.querySelector(".mobile-section-menu");
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

      const activationLine = header.offsetHeight + 8;
      let activeSection = visibleSections[0];
      visibleSections.forEach((section) => {
        if (section.getBoundingClientRect().top <= activationLine) {
          activeSection = section;
        }
      });

      const nextLabel = activeSection.getAttribute("data-section-label") || "";
      const firstLabel = visibleSections[0].getAttribute("data-section-label") || "";
      const shouldReplaceHeader = nextLabel !== firstLabel && !header.classList.contains("is-open");
      header.classList.toggle("is-section-collapsed", shouldReplaceHeader);
      indicator.classList.toggle("is-active", shouldReplaceHeader);

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

    requestSectionHeaderUpdate = requestIndicatorUpdate;

    sectionMenu?.addEventListener("click", () => {
      header.classList.remove("is-section-collapsed");
      indicator.classList.remove("is-active");
      if (navToggle && navToggle.getAttribute("aria-expanded") !== "true") {
        navToggle.click();
      }
    });

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
    form.noValidate = true;
    const fields = Array.from(
      form.querySelectorAll('input:not([type="hidden"]):not([name="botcheck"]), select, textarea')
    );
    const validationErrors = new Map();
    const formStatus = form.querySelector("[data-form-status]");

    const getValidationMessage = (field) => {
      const value = field.value.trim();

      if (field.required && !value) {
        if (field instanceof HTMLSelectElement) {
          return "Please choose an option.";
        }
        return "This field is required.";
      }

      if (field.name === "name" && value) {
        const letters = value.match(/\p{L}/gu) || [];
        const hasOnlyNameCharacters = /^[\p{L}\p{M}\s.'-]+$/u.test(value);
        if (!hasOnlyNameCharacters || letters.length < 2) {
          return "Enter a valid name using letters, spaces, apostrophes, periods, or hyphens.";
        }
      }

      if (field.name === "phone" && value) {
        const digits = value.replace(/\D/g, "");
        let mobileNumber = digits;
        if (digits.length === 12 && digits.startsWith("91")) {
          mobileNumber = digits.slice(2);
        } else if (digits.length === 11 && digits.startsWith("0")) {
          mobileNumber = digits.slice(1);
        }
        if (!/^[6-9]\d{9}$/.test(mobileNumber)) {
          return "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.";
        }
      }

      if (field.name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        return "Enter a valid email address, such as name@example.com.";
      }

      if (field instanceof HTMLTextAreaElement && value && value.length < 10) {
        return "Please provide at least 10 characters so we can understand the requirement.";
      }

      if (field.validity.typeMismatch) {
        return "Please enter a valid value.";
      }
      if (field.validity.patternMismatch) {
        return field.title || "Please use the requested format.";
      }
      if (field.validity.tooLong) {
        return `Please use no more than ${field.maxLength} characters.`;
      }
      if (field.validity.rangeUnderflow) {
        return "Please choose today or a future date.";
      }

      return "";
    };

    const validateField = (field, showMessage) => {
      field.setCustomValidity("");
      const message = getValidationMessage(field);
      field.setCustomValidity(message);
      const error = validationErrors.get(field);
      const isValid = !message;

      field.setAttribute("aria-invalid", String(!isValid));
      if (error) {
        error.textContent = showMessage ? message : "";
      }
      return isValid;
    };

    fields.forEach((field, fieldIndex) => {
      const error = document.createElement("span");
      const errorId = `form-${Array.from(document.forms).indexOf(form)}-${field.name || fieldIndex}-error`;
      error.className = "field-error";
      error.id = errorId;
      error.setAttribute("aria-live", "polite");
      const label = field.closest("label");
      if (label?.parentElement) {
        const fieldGroup = document.createElement("div");
        fieldGroup.className = "field-group";
        label.insertAdjacentElement("beforebegin", fieldGroup);
        fieldGroup.append(label, error);
      } else {
        field.insertAdjacentElement("afterend", error);
      }
      validationErrors.set(field, error);
      field.setAttribute("aria-describedby", [field.getAttribute("aria-describedby"), errorId].filter(Boolean).join(" "));

      const revalidate = () => {
        const wasInvalid = field.getAttribute("aria-invalid") === "true";
        validateField(field, wasInvalid);
        if (formStatus) {
          formStatus.textContent = "";
        }
      };
      field.addEventListener("input", revalidate);
      field.addEventListener("change", revalidate);
      field.addEventListener("blur", () => validateField(field, true));
    });

    const startDate = form.querySelector('input[type="date"][name="start_date"]');
    if (startDate instanceof HTMLInputElement) {
      const today = new Date();
      const localToday = new Date(today.getTime() - today.getTimezoneOffset() * 60000);
      startDate.min = localToday.toISOString().split("T")[0];
    }

    form.addEventListener("submit", (event) => {
      const honeypot = form.querySelector('input[name="botcheck"]');

      if (honeypot instanceof HTMLInputElement && honeypot.checked) {
        event.preventDefault();
        return;
      }

      let firstInvalidField;
      fields.forEach((field) => {
        if (!validateField(field, true) && !firstInvalidField) {
          firstInvalidField = field;
        }
      });
      if (firstInvalidField || !form.checkValidity()) {
        event.preventDefault();
        if (formStatus) {
          formStatus.textContent = "Please correct the highlighted fields before sending.";
        }
        firstInvalidField?.focus();
        return;
      }

      const submitButton = form.querySelector('button[type="submit"]');
      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = true;
        submitButton.textContent = "Sending...";
      }

      if (formStatus) {
        formStatus.textContent = "Sending your enquiry securely...";
      }
    });
  });

  const year = document.querySelector("[data-year]");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
