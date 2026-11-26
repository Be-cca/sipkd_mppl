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
  ${fi('Nama lengkap', 'a2', 'Nama dan gelar')}${sl('Program studi', 'a3', PRODI)}
  ${sl('Jabatan', 'a4', ['Asisten Ahli', 'Lektor', 'Lektor Kepala'])}${fi('No. HP', 'a6', '08xxxxxxxxxx')}
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
    <p class="note" style="margin:0 0 8px">NIDN ${d.id} ·${d.jab} · ${d.pr}${d.hp ? ' · ' + d.hp : ''}</p>
    <p>Persyaratan Serdos <b style="float:right">${pr(id, 's')} dari${D.sy.s.length}</b></p>
    ${bar(pr(id, 's') / D.sy.s.length * 100)}${SYs(id, 's').map(x => li(...x)).join('')}
    <p style="margin-top:10px"><b>Berkas diunggah (${B.length})</b></p>${B.map(b => li(b.s == 'Terverifikasi' ? 'g' : b.s == 'Ditolak' ? 'r' : 'y', b.t, b.f + ' · ' + b.s)).join('') || '<p class="note">Belum ada berkas.</p>'}
    <div style="margin-top:12px">
      <button class="btn w d" onclick="out('${id}')">Keluarkan</button>
      <button class="btn w" onclick="cl();L('y','Admin mereset sandi',dn('${id}'));save();toast('Sandi direset ke NIDN')">Reset Sandi Dosen</button>
      <button class="btn w" onclick="cl()">Tutup</button>
    </div>
  `);
};

// --- Cache Blob URL & Konversi DataURL ---
const _blobCache = {};
const getBlobUrl = v => {
  if (!v || !v.url) return '';
  if (_blobCache[v.id]) return _blobCache[v.id];
  try {
    const parts = v.url.split(',');
    const hdr = parts[0];
    const b64 = parts[1];
    const mime = (hdr.match(/:(.*?);/) || [])[1] || 'application/octet-stream';
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    _blobCache[v.id] = URL.createObjectURL(new Blob([arr], { type: mime }));
    return _blobCache[v.id];
  } catch (e) {
    return v.url;
  }
};

const dataUrlToBlob = async dataUrl => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

// --- Unduh Berkas: Cek folder nama dosen (buat jika belum ada, pakai jika sudah ada) ---
const dlToDosenFolder = async id => {
  const v = D.ber.find(x => x.id == id);
  if (!v || !v.url) return toast('Berkas tidak memiliki lampiran fisik');

  const namaDosen = dn(v.d).replace(/[\\/:*?"<>|]/g, '_').trim();
  const namaFile  = v.f.replace(/[\\/:*?"<>|]/g, '_').trim();
  const blob      = await dataUrlToBlob(v.url);

  if (typeof window.showDirectoryPicker === 'function') {
    try {
      const rootDir = await window.showDirectoryPicker({ mode: 'readwrite' });

      let dosenDir;
      let statusFolder = 'ditemukan';
      try {
        dosenDir = await rootDir.getDirectoryHandle(namaDosen, { create: false });
      } catch (e) {
        dosenDir = await rootDir.getDirectoryHandle(namaDosen, { create: true });
        statusFolder = 'dibuat';
      }

      const fileHandle = await dosenDir.getFileHandle(namaFile, { create: true });
      const writable   = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();

      toast('Folder "' + namaDosen + '" (' + statusFolder + ') · Berkas tersimpan!');
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = namaDosen + ' - ' + namaFile;
  document.body.appendChild(a);
  a.click();
  a.remove();
  toast('Mengunduh ' + namaDosen + ' - ' + namaFile);
};

// --- Renderer PDF & Gambar Fit-to-Page dengan Zoom In / Zoom Out / Reset Fit ---
const _pdfState = {};
const _imgZoom  = {};

const renderPdfFitPage = async (id, pageNum, zoomDelta) => {
  const v = D.ber.find(x => x.id == id);
  const wrap = $('#pdf-box-' + id);
  const cvs  = $('#pdf-cvs-' + id);
  if (!v || !wrap || !cvs || !window.pdfjsLib) return;

  try {
    if (!_pdfState[id]) {
      const b64 = v.url.split(',')[1];
      const bin = atob(b64);
      const bytes = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
      const pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise;
      _pdfState[id] = { doc: pdfDoc, page: 1, zoom: 1 };
    }

    const st = _pdfState[id];
    if (pageNum !== null && pageNum !== undefined) {
      st.page = Math.max(1, Math.min(pageNum, st.doc.numPages));
    }
    if (zoomDelta === 0) {
      st.zoom = 1;
    } else if (zoomDelta !== null && zoomDelta !== undefined) {
      st.zoom = Math.max(0.5, Math.min(3, +(st.zoom + zoomDelta).toFixed(2)));
    }

    const page = await st.doc.getPage(st.page);
    const unscaledViewport = page.getViewport({ scale: 1 });

    const boxWidth  = Math.max(260, wrap.clientWidth - 24);
    const maxHeight = 520;
    const baseScale = Math.min(boxWidth / unscaledViewport.width, maxHeight / unscaledViewport.height);
    const scale     = baseScale * st.zoom;

    const dpr = window.devicePixelRatio || 1;
    const viewport = page.getViewport({ scale: scale * dpr });

    cvs.width  = Math.floor(viewport.width);
    cvs.height = Math.floor(viewport.height);
    cvs.style.width  = Math.floor(viewport.width / dpr) + 'px';
    cvs.style.height = Math.floor(viewport.height / dpr) + 'px';

    const ctx = cvs.getContext('2d');
    await page.render({ canvasContext: ctx, viewport: viewport }).promise;

    const infoEl = $('#pdf-pg-' + id);
    if (infoEl) infoEl.textContent = 'Hal ' + st.page + ' / ' + st.doc.numPages;
    const zmEl = $('#pdf-zm-' + id);
    if (zmEl) zmEl.textContent = Math.round(st.zoom * 100) + '%';
  } catch (err) {
    wrap.innerHTML = '<iframe src="' + getBlobUrl(v) + '#toolbar=0&navpanes=0&view=Fit" style="display:block;width:100%;height:500px;border:0;background:#fff"></iframe>';
  }
};

const navPdfPage = (id, delta) => {
  const cur = _pdfState[id] ? _pdfState[id].page : 1;
  renderPdfFitPage(id, cur + delta, null);
};

const zoomPdf = (id, delta) => {
  renderPdfFitPage(id, null, delta);
};

const zoomImg = (id, delta) => {
  const img = $('#img-prv-' + id);
  const lbl = $('#img-zm-' + id);
  if (!img) return;
  const cur = _imgZoom[id] || 1;
  const nxt = delta === 0 ? 1 : Math.max(0.5, Math.min(3, +(cur + delta).toFixed(2)));
  _imgZoom[id] = nxt;
  img.style.width = Math.round(nxt * 100) + '%';
  img.style.maxHeight = nxt === 1 ? '500px' : 'none';
  if (lbl) lbl.textContent = Math.round(nxt * 100) + '%';
};

// --- Pratinjau Dokumen Asli (Fit to Page + Zoom In/Out & Rapi) ---
const openDoc = id => {
  const b = D.ber.find(x => x.id == id);
  if (!b || !b.url) return toast('Berkas demo bawaan tidak memiliki file fisik');
  const blobUrl = getBlobUrl(b);
  const win = window.open();
  if (win) {
    win.document.write('<title>' + b.f + '</title><body style="margin:0;background:#18181b"><iframe src="' + blobUrl + '#view=Fit&navpanes=0" style="border:0;width:100vw;height:100vh"></iframe></body>');
  }
};

const renderPreview = v => {
  if (!v.url) {
    return `<div class="drop" style="border-style:solid;border-color:var(--b);text-align:center;padding:24px 14px">
      <b>${v.f}</b>
      <small class="note" style="display:block;margin-top:4px">Berkas contoh bawaan sistem (belum ada lampiran fisik yang diunggah).</small>
    </div>`;
  }
  const isImg   = v.url.startsWith('data:image/');
  const isPdf   = v.url.startsWith('data:application/pdf');
  const blobUrl = getBlobUrl(v);

  if (isPdf) {
    _pdfState[v.id] = null;
    setTimeout(() => renderPdfFitPage(v.id, 1, 0), 30);
  } else if (isImg) {
    _imgZoom[v.id] = 1;
  }

  const viewerHtml = isImg
    ? `<div style="background:#1f1f23">
         <div style="max-height:520px;overflow:auto;padding:12px;display:grid;place-items:center">
           <img id="img-prv-${v.id}" src="${blobUrl}" alt="${v.f}" style="display:block;width:100%;max-height:500px;height:auto;border-radius:8px;padding:0;background:transparent;object-fit:contain;transition:width 0.15s ease">
         </div>
         <div style="display:flex;align-items:center;justify-content:center;gap:8px;padding:8px;background:#18181b;border-top:1px solid rgba(255,255,255,0.06)">
           <button type="button" class="btn w" style="margin:0;padding:4px 10px;font-size:13px" title="Perkecil (Zoom Out)" onclick="zoomImg(${v.id},-0.25)">−</button>
           <small id="img-zm-${v.id}" style="color:#e4e4e7;font-size:12px;font-weight:700;min-width:44px;text-align:center">100%</small>
           <button type="button" class="btn w" style="margin:0;padding:4px 10px;font-size:13px" title="Perbesar (Zoom In)" onclick="zoomImg(${v.id},0.25)">+</button>
           <button type="button" class="btn w" style="margin:0;padding:4px 10px;font-size:11.5px" title="Sesuaikan Halaman" onclick="zoomImg(${v.id},0)">Fit</button>
         </div>
       </div>`
    : isPdf
      ? `<div style="background:#27272a">
           <div id="pdf-box-${v.id}" style="max-height:540px;overflow:auto;padding:12px;display:grid;place-items:center;min-height:360px">
             <canvas id="pdf-cvs-${v.id}" style="display:block;background:#fff;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.4)"></canvas>
           </div>
           <div style="display:flex;flex-wrap:wrap;align-items:center;justify-content:center;gap:8px;padding:8px 10px;background:#18181b;border-top:1px solid rgba(255,255,255,0.06)">
             <button type="button" class="btn w" style="margin:0;padding:4px 10px;font-size:12px" onclick="navPdfPage(${v.id},-1)">‹</button>
             <small id="pdf-pg-${v.id}" style="color:#e4e4e7;font-size:12px;font-weight:600">Memuat…</small>
             <button type="button" class="btn w" style="margin:0;padding:4px 10px;font-size:12px" onclick="navPdfPage(${v.id},1)">›</button>
             <span style="width:1px;height:18px;background:rgba(255,255,255,0.18);margin:0 2px"></span>
             <button type="button" class="btn w" style="margin:0;padding:4px 10px;font-size:13px" title="Perkecil (Zoom Out)" onclick="zoomPdf(${v.id},-0.25)">−</button>
             <small id="pdf-zm-${v.id}" style="color:#e4e4e7;font-size:12px;font-weight:700;min-width:44px;text-align:center">100%</small>
             <button type="button" class="btn w" style="margin:0;padding:4px 10px;font-size:13px" title="Perbesar (Zoom In)" onclick="zoomPdf(${v.id},0.25)">+</button>
             <button type="button" class="btn w" style="margin:0;padding:4px 10px;font-size:11.5px" title="Sesuaikan Halaman" onclick="zoomPdf(${v.id},0)">Fit</button>
           </div>
         </div>`
      : `<div style="padding:28px 16px;text-align:center;color:#fff"><b>${v.f}</b><p class="note">Pratinjau langsung tersedia untuk PDF dan gambar. Klik tombol di bawah untuk mengunduh ke folder dosen.</p></div>`;

  const fullscreenBtn = (isImg || isPdf)
    ? `<button type="button" class="btn w" style="margin:0;padding:8px 12px;font-size:12px" onclick="openDoc(${v.id})">Buka Layar Penuh</button>`
    : '';

  return `
    <div style="border:1.5px solid var(--b);border-radius:12px;overflow:hidden;background:#1f1f23;width:100%">
      ${viewerHtml}
      <div style="display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px;background:#141416;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.08)">
        <small style="color:#d4d4d8;font-size:11.5px">Folder: <b>${dn(v.d)}</b></small>
        <div style="display:flex;flex-wrap:wrap;gap:6px">
          ${fullscreenBtn}
          <button type="button" class="btn" style="margin:0;padding:8px
