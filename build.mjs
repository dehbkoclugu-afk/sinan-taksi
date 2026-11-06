import { mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { join } from 'node:path';

const canonical = 'https://dehbkoclugu-afk.github.io/sinan-taksi/';
const out = 'dist';
const districts = readFileSync('src/districts.txt', 'utf8').trim().split(/\r?\n/).map(line => {
  const [name, side, places, tip] = line.split('|');
  const slug = name.toLocaleLowerCase('tr').replaceAll('ı', 'i').normalize('NFD').replace(/\p{M}/gu, '') + '-taksi';
  return { name, side, places, tip, slug };
});

function page({ title, description, path = '', content }) {
  const base = path ? '../' : './';
  const url = canonical + path;
  return `<!doctype html>
<html lang="tr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title><meta name="description" content="${description}">
<link rel="canonical" href="${url}"><meta name="theme-color" content="#111112">
<meta property="og:type" content="website"><meta property="og:title" content="${title}"><meta property="og:description" content="${description}"><meta property="og:url" content="${url}">
<link rel="icon" href="${base}assets/icon.svg" type="image/svg+xml"><link rel="stylesheet" href="${base}assets/site.css"><script src="${base}assets/site.js" defer></script></head>
<body><header class="top"><div class="wrap bar"><a class="brand" href="${base}" aria-label="Sinan Taksi ana sayfa"><b aria-hidden="true">↗</b>Sinan <span>Taksi</span></a><nav aria-label="Ana menü"><a href="${base}#hizmetler">Hizmetler</a><a href="${base}#ilceler">İlçeler</a></nav><a class="button" href="#rota">Rota planla <span aria-hidden="true">↗</span></a></div></header>
<main>${content}</main><footer><div class="wrap bar"><a class="brand" href="${base}">Sinan <span>Taksi</span></a><span class="muted">İstanbul · Taksi ve şoförlü araç kiralama</span><a href="${base}#ilceler">Tüm ilçeler ↗</a></div></footer></body></html>`;
}

function list(items, base = './') {
  return `<ul class="districts">${items.map(d => `<li data-district="${d.name}"><a href="${base}${d.slug}/">${d.name} Taksi <span aria-hidden="true">↗</span></a></li>`).join('')}</ul>`;
}

function planner(district = '') {
  return `<section class="block" id="rota"><div class="wrap planner"><div><p class="eyebrow">Yolculuk planlayıcı</p><h2>Rotanızı hazırlayın.</h2><p class="lead">Başlangıç ve varış noktalarını girin. Rotayı haritada açın veya yolculuk özetini paylaşmak için kopyalayın.</p></div>
<form class="card" id="planner"><div class="fields"><div class="field-wide"><label for="service">Hizmet</label><select id="service" name="service"><option>Taksi</option><option>Şoförlü araç kiralama</option></select></div>
<div><label for="from">Nereden?</label><input id="from" name="from" value="${district}" placeholder="Örn. Kadıköy İskele" maxlength="160" required></div>
<div><label for="to">Nereye?</label><input id="to" name="to" placeholder="Örn. İstanbul Havalimanı" maxlength="160" required></div></div>
<div class="actions"><button class="button" type="submit">Rota oluştur ↗</button></div><div class="result" id="result" hidden><p id="summary"></p><div class="actions"><a class="button ghost" id="maps" target="_blank" rel="noopener noreferrer">Haritada aç ↗</a><button type="button" class="button ghost" id="copy">Özeti kopyala</button></div><p id="copy-status" class="muted" role="status"></p></div>
<noscript><p>Rota planlayıcı için JavaScript’i açın.</p></noscript></form></div></section>`;
}

const heroImage = `<figure class="visual"><img src="./assets/taxi.svg" width="720" height="440" alt="Taksi sarısı şerit ve tavan tabelası olan siyah araç çizimi"><figcaption><span>SİNAN TAKSİ</span><span>İSTANBUL / TR</span></figcaption></figure>`;
const sides = ['Avrupa', 'Anadolu'];
const home = `<section class="wrap hero"><div><p class="eyebrow">İstanbul · Avrupa ve Anadolu</p><h1>İstanbul’da<br><span>yola çıkın.</span></h1><p class="lead">İstanbul’un 39 ilçesinde taksi ve şoförlü araç kiralama. İlçenizi seçin, yolculuğunuzu planlayın.</p><div class="actions"><a class="button" href="#ilceler">İlçeni bul ↘</a><a class="button ghost" href="#hizmetler">Hizmetleri keşfet</a></div></div>${heroImage}</section>
<div class="strip"><div class="wrap"><span>01 / 39 İLÇE</span><span>02 / AVRUPA YAKASI</span><span>03 / ANADOLU YAKASI</span></div></div>
<section class="block" id="hizmetler"><div class="wrap"><p class="eyebrow">Hizmetler</p><h2>Yolculuğunuza göre.</h2><div class="service-grid"><article class="card"><p class="index">01 / ŞEHİR İÇİ</p><h3>Taksi</h3><p class="muted">Mahallenizden istasyona, otelden iş adresine veya bir ilçeden diğerine tek yönlü yolculuklar.</p><a class="back" href="#ilceler">İlçenizi seçin ↗</a></article><article class="card"><p class="index">02 / PLANLI ULAŞIM</p><h3>Şoförlü araç kiralama</h3><p class="muted">Toplantılar, havalimanı transferleri ve birden fazla durağı olan programlar için şoförlü ulaşım.</p><a class="back" href="#rota">Rotanızı hazırlayın ↗</a></article></div></div></section>
<section class="block" id="ilceler"><div class="wrap"><p class="eyebrow">İstanbul ilçe rehberi</p><div class="section-head"><h2>39 ilçe, iki yaka.</h2><div class="search"><label for="search">İlçe ara</label><input id="search" type="search" placeholder="Kadıköy, Esenyurt, Maltepe…"></div></div><p id="no-results" role="status" hidden>Aramanıza uygun ilçe bulunamadı.</p><div class="region-grid">${sides.map(side => `<section class="card" data-region><h3>${side} Yakası</h3>${list(districts.filter(d => d.side === side))}</section>`).join('')}</div></div></section>
${planner()}`;

mkdirSync(join(out, 'assets'), { recursive: true });
for (const file of ['site.css', 'site.js', 'taxi.svg']) copyFileSync(join('src', file), join(out, 'assets', file));
writeFileSync(join(out, 'assets', 'icon.svg'), '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="9" fill="#ffc627"/><path d="M14 34 34 14M15 14h19v19" stroke="#111" stroke-width="5" fill="none"/></svg>');
writeFileSync(join(out, 'index.html'), page({ title: 'Sinan Taksi | İstanbul Taksi ve Şoförlü Araç Kiralama', description: 'İstanbul’un 39 ilçesinde Sinan Taksi. İlçenize özel taksi ve şoförlü araç kiralama rehberini inceleyin, yolculuk rotanızı planlayın.', content: home }));

for (const d of districts) {
  const others = districts.filter(item => item.side === d.side && item !== d);
  const start = districts.filter(item => item.side === d.side).indexOf(d);
  const related = Array.from({ length: 4 }, (_, i) => others[(start + i) % others.length]);
  const content = `<section class="wrap hero district-hero"><div><p class="eyebrow">İstanbul / ${d.side} Yakası</p><h1>${d.name} <span>Taksi</span></h1><p class="lead">${d.places} çevresinde taksi ve şoförlü araçla ulaşım için yolculuğunuzu planlayın.</p><div class="actions"><a class="button" href="#rota">Rota planla ↗</a><a class="button ghost" href="../#ilceler">Tüm ilçeler</a></div></div>${heroImage.replace('./assets/', '../assets/')}</section>
<section class="block"><div class="wrap"><p class="eyebrow">Buluşma ve ulaşım</p><h2>${d.name}’de yola çıkarken</h2><div class="service-grid"><article class="card"><h3>Buluşma noktası</h3><p class="muted">${d.tip}</p></article><article class="card"><h3>Şoförlü araç kiralama</h3><p class="muted">${d.name} çıkışlı bir iş programı, havalimanı yolculuğu veya çok duraklı rota için başlangıç saatini, durak sırasını ve tahmini bekleme süresini hazırlayın.</p></article></div></div></section>
${planner(d.name + ', İstanbul')}
<section class="block"><div class="wrap"><p class="eyebrow">İlçe rehberi</p><h2>${d.side} Yakası’nda diğer rotalar</h2>${list(related, '../')}<a class="back" href="../#ilceler">39 ilçenin tamamı ↗</a></div></section>`;
  mkdirSync(join(out, d.slug), { recursive: true });
  writeFileSync(join(out, d.slug, 'index.html'), page({
    title: `${d.name} Taksi ve Şoförlü Araç Kiralama | Sinan Taksi`,
    description: `${d.name} taksi ve şoförlü araç kiralama rehberi. ${d.places} çevresinde buluşma noktanızı seçin ve İstanbul rotanızı hazırlayın.`,
    path: d.slug + '/',
    content,
  }));
}

const urls = [canonical, ...districts.map(d => canonical + d.slug + '/')];
writeFileSync(join(out, 'sitemap.xml'), '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + urls.map(url => '  <url><loc>' + url + '</loc></url>').join('\n') + '\n</urlset>\n');
writeFileSync(join(out, 'robots.txt'), 'User-agent: *\nAllow: /\nSitemap: ' + canonical + 'sitemap.xml\n');
writeFileSync(join(out, '.nojekyll'), '');
