#!/usr/bin/env node
/* Proguild Facility Management — data-driven renderer for the shared JRD CMS.
   Content: data/*.json (edited via /admin). Layout: this file. Design tokens: data/theme.json.
   Stamps data-edit="<file>#<dot.path>" on text leaves and data-edit-item="<file>#<arr>#<idx>"
   on array-item roots for the /admin visual editor (see assets/js/main.js ?edit=1 bridge). */
'use strict';
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const CLOUD = 'dlgc3fj6w';
const CDN = 'https://res.cloudinary.com/' + CLOUD + '/';
const cdn = u => { if (!u) return ''; u = String(u); return u.startsWith('CDN:') ? CDN + u.slice(4) : u; };
const esc = s => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
const D = f => JSON.parse(fs.readFileSync(path.join(ROOT, 'data', f), 'utf8'));
const out = (f, html) => { fs.writeFileSync(path.join(ROOT, f), html); console.log('built', f); };

const pages = D('pages.json'), team = D('team.json'), privacy = D('privacy.json'), theme = D('theme.json');
const G = pages.global, H = pages.home;
const MAP_SVG = fs.readFileSync(path.join(__dirname, 'map.svg'), 'utf8');

const ed  = p => ` data-edit="pages.json#${p}"`;
const edf = (file, p) => ` data-edit="${file}#${p}"`;
const edi = (file, arr, i) => ` data-edit-item="${file}#${arr}#${i}"`;
const ic = n => `<i data-lucide="${esc(n)}"></i>`;

/* ---------- theme compiler: theme.json -> assets/css/theme.css ---------- */
function buildTheme() {
  let root = '';
  for (const k in theme) root += `  --${k}:${theme[k]};\n`;
  root += `  --hero-bg:url(${cdn(H.hero.bg)});\n`;
  fs.writeFileSync(path.join(ROOT, 'assets/css/theme.css'), '/* GENERATED from data/theme.json — edit via /admin -> Theme */\n:root{\n' + root + '}\n');
  console.log('built assets/css/theme.css');
}

/* ---------- static decorative shapes (exact, per section) ---------- */
const SHAPES = {
  mission: '<span class="pg-shape pg-tri" data-speed="130" data-rot="8" style="width:440px;height:440px;top:-140px;right:-90px;background:rgba(146,218,210,0.16)"></span><span class="pg-shape pg-diamond" data-speed="-95" data-rot="0" style="width:320px;height:320px;bottom:-140px;left:-100px;background:rgba(56,126,118,0.1)"></span><span class="pg-shape pg-hex" data-speed="80" data-rot="12" data-axis="x" style="width:360px;height:360px;top:28%;right:-150px;background:rgba(146,218,210,0.12)"></span><span class="pg-shape pg-para" data-speed="160" data-rot="-6" style="width:280px;height:280px;bottom:8%;left:12%;background:rgba(146,218,210,0.14)"></span>',
  why: '<span class="pg-shape pg-diamond" data-speed="150" data-rot="0" style="width:480px;height:480px;top:-170px;right:-130px;background:rgba(56,126,118,0.1)"></span><span class="pg-shape pg-tri" data-speed="-105" data-rot="18" style="width:320px;height:320px;bottom:-130px;left:-80px;background:rgba(146,218,210,0.18)"></span><span class="pg-shape pg-hex" data-speed="85" data-rot="0" data-axis="x" style="width:300px;height:300px;top:22%;left:-140px;background:rgba(146,218,210,0.12)"></span><span class="pg-shape pg-para" data-speed="130" data-rot="-10" style="width:260px;height:260px;bottom:10%;right:10%;background:rgba(146,218,210,0.14)"></span>',
  coverage: '<span class="pg-shape pg-tri" data-speed="135" data-rot="-6" style="width:500px;height:500px;top:-170px;left:-130px;background:rgba(146,218,210,0.14)"></span><span class="pg-shape pg-diamond" data-speed="-115" data-rot="0" style="width:340px;height:340px;bottom:-150px;right:-110px;background:rgba(146,218,210,0.18)"></span><span class="pg-shape pg-hex" data-speed="95" data-rot="0" data-axis="x" style="width:320px;height:320px;top:26%;right:-150px;background:rgba(56,126,118,0.1)"></span><span class="pg-shape pg-para" data-speed="155" data-rot="8" style="width:270px;height:270px;top:8%;left:8%;background:rgba(146,218,210,0.12)"></span>',
  team: '<span class="pg-shape pg-diamond" data-speed="125" data-rot="0" style="width:460px;height:460px;top:-160px;left:-120px;background:rgba(146,218,210,0.14)"></span><span class="pg-shape pg-tri" data-speed="-100" data-rot="-14" style="width:320px;height:320px;bottom:-130px;right:-80px;background:rgba(146,218,210,0.18)"></span><span class="pg-shape pg-hex" data-speed="85" data-rot="0" data-axis="x" style="width:300px;height:300px;top:30%;left:-150px;background:rgba(56,126,118,0.1)"></span><span class="pg-shape pg-para" data-speed="155" data-rot="10" style="width:260px;height:260px;bottom:6%;right:10%;background:rgba(146,218,210,0.12)"></span>',
  contact: '<span class="pg-shape pg-tri" data-speed="135" data-rot="6" style="width:480px;height:480px;top:-170px;right:-130px;background:rgba(146,218,210,0.15)"></span><span class="pg-shape pg-diamond" data-speed="-115" data-rot="0" style="width:340px;height:340px;bottom:-140px;left:-100px;background:rgba(146,218,210,0.17)"></span><span class="pg-shape pg-hex" data-speed="95" data-rot="0" data-axis="x" style="width:320px;height:320px;top:25%;right:-160px;background:rgba(146,218,210,0.12)"></span><span class="pg-shape pg-para" data-speed="155" data-rot="-8" style="width:270px;height:270px;bottom:8%;left:10%;background:rgba(146,218,210,0.14)"></span>',
  pagehero: '<span class="pg-shape pg-tri" data-speed="120" data-rot="8" style="width:380px;height:380px;top:-130px;right:-100px;background:rgba(146,218,210,0.15)"></span><span class="pg-shape pg-diamond" data-speed="-95" data-rot="0" style="width:280px;height:280px;bottom:-120px;left:-80px;background:rgba(146,218,210,0.17)"></span><span class="pg-shape pg-hex" data-speed="80" data-rot="0" data-axis="x" style="width:260px;height:260px;top:18%;right:-120px;background:rgba(146,218,210,0.12)"></span><span class="pg-shape pg-para" data-speed="140" data-rot="-6" style="width:230px;height:230px;bottom:10%;left:12%;background:rgba(146,218,210,0.13)"></span>'
};

