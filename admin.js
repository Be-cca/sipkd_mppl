/* admin.js: layar Admin BAAD */
const act = (id, ok) => {
  const b = D.ber.find(x => x.id == id);
  const ct = $('#ct').value.trim();
  if (!ok && !ct) return toast('Catatan wajib diisi jika menolak');
  b.s = ok ? 'Terverifikasi' : 'Ditolak';
  b.c = ct;
  N(b.d, ok ? 'g' : 'r', ok ? 'Berkas disetujui' : 'Berkas ditolak', b.t + (ct ? ' · ' + ct : '') + ' · oleh Admin BAAD');
  L(ok ? 'g' : 'r', 'Admin ' + (ok ? 'menyetujui ' : 'menolak ') + b.t, dn(b.d));
  save();
  S.sel = 0;
  draw(true);
  toast(ok ? 'Berkas disetujui' : 'Berkas ditolak');
};

const out = id => {
  const n = dn(id);
  D.dos = D.dos.filter(d => d.id != id);
  D.ber = D.ber.filter(b => b.d != id);
  D.rq = D.rq.filter(r => r.d != id);
  L('r', 'Admin mengeluarkan ' + n, 'Dikeluarkan dari database');
  save();
  cl();
  draw(true);
  toast('Dosen dikeluarkan dari database');
};

const mk = (id, n, p, j, hp) => {
  id = id.trim();
  n = n.trim();
  if (!id || !n) return toast('NIDN dan nama wajib diisi');
  if (D.dos.some(d => d.id == id)) return toast('NIDN sudah terdaftar');
  D.dos.push({ id, n, pr: p, jab: j, hp: hp || '' });
  N(id, 'g', 'Akun dibuat', 'Selamat datang di SIPKD');
  L('g', 'Admin mendaftarkan ' + n, 'Registrasi ' + id);
  save();
  cl();
  draw(true);
  toast('Dosen tersimpan');
};

const add = () => modal(`
  <h3>Tambah Dosen</h3>
  ${fi('NIDN / NUPTK', 'a1', 'Nomor unik pendidik')}
  ${fi('Nama lengkap', 'a2', 'Nama dan gelar')}
  ${sl('Program studi', 'a3', PRODI)}
  ${sl('Jabatan', 'a4', ['Asisten Ahli', 'Lektor', 'Lektor Kepala'])}
  ${fi('No. HP', 'a6', '08xxxxxxxxxx')}
  <p class="note">Kata sandi awal sama dengan NIDN/NUPTK.</p>
  <button class="btn" onclick="mk($('#a1').value,$('#a2').value,$('#a3').value,$('#a4').value,$('#a6').value)">Simpan Dosen</button>
  <button class="btn w" onclick="cl()">Batal</button>
`);

const addS = () => modal(`
  <h3>Tambah Persyaratan</h3>
  ${fi('Nama persyaratan', 's1', 'Mis. Sertifikat bahasa')}
  ${fi('Jenis berkas yang diminta', 's2', 'Mis. Sertifikat Bahasa')}
  <button class="btn" style="margin-top:12px" onclick="adS()">Simpan</button>
  <button class="btn w" onclick="cl()">Batal</button>
`);

const adS = () => {
  const t = $('#s1').value.trim();
  const j = $('#s2').value.trim();
  const k = S.tab.as || 's';
  if (!t) return toast('Nama persyaratan wajib diisi');
  D.sy[k].push({ t, j: j || t });
  D.dos.forEach(d => N(d.id, 'y', 'Persyaratan diperbarui', 'Admin menambah syarat: ' + t));
  L('y', 'Admin menambah persyaratan', t);
  save();
  cl();
  draw(true);
  toast('Persyaratan ditambahkan');
};

const delSy = (k, i) => {
  const x = D.sy[k][i];
  if (!x || !confirm('Hapus persyaratan "' + x.t + '"?')) return;
  D.sy[k].splice(i, 1);
  L('r', 'Admin menghapus persyaratan', x.t);
  save();
  draw(true);
  toast('Persyaratan dihapus');
};

