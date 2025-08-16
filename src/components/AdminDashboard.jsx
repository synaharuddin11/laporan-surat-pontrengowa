import React, { useState } from 'react'
import SuratList from './SuratList.jsx'
import { functions } from '../firebase'
import { httpsCallable } from 'firebase/functions'

export default function AdminDashboard({ user }){
  const [msg, setMsg] = useState('')
  const setAdmin = async () => {
    const target = prompt('Masukkan email yang akan diberi klaim admin (contoh: admin.kabupaten@example.go.id)')
    if(!target) return
    try{
      const fn = httpsCallable(functions, 'setAdminByEmail')
      const res = await fn({ email: target })
      setMsg(res.data?.message || 'Sukses')
    }catch(err){
      setMsg('Gagal: ' + (err.message || err.toString()))
    }
  }

  return (
    <div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <h3>Admin — Semua Data</h3>
        <div style={{marginLeft:'auto',display:'flex',gap:8}}>
          <button onClick={setAdmin}>Set Admin (panggil fungsi)</button>
        </div>
      </div>
      <div style={{color:'#334155'}}>{msg}</div>
      <div style={{marginTop:12}}>
        <SuratList scope="all" />
      </div>
    </div>
  )
}
