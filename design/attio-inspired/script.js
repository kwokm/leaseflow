(function () {
  var nav = document.getElementById("site-nav");
  var toggle = document.querySelector(".menu-toggle");
  var items = document.querySelectorAll(".has-menu");
  var announce = document.getElementById("announce");
  var announceX = document.querySelector(".announce-x");

  function closeMenus(except) {
    items.forEach(function (item) {
      if (item !== except) {
        item.classList.remove("is-open");
        var btn = item.querySelector(".nav-btn");
        if (btn) btn.setAttribute("aria-expanded", "false");
      }
    });
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      if (!open) closeMenus();
    });
  }

  items.forEach(function (item) {
    var btn = item.querySelector(".nav-btn");
    if (!btn) return;
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var open = item.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      if (open) closeMenus(item);
    });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeMenus();
      if (nav) nav.classList.remove("is-open");
      if (toggle) {
        toggle.setAttribute("aria-expanded", "false");
        toggle.setAttribute("aria-label", "Open menu");
      }
    }
  });

  document.addEventListener("click", function (e) {
    if (!e.target.closest(".has-menu")) closeMenus();
  });

  if (announce && announceX) {
    announceX.addEventListener("click", function () {
      announce.remove();
    });
  }

  var tabs = document.querySelectorAll(".plat-tab");
  var panels = document.querySelectorAll(".plat-panel");

  function showTab(id) {
    tabs.forEach(function (tab) {
      var on = tab.getAttribute("data-tab") === id;
      tab.classList.toggle("is-active", on);
      tab.setAttribute("aria-selected", on ? "true" : "false");
    });
    panels.forEach(function (panel) {
      var on = panel.getAttribute("data-panel") === id;
      panel.classList.toggle("is-active", on);
      if (on) panel.removeAttribute("hidden");
      else panel.setAttribute("hidden", "");
    });
  }

  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      showTab(tab.getAttribute("data-tab"));
    });
    tab.addEventListener("keydown", function (e) {
      var keys = ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"];
      if (keys.indexOf(e.key) === -1) return;
      e.preventDefault();
      var list = Array.prototype.slice.call(tabs);
      var i = list.indexOf(tab);
      if (e.key === "Home") i = 0;
      else if (e.key === "End") i = list.length - 1;
      else if (e.key === "ArrowDown" || e.key === "ArrowRight") i = (i + 1) % list.length;
      else i = (i - 1 + list.length) % list.length;
      list[i].focus();
      showTab(list[i].getAttribute("data-tab"));
    });
  });
})();
