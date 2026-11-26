/* dosen.js: layar Dosen (Beranda tanpa Perlu Tindakan, Persyaratan, Berkas dengan penanda kategori Serdos & JAD, Notifikasi, Pindah Tempat, Profil) */
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
      url: r.result
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
  L('y', m.n + ' mengajukan pindah tempat', $('#pa').value);
  save(); draw();
  toast('Pengajuan dikirim ke admin');
};

const sp = () => {
  me().hp = $('#hp').value;
  save();
  toast('Perubahan disimpan');
};

// Toggle daftar berkas berdasarkan kategori ('s' Serdos / 'j' JAD) & status ('Terverifikasi' / 'Menunggu' / 'Ditolak')
const togBerkasCard = (kat, status) => {
  const key = 'bk_' + kat;
  S.tab[key] = (S.tab[key] === status) ? '' : status;
  draw(true);
};

// Render tombol status berkas & daftar rincian berkas di bagian bawah kartu Serdos / JAD
const renderStatusBerkasKategori = (kat, berkasList) => {
  const aktif = S.tab['bk_' + kat] || '';
  const cnt = st => berkasList.filter(b => b.s === st).length;
  const filtered = aktif ? berkasList.filter(b => b.s === aktif) : [];

  return `
    <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--b)">
      <small class="note" style="display:block;margin:0 0 8px">Status Berkas (klik untuk melihat rincian):</small>
      <div style="display:flex;flex-wrap:wrap;gap:6px">
        <button type="button" class="bd g" style="border:${aktif === 'Terverifikasi' ? '2px solid var(--g)' : '0'};cursor:pointer;font-family:inherit" onclick="togBerkasCard('${kat}','Terverifikasi')">${cnt('Terverifikasi')} Terverifikasi</button>
        <button type="button" class="bd" style="border:${aktif === 'Menunggu' ? '2px solid #92400E' : '0'};cursor:pointer;font-family:inherit" onclick="togBerkasCard('${kat}','Menunggu')">${cnt('Menunggu')} Menunggu</button>
        <button type="button" class="bd r" style="border:${aktif === 'Ditolak' ? '2px solid var(--r)' : '0'};cursor:pointer;font-family:inherit" onclick="togBerkasCard('${kat}','Ditolak')">${cnt('Ditolak')} Ditolak</button>
      </div>
      ${aktif ? `
        <div style="margin-top:10px;background:rgba(0,0,0,0.04);border:1px solid var(--b);border-radius:10px;padding:8px 12px">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
            <small style="font-weight:700">Berkas ${aktif} (${filtered.length})</small>
            <button type="button" style="border:0;background:none;color:var(--m);font-size:11px;cursor:pointer;text-decoration:underline" onclick="togBerkasCard('${kat}','${aktif}')">Tutup</button>
          </div>
          ${filtered.length
            ? filtered.map(b => li(
                b.s === 'Terverifikasi' ? 'g' : b.s === 'Ditolak' ? 'r' : 'y',
                b.t,
                b.f + ' · ' + b.tg + (b.c ? ' · ' + b.c : '')
              )).join('')
            : `<p class="note" style="margin:6px 0">Tidak ada berkas dengan status ${aktif.toLowerCase()}.</p>`
          }
        </div>
      ` : ''}
    </div>
  `;
};

// Helper penanda kategori (Serdos / Kenaikan JAD) dari jenis berkas
const infoKategoriBerkas = jenis => {
  const syS = D.sy.s.find(x => x.j === jenis);
  const syJ = D.sy.j.find(x => x.j === jenis);
  const badges = [];
  if (syS) badges.push('<span class="bd g" style="font-size:10.5px;padding:2px 8px">Serdos</span>');
  if (syJ) badges.push('<span class="bd" style="font-size:10.5px;padding:2px 8px">Kenaikan JAD</span>');
  const namaSyarat = [syS && syS.t, syJ && syJ.t]
    .filter((v, idx, arr) => v && arr.indexOf(v) === idx)
    .join(' / ');
  return {
    isSerdos: !!syS,
    isJad: !!syJ,
    badgeHtml: badges.join(' '),
    namaSyarat
  };
};

