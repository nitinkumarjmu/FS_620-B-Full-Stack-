import React, { useState } from 'react'

export default function Auth({ onLogin }){
  const [isLogin, setIsLogin] = useState(true)
  const [form, setForm] = useState({ username:'', email:'', password:'' })
  const api = process.env.REACT_APP_API || 'http://localhost:5000'

  const submit = async (e) => {
    e.preventDefault()
    const url = isLogin ? '/api/auth/login' : '/api/auth/register'
    const res = await fetch(api + url, {
      method:'POST',
      headers:{ 'Content-Type':'application/json' },
      body: JSON.stringify({ username: form.username, email: form.email, password: form.password })
    })
    const data = await res.json()
    if(res.ok){
      onLogin(data.token, data.user)
    } else {
      alert(data.error || 'Error')
    }
  }

  return (
    <div className="container">
      <div className="card" style={{maxWidth:420, margin:'0 auto'}}>
        <h2 style={{margin:0}}>SocialConnect</h2>
        <p className="small">A demo social app (frontend + backend). Use john@example.com / password123</p>
        <form onSubmit={submit} style={{marginTop:12}}>
          {!isLogin && <input className="input" placeholder="Username" value={form.username} onChange={e=>setForm({...form, username:e.target.value})} style={{marginBottom:8}} />}
          <input className="input" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} style={{marginBottom:8}} />
          <input className="input" placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form, password:e.target.value})} style={{marginBottom:8}} />
          <div style={{display:'flex', gap:8}}>
            <button className="btn" type="submit">{isLogin ? 'Log in' : 'Sign up'}</button>
            <button type="button" onClick={()=>setIsLogin(!isLogin)} style={{background:'#e6e9ef', borderRadius:8, padding:'8px 12px'}}> {isLogin ? 'Create account' : 'Back to login'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
