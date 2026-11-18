/* core.js: komponen tampilan bersama, login, menu drawer mobile, dan fungsi draw() */

const LOGO = document.querySelector('img').src;
const $ = s => document.querySelector(s);
const S = { role: null, lr: 'dosen', pg: null, tab: {}, sel: 0 };

// --- Ikon SVG ---
const IC = {
  home: '<path d="M3 11l9-8 9 8v9h-6v-6H9v6H3z"/>',
  ok:   '<circle cx="12" cy="12" r="9"/><path d="M8 12l3 3 5-6"/>',
  dir:  '<path d="M3 6h7l2 2h9v11H3z"/>',
  usr:  '<circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 15-5 16 0"/>',
  bel:  '<path d="M6 17v-6a6 6 0 0 1 12 0v6l2 2H4zM10 21h4"/>',
  lst:  '<path d="M8 6h13M8 12h13M8 18h13M3 6h1M3 12h1M3 18h1"/>',
  cht:  '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  out:  '<path d="M9 4H4v16h5M16 8l4 4-4 4M20 12H9"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>'
};
const ic = n => `<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${IC[n]}</svg>`;

// --- Menu & Profil per Role ---
const NAV = {
  dosen: [
    ['beranda', 'Beranda', 'home'],
    ['syarat',  'Persyaratan', 'ok'],
    ['berkas',  'Berkas', 'dir'],
    ['notif',   'Notifikasi', 'bel'],
    ['pindah',  'Pindah Tugas', 'out'],
    ['profil',  'Profil', 'usr']
  ],
  admin: [
    ['beranda', 'Beranda', 'home'],
    ['dosen',   'Data Dosen', 'usr'],
    ['syarat',  'Persyaratan', 'lst'],
    ['batas',   'Batas Pengumpulan', 'bel'],
    ['verif',   'Verifikasi', 'ok'],
    ['reg',     'Registrasi dan Keluar', 'out'],
    ['lap',     'Laporan', 'cht'],
    ['akun',    'Akun Saya', 'usr']
  ],
  wr: [
    ['beranda', 'Monitoring', 'cht'],
    ['lap',     'Laporan', 'lst'],
    ['akun',    'Akun Saya', 'usr']
  ]
};

const U = {
  dosen: ['Dr. Ratna Wulandari, M.Si.', 'Dosen · Teknik Sipil'],
  admin: ['Sir', 'Admin BAAD · Verifikator'],
  wr:    ['WR 1', 'Wakil Rektor 1 · Mode Pantau']
};

// --- Kontrol Drawer Sidebar Mobile ---
const togNav = open => {
  const sb = $('aside');
  let ov = $('#ov');
  if (!ov) {
    ov = document.createElement('div');
    ov.id = 'ov';
    ov.onclick = () => togNav(false);
    document.body.appendChild(ov);
  }
  const show = typeof open === 'boolean' ? open : !sb.classList.contains('open');
  sb.classList.toggle('open', show);
  ov.classList.toggle('on', show);
};

// --- Komponen UI Bersama ---
const c = (t, b, x = '') => `<section class="c ${x}">${t ? `<h3>${t}</h3>` : ''}${b}</section>`;
const bd = (t, k = '') => `<span class="bd ${k}">${t}</span>`;
const bar = (p, col) => `<div class="bar"><i style="width:${p}%${col ? ';background:' + col : ''}"></i></div>`;
const li = (k, t, s, r = '') => `<div class="li"><span class="dot ${k}">${{ g: '✓', y: '…', r: '!' }[k] || '•'}</span><div><b>${t}</b><small>${s}</small></div>${r}</div>`;
const st = a => `<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(170px,1fr))">${a.map(([l, v]) => c('', `<div class="st"><span>${l}</span><b>${v}</b></div>`)).join('')}</div>`;
const tabs = (a, k) => `<div class="tabs">${a.map(([v, l]) => `<button class="${(S.tab[k] || a[0][0]) == v ? 'on' : ''}" onclick="S.tab['${k}']='${v}';draw()">${l}</button>`).join('')}</div>`;
const fd = (l, ph, t = 'text') => `<label>${l}</label><input type="${t}" placeholder="${ph}">`;
const sel = (l, a) => `<label>${l}</label><select>${a.map(o => `<option>${o}</option>`).join('')}</select>`;
const fi = (l, id, ph, t = 'text', v = '') => `<label>${l}</label><input id="${id}" type="${t}" placeholder="${ph}" value="${v}">`;
const sl = (l, id, a, v) => `<label>${l}</label><select id="${id}">${a.map(o => `<option${o == v ? ' selected' : ''}>${o}</option>`).join('')}</select>`;

