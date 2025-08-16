import React, { useState } from 'react'
import { db, storage } from '../firebase'
import { addDoc, collection, serverTimestamp, doc, setDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'

export default function FormSurat({ user }){
  const [jenis, setJenis] = useState('Masuk')
  const [tanggalMasuk, setTanggalMasuk] = useState('')
  const [tanggalKeluar, setTanggalKeluar] = useState('')
  const [tanggalDiterima, setTanggalDiterima] = useState('')
  const [asal, setAsal] = useState('')
  const [tujuan, setTujuan] = useState('')
  const [noMasuk, setNoMasuk] = useState('')
  const [noKeluar, setNoKeluar] = useState('')
  const [perihal, setPerihal] = useState('')
  const [sifat, setSifat] = useState('Biasa')
  const [disposisi, setDisposisi] = useState('')
  const [files, setFiles] = useState([])
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    setSaving(true); setMsg('Menyimpan...')
    try{
      const docRef = await addDoc(collection(db, 'surat'), {
        jenis,
        tanggalMasuk: tanggalMasuk || null,
        tanggalKeluar: tanggalKeluar || null,
        tanggalDiterima: tanggalDiterima || null,
        asal, tujuan,
        noMasuk: noMasuk || null,
        noKeluar: noKeluar || null,
        perihal, sifat, disposisi,
        createdBy: user.uid,
        createdByEmail: user.email,
        createdAt: serverTimestamp(),
        fileUrls: [],
      })

      const urls = []
      const uploads = Array.from(files).slice(0,3)
      for(let i=0;i<uploads.length;i++){
        const f = uploads[i]
        const sref = ref(storage, `surat/${user.uid}/${docRef.id}/lampiran-${i+1}-${f.name}`)
        await uploadBytes(sref, f)
        const url = await getDownloadURL(sref)
        urls.push(url)
      }

      await setDoc(doc(db,'surat',docRef.id), { fileUrls: urls }, { merge: true })

      setMsg('Tersimpan!'); setSaving(false)
      // reset form
      setTanggalMasuk(''); setTanggalKeluar(''); setTanggalDiterima('');
      setAsal(''); setTujuan(''); setNoMasuk(''); setNoKeluar(''); setPerihal(''); setSifat('Biasa'); setDisposisi(''); setFiles([])
    }catch(err){
      console.error(err)
      setMsg('Gagal menyimpan: ' + err.message)
      setSaving(false)
    }
  }

  return (
    <form onSubmit={onSubmit} style={{display:'grid',gap:12}}>
      <div>
        <label>Jenis Surat</label><br/>
        <select value={jenis} onChange={e=>setJenis(e.target.value)}>
          <option>Masuk</option>
          <option>Keluar</option>
        </select>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
        <div>
          <label>Tanggal Surat Masuk</label><br/>
          <input type="date" value={tanggalMasuk} onChange={e=>setTanggalMasuk(e.target.value)} />
        </div>
        <div>
          <label>Tanggal Surat Keluar</label><br/>
          <input type="date" value={tanggalKeluar} onChange={e=>setTanggalKeluar(e.target.value)} />
        </div>
        <div>
          <label>Diterima Surat Tanggal</label><br/>
          <input type="date" value={tanggalDiterima} onChange={e=>setTanggalDiterima(e.target.value)} />
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
        <div>
          <label>Asal Surat</label><br/>
          <input value={asal} onChange={e=>setAsal(e.target.value)} placeholder="Asal instansi/perorangan" />
        </div>
        <div>
          <label>Tujuan Surat</label><br/>
          <input value={tujuan} onChange={e=>setTujuan(e.target.value)} placeholder="Tujuan instansi/perorangan" />
        </div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
        <div>
          <label>Nomor Surat Masuk</label><br/>
          <input value={noMasuk} onChange={e=>setNoMasuk(e.target.value)} placeholder="(opsional)" />
        </div>
        <div>
          <label>Nomor Surat Keluar</label><br/>
          <input value={noKeluar} onChange={e=>setNoKeluar(e.target.value)} placeholder="(opsional)" />
        </div>
      </div>
      <div>
        <label>Perihal Surat</label><br/>
        <input value={perihal} onChange={e=>setPerihal(e.target.value)} />
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
        <div>
          <label>Sifat Surat</label><br/>
          <select value={sifat} onChange={e=>setSifat(e.target.value)}>
            <option>Biasa</option><option>Penting</option><option>Rahasia</option>
          </select>
        </div>
        <div>
          <label>Disposisi</label><br/>
          <input value={disposisi} onChange={e=>setDisposisi(e.target.value)} />
        </div>
      </div>
      <div>
        <label>Upload Surat (maks 3)</label><br/>
        <input type="file" accept=".pdf,image/*" multiple onChange={e=>setFiles(e.target.files)} />
      </div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <button disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</button>
        <div style={{marginLeft:12}}>{msg}</div>
      </div>
    </form>
  )
}
