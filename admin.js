/* admin.js: layar Admin BAAD & WR 1 (Beranda, Verifikasi, Persyaratan, Dosen, Laporan) */

// --- Fungsi Aksi Admin ---
const verif = (id, status) => {
  const b = D.ber.find(x => x.id == id);
  if (!b) return;
  let ket = '';
  if (status == 'Ditolak') {
    ket = prompt('Masukkan alasan penolakan berkas "' + b.f + '":');
    if (ket === null) return;
  }
  b.s = status;
  b.c = ket;
  const ds = D.ds.find(x => x.id == b.d);
  D.nt[b.d] = D.nt[b.d] || [];
  D.nt[b.d].unshift([
    status == 'Terverifikasi' ? 'g' : 'r',
    'Berkas ' + status,
    b.t + (ket ? ' · Alasan: ' + ket : '')
  ]);
  L(status == 'Terverifikasi' ? 'g' : 'r', (ds ? ds.n : b.d) + ' · ' + b.t + ' (' + status + ')', b.f);
  save();
  draw();
  toast('Berkas ' + status.toLowerCase());
};

const addSy = (k) => {
  const t = $('#syt').value.trim();
  const d = $('#syd').value.trim();
  const j = $('#syj').value.trim();
  if (!t) return toast('Nama persyaratan wajib diisi');
  D.sy[k].push({ t, d, j });
  L('g', 'Menambah persyaratan ' + (k == 's' ? 'Serdos' : 'Kenaikan JAD'), t);
  save();
  draw();
  toast('Persyaratan ditambahkan');
};

const delSy = (k, idx) => {
  const item = D.sy[k][idx];
  if (!item) return;
  if (!confirm('Hapus persyaratan "' + item.t + '"?')) return;
  D.sy[k].splice(idx, 1);
  L('r', 'Menghapus persyaratan ' + (k == 's' ? 'Serdos' : 'Kenaikan JAD'), item.t);
  save();
  draw();
  toast('Persyaratan dihapus');
};

const svDl = () => {
  const s = $('#dls').value;
  const j = $('#dlj').value;
  if (!s || !j) return toast('Tanggal batas pengumpulan wajib diisi');
  D.dl.s = new Date(s).getTime();
  D.dl.j = new Date(j).getTime();
  L('y', 'Memperbarui batas pengumpulan', 'Serdos & JAD');
  save();
  draw();
  toast('Batas pengumpulan disimpan');
};

const addDs = () => {
  const n = $('#dsn').value.trim();
  const id = $('#dsi').value.trim();
  const jab = $('#dsj').value;
  const pr = $('#dsp').value.trim();
  if (!n || !id || !pr) return toast('Lengkapi nama, NIDN/NUPTK, dan program studi');
  if (D.ds.some(x => x.id == id)) return toast('NIDN/NUPTK sudah terdaftar');
  D.ds.push({ id, n, jab, pr, hp: '', pw: id });
  L('g', 'Mendaftarkan dosen baru', n + ' (' + id + ')');
  save();
  draw();
  toast('Akun dosen berhasil ditambahkan');
};

const accRq = (id) => {
  const idx = D.rq.findIndex(r => r.d == id);
  if (idx < 0) return;
  const rq = D.rq[idx];
  const dsIdx = D.ds.findIndex(x => x.id == id);
  const nama = dsIdx >= 0 ? D.ds[dsIdx].n : id;
  if (!confirm('Setujui pengajuan "' + rq.a + '" dan keluarkan data ' + nama + ' dari database?')) return;
  D.rq.splice(idx, 1);
  if (dsIdx >= 0) D.ds.splice(dsIdx, 1);
  D.ber = D.ber.filter(b => b.d != id);
  L('r', 'Menonaktifkan & mengeluarkan data dosen', nama + ' (' + rq.a + ')');
  save();
  draw();
  toast('Akun dinonaktifkan dan data dikeluarkan');
};

const delDs = (id) => {
  const idx = D.ds.findIndex(x => x.id == id);
  if (idx < 0) return;
  const nama = D.ds[idx].n;
  if (!confirm('Keluarkan dosen "' + nama + '" secara permanen dari database?')) return;
  D.ds.splice(idx, 1);
  D.ber = D.ber.filter(b => b.d != id);
  D.rq = D.rq.filter(r => r.d != id);
  L('r', 'Menghapus data dosen dari database', nama);
  save();
  draw();
  toast('Data dosen dikeluarkan');
};

