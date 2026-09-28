"use strict";

const SERVICES = [
  { icon: "ph-stethoscope", title: "Осмотр и консультация", desc: "Первичный приём, диагностика, рекомендации.", price: "от 2 000 ₽" },
  { icon: "ph-syringe", title: "Вакцинация", desc: "Комплексная вакцинация от основных заболеваний.", price: "от 1 500 ₽" },
  { icon: "ph-test-tube", title: "Анализы", desc: "Кровь, моча, УЗИ и другие виды диагностики.", price: "от 1 200 ₽" },
  { icon: "ph-tooth", title: "Стоматология", desc: "Чистка зубов, удаление, лечение полости рта.", price: "от 3 500 ₽" },
];

const DOCTORS = [
  { name: "Сергей", role: "Терапевт", exp: "Опыт 9 лет" },
  { name: "Наталья", role: "Хирург", exp: "Опыт 12 лет" },
  { name: "Тимур", role: "Дерматолог", exp: "Опыт 6 лет" },
];

const SLOTS = [
  { time: "09:00", taken: false },
  { time: "10:30", taken: true },
  { time: "12:00", taken: false },
  { time: "13:30", taken: false },
  { time: "15:00", taken: true },
  { time: "16:30", taken: false },
  { time: "18:00", taken: false },
  { time: "19:30", taken: true },
];

function renderList(id, items, render) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = items.map((item, i) => render(item, i)).join("");
}

function renderServices() {
  renderList("servicesGrid", SERVICES, (s, i) => `
    <div class="card reveal" role="listitem" style="--reveal-delay:${i * 0.08}s">
      <span class="card__icon"><i class="ph ${s.icon}" aria-hidden="true"></i></span>
      <h3 class="card__title">${s.title}</h3>
      <p class="card__desc">${s.desc}</p>
      <span class="card__price">${s.price}</span>
    </div>`);
}

function renderDoctors() {
  renderList("doctorsGrid", DOCTORS, (d, i) => `
    <div class="doctor-card reveal" role="listitem" style="--reveal-delay:${i * 0.08}s">
      <div class="doctor-card__avatar">${d.name[0]}</div>
      <h3 class="doctor-card__name">${d.name}</h3>
      <p class="doctor-card__role">${d.role}</p>
      <p class="doctor-card__exp">${d.exp}</p>
    </div>`);
}

function populateBookingSelects() {
  const serviceSelect = document.getElementById("bookService");
  const doctorSelect = document.getElementById("bookDoctor");
  if (serviceSelect) serviceSelect.innerHTML = SERVICES.map((s) => `<option value="${s.title}">${s.title} — ${s.price}</option>`).join("");
  if (doctorSelect) doctorSelect.innerHTML = DOCTORS.map((d) => `<option value="${d.name}">${d.name} — ${d.role}</option>`).join("");
}

function renderSlots() {
  const grid = document.getElementById("slotsGrid");
  const hiddenInput = document.getElementById("bookSlot");
  if (!grid) return;

  grid.innerHTML = SLOTS.map((s) => `
    <button type="button" class="slot ${s.taken ? "slot--taken" : ""}" data-time="${s.time}" ${s.taken ? "disabled" : ""} role="option" aria-selected="false">
      ${s.time}
    </button>`).join("");

  grid.querySelectorAll(".slot:not(.slot--taken)").forEach((btn) => {
    btn.addEventListener("click", () => {
      grid.querySelectorAll(".slot").forEach((b) => { b.classList.remove("slot--selected"); b.setAttribute("aria-selected", "false"); });
      btn.classList.add("slot--selected");
      btn.setAttribute("aria-selected", "true");
      hiddenInput.value = btn.dataset.time;
      document.getElementById("slotError").textContent = "";
    });
  });
}

function initBookingForm() {
  const form = document.getElementById("bookingForm");
  if (!form) return;
  const status = document.getElementById("formStatus");
  const fields = {
    petName: { input: document.getElementById("petName"), error: document.getElementById("petNameError") },
    clientPhone: { input: document.getElementById("clientPhone"), error: document.getElementById("clientPhoneError") },
  };
  const setError = (key, msg) => {
    const { input, error } = fields[key];
    input.closest(".form-field").classList.toggle("has-error", Boolean(msg));
    error.textContent = msg || "";
  };

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    let valid = true;

    if (!fields.petName.input.value.trim()) { setError("petName", "Укажите имя питомца."); valid = false; } else setError("petName", "");
    const phonePattern = /^[+\d][\d\s()-]{6,}$/;
    if (!phonePattern.test(fields.clientPhone.input.value.trim())) { setError("clientPhone", "Укажите корректный телефон."); valid = false; } else setError("clientPhone", "");

    const slot = document.getElementById("bookSlot").value;
    if (!slot) { document.getElementById("slotError").textContent = "Выберите время."; valid = false; }

    if (!valid) { status.textContent = ""; return; }

    status.textContent = `Записано! Ждём вас в ${slot} у врача ${document.getElementById("bookDoctor").value}.`;
    form.reset();
    document.querySelectorAll(".slot").forEach((b) => b.classList.remove("slot--selected"));
  });
}

function initRevealObserver() {
  const items = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { items.forEach((el) => el.classList.add("is-visible")); return; }
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add("is-visible"); observer.unobserve(entry.target); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  items.forEach((el) => observer.observe(el));
}

function initHeaderScroll() {
  const header = document.getElementById("header");
  if (!header) return;
  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 12);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initActiveNav() {
  const sections = document.querySelectorAll("main section[id]");
  const links = document.querySelectorAll(".nav__link");
  const linkFor = (id) => document.querySelector(`.nav__link[href="#${id}"]`);
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const link = linkFor(entry.target.id);
      if (link && entry.isIntersecting) { links.forEach((l) => l.classList.remove("is-active")); link.classList.add("is-active"); }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  sections.forEach((s) => observer.observe(s));
}

function initMobileMenu() {
  const menuToggle = document.getElementById("menuToggle");
  const nav = document.getElementById("nav");
  if (!menuToggle || !nav) return;
  const closeMenu = () => {
    nav.classList.remove("is-open");
    menuToggle.classList.remove("is-open");
    menuToggle.setAttribute("aria-expanded", "false");
  };
  menuToggle.addEventListener("click", () => {
    const isOpen = nav.classList.toggle("is-open");
    menuToggle.classList.toggle("is-open", isOpen);
    menuToggle.setAttribute("aria-expanded", String(isOpen));
  });
  nav.querySelectorAll(".nav__link").forEach((l) => l.addEventListener("click", closeMenu));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
}

function initBackToTop() {
  const btn = document.getElementById("backToTop");
  if (!btn) return;
  btn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("year").textContent = new Date().getFullYear();
  renderServices();
  renderDoctors();
  populateBookingSelects();
  renderSlots();
  initBookingForm();
  initHeaderScroll();
  initActiveNav();
  initMobileMenu();
  initBackToTop();
  initRevealObserver();
});
