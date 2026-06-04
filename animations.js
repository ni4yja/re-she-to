// animations.js — D3 render functions for resheto
// requires D3 v7 loaded globally

async function renderBarChart() {
  const res = await fetch('data/top_languages.json');
  const langs = await res.json();
  const top5 = langs.slice(0, 5).sort((a, b) => a.percent_2025 - b.percent_2025);
  const el = document.getElementById('chart-s4');
  if (!el) return;
  el.innerHTML = '';

  const margin = { top: 10, right: 70, bottom: 20, left: 110 };
  const width = el.offsetWidth - margin.left - margin.right;
  const height = 240 - margin.top - margin.bottom;

  const svg = d3.select(el).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear()
    .domain([0, d3.max(top5, d => d.percent_2025) * 1.15])
    .range([0, width]);

  const y = d3.scaleBand()
    .domain(top5.map(d => d.name))
    .range([height, 0])
    .padding(0.35);

  // grid
  svg.append('g')
    .call(d3.axisBottom(x).ticks(5).tickSize(height).tickFormat(''))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('line').attr('stroke', '#e0e0e0').attr('stroke-width', 0.5));

  // axes
  svg.append('g')
    .call(d3.axisLeft(y).tickSize(0))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('text')
      .attr('font-size', '13px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('fill', '#1a1a1a')
      .attr('dx', '-8'));

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + '%'))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('text')
      .attr('font-size', '12px')
      .attr('fill', '#888'));

  // bars
  svg.selectAll('.bar')
    .data(top5)
    .join('rect')
    .attr('x', 0)
    .attr('y', d => y(d.name))
    .attr('height', y.bandwidth())
    .attr('rx', 2)
    .attr('fill', d => d.code === 'eng' ? '#3D3B8E' : '#9896C8')
    .attr('width', 0)
    .transition()
    .duration(600)
    .delay((_, i) => i * 80)
    .ease(d3.easeCubicOut)
    .attr('width', d => x(d.percent_2025));

  // labels
  svg.selectAll('.label')
    .data(top5)
    .join('text')
    .attr('x', d => x(d.percent_2025) + 6)
    .attr('y', d => y(d.name) + y.bandwidth() / 2 + 4)
    .attr('font-size', '12px')
    .attr('font-family', 'Inter, sans-serif')
    .attr('fill', '#1a1a1a')
    .attr('opacity', 0)
    .text(d => d.percent_2025 + '%')
    .transition()
    .duration(300)
    .delay((_, i) => i * 80 + 500)
    .attr('opacity', 1);
}

async function renderLineChart() {
  const res = await fetch('data/top5_by_year.json');
  const lineData = await res.json();
  const el = document.getElementById('chart-s5');
  if (!el || el.dataset.rendered) return;
  el.dataset.rendered = '1';
  el.innerHTML = '';

  const colors = {
    'japoński': '#3D3B8E',
    'francuski': '#D85A30',
    'niemiecki': '#1D9E75',
    'włoski': '#BA7517'
  };

  const parsed = lineData
    .filter(d => d.name !== 'hiszpański')
    .map(d => ({ ...d, year: +d.year }));

  const nested = d3.group(parsed, d => d.name);

  const margin = { top: 20, right: 100, bottom: 30, left: 50 };
  const width = el.offsetWidth - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const svg = d3.select(el).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([2000, 2025]).range([0, width]);
  const y = d3.scaleLinear()
    .domain([0, d3.max(parsed, d => d.percent) * 1.1])
    .range([height, 0]);

  // grid
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(''))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('line').attr('stroke', '#e0e0e0').attr('stroke-width', 0.5));

  // axes
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5).tickFormat(d => d + '%'))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('text')
      .attr('font-size', '12px').attr('fill', '#888'));

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('d')))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('text')
      .attr('font-size', '12px').attr('fill', '#888'));

  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.percent))
    .curve(d3.curveMonotoneX);

  nested.forEach((values, name) => {
    const col = colors[name] || '#ccc';

    const path = svg.append('path')
      .datum(values.sort((a, b) => a.year - b.year))
      .attr('fill', 'none')
      .attr('stroke', col)
      .attr('stroke-width', 2)
      .attr('d', line);

    const len = path.node().getTotalLength();
    path
      .attr('stroke-dasharray', len)
      .attr('stroke-dashoffset', len)
      .transition()
      .duration(1200)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    const last = values[values.length - 1];
    svg.append('text')
      .attr('x', x(last.year) + 6)
      .attr('y', y(last.percent) + 4)
      .attr('font-size', '11px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('fill', col)
      .attr('opacity', 0)
      .text(name)
      .transition()
      .delay(1200)
      .duration(300)
      .attr('opacity', 1);
  });
}