/* ---------- shared chrome ---------- */
const OG_IMAGE = 'https://res.cloudinary.com/dlgc3fj6w/image/upload/c_fill,g_auto,w_1200,h_630,e_brightness:-18,f_jpg,q_auto/proguild/hero';
const head = seo => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(seo.title)}</title>
<meta name="description" content="${esc(seo.desc)}">
<link rel="canonical" href="https://proguildfm.com/">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Proguild Facility Management">
<meta property="og:title" content="${esc(seo.title)}">
<meta property="og:description" content="${esc(seo.desc)}">
<meta property="og:url" content="https://proguildfm.com/">
<meta property="og:image" content="${OG_IMAGE}">
<meta property="og:image:secure_url" content="${OG_IMAGE}">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Proguild Facility Management">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(seo.title)}">
<meta name="twitter:description" content="${esc(seo.desc)}">
<meta name="twitter:image" content="${OG_IMAGE}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800&family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
<script src="https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js"></script>
<link href="assets/css/main.css" rel="stylesheet">
<link href="assets/css/theme.css" rel="stylesheet">
</head>
<body>`;

function header(pathPrefix) {
  const homeHref = pathPrefix + '#top', servHref = pathPrefix + '#services', contactHref = pathPrefix + '#contact', teamHref = 'our-team.html';
  const navHtml = G.nav.map((n, i) => {
    const href = n.href === '#top' ? homeHref : n.href === '#services' ? servHref : n.href;
    return `        <a href="${esc(href)}"${edi('pages.json','global.nav',i)}>${esc(n.label)}</a>`;
  }).join('\n');
  return `
<header class="site-header" id="siteHeader">
  <div class="utility">
    <div class="wrap">
      <a href="${esc(G.contact.mapUrl)}" target="_blank" rel="noopener">${ic('map-pin')} <span${ed('global.contact.address')}>${esc(G.contact.address)}</span></a>
      <a href="tel:${esc(G.contact.phoneHref)}">${ic('phone')} <span${ed('global.contact.phone')}>${esc(G.contact.phone)}</span></a>
      <a href="mailto:${esc(G.contact.email)}">${ic('mail')} <span${ed('global.contact.email')}>${esc(G.contact.email)}</span></a>
    </div>
  </div>
  <div class="navbar">
    <div class="wrap">
      <a href="${esc(homeHref)}" class="logo" aria-label="Proguild home">
        <span class="mark">${ic('building-2')}</span>
        <span class="word"><b>Pro</b>guild</span>
      </a>
      <nav class="nav-links" aria-label="Primary">
