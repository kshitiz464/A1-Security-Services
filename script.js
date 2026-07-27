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

  const requestedService = new URLSearchParams(window.location.search).get("service");
  if (requestedService) {
    document.querySelectorAll("[data-service-select]").forEach((serviceSelect) => {
      if (serviceSelect instanceof HTMLSelectElement) {
        const hasRequestedOption = Array.from(serviceSelect.options).some(
          (option) => option.value === requestedService
        );
        if (hasRequestedOption) {
          serviceSelect.value = requestedService;
        }
      }
    });
    document.querySelectorAll("[data-services-grid]").forEach((grid) => {
      const targetCheckbox = grid.querySelector(`input[value="${CSS.escape(requestedService)}"]`);
      if (targetCheckbox instanceof HTMLInputElement) {
        targetCheckbox.checked = true;
      }
    });
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
  const mobileStickyTitles = [];
  labelledSections.forEach((section) => {
    const titles = Array.from(section.querySelectorAll(".eyebrow")).filter(
      (title) => title.closest("[data-section-label]") === section
    );
    const titleCandidates = titles.length ? titles : [section.querySelector("h1, h2, h3")].filter(Boolean);
    titleCandidates.forEach((title) => {
      const marker = document.createElement("span");
      marker.className = "mobile-sticky-marker";
      marker.setAttribute("aria-hidden", "true");
      title.insertAdjacentElement("beforebegin", marker);
      title.classList.add("mobile-sticky-title");
      mobileStickyTitles.push({
        marker,
        owner: title.closest("article") || section,
        sourceHeight: title.getBoundingClientRect().height,
        title
      });
    });
  });

  if (header) {
    let lastScrollY = Math.max(0, window.scrollY);
    let direction = 0;
    let directionAnchorY = lastScrollY;
    let framePending = false;
    let settleTimer = 0;
    let activeStickyTitle = null;
    let pendingStickyTitle = null;
    let stickyTitleTimer = 0;

    const applyStickyTitle = (nextTitle) => {
      if (activeStickyTitle === nextTitle) {
        return;
      }

      if (activeStickyTitle) {
        activeStickyTitle.marker.style.height = "0px";
        activeStickyTitle.title.classList.remove("is-pinned", "is-entering");
      }

      activeStickyTitle = nextTitle;
      if (!activeStickyTitle) {
        return;
      }

      activeStickyTitle.sourceHeight = activeStickyTitle.title.getBoundingClientRect().height;
      activeStickyTitle.marker.style.height = `${activeStickyTitle.sourceHeight}px`;
      activeStickyTitle.title.classList.add("is-pinned", "is-entering");
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => activeStickyTitle?.title.classList.remove("is-entering"));
      });
    };

    const scheduleStickyTitle = (nextTitle) => {
      if (nextTitle === activeStickyTitle) {
        window.clearTimeout(stickyTitleTimer);
        pendingStickyTitle = null;
        return;
      }
      if (nextTitle === pendingStickyTitle) {
        return;
      }

      window.clearTimeout(stickyTitleTimer);
      pendingStickyTitle = nextTitle;
      stickyTitleTimer = window.setTimeout(() => {
        const confirmedTitle = pendingStickyTitle;
        pendingStickyTitle = null;
        applyStickyTitle(confirmedTitle);
      }, activeStickyTitle ? 180 : 100);
    };

    const setHeaderVisible = (isVisible) => {
      const mustShow = header.classList.contains("is-open") || window.scrollY < 80;
      const shouldShow = isVisible || mustShow;
      const isCurrentlyVisible = !header.classList.contains("is-scroll-hidden");
      const bodyStateMatches = document.body.classList.contains("mobile-header-visible") === shouldShow;
      if (shouldShow === isCurrentlyVisible && bodyStateMatches) {
        return;
      }
      header.classList.toggle("is-scroll-hidden", !shouldShow);
      document.body.classList.toggle("mobile-header-visible", shouldShow);
    };

    const updateMobileHeader = () => {
      framePending = false;
      if (window.innerWidth > 860) {
        header.classList.remove("is-scroll-hidden");
        document.body.classList.remove("mobile-header-visible");
        window.clearTimeout(stickyTitleTimer);
        pendingStickyTitle = null;
        applyStickyTitle(null);
        lastScrollY = Math.max(0, window.scrollY);
        directionAnchorY = lastScrollY;
        return;
      }

      const nextScrollY = Math.max(0, window.scrollY);
      const delta = nextScrollY - lastScrollY;
      const nextDirection = Math.sign(delta);
      if (nextDirection && nextDirection !== direction) {
        direction = nextDirection;
        directionAnchorY = lastScrollY;
      }

      if (header.classList.contains("is-open")) {
        setHeaderVisible(true);
      } else if (nextScrollY < 80 || (direction < 0 && directionAnchorY - nextScrollY >= 18)) {
        setHeaderVisible(true);
        directionAnchorY = nextScrollY;
      } else if (direction > 0 && nextScrollY > 120 && nextScrollY - directionAnchorY >= 42) {
        setHeaderVisible(false);
        directionAnchorY = nextScrollY;
      }

      const visibleTitles = mobileStickyTitles.filter(({ marker }) => marker.getClientRects().length > 0);
      const titleActivationLine = window.innerWidth <= 640 ? 50 : 54;
      let activeTitle = null;
      visibleTitles.forEach((item) => {
        if (item.owner.getBoundingClientRect().top <= titleActivationLine) {
          activeTitle = item;
        }
      });

      const main = document.querySelector("main");
      if (main && main.getBoundingClientRect().bottom <= titleActivationLine) {
        activeTitle = null;
      }

      scheduleStickyTitle(activeTitle);
      lastScrollY = nextScrollY;
    };

    const requestMobileHeaderUpdate = () => {
      if (!framePending) {
        framePending = true;
        window.requestAnimationFrame(updateMobileHeader);
      }
      window.clearTimeout(settleTimer);
      settleTimer = window.setTimeout(updateMobileHeader, 420);
    };

    requestSectionHeaderUpdate = requestMobileHeaderUpdate;
    window.addEventListener("scroll", requestMobileHeaderUpdate, { passive: true });
    window.addEventListener("resize", requestMobileHeaderUpdate);
    header.addEventListener("transitionend", requestMobileHeaderUpdate);
    updateMobileHeader();
  }

  document.querySelectorAll("[data-review-carousel]").forEach((carousel) => {
    const viewport = carousel.querySelector("[data-review-viewport]");
    const track = carousel.querySelector("[data-review-track]");
    const group = carousel.querySelector("[data-review-group]");
    const previous = carousel.querySelector("[data-review-prev]");
    const next = carousel.querySelector("[data-review-next]");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!viewport || !track || !group) {
      return;
    }

    const clone = group.cloneNode(true);
    clone.setAttribute("aria-hidden", "true");
    clone.removeAttribute("data-review-group");
    track.appendChild(clone);

    let animationFrame = 0;
    let resumeTimer = 0;
    let previousTimestamp = 0;
    let paused = reduceMotion;

    const cycleWidth = () => clone.offsetLeft - group.offsetLeft;
    const cardStep = () => {
      const card = group.querySelector(".google-review-card");
      const gap = Number.parseFloat(window.getComputedStyle(group).columnGap) || 14;
      return card ? card.getBoundingClientRect().width + gap : viewport.clientWidth * 0.85;
    };

    const animate = (timestamp) => {
      if (paused || document.hidden) {
        animationFrame = 0;
        previousTimestamp = 0;
        return;
      }
      if (previousTimestamp) {
        viewport.scrollLeft += Math.min(2.4, (timestamp - previousTimestamp) * 0.038);
        const width = cycleWidth();
        if (width > 0 && viewport.scrollLeft >= width) {
          viewport.scrollLeft -= width;
        }
      }
      previousTimestamp = timestamp;
      animationFrame = window.requestAnimationFrame(animate);
    };

    const start = () => {
      window.clearTimeout(resumeTimer);
      if (reduceMotion || document.hidden) {
        return;
      }
      paused = false;
      if (!animationFrame) {
        animationFrame = window.requestAnimationFrame(animate);
      }
    };

    const pauseForInteraction = () => {
      paused = true;
      previousTimestamp = 0;
      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = 0;
      }
      window.clearTimeout(resumeTimer);
      if (!reduceMotion) {
        resumeTimer = window.setTimeout(start, 10000);
      }
    };

    const moveByCard = (direction) => {
      pauseForInteraction();
      if (direction < 0 && viewport.scrollLeft < cardStep() * 0.5) {
        viewport.scrollLeft += cycleWidth();
      }
      viewport.scrollBy({ left: cardStep() * direction, behavior: "smooth" });
    };

    previous?.addEventListener("click", () => moveByCard(-1));
    next?.addEventListener("click", () => moveByCard(1));
    viewport.addEventListener("pointerdown", pauseForInteraction, { passive: true });
    viewport.addEventListener("touchstart", pauseForInteraction, { passive: true });
    viewport.addEventListener("wheel", pauseForInteraction, { passive: true });
    viewport.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault();
        moveByCard(event.key === "ArrowLeft" ? -1 : 1);
      }
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        pauseForInteraction();
      } else {
        start();
      }
    });

    start();
  });

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
    const languageButtons = Array.from(form.querySelectorAll("[data-form-lang]"));
    const submitButton = form.querySelector('button[type="submit"]');

    const isHindi = () => form.getAttribute("data-form-language") === "hi";
    const formCopy = (english, hindi) => (isHindi() ? hindi : english);

    const setFormLanguage = (language) => {
      const activeLanguage = language === "hi" ? "hi" : "en";
      form.setAttribute("data-form-language", activeLanguage);
      form.setAttribute("lang", activeLanguage);

      form.querySelectorAll("[data-form-copy]").forEach((element) => {
        const translation = element.getAttribute(`data-${activeLanguage}`);
        if (translation) {
          element.textContent = translation;
        }
      });
      form.querySelectorAll("[data-placeholder-en][data-placeholder-hi]").forEach((field) => {
        field.setAttribute("placeholder", field.getAttribute(`data-placeholder-${activeLanguage}`) || "");
      });
      form.querySelectorAll("option[data-option-en][data-option-hi]").forEach((option) => {
        option.textContent = option.getAttribute(`data-option-${activeLanguage}`) || option.textContent;
      });
      languageButtons.forEach((button) => {
        const isActive = button.getAttribute("data-form-lang") === activeLanguage;
        button.classList.toggle("is-active", isActive);
        button.setAttribute("aria-pressed", String(isActive));
      });
      validationErrors.forEach((error, field) => {
        if (error.textContent) {
          field.setCustomValidity("");
          error.textContent = getValidationMessage(field);
          field.setCustomValidity(error.textContent);
        }
      });
      if (formStatus) {
        formStatus.textContent = "";
      }
    };

    const getValidationMessage = (field) => {
      const value = field.value.trim();

      if (field.required && !value) {
        if (field instanceof HTMLSelectElement) {
          return formCopy("Please choose an option.", "कृपया एक विकल्प चुनें।");
        }
        return formCopy("This field is required.", "यह जानकारी आवश्यक है।");
      }

      if (field.name === "name" && value) {
        const letters = value.match(/\p{L}/gu) || [];
        const hasOnlyNameCharacters = /^[\p{L}\p{M}\s.'-]+$/u.test(value);
        if (!hasOnlyNameCharacters || letters.length < 2) {
          return formCopy(
            "Enter a valid name using letters, spaces, apostrophes, periods, or hyphens.",
            "कृपया अक्षरों और सामान्य विराम चिह्नों का उपयोग करके सही नाम दर्ज करें।"
          );
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
          return formCopy(
            "Enter a valid 10-digit Indian mobile number starting with 6, 7, 8, or 9.",
            "6, 7, 8 या 9 से शुरू होने वाला सही 10 अंकों का भारतीय मोबाइल नंबर दर्ज करें।"
          );
        }
      }

      if (field.name === "email" && value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
        return formCopy(
          "Enter a valid email address, such as name@example.com.",
          "सही ईमेल पता दर्ज करें, जैसे name@example.com।"
        );
      }

      if (field instanceof HTMLTextAreaElement && value && value.length < 10) {
        return formCopy(
          "Please provide at least 10 characters so we can understand the requirement.",
          "आवश्यकता समझने के लिए कम से कम 10 अक्षर लिखें।"
        );
      }

      if (field.validity.typeMismatch) {
        return formCopy("Please enter a valid value.", "कृपया सही जानकारी दर्ज करें।");
      }
      if (field.validity.patternMismatch) {
        return formCopy(field.title || "Please use the requested format.", "कृपया मांगे गए प्रारूप का उपयोग करें।");
      }
      if (field.validity.tooLong) {
        return formCopy(
          `Please use no more than ${field.maxLength} characters.`,
          `${field.maxLength} से अधिक अक्षर न लिखें।`
        );
      }
      if (field.validity.rangeUnderflow) {
        return formCopy("Please choose today or a future date.", "आज या भविष्य की तारीख चुनें।");
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

    languageButtons.forEach((button) => {
      button.addEventListener("click", () => setFormLanguage(button.getAttribute("data-form-lang")));
    });
    setFormLanguage(form.getAttribute("data-form-language"));

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
          formStatus.textContent = formCopy(
            "Please correct the highlighted fields before sending.",
            "भेजने से पहले चिन्हित जानकारी सही करें।"
          );
        }
        firstInvalidField?.focus();
        return;
      }

      if (submitButton instanceof HTMLButtonElement) {
        submitButton.disabled = true;
        submitButton.textContent = formCopy("Sending...", "भेजा जा रहा है...");
      }

      if (formStatus) {
        formStatus.textContent = formCopy(
          "Sending your enquiry securely...",
          "आपकी पूछताछ सुरक्षित रूप से भेजी जा रही है..."
        );
      }
    });
  });

  const year = document.querySelector("[data-year]");
  if (year) {
    year.textContent = String(new Date().getFullYear());
  }
})();
