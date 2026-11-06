const search = document.querySelector('#search');
const normalize = value => value.toLocaleLowerCase('tr').replaceAll('ı', 'i').normalize('NFD').replace(/\p{M}/gu, '');

if (search) {
  search.addEventListener('input', () => {
    const query = normalize(search.value.trim());
    const regions = [...document.querySelectorAll('[data-region]')];
    for (const region of regions) {
      const rows = [...region.querySelectorAll('[data-district]')];
      for (const row of rows) row.hidden = !normalize(row.textContent.replace('↗', '')).includes(query);
      region.hidden = rows.every(row => row.hidden);
    }
    document.querySelector('#no-results').hidden = regions.some(region => !region.hidden);
  });
}

const planner = document.querySelector('#planner');
const result = document.querySelector('#result');
const summary = document.querySelector('#summary');
const status = document.querySelector('#copy-status');
const maps = document.querySelector('#maps');

planner.addEventListener('input', event => {
  event.target.setCustomValidity('');
  result.hidden = true;
});

planner.addEventListener('submit', event => {
  event.preventDefault();
  const { from, to, service } = planner.elements;
  for (const field of [from, to]) {
    if (!field.value.trim()) {
      field.setCustomValidity('Bir adres veya konum girin.');
      field.reportValidity();
      return;
    }
  }
  const directions = new URL('https://www.google.com/maps/dir/');
  directions.search = new URLSearchParams({ api: '1', origin: from.value.trim(), destination: to.value.trim(), travelmode: 'driving' });
  maps.href = directions.href;
  summary.textContent = service.value + ' · ' + from.value.trim() + ' → ' + to.value.trim();
  status.textContent = '';
  result.hidden = false;
  maps.focus();
});

document.querySelector('#copy').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(summary.textContent);
    status.textContent = 'Yolculuk özeti kopyalandı.';
  } catch {
    status.textContent = 'Özeti seçip elle kopyalayabilirsiniz.';
  }
});
