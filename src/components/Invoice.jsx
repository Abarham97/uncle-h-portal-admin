import { useRef } from 'react'

export default function Invoice({ customer, visit, onClose }) {
  const printRef = useRef()

  const invoiceNumber = `INV-${String(visit.id).padStart(4, '0')}`

  const total = visit.invoiceItems && visit.invoiceItems.length > 0
  ? visit.invoiceItems.reduce((sum, item) => sum + parseFloat(item.price || 0), 0)
  : parseFloat(visit.price || 0)

  const handlePrint = () => {
    const content = printRef.current.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`
      <html>
        <head>
          <title>Invoice ${invoiceNumber}</title>
          <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body { font-family: 'Segoe UI', sans-serif; padding: 40px; color: #111; }
            .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 2px solid #cc1414; }
            .logo { font-size: 24px; font-weight: 700; }
            .logo span { color: #cc1414; }
            .subtitle { font-size: 11px; letter-spacing: 2px; color: #888; margin-top: 2px; }
            .business-info { font-size: 12px; color: #666; margin-top: 8px; line-height: 1.8; }
            .invoice-meta { text-align: right; }
            .invoice-meta h2 { font-size: 20px; font-weight: 600; }
            .invoice-meta p { font-size: 12px; color: #666; margin-top: 4px; }
            .badge { background: #cc1414; color: #fff; font-size: 11px; padding: 4px 12px; border-radius: 4px; margin-top: 8px; display: inline-block; letter-spacing: 1px; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
            .card { background: #f8f8f8; padding: 14px 16px; border-radius: 8px; }
            .card-label { font-size: 10px; color: #999; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 6px; }
            .card-value { font-size: 14px; font-weight: 600; }
            .card-sub { font-size: 12px; color: #666; margin-top: 2px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th { text-align: left; font-size: 10px; color: #999; letter-spacing: 2px; text-transform: uppercase; padding-bottom: 8px; font-weight: 400; border-bottom: 1px solid #e0e0e0; }
            td { padding: 12px 0; font-size: 13px; border-bottom: 1px solid #f0f0f0; }
            .text-right { text-align: right; }
            .notes { background: #f8f8f8; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; border-left: 3px solid #cc1414; }
            .notes-label { font-size: 10px; color: #999; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 4px; }
            .notes-text { font-size: 12px; color: #555; line-height: 1.6; }
            .total-section { display: flex; justify-content: flex-end; margin-bottom: 24px; }
            .total-box { min-width: 200px; }
            .total-row { display: flex; justify-content: space-between; padding: 8px 0; border-top: 1px solid #e0e0e0; font-size: 13px; }
            .total-final { display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #333; font-size: 16px; font-weight: 700; }
            .total-final span:last-child { color: #cc1414; }
            .footer { text-align: center; margin-top: 32px; font-size: 11px; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    win.print()
    win.close()
  }

  const handleWhatsApp = () => {
  const servicesText = visit.invoiceItems && visit.invoiceItems.length > 0
    ? visit.invoiceItems.map(i => `  • ${i.service}: $${parseFloat(i.price).toFixed(2)}`).join('\n')
    : `  • ${visit.service}: $${parseFloat(visit.price || 0).toFixed(2)}`

  const message = encodeURIComponent(
    `*Uncle H Interior Specialist*\n` +
    `*Invoice ${invoiceNumber}*\n\n` +
    `*Customer:* ${customer.firstName} ${customer.lastName}\n` +
    `*Vehicle:* ${customer.carMake} ${customer.carModel} ${customer.carYear}\n` +
    `*Services:*\n${servicesText}\n` +
    `*Date:* ${visit.visitDate || 'N/A'}\n` +
    `*Total:* $${total.toFixed(2)}\n` +
    (visit.notes && visit.notes !== 'none' ? `*Notes:* ${visit.notes}\n` : '') +
    `\nThank you for choosing Uncle H Interior Specialist!\n` +
    `📍 Millbrae, California\n` +
    `📞 (650) 732-5652`
  )
  window.open(`https://wa.me/?text=${message}`, '_blank')
}

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.85)',
      display:'flex', alignItems:'center', justifyContent:'center',
      zIndex:200, padding:24, overflowY:'auto',
    }}>
      <div style={{ background:'#fff', borderRadius:12, padding:32, width:580, maxWidth:'95vw', color:'#111' }}>

        {/* Printable content */}
        <div ref={printRef}>
          {/* Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28, paddingBottom:20, borderBottom:'2px solid #cc1414' }}>
            <div>
              <div style={{ fontSize:22, fontWeight:700 }}>UNCLE <span style={{ color:'#cc1414' }}>H</span></div>
              <div style={{ fontSize:11, letterSpacing:2, color:'#888', marginTop:2 }}>INTERIOR SPECIALIST</div>
              <div style={{ fontSize:12, color:'#666', marginTop:8, lineHeight:1.8 }}>
                Millbrae, California<br/>
                (650) 732-5652<br/>
                unclehinterior.com
              </div>
            </div>
            <div style={{ textAlign:'right' }}>
              <div style={{ fontSize:18, fontWeight:700 }}>Invoice</div>
              <div style={{ fontSize:12, color:'#666', marginTop:4 }}>{invoiceNumber}</div>
              <div style={{ fontSize:12, color:'#666', marginTop:2 }}>Date: {visit.visitDate || new Date().toLocaleDateString()}</div>
              <div style={{ background:'#cc1414', color:'#fff', fontSize:11, padding:'4px 12px', borderRadius:4, marginTop:8, display:'inline-block', letterSpacing:1 }}>PAID</div>
            </div>
          </div>

          {/* Customer & Vehicle */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:24 }}>
            <div style={{ background:'#f8f8f8', padding:'14px 16px', borderRadius:8 }}>
              <div style={{ fontSize:10, color:'#999', letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>Customer</div>
              <div style={{ fontSize:14, fontWeight:600 }}>{customer.firstName} {customer.lastName}</div>
              {customer.phone && <div style={{ fontSize:12, color:'#666', marginTop:2 }}>{customer.phone}</div>}
              {customer.email && <div style={{ fontSize:12, color:'#666', marginTop:2 }}>{customer.email}</div>}
            </div>
            <div style={{ background:'#f8f8f8', padding:'14px 16px', borderRadius:8 }}>
              <div style={{ fontSize:10, color:'#999', letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>Vehicle</div>
              <div style={{ fontSize:14, fontWeight:600 }}>{customer.carMake} {customer.carModel}</div>
              <div style={{ fontSize:12, color:'#666', marginTop:2 }}>{customer.carYear}</div>
            </div>
          </div>

          {/* Service table */}
          <table style={{ width:'100%', borderCollapse:'collapse', marginBottom:20 }}>
            <thead>
              <tr style={{ borderBottom:'1px solid #e0e0e0' }}>
                <th style={{ textAlign:'left', fontSize:10, color:'#999', letterSpacing:2, textTransform:'uppercase', paddingBottom:8, fontWeight:400 }}>Service</th>
                <th style={{ textAlign:'left', fontSize:10, color:'#999', letterSpacing:2, textTransform:'uppercase', paddingBottom:8, fontWeight:400 }}>Date</th>
                <th style={{ textAlign:'right', fontSize:10, color:'#999', letterSpacing:2, textTransform:'uppercase', paddingBottom:8, fontWeight:400 }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {visit.invoiceItems && visit.invoiceItems.length > 0 ? (
    visit.invoiceItems.map((item, index) => (
      <tr key={index} style={{ borderBottom:'1px solid #f0f0f0' }}>
        <td style={{ padding:'10px 0', fontSize:13 }}>{item.service}</td>
        <td style={{ padding:'10px 0', fontSize:13, color:'#666' }}>{visit.visitDate || '—'}</td>
        <td style={{ padding:'10px 0', fontSize:13, textAlign:'right', fontWeight:600 }}>${parseFloat(item.price).toFixed(2)}</td>
      </tr>
    ))
  ) : (
    <tr style={{ borderBottom:'1px solid #f0f0f0' }}>
      <td style={{ padding:'12px 0', fontSize:13 }}>{visit.service}</td>
      <td style={{ padding:'12px 0', fontSize:13, color:'#666' }}>{visit.visitDate || '—'}</td>
      <td style={{ padding:'12px 0', fontSize:13, textAlign:'right', fontWeight:600 }}>${parseFloat(visit.price || 0).toFixed(2)}</td>
    </tr>
  )}
            </tbody>
          </table>

          {/* Notes */}
          {visit.notes && visit.notes !== 'none' && (
            <div style={{ background:'#f8f8f8', padding:'12px 16px', borderRadius:8, marginBottom:20, borderLeft:'3px solid #cc1414' }}>
              <div style={{ fontSize:10, color:'#999', letterSpacing:2, textTransform:'uppercase', marginBottom:4 }}>Notes</div>
              <div style={{ fontSize:12, color:'#555', lineHeight:1.6 }}>{visit.notes}</div>
            </div>
          )}

          {/* Total */}
          <div style={{ display:'flex', justifyContent:'flex-end', marginBottom:24 }}>
            <div style={{ minWidth:200 }}>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderTop:'1px solid #e0e0e0', fontSize:13 }}>
                <span style={{ color:'#666' }}>Subtotal</span>
                <span>${total.toFixed(2)}</span>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', padding:'10px 0', borderTop:'2px solid #333', fontSize:16, fontWeight:700 }}>
                <span>Total</span>
                <span style={{ color:'#cc1414' }}>${visit.price?.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{ textAlign:'center', marginTop:24, fontSize:11, color:'#aaa', borderTop:'1px solid #eee', paddingTop:16 }}>
            Thank you for choosing Uncle H Interior Specialist
          </div>
        </div>

        {/* Action buttons */}
        <div style={{ display:'flex', gap:8, marginTop:24 }}>
          <button onClick={handlePrint} style={{ flex:1, padding:'12px', background:'#cc1414', color:'#fff', border:'none', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:600 }}>
            🖨️ Print Invoice
          </button>
          <button onClick={handleWhatsApp} style={{ flex:1, padding:'12px', background:'#25D366', color:'#fff', border:'none', borderRadius:8, fontSize:13, cursor:'pointer', fontWeight:600 }}>
            💬 Send via WhatsApp
          </button>
          <button onClick={onClose} style={{ padding:'12px 20px', background:'transparent', color:'#666', border:'1px solid #333', borderRadius:8, fontSize:13, cursor:'pointer' }}>
            Close
          </button>
        </div>

      </div>
    </div>
  )
}