${navHtml}
      </nav>
      <div class="nav-cta">
        <a href="${esc(contactHref)}" class="btn"${ed('global.ctaLabel')}>${esc(G.ctaLabel)}</a>
      </div>
      <button class="burger" id="burger" aria-label="Open menu" aria-expanded="false">${ic('menu')}</button>
    </div>
  </div>
  <div class="mobile-menu" id="mobileMenu">
${G.nav.map(n => { const href = n.href === '#top' ? homeHref : n.href === '#services' ? servHref : n.href; return `    <a href="${esc(href)}">${esc(n.label)}</a>`; }).join('\n')}
    <a href="${esc(contactHref)}" class="btn">${esc(G.ctaLabel)}</a>
  </div>
</header>`;
}

function footer(pathPrefix) {
  return `
<footer class="site-footer">
  <div class="wrap">
    <div class="top">
      <div>
        <div class="logo" style="margin-bottom:14px"><span class="mark" style="background:var(--accent)">${ic('building-2')}</span><span class="word"><b>Pro</b><span style="color:#fff">guild</span></span></div>
        <p${ed('global.footer.blurb')}>${esc(G.footer.blurb)}</p>
      </div>
      <div class="col">
        <h4>Company</h4>
        <a href="${esc(pathPrefix + '#top')}">Home</a>
        <a href="our-team.html">Our Team</a>
        <a href="${esc(pathPrefix + '#services')}">Our Services</a>
        <a href="${esc(pathPrefix + '#contact')}">Contact</a>
      </div>
      <div class="col">
        <h4>Contact</h4>
        <a href="${esc(G.contact.mapUrl)}" target="_blank" rel="noopener">${esc(G.contact.addressLine1)}<br>${esc(G.contact.addressLine2)}</a>
        <a href="tel:${esc(G.contact.phoneHref)}">${esc(G.contact.phone)}</a>
        <a href="mailto:${esc(G.contact.email)}">${esc(G.contact.email)}</a>
      </div>
      <div class="col">
        <h4>Connect</h4>
        <a href="privacy-policy.html">Privacy Policy</a>
        <div class="social"><a href="${esc(G.footer.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn">${ic('linkedin')}</a></div>
      </div>
    </div>
  </div>
  <div class="bottom">
    <div class="wrap"><span>© <span id="year"></span> <span${ed('global.footer.copyright')}>${esc(G.footer.copyright)}</span></span><span${ed('global.footer.location')}>${esc(G.footer.location)}</span></div>
  </div>
</footer>`;
}

/* COVERAGE config injected for the map JS (states array -> object map) */
function coverageScript() {
  const states = {};
  H.coverage.states.forEach(s => { states[s.code] = s.tier; });
  const cfg = { tiers: H.coverage.tiers.map(t => ({ id: t.id, label: t.label, color: t.color })), states };
  return `<script>window.COVERAGE=${JSON.stringify(cfg)};</script>`;
}

const tail = pathPrefix => `
${coverageScript()}
<script src="assets/js/main.js"></script>
</body>
</html>
`;

/* ---------- HOME ---------- */
function buildHome() {
  const hero = `
<main id="top">

<section class="hero" id="hero">
  <div class="hero-bg" id="heroBg"></div>
  <div class="hero-overlay"></div>
  <div class="shape s1" data-depth="0.18"></div>
  <div class="shape s2" data-depth="0.30"></div>
  <div class="shape s3" data-depth="0.45"></div>
  <div class="wrap">
    <div class="hero-inner">
      <span class="eyebrow on-dark"${ed('home.hero.eyebrow')}>${esc(H.hero.eyebrow)}</span>
      <h1${ed('home.hero.title')}>${esc(H.hero.title)}</h1>
      <p${ed('home.hero.body')}>${esc(H.hero.body)}</p>
      <div class="hero-actions">
        <a href="${esc(H.hero.cta1Href)}" class="btn lg"${ed('home.hero.cta1')}>${esc(H.hero.cta1)} ${ic('arrow-right')}</a>
        <a href="${esc(H.hero.cta2Href)}" class="btn lg on-dark"${ed('home.hero.cta2')}>${esc(H.hero.cta2)}</a>
      </div>
    </div>
  </div>
