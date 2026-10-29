/* GA4 interaction events. Never collect name/contact field values. */
(function () {
  'use strict';
  if (window.bermanTrack) return;
  window.bermanTrack = function (name, params) {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    if (window.fbq && name !== 'section_view') fbq('trackCustom', name, params);
  };
  var track = window.bermanTrack;
  document.querySelectorAll('a[href="#apply"]').forEach(function (link) {
    var place = link.closest('header') ? 'header' : link.closest('footer') ? 'footer' : 'hero';
    link.addEventListener('click', function () {
      track('cta_click', {
        section_id: place, element_id: link.id || 'footer_apply',
        cta_location: place, target_section: 'apply'
      });
    });
  });
  var select = document.getElementById('f-select');
  if (select) select.addEventListener('change', function () {
    var interest = { '택시': 'taxi', '식사': 'meal', '영화': 'movie', '여행': 'travel' }[select.value];
    if (interest) track('service_preference_select', {
      section_id: 'apply', element_id: 'f-select',
      form_id: 'lead-form', service_interest: interest
    });
  });

  // Representative headings avoid impossible thresholds on tall mobile sections.
  if (!window.IntersectionObserver) return;
  var ids = ['hero', 'intro', 'taxi', 'meal', 'leisure', 'how', 'apply'];
  var entries = [];
  document.querySelectorAll('main > section').forEach(function (section, index) {
    var target = section.querySelector('h1, h2');
    if (target) entries.push({ target: target, id: section.id || ids[index], timer: null, seen: false });
  });
  var footer = document.querySelector('footer');
  if (footer) entries.push({ target: footer, id: 'footer', timer: null, seen: false });
  var observer = new IntersectionObserver(function (changes) {
    changes.forEach(function (change) {
      var item = entries.find(function (entry) { return entry.target === change.target; });
      if (!item || item.seen) return;
      if (change.isIntersecting && change.intersectionRatio >= 0.5 && !document.hidden) {
        if (item.timer !== null) return;
        item.timer = setTimeout(function () {
          item.timer = null;
          if (document.hidden || item.seen) return;
          item.seen = true;
          track('section_view', { section_id: item.id });
          observer.unobserve(item.target);
        }, 1000);
      } else {
        clearTimeout(item.timer);
        item.timer = null;
      }
    });
  }, { threshold: [0, 0.5] });
  entries.forEach(function (entry) { observer.observe(entry.target); });
  document.addEventListener('visibilitychange', function () {
    entries.forEach(function (item) {
      clearTimeout(item.timer);
      item.timer = null;
      if (!item.seen) {
        observer.unobserve(item.target);
        observer.observe(item.target);
      }
    });
  });
})();
