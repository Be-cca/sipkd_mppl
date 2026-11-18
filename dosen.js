/* dosen.js: layar Dosen (Beranda, Persyaratan, Berkas dengan pratinjau asli, Notifikasi, Pindah Tugas, Profil) */
const upl = () => {
  const f = $('#fl').files[0], t = $('#jn').value;
  if (['s', 'j'].filter(k => D.sy[k].some(x => x.j == t)).every(k => dl(k) < 0))
    return toast('Batas unggah sudah lewat. Hubungi admin.');
  if (!f) return toast('Pilih berkas terlebih dahulu');
  if (f.size > 3145728) return toast('Ukuran berkas maksimal 3 MB agar tersinkron ke cloud');

  const m = me();
  const r = new FileReader();
  toast('Mengunggah & menyinkronkan berkas…');

  r.onload = () => {
    D.ber.push({
      id: D.nid++,
      d: m.id,
      t,
      f: f.name,
      tg: fmt(Date.now()),
      s: 'Menunggu',
      c: '',
      url: r.result // Simpan data file asli (PDF/Gambar/Dokumen) agar bisa dipratinjau Admin
    });
    L('y', m.n + ' mengunggah ' + t, f.name);
    save();
    draw(true);
    toast('Berkas terkirim & langsung muncul di Admin');
  };
  r.onerror = () => toast('Gagal membaca file. Coba file lain.');
  r.readAsDataURL(f);
};

const pj = () => {
  const m = me();
  if (D.rq.some(r => r.d == m.id)) return toast('Pengajuan sudah dikirim');
  D.rq.push({ d: m.id, a: $('#pa').value, tg: fmt(Date.now()) });
  L('y', m.n + ' mengajukan pindah tugas', $('#pa').value);
  save(); draw();
  toast('Pengajuan dikirim ke admin');
};

const sp = () => {
  me().hp = $('#hp').value;
  save();
  toast('Perubahan disimpan');
};

