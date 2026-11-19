/* admin.js: layar Admin BAAD (Beranda, Data Dosen, Persyaratan, Batas, Verifikasi dengan Pratinjau Dokumen Asli, Registrasi, Laporan, Akun) */
const act=(id,ok)=>{const b=D.ber.find(x=>x.id==id),ct=$('#ct').value.trim();if(!ok&&!ct)return toast('Catatan wajib diisi jika menolak');b.s=ok?'Terverifikasi':'Ditolak';b.c=ct;N(b.d,ok?'g':'r',ok?'Berkas disetujui':'Berkas ditolak',b.t+(ct?' · '+ct:'')+' · oleh Admin BAAD');L(ok?'g':'r','Admin '+(ok?'menyetujui ':'menolak ')+b.t,dn(b.d));save();S.sel=0;draw(true);toast(ok?'Berkas disetujui':'Berkas ditolak')};
const out=id=>{const n=dn(id);D.dos=D.dos.filter(d=>d.id!=id);D.ber=D.ber.filter(b=>b.d!=id);D.rq=D.rq.filter(r=>r.d!=id);L('r','Admin mengeluarkan '+n,'Dikeluarkan dari database');save();cl();draw(true);toast('Dosen dikeluarkan dari database')};
const mk=(id,n,p,j,hp)=>{id=id.trim();n=n.trim();if(!id||!n)return toast('NIDN dan nama wajib diisi');if(D.dos.some(d=>d.id==id))return toast('NIDN sudah terdaftar');D.dos.push({id,n,pr:p,jab:j,hp:hp||''});N(id,'g','Akun dibuat','Selamat datang di SIPKD');L('g','Admin mendaftarkan '+n,'Registrasi '+id);save();cl();draw(true);toast('Dosen tersimpan')};
const add=()=>modal(`<h3>Tambah Dosen</h3>${fi('NIDN / NUPTK','a1','Nomor unik pendidik')}${fi('Nama lengkap','a2','Nama dan gelar')}${sl('Program studi','a3',PRODI)}${sl('Jabatan','a4',['Asisten Ahli','Lektor','Lektor Kepala'])}${fi('No. HP','a6','08xxxxxxxxxx')}<p class="note">Kata sandi awal sama dengan NIDN/NUPTK.</p><button class="btn" onclick="mk($('#a1').value,$('#a2').value,$('#a3').value,$('#a4').value,$('#a6').value)">Simpan Dosen</button><button class="btn w" onclick="cl()">Batal</button>`);
const addS=()=>modal(`<h3>Tambah Persyaratan</h3>${fi('Nama persyaratan','s1','Mis. Sertifikat bahasa')}${fi('Jenis berkas yang diminta','s2','Mis. Sertifikat Bahasa')}<button class="btn" style="margin-top:12px" onclick="adS()">Simpan</button><button class="btn w" onclick="cl()">Batal</button>`);
const adS=()=>{const t=$('#s1').value.trim(),j=$('#s2').value.trim(),k=S.tab.as||'s';if(!t)return toast('Nama persyaratan wajib diisi');D.sy[k].push({t,j:j||t});D.dos.forEach(d=>N(d.id,'y','Persyaratan diperbarui','Admin menambah syarat: '+t));L('y','Admin menambah persyaratan',t);save();cl();draw(true);toast('Persyaratan ditambahkan')};
const delSy=(k,i)=>{const x=D.sy[k][i];if(!x||!confirm('Hapus persyaratan "'+x.t+'"?'))return;D.sy[k].splice(i,1);L('r','Admin menghapus persyaratan',x.t);save();draw(true);toast('Persyaratan dihapus')};
const sd=()=>{const a=$('#ds').value,b=$('#dj').value;if(!a||!b)return toast('Isi kedua tanggal');D.dl={s:a,j:b};D.dos.forEach(d=>N(d.id,'y','Batas unggah diperbarui','Serdos '+fmt(a)+' · JAD '+fmt(b)));L('y','Admin mengatur batas unggah','Serdos '+fmt(a)+' · JAD '+fmt(b));save();draw(true);toast('Batas waktu disimpan')};
const filt=()=>{const q=$('#q').value.toLowerCase();document.querySelectorAll('#tb tr').forEach(r=>r.style.display=r.textContent.toLowerCase().includes(q)?'':'none')};
const detail=id=>{const d=D.dos.find(x=>x.id==id),B=D.ber.filter(b=>b.d==id);modal(`<h3 style="margin-bottom:4px">${d.n}</h3><p class="note" style="margin:0 0 8px">NIDN ${d.id} · ${d.jab} · ${d.pr}${d.hp?' · '+d.hp:''}</p><p>Persyaratan Serdos <b style="float:right">${pr(id,'s')} dari ${D.sy.s.length}</b></p>${bar(pr(id,'s')/D.sy.s.length*100)}${SYs(id,'s').map(x=>li(...x)).join('')}<p style="margin-top:10px"><b>Berkas diunggah (${B.length})</b></p>${B.map(b=>li(b.s=='Terverifikasi'?'g':b.s=='Ditolak'?'r':'y',b.t,b.f+' · '+b.s)).join('')||'<p class="note">Belum ada berkas.</p>'}<div style="margin-top:12px"><button class="btn w d" onclick="out('${id}')">Keluarkan</button><button class="btn w" onclick="cl();L('y','Admin mereset sandi',dn('${id}'));save();toast('Sandi direset ke NIDN')">Reset Sandi Dosen</button><button class="btn w" onclick="cl()">Tutup</button></div>`)};

