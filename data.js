/* data.js: DATA AWAL & SINKRONISASI CLOUD ANTARPERANGKAT */
const FB_URL = 'https://sipkd-mppl-default-rtdb.asia-southeast1.firebasedatabase.app/';
const K = 'sipkd_demo_v1';

const dstr = n => new Date(Date.now() + n * 864e5).toISOString().slice(0, 10);
const fmt = s => new Date(s).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
const now = () => new Date().toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

const seed = () => {
  const B = [
    ['0412038801', 'Ijazah S2', 'Terverifikasi'],
    ['0412038801', 'SK Jabatan', 'Terverifikasi'],
    ['0412038801', 'SK Pengangkatan', 'Menunggu'],
    ['0412038801', 'PAK', 'Menunggu'],
    ['0412038801', 'Bukti Publikasi Jurnal', 'Ditolak', 'File tidak terbaca, unggah ulang'],
    ['0420057503', 'Ijazah S2', 'Terverifikasi'],
    ['0420057503', 'SK Jabatan', 'Terverifikasi'],
    ['0420057503', 'SK Pengangkatan', 'Terverifikasi'],
    ['0420057503', 'Sertifikat Pelatihan', 'Terverifikasi'],
    ['0420057503', 'PAK', 'Terverifikasi'],
    ['0420057503', 'Bukti Publikasi Jurnal', 'Terverifikasi'],
    ['0410129002', 'Ijazah S2', 'Menunggu'],
    ['0415088204', 'Sertifikat Pelatihan', 'Menunggu']
  ];
  return {
    dos: [
      { id: '0412038801', n: 'Dr. Ratna Wulandari, M.Si.', jab: 'Lektor', pr: 'Teknik Sipil', hp: '' },
      { id: '0420057503', n: 'Ir. Markus Tampi, M.T.', jab: 'Asisten Ahli', pr: 'Teknik Informatika', hp: '' },
      { id: '0410129002', n: 'Maria Lumentut, S.Pd., M.Pd.', jab: 'Asisten Ahli', pr: 'Pendidikan Guru', hp: '' },
      { id: '0415088204', n: 'Grace Mandagi, S.E., M.M.', jab: 'Asisten Ahli', pr: 'Manajemen', hp: '' }
    ],
    sy: {
      s: [
        { t: 'NIDN aktif' },
        { t: 'Pendidikan minimal S2', j: 'Ijazah S2' },
        { t: 'Jabatan minimal Asisten Ahli', j: 'SK Jabatan' },
        { t: 'Masa kerja memenuhi syarat', j: 'SK Pengangkatan' },
        { t: 'Sertifikat pelatihan pembelajaran', j: 'Sertifikat Pelatihan' }
      ],
      j: [
        { t: 'Pendidikan minimal S2', j: 'Ijazah S2' },
        { t: 'Angka kredit', j: 'PAK' },
        { t: 'Bukti publikasi jurnal', j: 'Bukti Publikasi Jurnal' }
      ]
    },
    ber: B.map((x, i) => ({
      id: i + 1,
      d: x[0],
      t: x[1],
      f: x[1].replace(/ /g, '_') + '.pdf',
      tg: fmt(Date.now() - (i + 1) * 864e5),
      s: x[2],
      c: x[3] || ''
    })),
    nid: B.length + 1,
    nt: { '0412038801': [['r', 'Berkas ditolak', 'Bukti Publikasi Jurnal · unggah ulang · 2 jam lalu']] },
    lg: [['g', 'Data demo dimuat', 'Sistem siap digunakan · ' + now()]],
    dl: { s: dstr(40), j: dstr(55) },
    rq: [{ d: '0415088204', a: 'Pindah tugas ke instansi lain', tg: fmt(Date.now() - 4 * 864e5) }]
  };
};

// Muat cache lokal terlebih dahulu agar halaman langsung tampil tanpa jeda
let D;
try { D = JSON.parse(localStorage.getItem(K)); } catch (e) {}
D = D || seed();

// Normalisasi array agar data dari Firebase tidak hilang jika kosong
const normD = r => {
  if (!r || typeof r !== 'object') return seed();
  r.dos = Array.isArray(r.dos) ? r.dos : Object.values(r.dos || {});
  r.ber = Array.isArray(r.ber) ? r.ber : Object.values(r.ber || {});
  r.rq  = Array.isArray(r.rq)  ? r.rq  : Object.values(r.rq  || {});
  r.lg  = Array.isArray(r.lg)  ? r.lg  : Object.values(r.lg  || {});
  r.nt  = r.nt || {};
  r.sy  = r.sy || { s: [], j: [] };
  r.sy.s = Array.isArray(r.sy.s) ? r.sy.s : Object.values(r.sy.s || {});
  r.sy.j = Array.isArray(r.sy.j) ? r.sy.j : Object.values(r.sy.j || {});
  r.dl  = r.dl || { s: dstr(40), j: dstr(55) };
  return r;
};

// Tarik data terbaru dari Firebase Cloud
let _lastStr = JSON.stringify(D);
const pullCloud = async () => {
  if (!FB_URL.startsWith('http')) return;
  try {
    const res = await fetch(FB_URL + '/sipkd.json');
    if (!res.ok) return;
    const remote = await res.json();
    if (remote) {
      const clean = normD(remote);
      const str = JSON.stringify(clean);
      if (str !== _lastStr) {
        D = clean;
        _lastStr = str;
        try { localStorage.setItem(K, str); } catch (e) {}
        if (typeof draw === 'function' && typeof S !== 'undefined' && S.role) draw();
      }
    } else {
      // Jika database cloud masih kosong pertama kali, unggah data awal
      pushCloud();
    }
  } catch (e) {}
};

// Simpan data ke Firebase Cloud
const pushCloud = async () => {
  if (!FB_URL.startsWith('http')) return;
  try {
    _lastStr = JSON.stringify(D);
    await fetch(FB_URL + '/sipkd.json', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: _lastStr
    });
  } catch (e) {}
};
