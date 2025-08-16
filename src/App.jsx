import React, { useEffect, useMemo, useState } from 'react'
import { auth, functions } from './firebase'
import { onAuthStateChanged, signOut, getIdTokenResult } from 'firebase/auth'
import Login from './components/Login.jsx'
import FormSurat from './components/FormSurat.jsx'
import SuratList from './components/SuratList.jsx'
import AdminDashboard from './components/AdminDashboard.jsx'
import { ADMIN_EMAILS } from './config.js'
import { httpsCallable } from 'firebase/functions'

export default function App(){
  const [user, setUser] = useState(null)
  const [claims, setClaims] = useState({})
  const [tab, setTab] = useState('form')

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      setUser(u)
      if(u){
        const token = await getIdTokenResult(u, true).catch(()=>null)
        setClaims(token?.claims || {})
      } else {
        setClaims({})
      }
    })
    return () => unsub()
  }, [])

  const isAdmin = useMemo(() => {
    const emailKnown = user?.email && ADMIN_EMAILS.map(e=>e.toLowerCase()).includes(user.email.toLowerCase())
    return !!claims.admin || emailKnown
  }, [claims, user])

  if(!user){
    return <Login />
  }

  return (
    <>
      <header style={{background:'#0f172a',color:'#fff',padding:12}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',gap:12,alignItems:'center'}}>
          <strong>Laporan Surat Masuk/Keluar (Aman)</strong>
          <div style={{marginLeft:12}}>{user.email}</div>
          {isAdmin && <div style={{marginLeft:12,background:'#e2e8f0',padding:'4px 8px',borderRadius:8}}>ADMIN</div>}
          <div style={{marginLeft:'auto',display:'flex',gap:8}}>
            <button onClick={()=>setTab('form')}>Input</button>
            <button onClick={()=>setTab('list')}>Data Saya</button>
            {isAdmin && <button onClick={()=>setTab('admin')}>Admin</button>}
            <button onClick={()=>signOut(auth)}>Keluar</button>
          </div>
        </div>
      </header>
      <main style={{maxWidth:1100,margin:'24px auto',padding:'0 16px'}}>
        {tab === 'form' && <div style={{background:'#fff',padding:16,borderRadius:12}}><FormSurat user={user} /></div>}
        {tab === 'list' && <div style={{background:'#fff',padding:16,borderRadius:12}}><SuratList user={user} scope="own" /></div>}
        {tab === 'admin' && isAdmin && <div style={{background:'#fff',padding:16,borderRadius:12}}><AdminDashboard user={user} /></div>}
      </main>
    </>
  )
}