const toast = m => {
  const t = $('#t');
  t.textContent = m;
  t.style.display = 'block';
  clearTimeout(toast.h);
  toast.h = setTimeout(() => (t.style.display = 'none'), 2200);
};

const modal = h => {
  $('#m>div').innerHTML = h;
  $('#m').classList.add('on');
};
const cl = () => $('#m').classList.remove('on');

const bye = () => modal(`
  <h3 style="margin-bottom:8px">Keluar dari akun?</h3>
  <p class="note">Anda akan kembali ke halaman masuk dan perlu memasukkan NIDN atau NUPTK dan kata sandi lagi.</p>
  <div style="margin-top:16px">
    <button class="btn rd" onclick="cl();S.role=null;draw()">Ya, Keluar</button>
    <button class="btn w" onclick="cl()">Batal</button>
  </div>
`);

const contact = c('Hubungi admin BAAD', `
  <p>+62 812-0000-0000<br><small class="note">Senin–Jumat · 08.00–16.00</small></p>
  <div style="margin-top:8px">
    <button class="btn w" onclick="toast('Membuka WhatsApp…')">WhatsApp</button>
    <button class="btn w" onclick="toast('Membuka Telegram…')">Telegram</button>
    <button class="btn w" onclick="toast('Membuka email…')">Email</button>
  </div>
`);

// --- Helper Data, Log, & Perhitungan ---
const save = () => {
  try { localStorage.setItem(K, JSON.stringify(D)); } catch (e) {}
};

const resetD = () => {
  try { localStorage.removeItem(K); } catch (e) {}
  D = seed();
  S.role = null;
  toast('Data demo direset');
  setLr(S.lr);
};

const L = (k, t, s) => { D.lg = [[k, t, s + ' · ' + now()], ...D.lg].slice(0, 30); };
const N = (id, k, t, s) => { D.nt[id] = [[k, t, s + ' · ' + now()], ...(D.nt[id] || [])]; };
const dn = id => (D.dos.find(d => d.id == id) || { n: '(dihapus)' }).n;
const me = () => D.dos.find(d => d.id == S.me) || D.dos[0];
const fb = (id, t) => D.ber.filter(b => b.d == id && b.t == t).pop();

const SYs = (id, k) => D.sy[k].map(x => {
  if (!x.j) return ['g', x.t, 'Terverifikasi'];
  const b = fb(id, x.j);
  if (!b) return ['r', x.t, 'Berkas belum diunggah'];
  if (b.s == 'Terverifikasi') return ['g', x.t, 'Terverifikasi'];
  if (b.s == 'Menunggu') return ['y', x.t, 'Menunggu verifikasi'];
  return ['r', x.t, 'Ditolak: ' + (b.c || 'unggah ulang')];
});

const pr = (id, k) => SYs(id, k).filter(x => x[0] == 'g').length;
const el = (id, k) => pr(id, k) == D.sy[k].length;
const es = (id, k) => el(id, k) ? 'Eligible' : pr(id, k) ? 'Proses' : 'Belum';
const pct = id => Math.round((pr(id, 's') + pr(id, 'j')) / (D.sy.s.length + D.sy.j.length) * 100);

const dl = k => Math.ceil((new Date(D.dl[k] + 'T23:59:59') - Date.now()) / 864e5);
const dlb = k => {
  const n = dl(k);
  return bd(n < 0 ? 'Ditutup' : n + ' hari lagi', n < 0 ? 'r' : '');
};

const kb = v => v == 'Eligible' ? 'g' : v == 'Belum' ? 'r' : '';
const VT = { m: ['Menunggu', 'Menunggu'], d: ['Disetujui', 'Terverifikasi'], t: ['Ditolak', 'Ditolak'] };
const PRODI = ['Teknik Sipil', 'Teknik Informatika', 'Manajemen', 'Pendidikan Guru'];