P.dosen = {
  beranda: () => {
    const m = me(), i = m.id, s = SYs(i, 's'), t = s.length;
    const cn = k => s.filter(x => x[0] == k).length;
    const p = Math.round(cn('g') / t * 100);
    const q = Math.round((cn('g') + cn('y')) / t * 100);
    const B = D.ber.filter(b => b.d == i);
    const n = x => B.filter(b => b.s == x).length;
    const j = pr(i, 'j'), jt = D.sy.j.length;
    const rej = B.filter(b => b.s == 'Ditolak');

    return ['Selamat datang', m.n, `
      <div class="grid">
        ${c('Kelengkapan Persyaratan Serdos', `
          <div style="display:flex;gap:22px;align-items:center">
            <div class="donut" style="background:conic-gradient(var(--g) 0 ${p}%,var(--y) 0 ${q}%,var(--b) 0)">
              <b>${p}%<br><small>lengkap</small></b>
            </div>
            <div>
              <p><i class="k" style="background:var(--g)"></i>${cn('g')} Lengkap</p>
              <p><i class="k" style="background:var(--y)"></i>${cn('y')} Menunggu verifikasi</p>
              <p><i class="k" style="background:var(--b)"></i>${cn('r')} Belum/ditolak</p>
            </div>
          </div>`)}
        ${c('Sertifikasi Dosen ' + (el(i, 's') ? bd('Eligible', 'g') : bd('Belum eligible', 'r')), `
          <p class="note" style="margin:0">${cn('g')} dari ${t} persyaratan terpenuhi</p>
          ${bar(p)}`)}
        ${c('Kenaikan Jabatan Akademik ' + (el(i, 'j') ? bd('Eligible', 'g') : bd('Dalam proses')), `
          <p class="note" style="margin:0">${m.jab} · ${j} dari ${jt} syarat</p>
          ${bar(j / jt * 100, '#C2570C')}`)}
        ${c('Batas Pengumpulan ' + dlb('s'), `
          <p class="note" style="margin:0">Serdos ${fmt(D.dl.s)} · JAD ${fmt(D.dl.j)} · diatur oleh admin</p>`)}
        ${c('Status Berkas Saya', bd(n('Terverifikasi') + ' Terverifikasi', 'g') + ' ' + bd(n('Menunggu') + ' Menunggu') + ' ' + bd(n('Ditolak') + ' Ditolak', 'r'))}
        ${c('Perlu Tindakan', rej.length ? rej.map(b => li('r', b.t, 'Ditolak: ' + b.c)).join('') : '<p class="note" style="margin:0">Tidak ada tindakan.</p>')}
        ${contact}
      </div>`];
  },

  syarat: () => {
    const k = S.tab.sy || 's', i = me().id;
    return ['Pemantauan', 'Persyaratan Karier',
      tabs([['s', 'Serdos'], ['j', 'Kenaikan JAD']], 'sy') +
      c('Persyaratan ' + (k == 's' ? 'Serdos ' : 'Kenaikan JAD ') + bd(pr(i, k) + '/' + D.sy[k].length), SYs(i, k).map(x => li(...x)).join('')) +
      '<p class="note">Status diperbarui otomatis setelah admin memverifikasi berkas Anda.</p>'
    ];
  },

  berkas: () => {
    const i = me().id;
    const B = D.ber.filter(b => b.d == i).reverse();
    const J = [...new Set([...D.sy.s, ...D.sy.j].map(x => x.j).filter(Boolean))];
    return ['Pengelolaan', 'Berkas Saya', `
      <div class="grid">
        ${c('Daftar Berkas', `
          <div style="overflow-x:auto">
            <table style="width:100%;table-layout:fixed">
              <tr>
                <th style="width:48%">Berkas</th>
                <th style="width:24%">Tanggal</th>
                <th style="width:28%;text-align:right">Status</th>
              </tr>
              ${B.map(b => `
                <tr>
                  <td style="word-break:break-word">
                    ${b.url ? `<a href="${b.url}" download="${b.f}" style="color:inherit;text-decoration:underline;font-weight:600">${b.f}</a>` : b.f}
                    <small class="note" style="display:block">${b.t}${b.c ? ' · ' + b.c : ''}</small>
                  </td>
                  <td style="font-size:12px">${b.tg}</td>
                  <td style="text-align:right;white-space:nowrap">
                    ${bd(b.s, b.s == 'Terverifikasi' ? 'g' : b.s == 'Ditolak' ? 'r' : '')}
                  </td>
                </tr>`).join('') || '<tr><td colspan="3">Belum ada berkas.</td></tr>'}
            </table>
          </div>`)}
        ${c('Unggah Berkas',
          sl('Jenis berkas', 'jn', J) +
          `<label>Berkas (PDF / JPG / PNG, maks. 3 MB)</label>
           <div class="drop" style="cursor:pointer" onclick="$('#fl').click()">
             <span id="fn">Klik untuk memilih berkas</span>
           </div>
           <input type="file" id="fl" accept=".pdf,.jpg,.jpeg,.png,application/pdf,image/*" hidden onchange="$('#fn').textContent=this.files[0]?this.files[0].name+' · '+(this.files[0].size/1048576).toFixed(2)+' MB':'Klik untuk memilih berkas'">
           <p class="note">Batas unggah ${dlb('s')}</p>
           <button class="btn" onclick="upl()">Kirim untuk Diverifikasi</button>`)}
        ${contact}
      </div>`];
  },

  notif: () => [
    'Pemberitahuan', 'Notifikasi',
    c('', [['y', 'Pengingat batas unggah', dl('s') + ' hari lagi · ' + fmt(D.dl.s)], ...(D.nt[me().id] || [])].map(x => li(...x)).join(''))
  ],

  pindah: () => {
    const has = D.rq.find(r => r.d == me().id);
    return ['Dosen pindah atau keluar', 'Pindah Tugas',
      c('', has
        ? `<p>${bd('Menunggu admin')} Pengajuan "${has.a}" dikirim ${has.tg}.</p><p class="note">Admin BAAD akan memverifikasi, menonaktifkan akun, dan mengeluarkan data dari database.</p>`
        : `<p class="note" style="margin:0">Ajukan jika Anda pindah tugas. Admin BAAD akan memverifikasi permintaan ini.</p>${sl('Alasan', 'pa', ['Pindah tugas ke instansi lain', 'Mengundurkan diri', 'Pensiun'])}${fi('Instansi tujuan', 'pi', 'Nama instansi')}${fi('Tanggal efektif', 'pt', '', 'date')}<button class="btn" style="margin-top:14px" onclick="pj()">Ajukan ke Admin</button>`,
        '" style="max-width:560px')
    ];
  },

  profil: () => {
    const m = me();
    return ['Profil', 'Data Saya', `
      <div class="grid">
        ${c('Dikelola Admin', [['Nama', m.n], ['NIDN', m.id], ['Jabatan akademik', m.jab], ['Program studi', m.pr]].map(([a, b]) => `
          <div class="li">
            <div><small>${a}</small><b>${b}</b></div>
            <small>Terkunci</small>
          </div>`).join(''))}
        ${c('Dapat Anda Perbarui',
          fi('Nomor HP', 'hp', '08xxxxxxxxxx', 'text', m.hp) +
          `<button class="btn" style="margin-top:14px" onclick="sp()">Simpan Perubahan</button>
           <button class="btn w d" onclick="bye()">Keluar dari Akun</button>`)}
      </div>`];
  }
};