</section>`;

  const stats = `
<section class="stats">
  <div class="wrap" id="statBand">
${H.stats.map((s,i)=>`    <div class="stat"${edi('pages.json','home.stats',i)}><div class="num" data-count="${esc(s.num)}" data-suffix="${esc(s.suffix)}">0</div><div class="label"${ed('home.stats.'+i+'.label')}>${esc(s.label)}</div></div>`).join('\n')}
  </div>
</section>`;

  const quote = `
<section class="quote-band">
  <div class="wrap reveal">
    <i data-lucide="quote" class="mk" style="width:42px;height:42px"></i>
    <blockquote${ed('home.quote.text')}>${esc(H.quote.text)}</blockquote>
    <cite${ed('home.quote.cite')}>${esc(H.quote.cite)}</cite>
  </div>
</section>`;

  const mission = `
<section class="section mission sec-shapes">${SHAPES.mission}
  <div class="wrap">
    <div class="grid">
      <div class="reveal">
        <span class="eyebrow"${ed('home.mission.eyebrow')}>${esc(H.mission.eyebrow)}</span>
        <h2${ed('home.mission.title')}>${esc(H.mission.title)}</h2>
      </div>
      <div class="reveal">
        <p${ed('home.mission.body1')}>${esc(H.mission.body1)}</p>
        <p${ed('home.mission.body2')}>${esc(H.mission.body2)}</p>
      </div>
    </div>
  </div>
</section>`;

  const why = `
<section class="section why sec-shapes">${SHAPES.why}
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow"${ed('home.why.eyebrow')}>${esc(H.why.eyebrow)}</span>
      <h2${ed('home.why.title')}>${esc(H.why.title)}</h2>
    </div>
    <div class="why-grid">
${H.why.items.map((it,i)=>`      <div class="guarantee reveal"${edi('pages.json','home.why.items',i)}><div class="ic">${ic(it.icon)}</div><h4${ed('home.why.items.'+i+'.title')}>${esc(it.title)}</h4><p${ed('home.why.items.'+i+'.text')}>${esc(it.text)}</p></div>`).join('\n')}
    </div>
  </div>
</section>`;

  const principles = `
<section class="section principles">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow on-dark"${ed('home.principles.eyebrow')}>${esc(H.principles.eyebrow)}</span>
      <h2${ed('home.principles.title')}>${esc(H.principles.title)}</h2>
    </div>
    <div class="pgrid">
${H.principles.items.map((it,i)=>`      <div class="principle reveal"${edi('pages.json','home.principles.items',i)}><div class="ic">${ic(it.icon)}</div><h3${ed('home.principles.items.'+i+'.title')}>${esc(it.title)}</h3><p${ed('home.principles.items.'+i+'.body')}>${esc(it.body)}</p></div>`).join('\n')}
    </div>
  </div>
</section>`;

  const process = `
<section class="section process" id="process">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow"${ed('home.process.eyebrow')}>${esc(H.process.eyebrow)}</span>
      <h2${ed('home.process.title')}>${esc(H.process.title)}</h2>
    </div>
    <div class="track" id="processTrack">
      <div class="baseline"></div>
${H.process.steps.map((s,i)=>`      <div class="step reveal"${edi('pages.json','home.process.steps',i)}><div class="dot">${i+1}</div><h4${ed('home.process.steps.'+i+'.title')}>${esc(s.title)}</h4><p${ed('home.process.steps.'+i+'.body')}>${esc(s.body)}</p></div>`).join('\n')}
    </div>
  </div>
</section>`;

  const services = `
<section class="section services" id="services">
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow"${ed('home.services.eyebrow')}>${esc(H.services.eyebrow)}</span>
      <h2${ed('home.services.title')}>${esc(H.services.title)}</h2>
    </div>
    <div class="svc-filter reveal" id="svcFilter">
${H.services.filters.map((f,i)=>`      <button class="chip${i===0?' active':''}" data-cat="${esc(f.cat)}">${esc(f.label)}</button>`).join('\n')}
    </div>
    <div class="svc-grid" id="svcGrid">