// --- Autentikasi & Login ---
const DEF = {
  dosen: ['0412038801', 'demo1234'],
  admin: ['admin.baad', 'demo1234'],
  wr:    ['wr1.unika', 'demo1234']
};

const setLr = k => {
  S.lr = k;
  $('#u').value = DEF[k][0];
  $('#p').value = DEF[k][1];
  draw();
};

const lgin = e => {
  e.preventDefault();
  const u = $('#u').value.trim();
  if (!u || !$('#p').value) return toast('Isi NIDN/NUPTK dan kata sandi');
  if (S.lr == 'dosen') {
    const d = D.dos.find(x => x.id == u);
    if (!d) return toast('NIDN tidak terdaftar. Coba 0412038801');
    S.me = d.id;
  }
  S.role = S.lr;
  S.pg = null;
  draw();
};

const stt = () => st([
  ['Total Dosen', D.dos.length],
  ['Eligible Serdos', D.dos.filter(d => el(d.id, 's')).length],
  ['Eligible JAD', D.dos.filter(d => el(d.id, 'j')).length],
  ['Berkas Menunggu', D.ber.filter(b => b.s == 'Menunggu').length]
]);

const rep = () => {
  const PR = [...new Set(D.dos.map(d => d.pr))];
  return ['Laporan', 'Pantau dan cetak', `
    <div class="grid">
      ${c('Kelengkapan Persyaratan per Prodi', PR.map(n => {
        const a = D.dos.filter(d => d.pr == n);
        const p = Math.round(a.reduce((s, d) => s + pct(d.id), 0) / a.length);
        return `<p style="margin-top:10px"><b>${n}</b><span style="float:right">${p}%</span></p>${bar(p, p < 65 ? '#C2570C' : '')}`;
      }).join('') || '<p class="note">Belum ada data.</p>')}
      ${c('Cetak dan Ekspor', `
        <p class="note" style="margin:0 0 8px">Rekap eligibilitas dan kelengkapan berkas.</p>
        <button class="btn" onclick="print()">Cetak / PDF</button>
        <button class="btn w" onclick="ex()">Ekspor Excel (CSV)</button>
      `)}
    </div>
  `];
};

const akunBox = (n, s, b) => c('', `
  <div class="li">
    <span class="dot g" style="width:54px;height:54px;background:var(--g);color:#fff">${n[0]}</span>
    <div><b>${n}</b><small>${s}</small></div>
    ${bd(b, 'g')}
  </div>
`);

// --- Render Utama ---
const P = {};

function draw() {
  const r = S.role;
  $('#lg').style.display = r ? 'none' : 'grid';
  $('#app').style.display = r ? 'grid' : 'none';

  if (!r) {
    togNav(false);
    $('#lt').innerHTML = '<div class="tabs">' +
      [['dosen', 'Dosen'], ['admin', 'Admin BAAD'], ['wr', 'WR 1']]
        .map(([k, l]) => `<button type="button" class="${S.lr == k ? 'on' : ''}" onclick="setLr('${k}')">${l}</button>`)
        .join('') +
      '</div>';
    return;
  }

  const n = NAV[r];
  const u = r == 'dosen' ? [me().n, 'Dosen · ' + me().pr] : U[r];
  if (!n.some(x => x[0] == S.pg)) S.pg = n[0][0];

  const [a, b, h] = P[r][S.pg]();

  $('#nv').innerHTML = n.map(([k, l, i]) =>
    `<button class="${k == S.pg ? 'on' : ''}" onclick="S.pg='${k}';togNav(false);draw()">${ic(i)}${l}</button>`
  ).join('');

  $('#me').innerHTML = `<b>${u[0]}</b><br>${u[1]}`;

  $('#hd').innerHTML = `
    <div class="hd-l">
      <button type="button" class="mbtn" aria-label="Buka Menu" onclick="togNav()">${ic('menu')}</button>
      <div><small>${a}</small><h1>${b}</h1></div>
    </div>
    <img src="${LOGO}" alt="Logo">
  `;

  $('#bd').innerHTML = h;
  scrollTo(0, 0);
}
