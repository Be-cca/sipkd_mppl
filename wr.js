/* wr.js: layar WR 1 (Monitoring, Laporan, Akun Saya) - hanya lihat */
P.wr = {
  beranda: () => [
    'Wakil Rektor 1 · Mode Pantau',
    'Monitoring',
    stt() +
    rep()[2] +
    '<p class="note">Akses hanya lihat. WR 1 tidak dapat menyetujui, menolak, atau mengubah data.</p>'
  ],
  lap: rep,
  akun: () => [
    'Wakil Rektor 1 · Mode Pantau',
    'Akun Saya',
    `<div class="grid">${akunBox('WR 1', 'Wakil Rektor 1', 'Pemantau')}</div>`
  ]
};