${H.services.items.map((it,i)=>`      <div class="service reveal" data-cat="${esc(it.cat)}"${edi('pages.json','home.services.items',i)}><div class="ic">${ic(it.icon)}</div><h4${ed('home.services.items.'+i+'.title')}>${esc(it.title)}</h4><p class="desc"${ed('home.services.items.'+i+'.desc')}>${esc(it.desc)}</p></div>`).join('\n')}
    </div>
  </div>
</section>`;

  const coverage = `
<section class="section coverage sec-shapes" id="coverage">${SHAPES.coverage}
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow"${ed('home.coverage.eyebrow')}>${esc(H.coverage.eyebrow)}</span>
      <h2${ed('home.coverage.title')}>${esc(H.coverage.title)}</h2>
      <p class="lead"${ed('home.coverage.lead')}>${esc(H.coverage.lead)}</p>
    </div>
    <div class="map-wrap reveal">
      ${MAP_SVG}
      <div class="map-tip" id="mapTip"></div>
    </div>
    <div class="legend" id="legend"></div>
  </div>
</section>`;

  const teamTeaser = `
<section class="section team sec-shapes" id="team">${SHAPES.team}
  <div class="wrap">
    <div class="section-head center reveal">
      <span class="eyebrow"${ed('home.teamTeaser.eyebrow')}>${esc(H.teamTeaser.eyebrow)}</span>
      <h2${ed('home.teamTeaser.title')}>${esc(H.teamTeaser.title)}</h2>
    </div>
    <div class="team-grid">
${team.members.map((m,i)=>`      <a class="person reveal" href="our-team.html#${esc(m.slug)}"${edi('team.json','members',i)}><div class="photo"><img src="${cdn(m.photo)}" alt="${esc(m.name)}"></div><div class="name"${edf('team.json','members.'+i+'.name')}>${esc(m.name)}</div><div class="role"${edf('team.json','members.'+i+'.role')}>${esc(m.role)}</div></a>`).join('\n')}
    </div>
    <div class="center reveal"><a href="our-team.html" class="btn ghost"${ed('home.teamTeaser.ctaLabel')}>${esc(H.teamTeaser.ctaLabel)} ${ic('arrow-right')}</a></div>
  </div>
</section>`;

  const cta = `
<section class="cta-band">
  <div class="cwave"></div>
  <div class="wrap reveal">
    <div>
      <h2${ed('home.cta.title')}>${esc(H.cta.title)}</h2>
      <p class="sub"${ed('home.cta.sub')}>${esc(H.cta.sub)}</p>
    </div>
    <div class="actions">
      <a href="tel:${esc(G.contact.phoneHref)}" class="phone">${ic('phone-call')} ${esc(H.cta.phone)}</a>
      <a href="#contact" class="btn"${ed('home.cta.buttonLabel')}>${esc(H.cta.buttonLabel)}</a>
    </div>
  </div>
</section>`;

  const contact = `
<section class="section contact sec-shapes" id="contact">${SHAPES.contact}
  <div class="wrap">
    <div class="grid">
      <div class="reveal">
        <span class="eyebrow"${ed('home.contact.eyebrow')}>${esc(H.contact.eyebrow)}</span>
        <h2${ed('home.contact.title')}>${esc(H.contact.title)}</h2>
        <p class="lead"${ed('home.contact.lead')}>${esc(H.contact.lead)}</p>
        <div class="info-list">
          <div class="row"><span class="ic">${ic('map-pin')}</span> <span><strong class="cname"${ed('global.contact.name')}>${esc(G.contact.name)}</strong><br>${esc(G.contact.address)}</span></div>
          <div class="row"><span class="ic">${ic('phone')}</span> <a href="tel:${esc(G.contact.phoneHref)}">${esc(G.contact.phone)}</a></div>
          <div class="row"><span class="ic">${ic('mail')}</span> <a href="mailto:${esc(G.contact.email)}">${esc(G.contact.email)}</a></div>
        </div>
      </div>
      <div class="form-card reveal">
        <div class="form-success" id="formSuccess"><strong${ed('home.contact.successTitle')}>${esc(H.contact.successTitle)}</strong> <span${ed('home.contact.successText')}>${esc(H.contact.successText)}</span></div>
        <form id="contactForm" action="${esc(H.contact.formAction)}" method="POST" novalidate>
          <input type="hidden" name="access_key" value="${esc(H.contact.accessKey||'')}">
          <input type="hidden" name="subject" value="${esc(H.contact.subject||'New inquiry from the Proguild website')}">
          <input type="hidden" name="from_name" value="Proguild Website">
          <input type="checkbox" name="botcheck" tabindex="-1" autocomplete="off" style="display:none" aria-hidden="true">
          <div class="field two">
            <div class="field" style="margin:0"><label for="fn">First name</label><input id="fn" name="firstName" type="text" required autocomplete="given-name"></div>
            <div class="field" style="margin:0"><label for="ln">Last name</label><input id="ln" name="lastName" type="text" required autocomplete="family-name"></div>
          </div>
          <div class="field"><label for="ph">Phone</label><input id="ph" name="phone" type="tel" required autocomplete="tel"></div>
          <div class="field"><label for="em">Email</label><input id="em" name="email" type="email" required autocomplete="email"></div>
          <div class="field"><label for="cm">Comments</label><textarea id="cm" name="comments" placeholder="Tell us about the property and the service you need…"></textarea></div>
          <button type="submit" class="btn lg" style="width:100%;justify-content:center">Send Request ${ic('arrow-right')}</button>
        </form>
      </div>
    </div>
  </div>
