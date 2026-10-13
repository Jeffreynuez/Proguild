/* ============================================================
   Proguild revamp: motion and interaction for the new sections.
   Runs after main.js. Skips animation for reduced motion, and keeps
   the page untouched inside the /admin visual editor (?edit=1).
   ============================================================ */
(function () {
  'use strict';
  var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var EDIT = /[?&]edit=1/.test(location.search);
  var HOVER_NONE = window.matchMedia('(hover: none)').matches;
  var IO = 'IntersectionObserver' in window;
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
  function seg(p, a, b) { return clamp((p - a) / (b - a), 0, 1); }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  /* ---------- hero: words rise in ---------- */
  var hero = document.getElementById('hero');
  var h1 = hero && hero.querySelector('h1');
  if (h1 && !EDIT && !RM) {
    var text = h1.textContent.trim();
    h1.setAttribute('aria-label', text);
    h1.innerHTML = text.split(/\s+/).map(function (w, i) {
      return '<span class="w" aria-hidden="true" style="transition-delay:' + (150 + i * 75) + 'ms">' + escapeHtml(w) + '</span>';
    }).join(' ');
  }
  if (hero) requestAnimationFrame(function () { requestAnimationFrame(function () { hero.classList.add('words-in'); }); });

  /* ---------- hero: background video loop ----------
     Starts after the page has loaded, so the photo paints first and the
     video never slows the first view. Phones (a hero much taller than
     it is wide) get the tall cut. Skipped for reduced motion, Save-Data and the
     CMS editor; the photo stays in all three. Pauses off screen. */
  var hv = hero && $('.hero-video', hero);
  var conn = navigator.connection || {};
  if (hv && !RM && !EDIT && !conn.saveData) {
    var startHero = function () {
      var tall = hero.clientWidth / Math.max(1, hero.clientHeight) < 0.7;
      hv.addEventListener('playing', function () {
        hv.classList.add('ready');
        hv.parentNode.classList.add('video-on');
      }, { once: true });
      hv.preload = 'auto';
      hv.src = (tall && hv.dataset.srcMobile) || hv.dataset.src;
      var pr = hv.play(); if (pr && pr.catch) pr.catch(function () {});
    };
    if (document.readyState === 'complete') setTimeout(startHero, 150);
    else window.addEventListener('load', function () { setTimeout(startHero, 150); });
    if (IO) new IntersectionObserver(function (entries) {
      if (!hv.getAttribute('src')) return;
      if (entries[0].isIntersecting) { var p = hv.play(); if (p && p.catch) p.catch(function () {}); }
      else hv.pause();
    }).observe(hero);
  }

  /* ---------- Why Choose Us: clips play while on screen ---------- */
  var vcards = $$('.vcard');
  vcards.forEach(function (c) {
    var img = $('.vmedia img', c);
    if (!$('video', c) && img && !RM) img.classList.add('kb');
  });
  if (IO && !RM) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        var v = $('video', e.target);
        if (!v) return;
        if (e.isIntersecting) {
          if (!v.getAttribute('src')) {
            v.addEventListener('playing', function () { v.classList.add('ready'); }, { once: true });
            v.src = v.dataset.src;
          }
          var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
        } else { v.pause(); }
      });
    }, { threshold: 0.25 });
    vcards.forEach(function (c) { vio.observe(c); });
  }
  /* on touch screens there is no hover: open a card while it sits mid-screen */
  if (IO && HOVER_NONE) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { e.target.classList.toggle('open', e.isIntersecting); });
    }, { rootMargin: '-38% 0px -38% 0px' });
    vcards.concat($$('.ptile')).forEach(function (c) { cio.observe(c); });
  }

  /* ---------- How It Works: the work order travels the line ---------- */
  var story = document.getElementById('processStory');
  if (story) {
    var ticket = $('#storyTicket', story), fill = $('#storyFill', story), clock = $('#storyClock', story), van = $('#storyVan', story);
    var statusEl = $('#ticketStatus', story), eta = $('#ticketEta', story), check = $('#ticketCheck', story);
    var checks = $$('li', check), nodes = $$('.snode', story), steps = $$('.sstep', story);
    var X = [12.5, 37.5, 62.5, 87.5];
    var desktop = window.matchMedia('(min-width: 861px)');
    var lastStatus = '';
    function setStatus(t, done) {
      if (t !== lastStatus) { statusEl.textContent = t; lastStatus = t; }
      statusEl.classList.toggle('done', !!done);
    }
    function render(p) {
      var a = seg(p, 0.02, 0.18), b = seg(p, 0.18, 0.44), c = seg(p, 0.44, 0.7), d = seg(p, 0.7, 0.94);
      var x, stage;
      if (p < 0.18) { x = -6 + (X[0] + 6) * ease(a); stage = 0; }
      else if (p < 0.44) { x = X[0] + (X[1] - X[0]) * ease(b); stage = 1; }
      else if (p < 0.7) { x = X[1] + (X[2] - X[1]) * ease(c); stage = 2; }
      else { x = X[2] + (X[3] - X[2]) * ease(d); stage = 3; }
      ticket.style.left = x + '%';
      ticket.style.opacity = String(clamp(a * 1.5, 0, 1));
      fill.style.setProperty('--fill', clamp((x - X[0]) / (X[3] - X[0]), 0, 1).toFixed(4));
      nodes.forEach(function (n, i) { n.classList.toggle('on', x >= X[i] - 0.4); });
      steps.forEach(function (s, i) { s.classList.toggle('on', i === stage); });
      clock.style.opacity = (p > 0.2 && p < 0.5) ? '1' : '0';
      clock.style.setProperty('--c', ease(b).toFixed(4));
      van.style.left = x + '%';
      van.style.opacity = (stage === 2 && c > 0.02 && c < 0.98) ? '1' : '0';
      eta.classList.toggle('on', stage >= 2);
      check.classList.toggle('on', stage === 3);
      checks.forEach(function (li, i) { li.classList.toggle('on', d > 0.25 + i * 0.28); });
      if (stage === 0) setStatus('Sent');
      else if (stage === 1) setStatus(b < 0.98 ? 'Received' : 'Acknowledged', b >= 0.98);
      else if (stage === 2) setStatus('On the way');
      else setStatus(d < 0.98 ? 'On site' : 'Completed', d >= 0.98);
    }
    var live = false, ticking = false;
    function measure() {
      var r = story.getBoundingClientRect();
      var total = story.offsetHeight - window.innerHeight;
      render(total > 0 ? clamp(-r.top / total, 0, 1) : 1);
      ticking = false;
    }
    function onScroll() { if (live && !ticking) { ticking = true; requestAnimationFrame(measure); } }
    function setup() {
      live = desktop.matches && !RM && !EDIT;
      story.classList.toggle('live', live);
      if (live) measure(); else render(1);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', setup);
    if (desktop.addEventListener) desktop.addEventListener('change', setup);
    setup();
  }

  /* ---------- Our Services: building explorer ---------- */
  var ex = document.getElementById('explorer');
  if (ex) {
    var hots = $$('.hot', ex), cards = $$('.svc-card'), pills = $$('.svc-pill');
    var filterBar = document.getElementById('svcFilter');
    var current = 0, touched = false, tourTimer = null;
    function select(i, fromUser) {
      current = i;
      hots.forEach(function (h) { h.classList.toggle('on', +h.dataset.i === i); });
      cards.forEach(function (c) { c.classList.toggle('on', +c.dataset.i === i); });
      pills.forEach(function (p) {
        var on = +p.dataset.i === i; p.classList.toggle('on', on);
        if (on && fromUser && p.parentNode.scrollWidth > p.parentNode.clientWidth) {
          p.parentNode.scrollTo({ left: p.offsetLeft - 16, behavior: RM ? 'auto' : 'smooth' });
        }
      });
    }
    function stopTour() { touched = true; if (tourTimer) { clearInterval(tourTimer); tourTimer = null; } }
    function visibleIdx() { return hots.filter(function (h) { return !h.classList.contains('dim'); }).map(function (h) { return +h.dataset.i; }); }
    hots.forEach(function (h) {
      h.addEventListener('click', function () { stopTour(); select(+h.dataset.i, true); });
      h.addEventListener('mouseenter', function () { if (!HOVER_NONE) { stopTour(); select(+h.dataset.i, false); } });
      h.addEventListener('focus', function () { stopTour(); select(+h.dataset.i, false); });
    });
    pills.forEach(function (p) { p.addEventListener('click', function () { stopTour(); select(+p.dataset.i, true); }); });
    if (filterBar) filterBar.addEventListener('click', function (e) {
      var chip = e.target.closest('.chip'); if (!chip) return;
      stopTour();
      var cat = chip.dataset.cat;
      hots.forEach(function (h) { h.classList.toggle('dim', cat !== 'all' && h.dataset.cat !== cat); });
      pills.forEach(function (p) { p.classList.toggle('dim', cat !== 'all' && p.dataset.cat !== cat); });
      var vis = visibleIdx();
      if (vis.length && vis.indexOf(current) < 0) select(vis[0], true);
    });
    /* a slow tour of the hotspots until someone touches the explorer */
    if (IO && !RM && !EDIT) {
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting || touched) return;
        obs.disconnect();
        tourTimer = setInterval(function () {
          if (touched) return;
          var vis = visibleIdx(); var k = vis.indexOf(current);
          select(vis[(k + 1) % vis.length], false);
        }, 2600);
      }, { threshold: 0.45 }).observe(ex);
    }
    /* Request this service: fill the form and take them there */
    var svcSelect = document.getElementById('svc');
    $$('.svc-req').forEach(function (a) {
      a.addEventListener('click', function () {
        if (!svcSelect) return;
        svcSelect.value = a.dataset.service;
        svcSelect.classList.remove('flash'); void svcSelect.offsetWidth; svcSelect.classList.add('flash');
        setTimeout(function () { var fn = document.getElementById('fn'); if (fn) fn.focus({ preventScroll: true }); }, 900);
      });
    });
  }

  /* ---------- Coverage: ripple out from Chandler ---------- */
  var map = document.getElementById('usMap');
  var wrap = map && map.closest('.map-wrap');
  if (map && wrap && window.COVERAGE) {
    var NS = 'http://www.w3.org/2000/svg';
    var states = $$('.state', map);
    var tiers = {}; (COVERAGE.tiers || []).forEach(function (t) { tiers[t.id] = t.color; });
    var noneColor = tiers.none || '#e6ebea';
    var countEl = document.getElementById('covCount');
    var isCovered = function (el) { return el.dataset.state !== 'DC' && (COVERAGE.states[el.dataset.state] || 'none') !== 'none'; };
    var covered = states.filter(isCovered);
    var az = $('.state[data-state="AZ"]', map);
    var hq = null, tag = null;
    if (az) {
      var bb = az.getBBox();
      hq = { x: bb.x + bb.width * 0.53, y: bb.y + bb.height * 0.66 };   /* Chandler sits south-central in Arizona */
      var g = document.createElementNS(NS, 'g'); g.setAttribute('class', 'hq'); g.setAttribute('aria-hidden', 'true');
      ['hq-wave', 'hq-ring r1', 'hq-ring r2', 'hq-ring r3'].forEach(function (cls) {
        var c = document.createElementNS(NS, 'circle'); c.setAttribute('class', cls);
        c.setAttribute('cx', hq.x); c.setAttribute('cy', hq.y); c.setAttribute('r', 7); g.appendChild(c);
      });
      var dot = document.createElementNS(NS, 'circle'); dot.setAttribute('class', 'hq-dot');
      dot.setAttribute('cx', hq.x); dot.setAttribute('cy', hq.y); dot.setAttribute('r', 6); g.appendChild(dot);
      map.appendChild(g);
      tag = document.createElement('div'); tag.className = 'hq-tag';
      tag.innerHTML = '<b>' + escapeHtml(wrap.dataset.hqLabel || 'Headquarters') + '</b>' + escapeHtml(wrap.dataset.hqCity || '');
      wrap.appendChild(tag);
      var placeTag = function () {
        var wr = wrap.getBoundingClientRect(), dr = dot.getBoundingClientRect();
        tag.style.left = (dr.left - wr.left + dr.width / 2) + 'px';
        tag.style.top = (dr.top - wr.top) + 'px';
      };
      placeTag(); window.addEventListener('resize', placeTag);
    }
    function finish() {
      states.forEach(function (el) { el.style.fill = el.dataset.fill || el.style.fill; });
      if (countEl) countEl.textContent = covered.length;
      map.classList.add('rippling'); if (tag) tag.classList.add('on');
    }
    states.forEach(function (el) { el.dataset.fill = el.style.fill; });
    if (RM || EDIT || !IO || !hq || !map.animate) { finish(); }
    else {
      states.forEach(function (el) { el.style.fill = noneColor; });
      if (countEl) countEl.textContent = '0';
      var started = false;
      new IntersectionObserver(function (entries, obs) {
        if (!entries[0].isIntersecting || started) return;
        started = true; obs.disconnect();
        var dists = states.map(function (el) {
          var b = el.getBBox(); var dx = b.x + b.width / 2 - hq.x, dy = b.y + b.height / 2 - hq.y;
          return Math.sqrt(dx * dx + dy * dy);
        });
        var maxd = Math.max.apply(null, dists) || 1, SPREAD = 1700, START = 350, n = 0;
        var wave = $('.hq-wave', map);
        if (wave) wave.animate([{ transform: 'scale(.5)', opacity: 0.9 }, { transform: 'scale(' + (maxd / 7) + ')', opacity: 0 }],
          { duration: START + SPREAD + 300, easing: 'linear', fill: 'forwards' });
        states.forEach(function (el, i) {
          var delay = START + (dists[i] / maxd) * SPREAD;
          el.animate([
            { transform: 'translateY(0) scale(1)' },
            { transform: 'translateY(-9px) scale(1.07)', offset: 0.35 },
            { transform: 'translateY(0) scale(1)' }
          ], { duration: 950, delay: delay, easing: 'cubic-bezier(.16,1,.3,1)' });
          setTimeout(function () {
            el.style.transition = 'fill .55s ease';
            el.style.fill = el.dataset.fill;
            if (isCovered(el)) { n++; if (countEl) countEl.textContent = n; }
          }, delay + 180);
        });
        setTimeout(function () { map.classList.add('rippling'); if (tag) tag.classList.add('on'); }, 200);
        setTimeout(finish, START + SPREAD + 1200);
      }, { threshold: 0.35 }).observe(wrap);
    }
  }
})();