const sd = () => {
  const a = $('#ds').value;
  const b = $('#dj').value;
  if (!a || !b) return toast('Isi kedua tanggal');
  D.dl = { s: a, j: b };
  D.dos.forEach(d => N(d.id, 'y', 'Batas unggah diperbarui', 'Serdos ' + fmt(a) + ' · JAD ' + fmt(b)));
  L('y', 'Admin mengatur batas unggah', 'Serdos ' + fmt(a) + ' · JAD ' + fmt(b));
  save();
  draw(true);
  toast('Batas waktu disimpan');
};

const filt = () => {
  const q = $('#q').value.toLowerCase();
  document.querySelectorAll('#tb tr').forEach(r => {
    r.style.display = r.textContent.toLowerCase().includes(q) ? '' : 'none';
  });
};

const detail = id => {
  const d = D.dos.find(x => x.id == id);
  const B = D.ber.filter(b => b.d == id);
  modal(`
    <h3 style="margin-bottom:4px">${d.n}</h3>
    <p class="note" style="margin:0 0 8px">NIDN ${d.id} · ${d.jab} · ${d.pr}${d.hp ? ' · ' + d.hp : ''}</p>
    <p>Persyaratan Serdos <b style="float:right">${pr(id, 's')} dari ${D.sy.s.length}</b></p>
    ${bar(pr(id, 's') / D.sy.s.length * 100)}
    ${SYs(id, 's').map(x => li(...x)).join('')}
    <p style="margin-top:10px"><b>Berkas diunggah (${B.length})</b></p>
    ${B.map(b => li(b.s == 'Terverifikasi' ? 'g' : b.s == 'Ditolak' ? 'r' : 'y', b.t, b.f + ' · ' + b.s)).join('') || '<p class="note">Belum ada berkas.</p>'}
    <div style="margin-top:12px">
      <button class="btn w d" onclick="out('${id}')">Keluarkan</button>
      <button class="btn w" onclick="cl();L('y','Admin mereset sandi',dn('${id}'));save();toast('Sandi direset ke NIDN')">Reset Sandi Dosen</button>
      <button class="btn w" onclick="cl()">Tutup</button>
    </div>
  `);
};

// --- Helper Konversi DataURL ke Blob ---
const dataUrlToBlob = async dataUrl => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

