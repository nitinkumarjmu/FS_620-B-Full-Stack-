import React, { useState, useEffect } from 'react'
import Auth from './components/Auth'
import Feed from './components/Feed'

export default function App(){
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'))

  useEffect(()=> {
    if(token && user){
      localStorage.setItem('token', token)
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }, [token, user])

  if(!token) return <Auth onLogin={(t,u)=>{ setToken(t); setUser(u); }} />

  return <Feed token={token} user={user} onLogout={()=>{ setToken(null); setUser(null); }} />
}
