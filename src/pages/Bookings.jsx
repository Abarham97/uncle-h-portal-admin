import { useState, useEffect } from 'react'
import config from '../config'

const SERVICE_OPTIONS = [
  "Leather Repair (Cracks / Tears)",
  "Vinyl Repair & Restoration",
  "Burn Repair",
  "Color Restoration & Dyeing",
  "Scuff & Scratch Removal",
  "Dashboard & Door Panel Repair",
  "Steering Wheel Restoration",
  "Deep Cleaning & Conditioning",
  "Plastic Trim Repair",
  "Custom Color Matching",
  "Multiple / Not Sure",
]

const STATUS_COLORS = {
  Pending:   { bg:'rgba(204,140,0,0.1)',   border:'rgba(204,140,0,0.4)',   text:'#cc8c00' },
  Confirmed: { bg:'rgba(0,140,204,0.1)',   border:'rgba(0,140,204,0.4)',   text:'#008ccc' },
  Completed: { bg:'rgba(0,180,80,0.1)',    border:'rgba(0,180,80,0.4)',    text:'#00b450' },
  Cancelled: { bg:'rgba(204,20,20,0.1)',   border:'rgba(204,20,20,0.4)',   text:'#cc1414' },
}

const EMPTY_APPOINTMENT = {
  customerID: '', service: '', appointmentDate: '', appointmentTime: '', address: '', notes: ''
}

export default function Bookings() {
  const [appointments, setAppointments] = useState([])
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(EMPTY_APPOINTMENT)
  const [saving, setSaving] = useState(false)
  const [filterStatus, setFilterStatus] = useState('All')
  const [editData, setEditData] = useState(null)

  useEffect(() => {
    fetchAppointments()
    fetchCustomers()
  }, [])

  const fetchAppointments = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${config.apiUrl}/api/appointments`)
      const data = await res.json()
      setAppointments(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/customers`)
      const data = await res.json()
      setCustomers(data)
    } catch (e) { console.error(e) }
  }

  const saveAppointment = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${config.apiUrl}/api/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, customerID: parseInt(formData.customerID),address: formData.address || null, }),
      })
      if (res.ok) {
        setShowForm(false)
        setFormData(EMPTY_APPOINTMENT)
        fetchAppointments()
      }
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const updateAppointment = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${config.apiUrl}/api/appointments/${editData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      })
      if (res.ok) {
        setEditData(null)
        setSelected(editData)
        fetchAppointments()
      }
    } catch (e) { console.error(e) }
    setSaving(false)
  }