// --- Unduh Berkas ke Folder Nama Dosen -> Subfolder (serdos & jab) ---
const dlToDosenFolder = async id => {
  const v = D.ber.find(x => x.id == id);
  if (!v || !v.url) return toast('Berkas tidak memiliki lampiran fisik');

  const namaDosen = dn(v.d).replace(/[\\/:*?"<>|]/g, '_').trim();
  const namaFile  = v.f.replace(/[\\/:*?"<>|]/g, '_').trim();
  const isSerdos  = D.sy.s.some(x => x.j === v.t);
  const isJab     = D.sy.j.some(x => x.j === v.t);

  // Tentukan subfolder tujuan ('serdos', 'jab', atau keduanya jika persyaratan dipakai di kedua jalur)
  const targetSubs = [];
  if (isSerdos) targetSubs.push('serdos');
  if (isJab)    targetSubs.push('jab');
  if (!targetSubs.length) targetSubs.push('serdos');

  const blob = await dataUrlToBlob(v.url);

  // Gunakan File System Access API agar folder Dosen + subfolder serdos & jab otomatis terbuat / terpakai
  if (typeof window.showDirectoryPicker === 'function') {
    try {
      const rootDir = await window.showDirectoryPicker({ mode: 'readwrite' });

      // Buat atau gunakan folder bernama Dosen tersebut
      const dosenDir = await rootDir.getDirectoryHandle(namaDosen, { create: true });

      // Pastikan kedua subfolder (serdos & jab) tersedia di dalam folder Dosen
      const serdosDir = await dosenDir.getDirectoryHandle('serdos', { create: true });
      const jabDir    = await dosenDir.getDirectoryHandle('jab', { create: true });
      const dirMap    = { serdos: serdosDir, jab: jabDir };

      // Simpan file ke subfolder yang sesuai
      for (const sub of targetSubs) {
        const fileHandle = await dirMap[sub].getFileHandle(namaFile, { create: true });
        const writable   = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      }

      toast(`Tersimpan di folder "${namaDosen}/${targetSubs.join(' & ')}"`);
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return; // Pengguna membatalkan pemilihan folder
    }
  }

  // Fallback jika browser tidak mendukung showDirectoryPicker
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${namaDosen}_${targetSubs[0]}_${namaFile}`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast(`Mengunduh ${namaDosen} (${targetSubs.join(' & ')})`);
};

// --- Pratinjau Dokumen Asli (Muat & Rapi) ---
const openDoc = id => {
  const b = D.ber.find(x => x.id == id);
  if (!b || !b.url) return toast('Berkas demo bawaan tidak memiliki file fisik');
  const win = window.open();
  if (win) {
    win.document.write('<title>' + b.f + '</title><body style="margin:0;background:#111"><iframe src="' + b.url + '#view=FitH" style="border:0;width:100vw;height:100vh"></iframe></body>');
  }
};

const renderPreview = v => {
  if (!v.url) {
    return `<div class="drop" style="border-style:solid;border-color:var(--b);text-align:center;padding:24px 14px">
      <b>${v.f}</b>
      <small class="note" style="display:block;margin-top:4px">Berkas contoh bawaan sistem (belum ada lampiran fisik yang diunggah).</small>
    </div>`;
  }
  const isImg = v.url.startsWith('data:image/');
  const isPdf = v.url.startsWith('data:application/pdf');
  const isSerdos = D.sy.s.some(x => x.j === v.t);
  const isJab    = D.sy.j.some(x => x.j === v.t);
  const katLabel = [isSerdos ? 'serdos' : '', isJab ? 'jab' : ''].filter(Boolean).join(' & ') || 'serdos';

  return `
    <div style="border:1.5px solid var(--b);border-radius:12px;overflow:hidden;background:#18181b;width:100%">
      ${isImg
        ? `<div style="display:grid;place-items:center;padding:12px;background:#18181b">
             <img src="${v.url}" alt="${v.f}" style="display:block;width:100%;max-height:440px;height:auto;border-radius:8px;padding:0;background:transparent;object-fit:contain">
           </div>`
        : isPdf
          ? `<iframe src="${v.url}#view=FitH&navpanes=0&scrollbar=1" style="display:block;width:100%;height:460px;border:0;background:#fff"></iframe>`
          : `<div style="padding:24px;text-align:center;color:#fff"><b>${v.f}</b><p class="note">Pratinjau langsung tersedia untuk PDF dan gambar. Klik tombol di bawah untuk mengunduh ke folder dosen.</p></div>`
      }
      <div style="display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px;background:rgba(0,0,0,.78);align-items:center;justify-content:space-between">
        <small style="color:#e4e4e7;font-size:11.5px">Folder: <b>${dn(v.d)}/${katLabel}</b></small>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${(isImg || isPdf) ? `<button type="button" class="btn w" style="margin:0;padding:8px 12px;font-size:12px" onclick="openDoc(${v.id})">Buka Layar Penuh</button>` : ''}
          <button type="button" class="btn" style="margin:0;padding:8px 14px;font-size:12px" onclick="dlToDosenFolder(${v.id})">Unduh ke Folder Dosen</button>
        </div>
      </div>
    </div>`;
};

// --- Ekspor Excel (.xls) ---
const ex = () => {
  const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const rows = D.dos.map((d, i) => {
    const s = es(d.id, 's');
    const j = es(d.id, 'j');
    const p = pct(d.id);
    const bgS = s == 'Eligible' ? '#D1FAE5;color:#065F46' : '#FEF3C7;color:#92400E';
    const bgJ = j == 'Eligible' ? '#D1FAE5;color:#065F46' : '#FEF3C7;color:#92400E';
    return `<tr style="background:${i % 2 ? '#FFFDF5' : '#FFFFFF'}">
      <td style="text-align:center">${i + 1}</td>
      <td>${d.n}</td>
      <td style="text-align:center">'${d.id}</td>
      <td>${d.pr}</td>
      <td>${d.jab}</td>
      <td style="text-align:center;font-weight:bold;background:${bgS}">${s} (${pr(d.id, 's')}/${D.sy.s.length})</td>
      <td style="text-align:center;font-weight:bold;background:${bgJ}">${j} (${pr(d.id, 'j')}/${D.sy.j.length})</td>
      <td style="text-align:center;font-weight:bold">${p}%</td>
    </tr>`;
  }).join('');

  const html = `<html><head><meta charset="utf-8"><style>
    table{border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:11pt}
    th,td{border:1px solid #B8A358;padding:7px 10px}
    th{background:#F5C400;color:#1F1A05;font-weight:bold;text-align:center}
  </style></head><body>
    <table>
      <tr><td colspan="8" style="border:none;font-size:14pt;font-weight:bold;color:#1F1A05">REKAPITULASI PENGEMBANGAN KARIER DOSEN (SERDOS & JAD)</td></tr>
      <tr><td colspan="8" style="border:none;font-size:11pt;color:#2F7D12;font-weight:bold">UNIVERSITAS KATOLIK DE LA SALLE MANADO · Biro Administrasi Akademik Dosen (BAAD)</td></tr>
      <tr><td colspan="8" style="border:none;font-size:10pt;color:#5C4A00">Tanggal Ekspor: ${tgl} · Batas Serdos: ${fmt(D.dl.s)} · Batas JAD: ${fmt(D.dl.j)}</td></tr>
      <tr><td colspan="8" style="border:none"></td></tr>
      <tr>
        <th>No</th><th>Nama Lengkap & Gelar</th><th>NIDN / NUPTK</th><th>Program Studi</th>
        <th>Jabatan Akademik</th><th>Status Serdos</th><th>Status Kenaikan JAD</th><th>Kelengkapan</th>
      </tr>
      ${rows}
    </table>
  </body></html>`;

  const blob = new Blob(['\ufeff', html], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'Rekap_SIPKD_BAAD_' + new Date().toISOString().slice(0, 10) + '.xls';
  document.body.appendChild(a);
  a.click();
  a.remove();
  L('g', 'Admin mengekspor laporan Excel', 'Rekap_SIPKD_BAAD.xls');
  save();
  toast('File Excel (.xls) berhasil diunduh');
};

// --- Cetak PDF Berwarna & Berkepala Surat ---
const prtLap = () => {
  if (!$('#sipkd-print-css')) {
    const st = document.createElement('style');
    st.id = 'sipkd-print-css';
    st.textContent = `@media print{
      *{-webkit-print-color-adjust:exact!important;print-color-adjust:exact!important}
      .no-print{display:none!important}
      .only-print{display:block!important}
      body,.app,.main{background:#FFFDF5!important;color:#1F1A05!important}
      .cd{background:#FFFFFF!important;border:1.5px solid #E3D18A!important;break-inside:avoid;margin-bottom:14px}
      #lap-tbl th{background:#F5C400!important;color:#1F1A05!important;border:1px solid #C9A200!important}
      #lap-tbl td{border:1px solid #E3D18A!important;color:#1F1A05!important}
    }`;
    document.head.appendChild(st);
  }
  window.print();
};

// --- Tampilan Halaman Laporan Lengkap ---
const lapAdmin = () => {
  const tgl = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  const elS = D.dos.filter(d => es(d.id, 's') == 'Eligible').length;
  const elJ = D.dos.filter(d => es(d.id, 'j') == 'Eligible').length;
  const prodiRows = PRODI.map(p => {
    const ds = D.dos.filter(d => d.pr == p);
    const avg = ds.length ? Math.round(ds.reduce((a, b) => a + pct(b.id), 0) / ds.length) : 0;
    return `<div style="margin-bottom:10px">
      <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:4px">
        <span><b>${p}</b> <small class="note">(${ds.length} dosen)</small></span><b>${avg}%</b>
      </div>
      ${bar(avg)}
    </div>`;
  }).join('');

  return ['Laporan', 'Pantau dan cetak', `
    <div class="only-print" style="display:none;background:#F5C400;border-bottom:4px solid #2F7D12;border-radius:12px;padding:16px 20px;margin-bottom:16px">
      <div style="font-size:11px;font-weight:700;color:#2F7D12;letter-spacing:1px">UNIVERSITAS KATOLIK DE LA SALLE MANADO</div>
      <div style="font-size:18px;font-weight:800;color:#1F1A05;margin:2px 0">LAPORAN REKAPITULASI PENGEMBANGAN KARIER DOSEN (SIPKD)</div>
      <div style="font-size:12px;color:#5C4A00">Biro Administrasi Akademik Dosen (BAAD) · Dicetak pada ${tgl}</div>
    </div>

    <div class="grid">
      ${c('Kelengkapan Persyaratan per Prodi', prodiRows)}
      ${c('Cetak dan Ekspor', `
        <p class="note" style="margin:0 0 12px">Ringkasan: <b>${D.dos.length}</b> Dosen · <b>${elS}</b> Eligible Serdos · <b>${elJ}</b> Eligible JAD</p>
        <div class="no-print" style="display:flex;flex-direction:column;gap:8px">
          <button class="btn" onclick="prtLap()">Cetak / Simpan PDF (Berwarna)</button>
          <button class="btn w" onclick="ex()">Unduh Laporan Excel (.xls)</button>
        </div>`)}
    </div>

    ${c('Rekapitulasi Status Dosen (' + D.dos.length + ' Dosen)', `
      <div style="overflow-x:auto">
        <table id="lap-tbl" style="width:100%;border-collapse:collapse">
          <tr>
            <th>No</th>
            <th>Nama Dosen</th>
            <th>NIDN</th>
            <th>Program Studi</th>
            <th>Jabatan</th>
            <th>Serdos</th>
            <th>Kenaikan JAD</th>
            <th>Progres</th>
          </tr>
          ${D.dos.map((d, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><b>${d.n}</b></td>
              <td>${d.id}</td>
              <td>${d.pr}</td>
              <td>${d.jab}</td>
              <td>${bd(es(d.id, 's') + ' (' + pr(d.id, 's') + '/' + D.sy.s.length + ')', kb(es(d.id, 's')))}</td>
              <td>${bd(es(d.id, 'j') + ' (' + pr(d.id, 'j') + '/' + D.sy.j.length + ')', kb(es(d.id, 'j')))}</td>
              <td><b>${pct(d.id)}%</b></td>
            </tr>`).join('')}
        </table>
      </div>`)}
  `];
};

P.admin = {
  beranda: () => {
    const W = D.ber.filter(b => b.s == 'Menunggu');
    return ['Admin BAAD · Verifikator', 'Halo, Admin', stt() + c('Berkas Menunggu Verifikasi', W.map(b => li('y', dn(b.d), b.t + ' · ' + b.tg, `<button class="btn w" onclick="S.sel=${b.id};S.vt='m';S.pg='verif';draw()">Tinjau</button>`)).join('') || '<p class="note" style="margin:0">Semua berkas sudah diverifikasi.</p>')];
  },

  dosen: () => ['Kelola', 'Data Dosen', c('', `
    <div style="display:flex;gap:10px">
      <input id="q" placeholder="Cari dosen: nama atau NIDN" oninput="filt()">
      <button class="btn" style="white-space:nowrap" onclick="add()">Tambah Dosen</button>
    </div>
    <table style="margin-top:10px">
      <tr><th>Nama</th><th>NIDN</th><th>Jabatan</th><th>Serdos</th><th>JAD</th></tr>
      <tbody id="tb">
        ${D.dos.map(d => `<tr class="cl" onclick="detail('${d.id}')"><td><b>${d.n}</b></td><td>${d.id}</td><td>${d.jab}</td><td>${bd(es(d.id, 's'), kb(es(d.id, 's')))}</td><td>${bd(es(d.id, 'j'), kb(es(d.id, 'j')))}</td></tr>`).join('')}
      </tbody>
    </table>
    <p class="note">Klik baris untuk melihat detail dosen.</p>
  `)],

  syarat: () => {
    const k = S.tab.as || 's';
    return ['Kelola', 'Daftar Persyaratan',
      tabs([['s', 'Serdos'], ['j', 'Kenaikan JAD']], 'as') +
      c('', (D.sy[k].map((x, i) => li('', x.t, 'Berkas: ' + (x.j || 'Data dosen'), `<div style="display:flex;align-items:center;gap:8px">${bd('Aktif', 'g')}<button class="btn w d" style="min-height:32px;padding:0 10px;font-size:12px" onclick="delSy('${k}',${i})">Hapus</button></div>`)).join('') || '<p class="note" style="margin:0">Belum ada persyaratan.</p>') + `<button class="btn" style="margin-top:12px" onclick="addS()">Tambah Persyaratan</button>`)
    ];
  },

  batas: () => ['Diatur oleh admin BAAD', 'Batas Pengumpulan', `
    <div class="grid">
      ${c('Sertifikasi Dosen ' + dlb('s'), fi('Batas unggah dokumen', 'ds', '', 'date', D.dl.s))}
      ${c('Kenaikan Jabatan Akademik ' + dlb('j'), fi('Batas unggah dokumen', 'dj', '', 'date', D.dl.j))}
    </div>
    <button class="btn" onclick="sd()">Simpan Batas Waktu</button>
    <p class="note">Setelah batas waktu, dosen tidak dapat mengunggah berkas. Perpanjangan hanya oleh admin.</p>
  `],

  verif: () => {
    const k = S.vt || 'm';
    const Q = D.ber.filter(b => b.s == VT[k][1]);
    const v = Q.find(b => b.id == S.sel) || Q[0];
    return ['Verifikator BAAD (Sir / Staf)', 'Verifikasi Berkas', `
      <div class="tabs">${Object.entries(VT).map(([a, [l, s]]) => `<button class="${k == a ? 'on' : ''}" onclick="S.vt='${a}';S.sel=0;draw()">${l} ${D.ber.filter(b => b.s == s).length}</button>`).join('')}</div>
      <div class="grid" style="grid-template-columns:minmax(240px,0.85fr) minmax(320px,1.35fr)">
        ${c('Antrean', Q.map(x => `<div class="li" style="cursor:pointer;${v && x.id == v.id ? 'background:var(--ys);border-radius:10px;padding:11px 10px;' : ''}" onclick="S.sel=${x.id};draw(true)"><div><b>${dn(x.d)}</b><small>${x.t} · ${x.tg}</small></div></div>`).join('') || '<p class="note" style="margin:0">Tidak ada berkas.</p>')}
        ${c('Tinjau Berkas', v ? `
          <p><b>${dn(v.d)}</b><br><small class="note">${v.t} · ${v.f} · ${v.tg}</small></p>
          <label>Pratinjau dokumen</label>
          ${renderPreview(v)}
          ${v.s == 'Menunggu'
            ? `<label>Catatan (wajib jika ditolak)</label><textarea id="ct" rows="3" placeholder="Tulis alasan penolakan…"></textarea><div style="margin-top:12px"><button class="btn" onclick="act(${v.id},1)">Setujui</button><button class="btn w d" onclick="act(${v.id},0)">Tolak</button></div>`
            : `<p style="margin-top:10px">${bd(v.s, v.s == 'Ditolak' ? 'r' : 'g')} <small class="note">${v.c}</small></p>`
          }` : '<p class="note" style="margin:0">Pilih berkas dari antrean.</p>', '" style="min-width:0;overflow:hidden')}
      </div>
    `];
  },

  reg: () => ['Dikelola admin BAAD', 'Registrasi dan Keluar', `
    <div class="grid">
      ${c('Registrasi Dosen',
        fi('NIDN / NUPTK', 'r1', 'Nomor unik pendidik') +
        fi('Nama lengkap', 'r2', 'Nama dan gelar') +
        sl('Program studi', 'r3', PRODI) +
        `<button class="btn" style="margin-top:14px" onclick="mk($('#r1').value,$('#r2').value,$('#r3').value,'Asisten Ahli','')">Daftarkan Dosen</button>`)}
      ${c('Pindah Tempat / Keluar',
        (D.rq.map(r => li('', dn(r.d), r.a.replace(/pindah tugas/gi, 'Pindah tempat') + ' · ' + r.tg, `<button class="btn w d" onclick="out('${r.d}')">Keluarkan</button>`)).join('') || '<p class="note" style="margin:0">Tidak ada pengajuan.</p>') +
        '<p class="note">Akun dinonaktifkan dan data dikeluarkan dari database. Tercatat di log admin.</p>')}
    </div>
  `],

  lap: lapAdmin,

  akun: () => ['Admin BAAD · Verifikator', 'Akun Saya', `
    <div class="grid">
      ${akunBox('Sir', 'Admin BAAD · Verifikator', 'Aktif')}
      ${c('Keamanan dan Pengguna', [['Reset sandi pengguna', 'Atur ulang sandi dosen dari Data Dosen'], ['Log aktivitas', 'Lihat di menu Laporan']].map(x => li('', x[0], x[1])).join(''))}
    </div>
    <button class="btn w" onclick="resetD()">Reset Data Demo</button>
  `]
};