// --- Layar Admin ---
P.admin = {
  beranda: () => {
    const tot = D.ds.length;
    const elS = D.ds.filter(d => el(d.id, 's')).length;
    const elJ = D.ds.filter(d => el(d.id, 'j')).length;
    const mng = D.ber.filter(b => b.s == 'Menunggu').length;
    const logs = (D.lg || []).slice(0, 6);

    return ['Dashboard Admin', S.u.n + (S.u.r == 'wr1' ? ' · Monitoring WR 1' : ' · Admin BAAD'), `
      <div class="grid">
        ${c('Ringkasan Dosen', `
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;text-align:center">
            <div class="li" style="flex-direction:column;align-items:center"><b>${tot}</b><small>Total Dosen</small></div>
            <div class="li" style="flex-direction:column;align-items:center"><b>${elS}</b><small>Eligible Serdos</small></div>
            <div class="li" style="flex-direction:column;align-items:center"><b>${elJ}</b><small>Eligible JAD</small></div>
          </div>`)}
        ${c('Antrean Verifikasi', `
          <p class="note" style="margin:0 0 10px">${bd(mng + ' Berkas Menunggu')} · ${D.rq.length} pengajuan pindah/keluar</p>
          <p class="note" style="margin:0">Batas unggah Serdos ${fmt(D.dl.s)} · JAD ${fmt(D.dl.j)}</p>`)}
        ${c('Aktivitas Terbaru', logs.length ? logs.map(x => li(...x)).join('') : '<p class="note" style="margin:0">Belum ada aktivitas.</p>')}
      </div>`];
  },

  verif: () => {
    const ro = S.u.r == 'wr1';
    const f = S.tab.vf || 'Menunggu';
    const list = D.ber.filter(b => f == 'Semua' ? true : b.s == f).slice().reverse();

    return ['Pemeriksaan Dokumen', 'Verifikasi Berkas',
      tabs([['Menunggu', 'Menunggu'], ['Terverifikasi', 'Terverifikasi'], ['Ditolak', 'Ditolak'], ['Semua', 'Semua']], 'vf') +
      c('Daftar Berkas (' + list.length + ')', list.length ? list.map(b => {
        const ds = D.ds.find(x => x.id == b.d);
        return `
          <div class="li" style="flex-direction:column;align-items:stretch;gap:8px">
            <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
              <div>
                <b>${b.f}</b>
                <small>${ds ? ds.n + ' (' + ds.id + ')' : b.d} · ${b.t} · ${b.tg}</small>
                ${b.c ? `<small style="color:var(--r)">Catatan: ${b.c}</small>` : ''}
              </div>
              ${bd(b.s, b.s == 'Terverifikasi' ? 'g' : b.s == 'Ditolak' ? 'r' : '')}
            </div>
            ${ro ? '' : `
              <div style="display:flex;gap:8px;justify-content:flex-end">
                <button class="btn" style="width:auto;min-height:34px;padding:0 12px;font-size:12px" onclick="verif(${b.id}, 'Terverifikasi')">Setujui</button>
                <button class="btn d" style="width:auto;min-height:34px;padding:0 12px;font-size:12px" onclick="verif(${b.id}, 'Ditolak')">Tolak</button>
              </div>`}
          </div>`;
      }).join('') : '<p class="note" style="margin:0">Tidak ada berkas pada kategori ini.</p>')
    ];
  },

  syarat: () => {
    const k = S.tab.sy || 's';
    const ro = S.u.r == 'wr1';
    const toInputDate = (ms) => new Date(ms).toISOString().slice(0, 10);

    return ['Pengaturan', 'Persyaratan Karier',
      tabs([['s', 'Serdos'], ['j', 'Kenaikan JAD']], 'sy') +
      `<div class="grid">
        ${c('Daftar Persyaratan ' + (k == 's' ? 'Serdos ' : 'Kenaikan JAD ') + bd(D.sy[k].length),
          D.sy[k].map((x, idx) => `
            <div class="li">
              <div style="padding-right:10px">
                <b>${x.t}</b>
                <small>${x.d || ''}${x.j ? ' · Jenis berkas: ' + x.j : ''}</small>
              </div>
              ${ro ? '' : `<button class="btn d" style="width:auto;min-height:34px;padding:0 12px;font-size:12px;flex:none" onclick="delSy('${k}', ${idx})">Hapus</button>`}
            </div>`).join('') || '<p class="note" style="margin:0">Belum ada persyaratan.</p>')}
        ${ro ? '' : c('Tambah Persyaratan ' + (k == 's' ? 'Serdos' : 'Kenaikan JAD'),
          fi('Nama persyaratan', 'syt', 'Contoh: Sertifikat PEKERTI / AA') +
          fi('Keterangan singkat', 'syd', 'Contoh: Wajib diunggah dalam format PDF') +
          fi('Jenis berkas unggahan (opsional)', 'syj', 'Contoh: Sertifikat PEKERTI') +
          `<button class="btn" style="margin-top:14px" onclick="addSy('${k}')">Tambah Persyaratan</button>`
        )}
        ${ro ? '' : c('Batas Waktu Pengumpulan (Deadline)',
          fi('Batas pengumpulan Serdos', 'dls', '', 'date', toInputDate(D.dl.s)) +
          fi('Batas pengumpulan Kenaikan JAD', 'dlj', '', 'date', toInputDate(D.dl.j)) +
          `<button class="btn" style="margin-top:14px" onclick="svDl()">Simpan Batas Waktu</button>`
        )}
      </div>`
    ];
  },

  dosen: () => {
    const ro = S.u.r == 'wr1';
    return ['Manajemen Pengguna', 'Data Dosen', `
      <div class="grid">
        ${D.rq.length ? c('Pengajuan Pindah Tugas / Keluar ' + bd(D.rq.length, 'r'),
          D.rq.map(r => {
            const ds = D.ds.find(x => x.id == r.d);
            return `
              <div class="li">
                <div>
                  <b>${ds ? ds.n : r.d} (${r.d})</b>
                  <small>Alasan: ${r.a} · Dikirim ${r.tg}</small>
                </div>
                ${ro ? '' : `<button class="btn d" style="width:auto;min-height:34px;padding:0 12px;font-size:12px" onclick="accRq('${r.d}')">Nonaktifkan & Hapus</button>`}
              </div>`;
          }).join('')) : ''}
        ${c('Daftar Dosen Terdaftar (' + D.ds.length + ')',
          D.ds.map(d => `
            <div class="li">
              <div>
                <b>${d.n}</b>
                <small>NIDN: ${d.id} · ${d.jab} · ${d.pr}</small>
                <small>Serdos: ${pr(d.id, 's')}/${D.sy.s.length} · JAD: ${pr(d.id, 'j')}/${D.sy.j.length}</small>
              </div>
              ${ro ? '' : `<button class="btn d" style="width:auto;min-height:34px;padding:0 12px;font-size:12px" onclick="delDs('${d.id}')">Keluarkan</button>`}
            </div>`).join('') || '<p class="note" style="margin:0">Belum ada data dosen.</p>')}
        ${ro ? '' : c('Registrasi Dosen Baru',
          fi('Nama lengkap & gelar', 'dsn', 'Contoh: Dr. Budi Santoso, M.Kom.') +
          fi('NIDN / NUPTK (untuk login)', 'dsi', 'Contoh: 0912088901') +
          sl('Jabatan akademik', 'dsj', ['Tenaga Pengajar', 'Asisten Ahli', 'Lektor', 'Lektor Kepala', 'Guru Besar']) +
          fi('Program studi', 'dsp', 'Contoh: Teknik Informatika') +
          `<button class="btn" style="margin-top:14px" onclick="addDs()">Daftarkan Dosen</button>`
        )}
      </div>`];
  },

  laporan: () => {
    return ['Rekapitulasi', 'Laporan Kelengkapan', `
      <div class="grid">
        ${c('Status Kelengkapan Persyaratan Dosen', `
          <div style="overflow-x:auto">
            <table style="width:100%">
              <tr>
                <th>Dosen</th>
                <th>Jabatan</th>
                <th>Serdos</th>
                <th>JAD</th>
              </tr>
              ${D.ds.map(d => `
                <tr>
                  <td><b>${d.n}</b><small class="note" style="display:block">${d.id} · ${d.pr}</small></td>
                  <td>${d.jab}</td>
                  <td>${bd(pr(d.id, 's') + '/' + D.sy.s.length, el(d.id, 's') ? 'g' : '')}</td>
                  <td>${bd(pr(d.id, 'j') + '/' + D.sy.j.length, el(d.id, 'j') ? 'g' : '')}</td>
                </tr>`).join('')}
            </table>
          </div>
          <button class="btn" style="margin-top:14px" onclick="window.print()">Cetak / Simpan PDF</button>`)}
      </div>`];
  }
};
