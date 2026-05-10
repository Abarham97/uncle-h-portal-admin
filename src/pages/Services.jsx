import { useState, useEffect } from 'react'
import config from '../config'

const EMPTY_SERVICE = { num: '', icon: '', title: '', desc: '', sortOrder: 0, active: true }

export default function Services() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState(EMPTY_SERVICE)
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => { fetchServices() }, [showAll])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const url = showAll ? `${config.apiUrl}/api/srv/all` : `${config.apiUrl}/api/srv`
      const res = await fetch(url)
      const data = await res.json()
      setServices(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const openAdd = () => {
    setFormData(EMPTY_SERVICE)
    setIsEdit(false)
    setShowForm(true)
  }

  const openEdit = (svc) => {
    setFormData({ ...svc })
    setIsEdit(true)
    setShowForm(true)
  }

  const saveService = async () => {
    if (!formData.num.trim() || !formData.title.trim()) return
    setSaving(true)
    try {
      const url = isEdit
        ? `${config.apiUrl}/api/srv/${formData.id}`
        : `${config.apiUrl}/api/srv`
      const method = isEdit ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        setShowForm(false)
        setFormData(EMPTY_SERVICE)
        fetchServices()
      }
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const deleteService = async (id) => {
    if (!confirm('Delete this service? This action cannot be undone.')) return
    try {
      await fetch(`${config.apiUrl}/api/srv/${id}`, { method: 'DELETE' })
      fetchServices()
    } catch (e) { console.error(e) }
  }

  const toggleActive = async (svc) => {
    try {
      await fetch(`${config.apiUrl}/api/srv/${svc.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...svc, active: !svc.active }),
      })
      fetchServices()
    } catch (e) { console.error(e) }
  }

  return (
    <div style={{ padding: 32, height: '100vh', overflowY: 'auto' }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#fff', marginBottom: 4 }}>Services</h2>
          <div style={{ fontSize: 12, color: '#555' }}>{services.length} record{services.length !== 1 ? 's' : ''}</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button
            onClick={() => setShowAll(v => !v)}
            style={showAll ? btnGhost : { ...btnGhost, color: '#cc1414', borderColor: '#cc1414' }}
          >
            {showAll ? 'Showing All' : 'Active Only'}
          </button>
          <button onClick={openAdd} style={btnRed}>+ Add Service</button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ color: '#555', fontSize: 13 }}>Loading...</div>
      ) : services.length === 0 ? (
        <div style={{ color: '#555', fontSize: 13 }}>No services found.</div>
      ) : (
        <div style={{ border: '1px solid #222', overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{ ...tableRow, background: '#1a1a1a', borderBottom: '1px solid #2a2a2a' }}>
            <div style={{ ...colNum, ...thStyle }}>NUM</div>
            <div style={{ ...colIcon, ...thStyle }}>ICON</div>
            <div style={{ ...colTitle, ...thStyle }}>TITLE</div>
            <div style={{ ...colDesc, ...thStyle }}>DESCRIPTION</div>
            <div style={{ ...colSort, ...thStyle }}>SORT</div>
            <div style={{ ...colStatus, ...thStyle }}>STATUS</div>
            <div style={{ ...colActions, ...thStyle }}>ACTIONS</div>
          </div>

          {/* Table Rows */}
          {services.map((svc, i) => (
            <div
              key={svc.id}
              style={{
                ...tableRow,
                background: i % 2 === 0 ? '#141414' : '#161616',
                borderBottom: '1px solid #1e1e1e',
                opacity: svc.active ? 1 : 0.5,
              }}
            >
              <div style={{ ...colNum, fontSize: 13, color: '#aaa' }}>{svc.num}</div>
              <div style={{ ...colIcon, fontSize: 22 }}>{svc.icon}</div>
              <div style={{ ...colTitle, fontSize: 13, fontWeight: 600, color: '#fff' }}>{svc.title}</div>
              <div style={{
                ...colDesc, fontSize: 12, color: '#666',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>{svc.desc}</div>
              <div style={{ ...colSort, fontSize: 12, color: '#555' }}>{svc.sortOrder}</div>
              <div style={colStatus}>
                <span style={{
                  fontSize: 10, fontWeight: 600, letterSpacing: 1, padding: '3px 8px',
                  background: svc.active ? 'rgba(34,197,94,0.1)' : 'rgba(100,100,100,0.1)',
                  color: svc.active ? '#22c55e' : '#555',
                  border: `1px solid ${svc.active ? 'rgba(34,197,94,0.3)' : '#2a2a2a'}`,
                }}>
                  {svc.active ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>
              <div style={{ ...colActions, display: 'flex', gap: 6 }}>
                <button onClick={() => toggleActive(svc)} style={btnTiny}>
                  {svc.active ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => openEdit(svc)} style={btnTiny}>Edit</button>
                <button onClick={() => deleteService(svc.id)} style={btnTinyDanger}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      {showForm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100,
        }}>
          <div style={{ background: '#141414', border: '1px solid #333', padding: 32, width: 560, maxWidth: '92vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: '#fff', marginBottom: 24 }}>
              {isEdit ? 'Edit Service' : 'Add Service'}
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Number / Code *</label>
                  <input
                    value={formData.num}
                    onChange={e => setFormData(f => ({ ...f, num: e.target.value }))}
                    placeholder="e.g. SRV-001"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Icon (emoji or text)</label>
                  <input
                    value={formData.icon}
                    onChange={e => setFormData(f => ({ ...f, icon: e.target.value }))}
                    placeholder="e.g. 🔧"
                    style={{ ...inputStyle, fontSize: 20 }}
                  />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Title *</label>
                <input
                  value={formData.title}
                  onChange={e => setFormData(f => ({ ...f, title: e.target.value }))}
                  placeholder="e.g. Engine Repair"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea
                  value={formData.desc}
                  onChange={e => setFormData(f => ({ ...f, desc: e.target.value }))}
                  placeholder="Describe the service..."
                  style={{ ...inputStyle, minHeight: 90, resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Sort Order</label>
                  <input
                    type="number"
                    value={formData.sortOrder}
                    onChange={e => setFormData(f => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
                    <button
                      type="button"
                      onClick={() => setFormData(f => ({ ...f, active: true }))}
                      style={formData.active ? btnRed : btnGhost}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData(f => ({ ...f, active: false }))}
                      style={!formData.active ? btnRed : btnGhost}
                    >
                      Inactive
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 24 }}>
              <button onClick={saveService} disabled={saving} style={btnRed}>
                {saving ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Service'}
              </button>
              <button onClick={() => { setShowForm(false); setFormData(EMPTY_SERVICE) }} style={btnGhost}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Table layout ── */
const tableRow = { display: 'flex', alignItems: 'center', padding: '10px 16px', gap: 12 }
const colNum    = { width: 80,  flexShrink: 0 }
const colIcon   = { width: 48,  flexShrink: 0, textAlign: 'center' }
const colTitle  = { width: 160, flexShrink: 0 }
const colDesc   = { flex: 1, minWidth: 0 }
const colSort   = { width: 50,  flexShrink: 0, textAlign: 'center' }
const colStatus = { width: 80,  flexShrink: 0 }
const colActions = { width: 200, flexShrink: 0 }

const thStyle = {
  fontSize: 10, fontWeight: 600, color: '#444', letterSpacing: 1, textTransform: 'uppercase',
}

/* ── Shared styles ── */
const inputStyle = {
  width: '100%', background: '#1a1a1a', border: '1px solid #2a2a2a',
  color: '#fff', padding: '10px 12px', fontSize: 13, outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
}
const labelStyle = {
  fontSize: 10, color: '#555', letterSpacing: 1,
  textTransform: 'uppercase', display: 'block', marginBottom: 6,
}
const btnRed = {
  background: '#cc1414', color: '#fff', border: 'none', padding: '8px 16px',
  fontSize: 12, fontWeight: 600, cursor: 'pointer', letterSpacing: 1,
}
const btnGhost = {
  background: 'transparent', color: '#666', border: '1px solid #333',
  padding: '8px 16px', fontSize: 12, cursor: 'pointer', letterSpacing: 1,
}
const btnTiny = {
  background: 'transparent', color: '#666', border: '1px solid #2a2a2a',
  padding: '4px 10px', fontSize: 11, cursor: 'pointer', letterSpacing: 0.5,
}
const btnTinyDanger = {
  background: 'transparent', color: '#cc1414', border: '1px solid #cc1414',
  padding: '4px 10px', fontSize: 11, cursor: 'pointer', letterSpacing: 0.5,
}