</section>

</main>`;

  const floatBar = `
<div class="float-cta" id="floatCta"><a href="#contact" class="btn">Request Service ${ic('arrow-right')}</a></div>
<div class="mobile-bar"><a class="call" href="tel:${esc(G.contact.phoneHref)}">${ic('phone')} Call</a><a class="req" href="#contact">${ic('wrench')} Request Service</a></div>`;

  return head({ title: G.seoTitle, desc: G.seoDesc })
    + header('') + hero + stats + quote + mission + why + principles + process + services + coverage + teamTeaser + contact
    + footer('') + floatBar + tail('');
}

/* ---------- OUR TEAM ---------- */
function buildTeam() {
  const P = team.page;
  const main = `
<main id="top">
  <section class="page-hero sec-shapes">${SHAPES.pagehero}
    <div class="wrap reveal">
      <span class="eyebrow on-dark"${edf('team.json','page.eyebrow')}>${esc(P.eyebrow)}</span>
      <h1 class="pg-h1 pg-on-dark"${edf('team.json','page.title')}>${esc(P.title)}</h1>
      <p class="pg-lead pg-on-dark"${edf('team.json','page.intro')}>${esc(P.intro)}</p>
    </div>
  </section>
  <section class="section"><div class="wrap"><div class="tm-list">
${team.members.map((m,i)=>`    <article class="tm-card reveal" id="${esc(m.slug)}"${edi('team.json','members',i)}>
      <div class="ph"><img src="${cdn(m.photo)}" alt="${esc(m.name)}"></div>
      <div><h3 class="nm"${edf('team.json','members.'+i+'.name')}>${esc(m.name)}</h3><div class="rl"${edf('team.json','members.'+i+'.role')}>${esc(m.role)}</div><p class="bio"${edf('team.json','members.'+i+'.bio')}>${esc(m.bio)}</p></div>
    </article>`).join('\n')}
  </div></div></section>
</main>`;
  return head({ title: 'Our Team | Proguild Facility Management', desc: 'Meet the Proguild Facility Management team.' })
    + header('index.html') + main + footer('index.html') + tail('index.html');
}

/* ---------- PRIVACY ---------- */
function buildPrivacy() {
  const P = privacy.page;
  const main = `
<main id="top">
  <section class="page-hero sec-shapes">${SHAPES.pagehero}
    <div class="wrap reveal"><h1${edf('privacy.json','page.title')}>${esc(P.title)}</h1>
    <p${edf('privacy.json','page.sub')}>${esc(P.sub)}</p></div>
  </section>
  <section class="section"><div class="wrap prose reveal">
    <p${edf('privacy.json','page.intro')}>${esc(P.intro)}</p>
${P.sections.map((s,i)=>`    <h2${edf('privacy.json','page.sections.'+i+'.heading')}>${esc(s.heading)}</h2>\n    <p${edf('privacy.json','page.sections.'+i+'.body')}>${esc(s.body)}</p>`).join('\n')}
  </div></section>
</main>`;
  return head({ title: 'Privacy Policy | Proguild Facility Management', desc: 'Privacy Policy for Proguild Facility Management.' })
    + header('index.html') + main + footer('index.html') + tail('index.html');
}

/* ---------- run ---------- */
buildTheme();
out('index.html', buildHome());
out('our-team.html', buildTeam());
out('privacy-policy.html', buildPrivacy());
console.log('build complete');
