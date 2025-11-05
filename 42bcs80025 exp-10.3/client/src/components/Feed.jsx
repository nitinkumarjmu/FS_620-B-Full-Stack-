import React, { useState, useEffect } from 'react'
import Post from './Post'

export default function Feed({ token, user, onLogout }){
  const [posts, setPosts] = useState([])
  const [newText, setNewText] = useState('')
  const api = process.env.REACT_APP_API || 'http://localhost:5000'

  const load = async ()=>{
    const res = await fetch(api + '/api/posts')
    const data = await res.json()
    setPosts(data)
  }

  useEffect(()=>{ load() }, [])

  const create = async ()=>{
    if(!newText.trim()) return
    const form = new FormData()
    form.append('content', newText)
    const res = await fetch(api + '/api/posts', {
      method:'POST',
      headers: { 'Authorization': 'Bearer ' + token },
      body: form
    })
    const data = await res.json()
    if(res.ok) { setPosts([data, ...posts]); setNewText('') }
    else alert(data.error || 'Error')
  }

  return (
    <div className="container">
      <div className="card header">
        <div>
          <div style={{fontWeight:700}}>{user.username}</div>
          <div className="small">Logged in</div>
        </div>
        <div style={{display:'flex', gap:8}}>
          <button className="btn" onClick={onLogout}>Logout</button>
        </div>
      </div>

      <div className="card" style={{marginTop:12}}>
        <textarea className="textarea" placeholder="What's on your mind?" value={newText} onChange={e=>setNewText(e.target.value)} />
        <div style={{textAlign:'right', marginTop:8}}>
          <button className="btn" onClick={create}>Post</button>
        </div>
      </div>

      <div style={{marginTop:12}}>
        {posts.map(p => <Post key={p.id} post={p} token={token} user={user} onUpdate={load} />)}
      </div>
    </div>
  )
}
