import React, { useState } from 'react'

export default function Post({ post, token, user, onUpdate }){
  const [comment, setComment] = useState('')
  const api = process.env.REACT_APP_API || 'http://localhost:5000'

  const like = async ()=> {
    await fetch(api + '/api/posts/' + post.id + '/like', {
      method:'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type':'application/json' }
    })
    onUpdate()
  }

  const doComment = async ()=> {
    if(!comment.trim()) return
    await fetch(api + '/api/posts/' + post.id + '/comment', {
      method:'POST',
      headers: { 'Authorization': 'Bearer ' + token, 'Content-Type':'application/json' },
      body: JSON.stringify({ text: comment })
    })
    setComment('')
    onUpdate()
  }

  const remove = async ()=> {
    if(!confirm('Delete this post?')) return
    await fetch(api + '/api/posts/' + post.id, {
      method:'DELETE',
      headers: { 'Authorization': 'Bearer ' + token }
    })
    onUpdate()
  }

  return (
    <div className="card post">
      <div className="row" style={{justifyContent:'space-between'}}>
        <div className="row">
          <div className="avatar">{post.username[0].toUpperCase()}</div>
          <div style={{marginLeft:8}}>
            <div style={{fontWeight:700}}>{post.username}</div>
            <div className="meta">{new Date(post.createdAt).toLocaleString()}</div>
          </div>
        </div>
        {post.userId === user.id && <div style={{display:'flex', gap:8}}>
          <button className="btn" style={{background:'#e6e9ef', color:'#0f172a'}} onClick={remove}>Delete</button>
        </div>}
      </div>

      <div style={{marginTop:12}}>{post.content}</div>

      <div style={{display:'flex', gap:12, marginTop:12, alignItems:'center'}}>
        <button onClick={like} className="btn" style={{background:'#eef2ff', color:'#0f172a'}}>Like ({post.likes})</button>
        <div className="small">{post.comments.length} comments</div>
      </div>

      <div style={{marginTop:8}}>
        {post.comments.map(c => <div key={c.id} className="comment"><strong>{c.username}</strong><div style={{marginTop:4}}>{c.text}</div></div>)}
      </div>

      <div style={{display:'flex', gap:8, marginTop:8}}>
        <input className="input" placeholder="Write a comment..." value={comment} onChange={e=>setComment(e.target.value)} onKeyDown={e=>e.key==='Enter' && doComment()} />
        <button className="btn" onClick={doComment}>Send</button>
      </div>
    </div>
  )
}
