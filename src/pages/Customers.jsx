import { useState, useEffect } from 'react'
import config from '../config'
import Invoice from '../components/Invoice'
import { useIsMobile } from '../hooks/useIsMobile'

const EMPTY_CUSTOMER = { firstName:'', lastName:'', carMake:'', carModel:'', carYear:'', phone:'', email:'' }
const EMPTY_VISIT = { visitDate:'', notes:'' }
const EMPTY_ITEM        = { service:'', price:'', notes:'', isCustom: false }
const EMPTY_CUSTOM_ITEM = { service:'', price:'', notes:'', isCustom: true  }

export default function Customers() {
  const isMobile = useIsMobile()
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [visits, setVisits] = useState([])
  const [showNewCustomer, setShowNewCustomer] = useState(false)
  const [showNewVisit, setShowNewVisit] = useState(false)
  const [newCustomer, setNewCustomer] = useState(EMPTY_CUSTOMER)
  const [newVisit, setNewVisit] = useState(EMPTY_VISIT)
  const [visitItems, setVisitItems] = useState([{ ...EMPTY_ITEM }])
  const [saving, setSaving] = useState(false)
  const [invoiceVisit, setInvoiceVisit] = useState(null)
  const [editCustomer, setEditCustomer] = useState(null)
  const [visitItemsMap, setVisitItemsMap] = useState({})
  const [services, setServices] = useState([])

  useEffect(() => {
    fetchCustomers()
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const res = await fetch(`${config.apiUrl}/api/srv`)
      const data = await res.json()
      setServices(data)
    } catch (e) { console.error(e) }
  }

  const fetchCustomers = async (q = '') => {
    setLoading(true)
    try {
      const url = q
        ? `${config.apiUrl}/api/customers/search?query=${q}`
        : `${config.apiUrl}/api/customers`
      const res = await fetch(url)
      const data = await res.json()
      setCustomers(data)
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const fetchVisits = async (customerId) => {
    try {
      const res = await fetch(`${config.apiUrl}/api/visits/customer/${customerId}`)
      const data = await res.json()
      setVisits(data)
      // Fetch invoice items for each visit
      for (const v of data) {
        fetchVisitItems(v.id)
      }
    } catch (e) { console.error(e) }
  }

  const fetchVisitItems = async (visitId) => {
    try {
      const res = await fetch(`${config.apiUrl}/api/invoiceitems/visit/${visitId}`)
      const data = await res.json()
      setVisitItemsMap(prev => ({ ...prev, [visitId]: data }))
    } catch (e) { console.error(e) }
  }

  const selectCustomer = (c) => {
    setSelected(c)
    fetchVisits(c.id)
    setShowNewVisit(false)
  }

  const handleSearch = (e) => {
    setSearch(e.target.value)
    if (e.target.value.length > 1) fetchCustomers(e.target.value)
    else if (e.target.value === '') fetchCustomers()
  }

  const saveCustomer = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${config.apiUrl}/api/customers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCustomer),
      })
      if (res.ok) {
        setShowNewCustomer(false)
        setNewCustomer(EMPTY_CUSTOMER)
        fetchCustomers()
      }
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const addVisitItem = () => {
    setVisitItems(items => [...items, { ...EMPTY_ITEM }])
  }

  const addCustomItem = () => {
    setVisitItems(items => [...items, { ...EMPTY_CUSTOM_ITEM }])
  }

  const removeVisitItem = (index) => {
    setVisitItems(items => items.filter((_, i) => i !== index))
  }

  const updateVisitItem = (index, field, value) => {
    setVisitItems(items => items.map((item, i) =>
      i === index ? { ...item, [field]: value } : item
    ))
  }

  const totalPrice = visitItems.reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)

  const saveVisit = async () => {
    setSaving(true)
    try {
      const serviceNames = visitItems.map(i => i.service).filter(Boolean).join(', ')
      const visitRes = await fetch(`${config.apiUrl}/api/visits`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerID: selected.id,
          service: serviceNames || 'Multiple Services',
          visitDate: newVisit.visitDate,
          price: totalPrice,
          notes: newVisit.notes,
        }),
      })

      if (visitRes.ok) {
        const savedVisit = await visitRes.json()

        for (const item of visitItems) {
          if (item.service) {
            await fetch(`${config.apiUrl}/api/invoiceitems`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                visitID: savedVisit.id,
                service: item.service,
                price: parseFloat(item.price) || 0,
                notes: item.notes || '',
              }),
            })
          }
        }

        // Fetch items for the new visit
        await fetchVisitItems(savedVisit.id)
        setShowNewVisit(false)
        setNewVisit(EMPTY_VISIT)
        setVisitItems([{ ...EMPTY_ITEM }])
        fetchVisits(selected.id)
        setInvoiceVisit({ ...savedVisit, invoiceItems: visitItems })
      }
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  const updateCustomer = async () => {
    setSaving(true)
    try {
      const res = await fetch(`${config.apiUrl}/api/customers/${editCustomer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editCustomer),
      })
      if (res.ok) {
        setSelected(editCustomer)
        setEditCustomer(null)
        fetchCustomers()
      }
    } catch (e) { console.error(e) }
    setSaving(false)
  }

  return (
    <div style={{ display:'flex', flexDirection: isMobile ? 'column' : 'row', height: isMobile ? 'auto' : '100vh', overflow: isMobile ? 'visible' : 'hidden' }}>

      {/* LEFT — Customer list */}
      <div style={{ width: isMobile ? '100%' : 320, borderRight: isMobile ? 'none' : '1px solid #222', borderBottom: isMobile ? '1px solid #222' : 'none', display: isMobile && selected ? 'none' : 'flex', flexDirection:'column', maxHeight: isMobile ? '45vh' : 'unset' }}>
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid #1a1a1a' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
            <h2 style={{ fontSize:16, fontWeight:600, color:'#fff' }}>Customers</h2>
            <button onClick={() => setShowNewCustomer(true)} style={btnRed}>+ New</button>
          </div>
          <input
            value={search} onChange={handleSearch}
            placeholder="Search name, phone, car..."
            style={inputStyle}
          />
        </div>

        <div style={{ flex:1, overflowY:'auto' }}>
          {loading ? (
            <div style={{ padding:20, color:'#555', fontSize:13 }}>Loading...</div>
          ) : customers.length === 0 ? (
            <div style={{ padding:20, color:'#555', fontSize:13 }}>No customers found</div>
          ) : customers.map(c => (
            <div key={c.id} onClick={() => selectCustomer(c)} style={{
              padding:'14px 20px', borderBottom:'1px solid #1a1a1a', cursor:'pointer',
              background: selected?.id === c.id ? 'rgba(204,20,20,0.08)' : 'transparent',
              borderLeft: selected?.id === c.id ? '3px solid #cc1414' : '3px solid transparent',
              transition:'all 0.15s',
            }}>
              <div style={{ fontSize:14, fontWeight:500, color:'#fff' }}>{c.firstName} {c.lastName}</div>
              <div style={{ fontSize:12, color:'#555', marginTop:3 }}>{c.carMake} {c.carModel} {c.carYear}</div>
              {c.phone && <div style={{ fontSize:11, color:'#444', marginTop:2 }}>{c.phone}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Customer detail */}
      <div style={{ flex:1, overflowY:'auto', padding: isMobile ? 16 : 32, display: isMobile && !selected ? 'none' : 'block' }}>
        {/* Mobile back button */}
        {isMobile && selected && (
          <button onClick={() => setSelected(null)} style={{ ...btnGhost, marginBottom:16, fontSize:13 }}>← Back</button>
        )}
        {!selected ? (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%' }}>
            <div style={{ fontSize:48, marginBottom:16 }}>👥</div>
            <div style={{ fontSize:16, color:'#444' }}>Select a customer or create a new one</div>
            <button onClick={() => setShowNewCustomer(true)} style={{ ...btnRed, marginTop:20, padding:'12px 28px' }}>+ New Customer</button>
          </div>
        ) : (
          <>
            {/* Customer info */}
            <div style={{ background:'#141414', border:'1px solid #222', padding:24, marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
                <div>
                  <h2 style={{ fontSize:22, fontWeight:700, color:'#fff' }}>{selected.firstName} {selected.lastName}</h2>
                  <div style={{ fontSize:14, color:'#cc1414', marginTop:4, fontWeight:700 }}>{selected.carMake} {selected.carModel} {selected.carYear}</div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={() => setEditCustomer({...selected})} style={btnGhost}>Edit</button>
                  <button onClick={() => { setShowNewVisit(true); setVisitItems([{ ...EMPTY_ITEM }]) }} style={btnRed}>+ New Visit</button>
                </div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:12 }}>
                {[
                  { label:'Phone', val:selected.phone || '—' },
                  { label:'Email', val:selected.email || '—' },
                  { label:'Car Make', val:selected.carMake },
                  { label:'Car Model', val:selected.carModel },
                  { label:'Car Year', val:selected.carYear },
                  { label:'Customer Since', val:new Date(selected.createdAt).toLocaleDateString() },
                ].map(item => (
                  <div key={item.label} style={{ background:'#1a1a1a', padding:'10px 14px' }}>
                    <div style={{ fontSize:10, color:'#555', letterSpacing:1, textTransform:'uppercase', marginBottom:4 }}>{item.label}</div>
                    <div style={{ fontSize:13, color:'#ccc' }}>{item.val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* New visit form */}
            {showNewVisit && (
              <div style={{ background:'#141414', border:'1px solid #cc1414', padding:24, marginBottom:24 }}>
                <h3 style={{ fontSize:15, fontWeight:600, color:'#fff', marginBottom:16 }}>New Visit</h3>

                {/* Date & Notes */}
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
                  <div>
                    <label style={labelStyle}>Date</label>
                    <input type="date" value={newVisit.visitDate} onChange={e => setNewVisit(v => ({...v, visitDate:e.target.value}))} style={inputStyle}/>
                  </div>
                  <div>
                    <label style={labelStyle}>Notes</label>
                    <input placeholder="Any notes..." value={newVisit.notes} onChange={e => setNewVisit(v => ({...v, notes:e.target.value}))} style={inputStyle}/>
                  </div>
                </div>

                {/* Service Items */}
                <div style={{ marginBottom:12 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                    <label style={labelStyle}>Services</label>
                    <div style={{ display:'flex', gap:6 }}>
                      <button onClick={addVisitItem} style={{ ...btnGhost, padding:'4px 12px', fontSize:11 }}>+ From List</button>
                      <button onClick={addCustomItem} style={{ ...btnGhost, padding:'4px 12px', fontSize:11, color:'#cc1414', borderColor:'#cc1414' }}>+ Custom</button>
                    </div>
                  </div>

                  {visitItems.map((item, index) => (
                    <div key={index} style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '2fr 1fr 1fr auto', gap:8, marginBottom:8, alignItems:'center' }}>
                      {item.isCustom ? (
                        <input
                          placeholder="Type service name..."
                          value={item.service}
                          onChange={e => updateVisitItem(index, 'service', e.target.value)}
                          style={{ ...inputStyle, borderColor:'#cc1414' }}
                        />
                      ) : (
                        <select
                          value={item.service}
                          onChange={e => updateVisitItem(index, 'service', e.target.value)}
                          style={{ ...inputStyle, color: item.service ? '#fff' : '#555' }}
                        >
                          <option value="">Select service...</option>
                          {services.map(s => (
                            <option key={s.id} value={s.title}>{s.title}</option>
                          ))}
                        </select>
                      )}
                      <input
                        type="number"
                        placeholder="Price $"
                        value={item.price}
                        onChange={e => updateVisitItem(index, 'price', e.target.value)}
                        style={inputStyle}
                      />
                      <input
                        placeholder="Notes"
                        value={item.notes}
                        onChange={e => updateVisitItem(index, 'notes', e.target.value)}
                        style={inputStyle}
                      />
                      {visitItems.length > 1 && (
                        <button onClick={() => removeVisitItem(index)} style={{ ...btnDanger, padding:'8px 12px' }}>✕</button>
                      )}
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:16 }}>
                  <div style={{ background:'#1a1a1a', padding:'10px 20px', borderLeft:'3px solid #cc1414' }}>
                    <span style={{ fontSize:11, color:'#555', letterSpacing:1, textTransform:'uppercase', marginRight:12 }}>Total</span>
                    <span style={{ fontSize:18, fontWeight:700, color:'#cc1414' }}>${totalPrice.toFixed(2)}</span>
                  </div>
                </div>

                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={saveVisit} disabled={saving} style={btnRed}>{saving ? 'Saving...' : 'Save Visit'}</button>
                  <button onClick={() => setShowNewVisit(false)} style={btnGhost}>Cancel</button>
                </div>
              </div>
            )}

            {/* Visit history */}
            <div>
              <h3 style={{ fontSize:15, fontWeight:600, color:'#fff', marginBottom:16 }}>Visit History ({visits.length})</h3>
              {visits.length === 0 ? (
                <div style={{ color:'#444', fontSize:13 }}>No visits yet</div>
              ) : visits.map(v => {
                const items = visitItemsMap[v.id] || []
                return (
                  <div key={v.id} style={{ background:'#141414', border:'1px solid #222', padding:16, marginBottom:8 }}>
                    {/* Header */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
                      <div style={{ fontSize:14, fontWeight:600, color:'#fff' }}>
                        {items.length > 0 ? `${items.length} Service${items.length > 1 ? 's' : ''}` : v.service}
                      </div>
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        {v.price > 0 && <div style={{ fontSize:16, fontWeight:700, color:'#cc1414' }}>${v.price}</div>}
                        <button onClick={() => setInvoiceVisit({ ...v, invoiceItems: items })} style={{
                          background:'transparent', border:'1px solid #444', color:'#888',
                          padding:'4px 10px', fontSize:11, cursor:'pointer', borderRadius:4,
                        }}>Invoice</button>
                      </div>
                    </div>

                    {/* Invoice items */}
                    {items.length > 0 && (
                      <div style={{ marginBottom:8 }}>
                        {items.map(item => (
                          <div key={item.id} style={{ display:'flex', justifyContent:'space-between', padding:'6px 12px', background:'#1a1a1a', marginBottom:4 }}>
                            <div style={{ fontSize:12, color:'#ccc' }}>{item.service}</div>
                            <div style={{ fontSize:12, color:'#cc1414', fontWeight:600 }}>${item.price}</div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Properties grid */}
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8 }}>
                      {v.visitDate && (
                        <div style={{ background:'#1a1a1a', padding:'8px 12px' }}>
                          <div style={{ fontSize:10, color:'#555', letterSpacing:1, textTransform:'uppercase', marginBottom:3 }}>Date</div>
                          <div style={{ fontSize:12, color:'#ccc' }}>{v.visitDate}</div>
                        </div>
                      )}
                      <div style={{ background:'#1a1a1a', padding:'8px 12px' }}>
                        <div style={{ fontSize:10, color:'#555', letterSpacing:1, textTransform:'uppercase', marginBottom:3 }}>Created</div>
                        <div style={{ fontSize:12, color:'#ccc' }}>{new Date(v.createdAt).toLocaleDateString()}</div>
                      </div>
                      {v.notes && v.notes !== 'none' && (
                        <div style={{ background:'#1a1a1a', padding:'8px 12px', gridColumn:'1 / -1' }}>
                          <div style={{ fontSize:10, color:'#555', letterSpacing:1, textTransform:'uppercase', marginBottom:3 }}>Notes</div>
                          <div style={{ fontSize:12, color:'#ccc', lineHeight:1.7 }}>{v.notes}</div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* New Customer Modal */}
      {showNewCustomer && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.8)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:100,
        }}>
          <div style={{ background:'#141414', border:'1px solid #333', padding:32, width:500, maxWidth:'90vw' }}>
            <h3 style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:24 }}>New Customer</h3>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:12, marginBottom:12 }}>
              {[
                { label:'First Name', key:'firstName', placeholder:'John' },
                { label:'Last Name', key:'lastName', placeholder:'Smith' },
                { label:'Phone', key:'phone', placeholder:'(555) 000-0000' },
                { label:'Email', key:'email', placeholder:'john@email.com' },
                { label:'Car Make', key:'carMake', placeholder:'BMW' },
                { label:'Car Model', key:'carModel', placeholder:'X5' },
                { label:'Car Year', key:'carYear', placeholder:'2020' },
              ].map(f => (
                <div key={f.key} style={f.key === 'carYear' ? { gridColumn:'1' } : {}}>
                  <label style={labelStyle}>{f.label}</label>
                  <input
                    placeholder={f.placeholder}
                    value={newCustomer[f.key]}
                    onChange={e => setNewCustomer(c => ({...c, [f.key]:e.target.value}))}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button onClick={saveCustomer} disabled={saving} style={btnRed}>{saving ? 'Saving...' : 'Save Customer'}</button>
              <button onClick={() => { setShowNewCustomer(false); setNewCustomer(EMPTY_CUSTOMER) }} style={btnGhost}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Invoice Modal */}
      {invoiceVisit && (
        <Invoice
          customer={selected}
          visit={invoiceVisit}
          onClose={() => setInvoiceVisit(null)}
        />
      )}

      {/* Edit Customer Modal */}
      {editCustomer && (
        <div style={{
          position:'fixed', inset:0, background:'rgba(0,0,0,0.8)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:100,
        }}>
          <div style={{ background:'#141414', border:'1px solid #333', padding:32, width:500, maxWidth:'90vw' }}>
            <h3 style={{ fontSize:18, fontWeight:700, color:'#fff', marginBottom:24 }}>Edit Customer</h3>
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap:12, marginBottom:12 }}>
              {[
                { label:'First Name', key:'firstName', placeholder:'John' },
                { label:'Last Name', key:'lastName', placeholder:'Smith' },
                { label:'Phone', key:'phone', placeholder:'(555) 000-0000' },
                { label:'Email', key:'email', placeholder:'john@email.com' },
                { label:'Car Make', key:'carMake', placeholder:'BMW' },
                { label:'Car Model', key:'carModel', placeholder:'X5' },
                { label:'Car Year', key:'carYear', placeholder:'2020' },
              ].map(f => (
                <div key={f.key}>
                  <label style={labelStyle}>{f.label}</label>
                  <input
                    placeholder={f.placeholder}
                    value={editCustomer[f.key] || ''}
                    onChange={e => setEditCustomer(c => ({...c, [f.key]:e.target.value}))}
                    style={inputStyle}
                  />
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, marginTop:16 }}>
              <button onClick={updateCustomer} disabled={saving} style={btnRed}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditCustomer(null)} style={btnGhost}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle = {
  width:'100%', background:'#1a1a1a', border:'1px solid #2a2a2a',
  color:'#fff', padding:'10px 12px', fontSize:13, outline:'none',
  fontFamily:'inherit',
}
const labelStyle = { fontSize:10, color:'#555', letterSpacing:1, textTransform:'uppercase', display:'block', marginBottom:6 }
const btnRed = {
  background:'#cc1414', color:'#fff', border:'none', padding:'8px 16px',
  fontSize:12, fontWeight:600, cursor:'pointer', letterSpacing:1,
}
const btnGhost = {
  background:'transparent', color:'#666', border:'1px solid #333', padding:'8px 16px',
  fontSize:12, cursor:'pointer', letterSpacing:1,
}
const btnDanger = {
  background:'transparent', color:'#cc1414', border:'1px solid #cc1414', padding:'8px 16px',
  fontSize:12, cursor:'pointer', letterSpacing:1,
}