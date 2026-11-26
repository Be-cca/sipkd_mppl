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
    const [hdr, b64] = v.url.split(',');
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

      toast(`Folder "${namaDosen}" (${statusFolder}) · Berkas tersimpan!`);
      return;
    } catch (err) {
      if (err && err.name === 'AbortError') return;
    }
  }

  // Fallback jika browser tidak mendukung pemilihan folder langsung
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `${namaDosen} - ${namaFile}`; document.body.appendChild(a); a.click(); a.remove(); toast(`Mengunduh ${namaDosen} - ${namaFile}`); };  // --- Renderer PDF Fit-to-Page Presisi Menggunakan PDF.js --- const _pdfState = {};  const renderPdfFitPage = async (id, pageNum = 1) => { const v = D.ber.find(x => x.id == id); const wrap = $(`#pdf-box-${id}`);
  const cvs  = $(`#pdf-cvs-${id}`); if (!v \vert{}\vert{} !wrap \vert{}\vert{} !cvs \vert{}\vert{} !window.pdfjsLib) return;  try { if (!_pdfState[id]) { const b64 = v.url.split(',')[1]; const bin = atob(b64); const bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i); const pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise; _pdfState[id] = { doc: pdfDoc, page: 1 }; }  const st = _pdfState[id]; const targetPage = Math.max(1, Math.min(pageNum, st.doc.numPages)); st.page = targetPage;  const page = await st.doc.getPage(targetPage); const unscaledViewport = page.getViewport({ scale: 1 });  // Hitung skala agar seluruh lebar & tinggi halaman muat sempurna (Fit to Page) const boxWidth  = Math.max(260, wrap.clientWidth - 24); const maxHeight = 520; const scaleW = boxWidth / unscaledViewport.width; const scaleH = maxHeight / unscaledViewport.height; const scale  = Math.min(scaleW, scaleH);  const dpr = window.devicePixelRatio \vert{}\vert{} 1; const viewport = page.getViewport({ scale: scale * dpr });  cvs.width  = Math.floor(viewport.width); cvs.height = Math.floor(viewport.height); cvs.style.width  = Math.floor(viewport.width / dpr) + 'px'; cvs.style.height = Math.floor(viewport.height / dpr) + 'px';  const ctx = cvs.getContext('2d'); await page.render({ canvasContext: ctx, viewport }).promise;  const infoEl = $(`#pdf-pg-${id}`);
    if (infoEl) infoEl.textContent = `Hal ${targetPage} /${st.doc.numPages}`;
  } catch (err) {
    wrap.innerHTML = `<iframe src="${getBlobUrl(v)}#toolbar=0&navpanes=0&view=Fit" style="display:block;width:100\%;height:500px;border:0;background:#fff"></iframe>`; } };  const navPdfPage = (id, delta) => { const st = _pdfState[id]; if (!st) return; renderPdfFitPage(id, st.page + delta); };  // --- Pratinjau Dokumen Asli (Fit to Page & Rapi) --- const openDoc = id => { const b = D.ber.find(x => x.id == id); if (!b \vert{}\vert{} !b.url) return toast('Berkas demo bawaan tidak memiliki file fisik'); const blobUrl = getBlobUrl(b); const win = window.open(); if (win) { win.document.write(`<title>${b.f}</title><body style="margin:0;background:#18181b"><iframe src="${blobUrl}#view=Fit&navpanes=0" style="border:0;width:100vw;height:100vh"></iframe></body>`);
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
    setTimeout(() => renderPdfFitPage(v.id, 1), 30);
  }

  return `
    <div style="border:1.5px solid var(--b);border-radius:12px;overflow:hidden;background:#1f1f23;width:100%">
      ${isImg
        ? `<div style="display:grid;place-items:center;padding:12px;background:#1f1f23">
             <img src="${blobUrl}" alt="${v.f}" style="display:block;width:100%;max-height:500px;height:auto;border-radius:8px;padding:0;background:transparent;object-fit:contain">
           </div>`
        : isPdf
          ? `<div id="pdf-box-${v.id}" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:12px;background:#27272a;min-height:360px">
               <canvas id="pdf-cvs-${v.id}" style="display:block;background:#fff;border-radius:6px;box-shadow:0 4px 16px rgba(0,0,0,0.4)"></canvas>
               <div style="display:flex;align-items:center;gap:10px;margin-top:10px">
                 <button type="button" class="btn w" style="margin:0;padding:4px 10px;font-size:12px" onclick="navPdfPage(${v.id},-1)">‹</button>
                 <small id="pdf-pg-${v.id}" style="color:#e4e4e7;font-size:12px;font-weight:600">Memuat…</small>
                 <button type="button" class="btn w" style="margin:0;padding:4px 10px;font-size:12px" onclick="navPdfPage(${v.id},1)">›</button>
               </div>
             </div>`
          : `<div style="padding:28px 16px;text-align:center;color:#fff"><b>${v.f}</b><p class="note">Pratinjau langsung tersedia untuk PDF dan gambar. Klik tombol di bawah untuk mengunduh ke folder dosen.</p></div>`
      }
      <div style="display:flex;flex-wrap:wrap;gap:8px;padding:10px 12px;background:#141416;align-items:center;justify-content:space-between;border-top:1px solid rgba(255,255,255,0.08)">
        <small style="color:#d4d4d8;font-size:11.5px">Folder: <b>${dn(v.d)}</b></small>
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
    table{border-collapse:collapse
