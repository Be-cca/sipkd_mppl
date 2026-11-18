/* data.js: DATA AWAL & SINKRONISASI CLOUD ANTARPERANGKAT */
const FB_URL = 'https://sipkd-mppl-default-rtdb.asia-southeast1.firebasedatabase.app';
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
        {
