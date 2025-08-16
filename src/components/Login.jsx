import React, { useState } from 'react'
import { auth } from '../firebase'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const register = async (e) => {
    e.preventDefault()
    await createUserWithEmailAndPassword(auth, email, password)
  }
  const login = async (e) => {
    e.preventDefault()
    await signInWithEmailAndPassword(auth, email, password)
  }

  return (
    <main style={{maxWidth:520,margin:'40px auto'}}>
      <div style={{background:'#fff',padding:16,borderRadius:12}}>
        <h2>Masuk / Daftar</h2>
        <form onSubmit={login} style={{display:'grid',gap:12}}>
          <div>
            <label>Email</label><br/>
            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required placeholder="nama@contoh.com" />
          </div>
          <div>
            <label>Password</label><br/>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required />
          </div>
          <div style={{display:'flex',gap:8}}>
            <button type="submit">Masuk</button>
            <button type="button" onClick={register}>Daftar</button>
          </div>
        </form>
      </div>
    </main>
  )
}