async function renderAuthorsChart() {
  const el = document.getElementById('chart-s9');
  if (!el || el.dataset.rendered) return;
  el.dataset.rendered = '1';
  el.innerHTML = '';

  const res = await fetch('data/authors.json');
  const authors = await res.json();

  const sorted = [...authors].sort((a, b) => b.count - a.count);
  const minBorn = Math.min(...authors.map(a => a.born));
  const maxBorn = Math.max(...authors.map(a => a.born));

  sorted.forEach((a, i) => {
    const pct = (a.born - minBorn) / (maxBorn - minBorn);
    const dotPct = Math.round(pct * 100);
    const linePct = 100 - dotPct;
    const langCls = a.lang === 'ukr' ? 'ukr' : 'rus';
    const yearsStr = a.died ? `${a.born}–${a.died}` : `ur. ${a.born}`;

    const row = document.createElement('div');
    row.className = 's9-row';
    row.innerHTML = `
      <div class="s9-count s9-count--${langCls}">${a.count}</div>
      <div class="s9-bar">
        <div class="s9-line" style="flex:${dotPct};"></div>
        <div class="s9-dot s9-dot--${langCls}"></div>
        <div class="s9-line" style="flex:${linePct};"></div>
      </div>
      <div class="s9-author">
        <div class="s9-name">${a.name}</div>
        <div class="s9-years">${yearsStr}</div>
      </div>`;
    el.appendChild(row);

    setTimeout(() => row.classList.add('s9-row--visible'), i * 50);
  });
}

async function renderUkrRusChart() {
  const res = await fetch('data/ukr_rus_by_year.json');
  const data = await res.json();
  const el = document.getElementById('chart-s7');
  if (!el) return;
  el.innerHTML = '';

  const flat = [];
  data.forEach(d => {
    if (d.year && /^\d{4}$/.test(String(d.year))) {
      flat.push({ year: +d.year, count: d.ukr || 0, lang: 'ukraiński' });
      flat.push({ year: +d.year, count: d.rus || 0, lang: 'rosyjski' });
    }
  });

  const nested = d3.group(flat, d => d.lang);
  const margin = { top: 20, right: 120, bottom: 30, left: 50 };
  const width = el.offsetWidth - margin.left - margin.right;
  const height = 300 - margin.top - margin.bottom;

  const svg = d3.select(el).append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([2000, 2025]).range([0, width]);
  const y = d3.scaleLinear()
    .domain([0, d3.max(flat, d => d.count) * 1.1])
    .range([height, 0]);

  // grid
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(''))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('line').attr('stroke', '#e0e0e0').attr('stroke-width', 0.5));

  // axes
  svg.append('g')
    .call(d3.axisLeft(y).ticks(5))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('text')
      .attr('font-size', '12px').attr('fill', '#888'));

  svg.append('g')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format('d')))
    .call(g => g.select('.domain').remove())
    .call(g => g.selectAll('text')
      .attr('font-size', '12px').attr('fill', '#888'));

  // 2022 marker
  svg.append('line')
    .attr('x1', x(2022)).attr('x2', x(2022))
    .attr('y1', 0).attr('y2', height)
    .attr('stroke', '#e03c31')
    .attr('stroke-width', 1)
    .attr('stroke-dasharray', '4 2');

  svg.append('text')
    .attr('x', x(2022) + 4).attr('y', 12)
    .attr('font-size', '11px')
    .attr('font-family', 'Inter, sans-serif')
    .attr('fill', '#e03c31')
    .text('2022');

  const colors = { 'ukraiński': '#3D3B8E', 'rosyjski': '#ccc' };
  const line = d3.line()
    .x(d => x(d.year))
    .y(d => y(d.count))
    .curve(d3.curveMonotoneX);

  // rosyjski first, ukraiński on top
  ['rosyjski', 'ukraiński'].forEach(name => {
    const values = nested.get(name).sort((a, b) => a.year - b.year);
    const col = colors[name];

    const path = svg.append('path')
      .datum(values)
      .attr('fill', 'none')
      .attr('stroke', col)
      .attr('stroke-width', 2)
      .attr('d', line);

    const len = path.node().getTotalLength();
    path
      .attr('stroke-dasharray', len)
      .attr('stroke-dashoffset', len)
      .transition()
      .duration(1400)
      .ease(d3.easeLinear)
      .attr('stroke-dashoffset', 0);

    const last = values[values.length - 1];
    svg.append('text')
      .attr('x', x(last.year) + 6)
      .attr('y', y(last.count) + 4)
      .attr('font-size', '11px')
      .attr('font-family', 'Inter, sans-serif')
      .attr('fill', name === 'ukraiński' ? '#3D3B8E' : '#aaa')
      .attr('opacity', 0)
      .text(`${name} (${last.count})`)
      .transition()
      .delay(1400)
      .duration(300)
      .attr('opacity', 1);
  });
}