// --- Pratinjau Dokumen Asli (PDF / Gambar / Unduh) ---
const openDoc = id => {
  const b = D.ber.find(x => x.id == id);
  if (!b || !b.url) return toast('Berkas demo bawaan tidak memiliki file fisik');
  const win = window.open();
  if (win) {
    win.document.write(`<title>${b.f}</title><body style="margin:0;background:#111"><iframe src="${b.url}" style="border:0;width:100vw;height:100vh"></iframe></body>`);
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
  return `
    <div style="border:1.5px solid var(--b);border-radius:12px;overflow:hidden;background:#111">
      ${isImg
        ? `<img src="${v.url}" alt="${v.f}" style="display:block;width:100%;max-height:360px;object-fit:contain">`
        : isPdf
          ? `<iframe src="${v.url}" style="display:block;width:100%;height:360px;border:0;background:#fff"></iframe>`
          : `<div style="padding:24px;text-align:center;color:#fff"><b>${v.f}</b><p class="note">Pratinjau langsung hanya tersedia untuk PDF dan gambar. Klik tombol di bawah untuk mengunduh.</p></div>`
      }
      <div style="display:flex;gap:8px;padding:10px;background:rgba(0,0,0,.65);justify-content:flex-end">
        ${(isImg || isPdf) ? `<button type="button" class="btn w" style="min-height:34px;padding:0 12px;font-size:12px" onclick="openDoc(${v.id})">Buka Layar Penuh</button>` : ''}
        <a href="${v.url}" download="${v.f}" class="btn" style="min-height:34px;padding:0 12px;font-size:12px;display:inline-flex;align-items:center;text-decoration:none">Unduh Berkas</a>
      </div>
    </div>`;
};

// --- Ekspor Excel (.xls asli dengan tabel & warna) ---
const ex=()=>{
  const tgl=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
  const rows=D.dos.map((d,i)=>{
    const s=es(d.id,'s'),j=es(d.id,'j'),p=pct(d.id);
    const bgS=s=='Eligible'?'#D1FAE5;color:#065F46':'#FEF3C7;color:#92400E';
    const bgJ=j=='Eligible'?'#D1FAE5;color:#065F46':'#FEF3C7;color:#92400E';
    return `<tr style="background:${i%2?'#FFFDF5':'#FFFFFF'}">
      <td style="text-align:center">${i+1}</td>
      <td>${d.n}</td>
      <td style="mso-number-format:'\\@';text-align:center">${d.id}</td>
      <td>${d.pr}</td>
      <td>${d.jab}</td>
      <td style="text-align:center;font-weight:bold;background:${bgS}">${s} (${pr(d.id,'s')}/${D.sy.s.length})</td>
      <td style="text-align:center;font-weight:bold;background:${bgJ}">${j} (${pr(d.id,'j')}/${D.sy.j.length})</td>
      <td style="text-align:center;font-weight:bold">${p}%</td>
    </tr>`;
  }).join('');

  const html=`<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
  <head><meta charset="utf-8"><style>
    table{border-collapse:collapse;font-family:Calibri,Arial,sans-serif;font-size:11pt}
    th,td{border:1px solid #B8A358;padding:7px 10px}
    th{background:#F5C400;color:#1F1A05;font-weight:bold;text-align:center}
  </style></head><body>
    <table>
      <tr><td colspan="8" style="border:none;font-size:14pt;font-weight:bold;color:#1F1A05">REKAPITULASI PENGEMBANGAN KARIER DOSEN (SERDOS & JAD)</td></tr>
      <tr><td colspan="8" style="border:none;font-size:11pt;color:#2F7D12;font-weight:bold">Universitas Katolik De La Salle Manado · Biro Administrasi Akademik Dosen (BAAD)</td></tr>
      <tr><td colspan="8" style="border:none;font-size:10pt;color:#5C4A00">Tanggal Ekspor: ${tgl} · Batas Serdos: ${fmt(D.dl.s)} · Batas JAD: ${fmt(D.dl.j)}</td></tr>
      <tr><td colspan="8" style="border:none"></td></tr>
      <tr>
        <th>No</th><th>Nama Lengkap & Gelar</th><th>NIDN / NUPTK</th><th>Program Studi</th>
        <th>Jabatan Akademik</th><th>Status Serdos</th><th>Status Kenaikan JAD</th><th>Kelengkapan</th>
      </tr>
      ${rows}
    </table>
  </body></html>`;

  const blob=new Blob(['\ufeff',html],{type:'application/vnd.ms-excel;charset=utf-8'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='Rekap_SIPKD_BAAD_'+new Date().toISOString().slice(0,10)+'.xls';
  document.body.appendChild(a);a.click();a.remove();
  L('g','Admin mengekspor laporan Excel','Rekap_SIPKD_BAAD.xls');save();
  toast('File Excel (.xls) berhasil diunduh');
};

// --- Cetak PDF Berwarna & Berkepala Surat ---
const prtLap=()=>{
  if(!$('#sipkd-print-css')){
    const st=document.createElement('style');st.id='sipkd-print-css';
    st.textContent=`@media print{
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
const lapAdmin=()=>{
  const tgl=new Date().toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'});
  const elS=D.dos.filter(d=>es(d.id,'
