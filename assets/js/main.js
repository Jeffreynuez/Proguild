/* ============================================================
   COVERAGE CONFIG  (CMS-editable: tier colors + per-state tier)
   ============================================================ */
var COVERAGE = window.COVERAGE || { tiers: [], states: {} };

(function(){
  "use strict";
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Lucide icons ---- */
  if (window.lucide) lucide.createIcons();

  /* ---- Year ---- */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ---- Mobile menu ---- */
  const burger = document.getElementById('burger');
  const menu = document.getElementById('mobileMenu');
  burger.addEventListener('click', function(){
    const open = menu.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    burger.innerHTML = open ? '<i data-lucide="x"></i>' : '<i data-lucide="menu"></i>';
    if (window.lucide) lucide.createIcons();
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
    menu.classList.remove('open'); burger.setAttribute('aria-expanded','false');
    burger.innerHTML = '<i data-lucide="menu"></i>'; if (window.lucide) lucide.createIcons();
  }));

  /* ---- Header condense + floating CTA ---- */
  const header = document.getElementById('siteHeader');
  const hero = document.getElementById('hero');
  const floatCta = document.getElementById('floatCta');
  function onScroll(){
    const past = window.scrollY > (hero.offsetHeight - 120);
    header.classList.toggle('condensed', window.scrollY > 40);
    floatCta.classList.toggle('show', past);
  }
  window.addEventListener('scroll', onScroll, { passive:true });
  onScroll();

  /* ---- Hero parallax + floating shapes ---- */
  const heroBg = document.getElementById('heroBg');
  const shapes = Array.from(document.querySelectorAll('.hero .shape'));
  if (!reduceMotion){
    let ticking = false;
    window.addEventListener('scroll', function(){
      if (ticking) return; ticking = true;
      requestAnimationFrame(function(){
        const y = window.scrollY;
        if (y < window.innerHeight){
          heroBg.style.transform = 'translateY(' + (y * 0.28) + 'px)';
          shapes.forEach(function(s){
            const d = parseFloat(s.dataset.depth) || 0.2;
            s.style.transform = 'translateY(' + (y * d) + 'px)';
          });
        }
        ticking = false;
      });
    }, { passive:true });
  }

  /* ---- Scroll reveal ---- */
  const reveals = document.querySelectorAll('.reveal');
  if (reduceMotion){
    reveals.forEach(el => el.classList.add('in'));
  } else {
    const ro = new IntersectionObserver(function(entries){
      entries.forEach(function(en, i){
        if (en.isIntersecting){
          // stagger siblings within the same grid
          const sibs = Array.from(en.target.parentNode.children).filter(c => c.classList.contains('reveal'));
          const idx = sibs.indexOf(en.target);
          en.target.style.transitionDelay = (idx >= 0 ? Math.min(idx,6) * 70 : 0) + 'ms';
          en.target.classList.add('in');
          ro.unobserve(en.target);
        }
      });
    }, { threshold:0.14 });
    reveals.forEach(el => ro.observe(el));
  }

  /* ---- Count-up stats ---- */
  const statBand = document.getElementById('statBand');
  let counted = false;
  function runCount(){
    if (counted) return; counted = true;
    document.querySelectorAll('.num[data-count]').forEach(function(el){
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      if (reduceMotion){ el.innerHTML = target + '<span class="suffix">'+suffix+'</span>'; return; }
      const dur = 1400; const start = performance.now();
      function tick(now){
        const p = Math.min((now - start)/dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.innerHTML = Math.round(target * eased) + '<span class="suffix">'+suffix+'</span>';
        if (p < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }
  new IntersectionObserver(function(e){ if (e[0].isIntersecting) runCount(); }, { threshold:0.4 }).observe(statBand);

  /* ---- Process timeline draw ---- */
  const process = document.getElementById('process');
  new IntersectionObserver(function(e){ if (e[0].isIntersecting){ process.classList.add('drawn'); } }, { threshold:0.3 }).observe(process);

  /* ---- Services filter ---- */
  const filter = document.getElementById('svcFilter');
  const services = Array.from(document.querySelectorAll('#svcGrid .service'));
  filter.addEventListener('click', function(e){
    const chip = e.target.closest('.chip'); if (!chip) return;
    filter.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    const cat = chip.dataset.cat;
    services.forEach(function(s){
      const show = cat === 'all' || s.dataset.cat === cat;
      s.style.display = show ? '' : 'none';
    });
  });

  /* ---- Coverage map ---- */
  // Resolve CSS custom properties (e.g. "var(--accent)") to concrete hex so
  // SVG fill applies reliably across renderers.
  const rootStyle = getComputedStyle(document.documentElement);
  function resolveColor(c){
    if (typeof c === 'string' && c.indexOf('var(') === 0){
      const name = c.slice(4, -1).trim();
      return rootStyle.getPropertyValue(name).trim() || c;
    }
    return c;
  }
  const tierMap = {};
  COVERAGE.tiers.forEach(t => tierMap[t.id] = Object.assign({}, t, { color: resolveColor(t.color) }));
  const noneColor = (tierMap.none && tierMap.none.color) || '#e6ebea';
  const stateNames = {AL:"Alabama",AK:"Alaska",AZ:"Arizona",AR:"Arkansas",CA:"California",CO:"Colorado",CT:"Connecticut",DE:"Delaware",DC:"District of Columbia",FL:"Florida",GA:"Georgia",HI:"Hawaii",ID:"Idaho",IL:"Illinois",IN:"Indiana",IA:"Iowa",KS:"Kansas",KY:"Kentucky",LA:"Louisiana",ME:"Maine",MD:"Maryland",MA:"Massachusetts",MI:"Michigan",MN:"Minnesota",MS:"Mississippi",MO:"Missouri",MT:"Montana",NE:"Nebraska",NV:"Nevada",NH:"New Hampshire",NJ:"New Jersey",NM:"New Mexico",NY:"New York",NC:"North Carolina",ND:"North Dakota",OH:"Ohio",OK:"Oklahoma",OR:"Oregon",PA:"Pennsylvania",RI:"Rhode Island",SC:"South Carolina",SD:"South Dakota",TN:"Tennessee",TX:"Texas",UT:"Utah",VT:"Vermont",VA:"Virginia",WA:"Washington",WV:"West Virginia",WI:"Wisconsin",WY:"Wyoming"};
  const tip = document.getElementById('mapTip');

  function tierFor(code){ return COVERAGE.states[code] || 'none'; }
  function colorFor(code){ const t = tierMap[tierFor(code)]; return t ? t.color : noneColor; }

  document.querySelectorAll('#usMap .state').forEach(function(el){
    const code = el.dataset.state;
    el.style.fill = colorFor(code);
    el.setAttribute('tabindex','0');
    const tierId = tierFor(code);
    const label = (stateNames[code] || code) + ' — ' + (tierMap[tierId] ? tierMap[tierId].label : 'No Coverage');
    el.setAttribute('role','img');
    el.setAttribute('aria-label', label);

    function showTip(x, y){
      const t = tierMap[tierId] || tierMap.none;
      tip.innerHTML = '<span class="t-name">'+(stateNames[code]||code)+'</span><br><span class="t-tier"><span class="swatch" style="background:'+(t?t.color:noneColor)+'"></span>'+(t?t.label:'No Coverage')+'</span>';
      tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.classList.add('show');
    }
    function hideTip(){ tip.classList.remove('show'); }

    el.addEventListener('mousemove', e => showTip(e.clientX, e.clientY));
    el.addEventListener('mouseleave', hideTip);
    el.addEventListener('focus', function(){
      const r = el.getBoundingClientRect();
      showTip(r.left + r.width/2, r.top + r.height/2);
    });
    el.addEventListener('blur', hideTip);
    // touch
    el.addEventListener('touchstart', function(e){
      const t = e.touches[0]; if (t) showTip(t.clientX, t.clientY);
    }, { passive:true });
  });

  /* ---- Legend (generated from tiers) ---- */
  const legend = document.getElementById('legend');
  legend.innerHTML = COVERAGE.tiers.map(function(t){
    return '<span class="item"><span class="swatch" style="background:'+t.color+'"></span>'+t.label+'</span>';
  }).join('');

  /* ---- Contact form (fake submit) ---- */
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  form.addEventListener('submit', function(e){
    e.preventDefault();
    if (!form.checkValidity()){ form.reportValidity(); return; }
    form.style.display = 'none';
    success.style.display = 'block';
    success.scrollIntoView ? null : null; // no scrollIntoView per guidance
  });
})();

/* ---- next script ---- */

/* --uh from utility height (so only the navbar pins) */
(function(){var u=document.querySelector('.utility');function s(){if(u)document.documentElement.style.setProperty('--uh',u.offsetHeight+'px');}s();window.addEventListener('resize',s);window.addEventListener('load',s);})();
(function(){var b=document.querySelector('.mobile-bar');if(!b)return;function c(){b.classList.toggle('solid',(window.innerHeight+window.scrollY)>=document.documentElement.scrollHeight-2);}window.addEventListener('scroll',c,{passive:true});window.addEventListener('resize',c);window.addEventListener('load',c);c();})();

/* ---- next script ---- */

/* ambient shape parallax v2 (size + multi-direction) */
(function(){
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var shapes=[].slice.call(document.querySelectorAll('.pg-shape'));
  if(!shapes.length) return;
  var vh=window.innerHeight, ticking=false;
  function cache(){ shapes.forEach(function(s){ s.style.transform='none'; var r=s.getBoundingClientRect(); s._base=r.top+window.scrollY+r.height/2; }); }
  function upd(){ var vc=window.scrollY+vh/2;
    shapes.forEach(function(s){
      var rel=(s._base-vc)/vh;
      var sp=parseFloat(s.dataset.speed||'90');
      var rot=parseFloat(s.dataset.rot||0);
      var d=-rel*sp, x=s.dataset.axis==='x'?d:0, y=s.dataset.axis==='x'?0:d;
      s.style.transform='translate3d('+x.toFixed(1)+'px,'+y.toFixed(1)+'px,0) rotate('+rot+'deg)';
    });
    ticking=false;
  }
  function onScroll(){ if(!ticking){ticking=true;requestAnimationFrame(upd);} }
  function reset(){ vh=window.innerHeight; cache(); upd(); }
  window.addEventListener('scroll',onScroll,{passive:true});
  window.addEventListener('resize',reset); window.addEventListener('load',reset);
  cache(); upd();
})();

/* ===== /admin visual-editor bridge (only inside the admin iframe with ?edit=1) ===== */
(function () {
  'use strict';
  if (!/[?&]edit=1/.test(location.search) || window.parent === window) return;
  var st = document.createElement('style');
  st.textContent = '[data-edit],[data-edit-item]{cursor:pointer}' +
    '[data-edit]:hover{outline:2px dashed #4a9eff;outline-offset:2px}' +
    '[data-edit-item]:hover{outline:2px dashed #7ab8ff;outline-offset:3px}' +
    '.jrd-ed-sel{outline:2px solid #4a9eff!important;outline-offset:2px}';
  document.head.appendChild(st);
  var selEl = null;
  function select(el){ if(selEl){ selEl.classList.remove('jrd-ed-sel'); if(selEl.isContentEditable) selEl.contentEditable='false'; } selEl=el; if(!el) return; el.classList.add('jrd-ed-sel'); }
  document.addEventListener('click', function(e){
    var leaf=e.target.closest('[data-edit]'), item=e.target.closest('[data-edit-item]');
    if(!leaf&&!item){ select(null); parent.postMessage({jrd:'deselect'},'*'); return; }
    e.preventDefault(); e.stopPropagation();
    var el=leaf||item; select(el);
    if(leaf){ leaf.contentEditable='plaintext-only'; try{leaf.focus();}catch(err){} }
    parent.postMessage({jrd:'select', edit:leaf?leaf.getAttribute('data-edit'):null, item:item?item.getAttribute('data-edit-item'):null, text:leaf?leaf.textContent:null},'*');
  }, true);
  document.addEventListener('input', function(e){ if(e.target===selEl && selEl && selEl.hasAttribute('data-edit')){ parent.postMessage({jrd:'text', edit:selEl.getAttribute('data-edit'), value:selEl.textContent},'*'); } }, true);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape'&&selEl){ selEl.blur(); select(null); } }, true);
  window.addEventListener('message', function(e){
    var d=e.data||{};
    if(d.jrd==='apply'&&d.edit){ document.querySelectorAll('[data-edit="'+d.edit+'"]').forEach(function(el){ if(el!==selEl||!el.isContentEditable) el.textContent=d.value; }); }
    if(d.jrd==='styleapply'&&d.edit){ document.querySelectorAll('[data-edit="'+d.edit+'"]').forEach(function(el){ if(d.color) el.style.setProperty('color',d.color,'important'); else el.style.removeProperty('color'); if(d.align) el.style.setProperty('text-align',d.align,'important'); else el.style.removeProperty('text-align'); }); }
    // Proguild themes via CSS variables (theme.json -> theme.css on rebuild); live theme msgs ignored.
  });
  parent.postMessage({jrd:'ready', page:location.pathname}, '*');
})();