const updateStatus = async (id, status) => {
  try {
    const appointment = appointments.find(a => a.id === id)
    await fetch(`${config.apiUrl}/api/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...appointment, status }),
    })
    setSelected(prev => prev?.id === id ? { ...prev, status } : prev)
    fetchAppointments()
  } catch (e) { console.error(e) }
}

  const deleteAppointment = async (id) => {
    if (!confirm('Delete this appointment?')) return
    try {
      await fetch(`${config.apiUrl}/api/appointments/${id}`, { method: 'DELETE' })
      setSelected(null)
      fetchAppointments()
    } catch (e) { console.error(e) }
  }

  const filtered = filterStatus === 'All'
    ? appointments
    : appointments.filter(a => a.status === filterStatus)

  return (
    <div style={{ display:'flex', height:'100vh', overflow:'hidden' }}>

      {/* LEFT — Appointments list */}
      <div style={{ width:340, borderRight:'1px solid #222', display:'flex', flexDirection:'column' }}>
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid #1a1a1a' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h2 style={{ fontSize:16, fontWeight:600, color:'#fff' }}>Bookings</h2>
            <button onClick={() => setShowForm(true)} style={btnRed}>+ New</button>
          </div>
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {['All','Pending','Confirmed','Completed','Cancelled'].map(s => (
              <button key={s} onClick={() => setFilterStatus(s)} style={{
                padding:'4px 10px', fontSize:11, cursor:'pointer', letterSpacing:1,
                background: filterStatus === s ? '#cc1414' : 'transparent',
                color: filterStatus === s ? '#fff' : '#555',
                border: filterStatus === s ? 'none' : '1px solid #2a2a2a',
              }}>{s}</button>
            ))}
          </div>
        </div>

        <div style={{ flex:1, overflowY:'auto' }}>
          {loading ? (
            <div style={{ padding:20, color:'#555', fontSize:13 }}>Loading...</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding:20, color:'#555', fontSize:13 }}>No appointments found</div>
          ) : filtered.map(a => (
            <div key={a.id} onClick={() => setSelected(a)} style={{
              padding:'14px 20px', borderBottom:'1px solid #1a1a1a', cursor:'pointer',
              background: selected?.id === a.id ? 'rgba(204,20,20,0.08)' : 'transparent',
              borderLeft: selected?.id === a.id ? '3px solid #cc1414' : '3px solid transparent',
              transition:'all 0.15s',
            }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                <div style={{ fontSize:14, fontWeight:500, color:'#fff' }}>
                  {a.customer ? `${a.customer.firstName} ${a.customer.lastName}` : `Customer #${a.customerID}`}
                </div>
                <StatusBadge status={a.status} />
              </div>
              <div style={{ fontSize:12, color:'#cc1414', marginTop:3 }}>{a.service}</div>
              <div style={{ fontSize:11, color:'#444', marginTop:2 }}>
                {a.appointmentDate || '—'} {a.appointmentTime && `@ ${a.appointmentTime}`}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Appointment detail */}
      <div style={{ flex:1, overflowY:'auto', padding:32 }}>
        {!selected ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>📅</div>
            <div style={{ fontSize:16, color:'#444' }}>Select a booking to view details</div>
            <button onClick={() => setShowForm(true)} style={{ ...btnRed, marginTop:20, padding:'12px 28px' }}>+ New Booking</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ background:'#141414', border:'1px solid #222', padding:24, marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                <div>
                  <h2 style={{ fontSize:22, fontWeight:700, color:'#fff' }}>
                    {selected.customer ? `${selected.customer.firstName} ${selected.customer.lastName}` : `Customer #${selected.customerID}`}
                  </h2>
                  <div style={{ fontSize:14, color:'#cc1414', marginTop:4, fontWeight:700 }}>{selected.service}</div>
                  {selected.customer && (
                    <div style={{ fontSize:12, color:'#555', marginTop:4 }}>
                      {selected.customer.carMake} {selected.customer.carModel} {selected.customer.carYear}
                    </div>
                  )}
                </div>
                <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                  <button onClick={() => setEditData({...selected})} style={btnGhost}>Edit</button>
                  <StatusBadge status={selected.status} large />
                </div>
              </div>

              {/* Details */}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
                {[
                  { label:'Date', val:selected.appointmentDate || '—' },
                  { label:'Time', val:selected.appointmentTime || '—' },
                  { label:'Phone', val:selected.customer?.phone || '—' },
                  { label:'Email', val:selected.customer?.email || '—' },
                  { label:'Created', val:new Date(selected.createdAt).toLocaleDateString() },
                  { label:'Status', val:selected.status },
                  
                ].map(item => (
                  <div key={item.label} style={{ background:'#1a1a1a', padding:'10px 14px' }}>
                    <div style={{ fontSize:10, color:'#555', letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>{item.label}</div>
                    <div style={{ fontSize:13, color:'#ccc' }}>{item.val}</div>
                  </div>
                ))}
              </div>
                {/* Address */}
                {selected.address && (
                <div style={{ background:'#1a1a1a', padding:'12px 14px', borderLeft:'3px solid #cc1414', marginBottom:12 }}>
                    <div style={{ fontSize:10, color:'#555', letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>📍 Service Address</div>
                    <div style={{ fontSize:13, color:'#ccc', lineHeight:1.7 }}>{selected.address}</div>
                </div>
                )}
              {/* Notes */}
              {selected.notes && (
                <div style={{ background:'#1a1a1a', padding:'12px 14px', borderLeft:'3px solid #cc1414' }}>
                  <div style={{ fontSize:10, color:'#555', letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>Notes</div>
                  <div style={{ fontSize:13, color:'#ccc', lineHeight:1.7 }}>{selected.notes}</div>
                </div>
              )}
            </div>

            {/* Status actions */}
            <div style={{ background:'#141414', border:'1px solid #222', padding:20, marginBottom:24 }}>
              <div style={{ fontSize:11, color:'#555', letterSpacing:2, textTransform:'uppercase', marginBottom:12 }}>Update Status</div>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                {selected && ['Pending','Confirmed','Completed','Cancelled'].map(s => (
                  <button key={s} onClick={() => updateStatus(selected.id, s)} style={{
                    padding:'8px 16px', fontSize:12, cursor:'pointer', letterSpacing:1,
                    background: selected.status === s ? STATUS_COLORS[s].bg : 'transparent',
                    color: selected.status === s ? STATUS_COLORS[s].text : '#555',
                    border: `1px solid ${selected.status === s ? STATUS_COLORS[s].border : '#2a2a2a'}`,
                  }}>{s}</button>
                ))}
              </div>
            </div>

            {/* Contact actions */}
            <div style={{ display:'flex', gap:12, marginBottom:24 }}>
              {selected.customer?.phone && (
                <a href={`tel:${selected.customer.phone}`} style={{ ...btnRed, textDecoration:'none' }}>📞 Call</a>
              )}
              {selected.customer?.phone && (
                <a href={`https://wa.me/${selected.customer.phone.replace(/\D/g,'')}`} target="_blank" style={{
                  background:'#25D366', color:'#fff', border:'none', padding:'8px 16px',
                  fontSize:12, fontWeight:600, cursor:'pointer', letterSpacing:1,
                  textDecoration:'none', display:'inline-block',
                }}>💬 WhatsApp</a>
              )}
              {selected.customer?.email && (
                <a href={`mailto:${selected.customer.email}`} style={{ ...btnGhost, textDecoration:'none' }}>✉️ Email</a>
              )}
              <button onClick={() => deleteAppointment(selected.id)} style={btnDanger}>Delete</button>
            </div>
          </>
        )}
      </div>

      {/* New Appointment Modal */}
      {showForm && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.85)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:100,
        }}>
          <div style={{ background:'#141414', border:'1px solid #333', padding:32, width:520, maxWidth:'90vw' }}>
            <h3 style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:24 }}>New Booking</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={labelStyle}>Customer</label>
                <select value={formData.customerID} onChange={e => setFormData(f => ({...f, customerID:e.target.value}))} style={inputStyle}>
                  <option value="">Select customer...</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.firstName} {c.lastName} — {c.carMake} {c.carModel}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Service</label>
                <select value={formData.service} onChange={e => setFormData(f => ({...f, service:e.target.value}))} style={inputStyle}>
                  <option value="">Select service...</option>
                  {SERVICE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={formData.appointmentDate} onChange={e => setFormData(f => ({...f, appointmentDate:e.target.value}))} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Time</label>
                  <input type="time" value={formData.appointmentTime} onChange={e => setFormData(f => ({...f, appointmentTime:e.target.value}))} style={inputStyle}/>
                </div>
              </div>
              <div>
  <label style={labelStyle}>Address <span style={{ color:'#444' }}>(for mobile service)</span></label>
  <input
    placeholder="e.g. 123 Main St, Millbrae, CA"
    value={formData.address || ''}
    onChange={e => setFormData(f => ({...f, address:e.target.value}))}
    style={inputStyle}
  />
</div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={formData.notes} onChange={e => setFormData(f => ({...f, notes:e.target.value}))} placeholder="Any notes..." style={{ ...inputStyle, minHeight:80, resize:'vertical' }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:20 }}>
              <button onClick={saveAppointment} disabled={saving} style={btnRed}>{saving ? 'Saving...' : 'Save Booking'}</button>
              <button onClick={() => { setShowForm(false); setFormData(EMPTY_APPOINTMENT) }} style={btnGhost}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Appointment Modal */}
      {editData && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.85)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:100,
        }}>
          <div style={{ background:'#141414', border:'1px solid #333', padding:32, width:520, maxWidth:'90vw' }}>
            <h3 style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:24 }}>Edit Booking</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={labelStyle}>Service</label>
                <select value={editData.service} onChange={e => setEditData(d => ({...d, service:e.target.value}))} style={inputStyle}>
                  <option value="">Select service...</option>
                  {SERVICE_OPTIONS.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={labelStyle}>Date</label>
                  <input type="date" value={editData.appointmentDate || ''} onChange={e => setEditData(d => ({...d, appointmentDate:e.target.value}))} style={inputStyle}/>
                </div>
                <div>
                  <label style={labelStyle}>Time</label>
                  <input type="time" value={editData.appointmentTime || ''} onChange={e => setEditData(d => ({...d, appointmentTime:e.target.value}))} style={inputStyle}/>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={editData.status} onChange={e => setEditData(d => ({...d, status:e.target.value}))} style={inputStyle}>
                  <option>Pending</option>
                  <option>Confirmed</option>
                  <option>Completed</option>
                  <option>Cancelled</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Address <span style={{ color:'#444' }}>(for mobile service)</span></label>
                <input
                    placeholder="e.g. 123 Main St, Millbrae, CA"
                    value={editData.address || ''}
                    onChange={e => setEditData(d => ({...d, address:e.target.value}))}
                    style={inputStyle}
                />
                </div>
              <div>
                <label style={labelStyle}>Notes</label>
                <textarea value={editData.notes || ''} onChange={e => setEditData(d => ({...d, notes:e.target.value}))} style={{ ...inputStyle, minHeight:80, resize:'vertical' }}/>
              </div>
            </div>
            <div style={{ display:'flex', gap:8, marginTop:20 }}>
              <button onClick={updateAppointment} disabled={saving} style={btnRed}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditData(null)} style={btnGhost}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status, large }) {
  const s = STATUS_COLORS[status] || STATUS_COLORS.Pending
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.border}`, color: s.text,
      fontSize: large ? 12 : 10, padding: large ? '6px 14px' : '3px 8px',
      letterSpacing: 1, fontWeight: 600,
    }}>{status}</span>
  )
}

const inputStyle = {
  width:'100%', background:'#1a1a1a', border:'1px solid #2a2a2a',
  color:'#fff', padding:'10px 12px', fontSize:13, outline:'none', fontFamily:'inherit',
}
const labelStyle = { fontSize:10, color:'#555', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:6 }
const btnRed = { background:'#cc1414', color:'#fff', border:'none', padding:'8px 16px', fontSize:12, fontWeight:600, cursor:'pointer', letterSpacing:1 }
const btnGhost = { background:'transparent', color:'#666', border:'1px solid #333', padding:'8px 16px', fontSize:12, cursor:'pointer', letterSpacing:1 }
const btnDanger = { background:'transparent', color:'#cc1414', border:'1px solid #cc1414', padding:'8px 16px', fontSize:12, cursor:'pointer', letterSpacing:1 }