P.dosen = {
  beranda: () => {
    const m = me(), i = m.id, s = SYs(i, 's'), t = s.length;
    const cn = k => s.filter(x => x[0] == k).length;
    const p = Math.round(cn('g') / t * 100);
    const q = Math.round((cn('g') + cn('y')) / t * 100);
    const B = D.ber.filter(b => b.d == i);
    const j = pr(i, 'j'), jt = D.sy.j.length;

    const jenisSerdos = new Set(D.sy.s.map(x => x.j).filter(Boolean));
    const jenisJad    = new Set(D.sy.j.map(x => x.j).filter(Boolean));
    const berkasSerdos = B.filter(b => jenisSerdos.has(b.t));
    const berkasJad    = B.filter(b => jenisJad.has(b.t));

    return ['Selamat datang', m.n, `
      <div class="grid">
        ${c('Batas Pengumpulan ' + dlb('s'), `
          <p class="note" style="margin:0">Serdos ${fmt(D.dl.s)} · JAD ${fmt(D.dl.j)} · diatur oleh admin</p>`)}
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
          ${bar(p)}
          ${renderStatusBerkasKategori('s', berkasSerdos)}`)}
        ${c('Kenaikan Jabatan Akademik ' + (el(i, 'j') ? bd('Eligible', 'g') : bd('Dalam proses')), `
          <p class="note" style="margin:0">${m.jab} · ${j} dari ${jt} syarat</p>
          ${bar(j / jt * 100, '#C2570C')}
          ${renderStatusBerkasKategori('j', berkasJad)}`)}
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
    const katFilter = S.tab.bkat || 'semua';
    const allB = D.ber.filter(b => b.d == i).reverse();

    const cntSerdos = allB.filter(b => infoKategoriBerkas(b.t).isSerdos).length;
    const cntJad    = allB.filter(b => infoKategoriBerkas(b.t).isJad).length;

    const B = allB.filter(b => {
      const info = infoKategoriBerkas(b.t);
      if (katFilter === 'serdos') return info.isSerdos;
      if (katFilter === 'jad') return info.isJad;
      return true;
    });

    const J = [...new Set([...D.sy.s, ...D.sy.j].map(x => x.j).filter(Boolean))];
    const optJenis = J.map(j => {
      const inf = infoKategoriBerkas(j);
      const tag = [inf.isSerdos ? 'Serdos' : '', inf.isJad ? 'JAD' : ''].filter(Boolean).join(' & ');
      return `<option value="${j}">${j}${tag ? ' (' + tag + ')' : ''}</option>`;
    }).join('');

    return ['Pengelolaan', 'Berkas Saya',
      tabs([
        ['semua', 'Semua Berkas (' + allB.length + ')'],
        ['serdos', 'Persyaratan Serdos (' + cntSerdos + ')'],
        ['jad', 'Kenaikan JAD (' + cntJad + ')']
      ], 'bkat') +
      `<div class="grid">
        ${c('Daftar Berkas', `
          <div style="overflow-x:auto">
            <table style="width:100%;table-layout:fixed">
              <tr>
                <th style="width:52%">Berkas &amp; Persyaratan</th>
                <th style="width:22%">Tanggal</th>
                <th style="width:26%;text-align:right">Status</th>
              </tr>
              ${B.map(b => {
                const inf = infoKategoriBerkas(b.t);
                return `
                <tr>
                  <td style="word-break:break-word">
                    <div style="margin-bottom:4px;display:flex;flex-wrap:wrap;gap:4px">
                      ${inf.badgeHtml}
                    </div>
                    ${b.url ? `<a href="${b.url}" download="${b.f}" style="color:inherit;text-decoration:underline;font-weight:700">${b.f}</a>` : `<b>${b.f}</b>`}
                    <small class="note" style="display:block;margin-top:3px">
                      Syarat: <b>${inf.namaSyarat || b.t}</b>${b.c ? ' · <span style="color:var(--r)">' + b.c + '</span>' : ''}
                    </small>
                  </td>
                  <td style="font-size:12px">${b.tg}</td>
                  <td style="text-align:right;white-space:nowrap">
                    ${bd(b.s, b.s == 'Terverifikasi' ? 'g' : b.s == 'Ditolak' ? 'r' : '')}
                  </td>
                </tr>`;
              }).join('') || '<tr><td colspan="3">Belum ada berkas pada kategori ini.</td></tr>'}
            </table>
          </div>`)}
        ${c('Unggah Berkas',
          `<label>Jenis berkas</label><select id="jn">${optJenis}</select>` +
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
    return ['Dosen pindah atau keluar', 'Pindah Tempat',
      c('', has
        ? `<p>${bd('Menunggu admin')} Pengajuan "${has.a}" dikirim ${has.tg}.</p><p class="note">Admin BAAD akan memverifikasi, menonaktifkan akun, dan mengeluarkan data dari database.</p>`
        : `<p class="note" style="margin:0">Ajukan jika Anda pindah tempat. Admin BAAD akan memverifikasi permintaan ini.</p>${sl('Alasan', 'pa', ['Pindah tempat ke instansi lain', 'Mengundurkan diri', 'Pensiun'])}${fi('Instansi tujuan', 'pi', 'Nama instansi')}${fi('Tanggal efektif', 'pt', '', 'date')}<button class="btn" style="margin-top:14px" onclick="pj()">Ajukan ke Admin</button>`,
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
          `<button class="btn" style="margin-top:14px" onclick="sp()">Simpan Perubahan</button>`)}
      </div>`];
  }
};
