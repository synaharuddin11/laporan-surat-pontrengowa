import React, { useEffect, useMemo, useState } from 'react'
import { db } from '../firebase'
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, where } from 'firebase/firestore'

export default function SuratList({ user, scope='own' }){
  const [rows, setRows] = useState([])
  const [filter, setFilter] = useState('')

  useEffect(()=>{
    let q = query(collection(db, 'surat'), orderBy('createdAt', 'desc'))
    if(scope === 'own'){
      q = query(collection(db, 'surat'), where('createdBy','==', user.uid), orderBy('createdAt', 'desc'))
    }
    const unsub = onSnapshot(q, snap => {
      const data = []
      snap.forEach(d => data.push({ id: d.id, ...d.data() }))
      setRows(data)
    })
    return () => unsub()
  }, [user, scope])

  const filtered = useMemo(()=>{
    if(!filter) return rows
    const f = filter.toLowerCase()
    return rows.filter(r =>
      (r.perihal||'').toLowerCase().includes(f) ||
      (r.jenis||'').toLowerCase().includes(f) ||
      (r.asal||'').toLowerCase().includes(f) ||
      (r.tujuan||'').toLowerCase().includes(f)
    )
  }, [rows, filter])

  const hapus = async (id) => {
    if(confirm('Hapus data?')){
      await deleteDoc(doc(db,'surat', id))
    }
  }

  const downCSV = () => {
    const headers = ['Jenis','TglMasuk','TglKeluar','TglDiterima','Asal','Tujuan','NoMasuk','NoKeluar','Perihal','Sifat','Disposisi','Lampiran1','Lampiran2','Lampiran3','DibuatOleh','Email']
    const lines = [headers.join(',')]
    filtered.forEach(r => {
      const row = [
        r.jenis||'',
        r.tanggalMasuk||'',
        r.tanggalKeluar||'',
        r.tanggalDiterima||'',
        r.asal||'',
        r.tujuan||'',
        r.noMasuk||'',
        r.noKeluar||'',
        (r.perihal||'').replaceAll(',',';'),
        r.sifat||'',
        (r.disposisi||'').replaceAll(',',';'),
        r.fileUrls?.[0]||'',
        r.fileUrls?.[1]||'',
        r.fileUrls?.[2]||'',
        r.createdBy||'',
        r.createdByEmail||'',
      ].map(v => `"${String(v).replaceAll('"','""')}"`)
      lines.push(row.join(','))
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'laporan-surat.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div style={{display:'flex',alignItems:'center',gap:8}}>
        <strong>Data {scope==='own' ? 'Saya' : 'Semua'}</strong>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <input placeholder="Cari" value={filter} onChange={e=>setFilter(e.target.value)} />
          <button onClick={downCSV}>Unduh CSV</button>
        </div>
      </div>
      <div style={{overflowX:'auto',marginTop:12}}>
        <table style={{width:'100%',borderCollapse:'collapse'}}>
          <thead>
            <tr>
              <th>Jenis</th><th>Tanggal</th><th>Perihal</th><th>Asal → Tujuan</th><th>Sifat</th><th>Lampiran</th><th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(r=> (
              <tr key={r.id}>
                <td>{r.jenis}</td>
                <td>
                  <div style={{fontSize:12,color:'#64748b'}}>Masuk: {r.tanggalMasuk || '-'}</div>
                  <div style={{fontSize:12,color:'#64748b'}}>Keluar: {r.tanggalKeluar || '-'}</div>
                  <div style={{fontSize:12,color:'#64748b'}}>Diterima: {r.tanggalDiterima || '-'}</div>
                </td>
                <td>{r.perihal}</td>
                <td>{r.asal} → {r.tujuan}</td>
                <td>{r.sifat}</td>
                <td>{(r.fileUrls||[]).map((u,i)=>(<div key={i}><a href={u} target="_blank" rel="noreferrer">Lampiran {i+1}</a></div>))}</td>
                <td><button onClick={()=>hapus(r.id)}>Hapus</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
