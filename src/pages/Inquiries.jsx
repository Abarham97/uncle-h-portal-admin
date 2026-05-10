import { useState, useEffect } from 'react'
import config from '../config'

export default function Inquiries() {
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => { fetchBookings() }, [])

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${config.apiUrl}/api/contact`)
      const data = await res.json()
      setBookings(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>

      {/* LEFT — Bookings list */}
      <div style={{ width:340, borderRight:'1px solid #222', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid #1a1a1a' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <h2 style={{ fontSize:16, fontWeight:600, color:'#fff' }}>Bookings</h2>
            <span style={{ fontSize:11, color:'#555' }}>{bookings.length} total</span>
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto' }}>
          {loading ? (
            <div style={{ padding:20, color:'#555', fontSize:13 }}>Loading...</div>
          ) : bookings.length === 0 ? (
            <div style={{ padding:20, color:'#555', fontSize:13 }}>No bookings yet</div>
          ) : bookings.map(b => (
            <div key={b.id} onClick={() => setSelected(b)} style={{
              padding:'14px 20px', borderBottom:'1px solid #1a1a1a', cursor:'pointer',
              background: selected?.id === b.id ? 'rgba(204,20,20,0.08)' : 'transparent',
              borderLeft: selected?.id === b.id ? '3px solid #cc1414' : '3px solid transparent',
              transition:'all 0.15s',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ fontSize:14, fontWeight:500, color:'#fff' }}>{b.firstName} {b.lastName}</div>
                <div style={{ fontSize:11, color:'#555' }}>{b.date || '—'}</div>
              </div>
              <div style={{ fontSize:12, color:'#cc1414', marginTop:3 }}>{b.service}</div>
              <div style={{ fontSize:11, color:'#444', marginTop:2 }}>{b.phone}</div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Booking detail */}
      <div style={{ flex:1, overflowY:'auto', padding:32 }}>
        {!selected ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
            <div style={{ fontSize:16, color:'#444' }}>Select a booking to view details</div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ background:'#141414', border:'1px solid #222', padding:24, marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                <div>
                  <h2 style={{ fontSize:22, fontWeight:700, color:'#fff' }}>{selected.firstName} {selected.lastName}</h2>
                  <div style={{ fontSize:14, color:'#cc1414', marginTop:4, fontWeight:700 }}>{selected.service}</div>
                </div>
                <div style={{ background:'rgba(204,20,20,0.1)', border:'1px solid rgba(204,20,20,0.3)', padding:'6px 14px' }}>
                  <span style={{ fontSize:11, color:'#cc1414', letterSpacing:2 }}>NEW REQUEST</span>
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                {[
                  { label:'Phone', val:selected.phone || '—' },
                  { label:'Email', val:selected.email || '—' },
                  { label:'Service', val:selected.service },
                  { label:'Preferred Date', val:selected.date || '—' },
                  { label:'Submitted', val:new Date(selected.createdAt).toLocaleDateString() },
                ].map(item => (
                  <div key={item.label} style={{ background:'#1a1a1a', padding:'10px 14px' }}>
                    <div style={{ fontSize:10, color:'#555', letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>{item.label}</div>
                    <div style={{ fontSize:13, color:'#ccc' }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Message/Notes */}
            {selected.message && (
              <div style={{ background:'#141414', border:'1px solid #222', padding:24, marginBottom:24 }}>
                <div style={{ fontSize:10, color:'#555', letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>Customer Message</div>
                <p style={{ fontSize:13, color:'#ccc', lineHeight:1.8 }}>{selected.message}</p>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display:'flex', gap:12 }}>
              <a href={`tel:${selected.phone}`} style={{
                ...btnRed, textDecoration:'none', display:'inline-block'
              }}>📞 Call Customer</a>
              <a href={`https://wa.me/${selected.phone?.replace(/\D/g,'')}`} target="_blank" style={{
                background:'#25D366', color:'#fff', border:'none', padding:'8px 16px',
                fontSize:12, fontWeight:600, cursor:'pointer', letterSpacing:1,
                textDecoration:'none', display:'inline-block',
              }}>💬 WhatsApp</a>
              <a href={`mailto:${selected.email}`} style={{
                ...btnGhost, textDecoration:'none', display:'inline-block'
              }}>✉️ Send Email</a>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

const btnRed = {
  background:'#cc1414', color:'#fff', border:'none', padding:'8px 16px',
  fontSize:12, fontWeight:600, cursor:'pointer', letterSpacing:1,
}
const btnGhost = {
  background:'transparent', color:'#666', border:'1px solid #333',
  padding:'8px 16px', fontSize:12, cursor:'pointer', letterSpacing:1,
}