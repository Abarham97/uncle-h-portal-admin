import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Inquiries from './pages/Inquiries'
import Questions from './pages/Questions'
import Bookings from './pages/Bookings'
import Services from './pages/Services'
import Images from './pages/Images'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
     <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#0f0f0f', color:'#e0e0e0', fontFamily:'Segoe UI, sans-serif' }}>
        
        {/* Sidebar */}
        <aside style={{
          width:240, background:'#141414', borderRight:'1px solid #222',
          display:'flex', flexDirection:'column', padding:'24px 0',
        }}>
          {/* Logo */}
          <div style={{ padding:'0 24px 32px', borderBottom:'1px solid #222' }}>
            <div style={{ fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'#fff' }}>
              UNCLE <span style={{ color:'#cc1414' }}>H</span>
            </div>
            <div style={{ fontSize:11, color:'#555', letterSpacing:2, marginTop:4 }}>ADMIN PORTAL</div>
          </div>

          {/* Nav */}
          <nav style={{ padding:'24px 0', flex:1 }}>
            {[
              { to:'/', label:'Dashboard', icon:'📊' },
              { to:'/customers', label:'Customers', icon:'👥' },
              { to:'/inquiries', label:'Inquiries', icon:'📋' },
              { to:'/questions', label:'Questions', icon:'💬' },
              { to:'/bookings', label:'Bookings', icon:'📅' },
              { to:'/services', label:'Services', icon:'🔧' },
              { to:'/images', label:'Images', icon:'🖼️' },
            ].map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:12,
                  padding:'12px 24px', textDecoration:'none',
                  color: isActive ? '#fff' : '#666',
                  background: isActive ? 'rgba(204,20,20,0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid #cc1414' : '3px solid transparent',
                  fontSize:14, transition:'all 0.2s',
                })}>
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div style={{ padding:'16px 24px', borderTop:'1px solid #222', fontSize:11, color:'#444' }}>
            Uncle H Admin v1.0
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex:1, overflow:'auto', height:'100vh' }}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/customers" element={<Customers />} />
           <Route path="/inquiries" element={<Inquiries />} />
            <Route path="/questions" element={<Questions />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/services" element={<Services />} />
            <Route path="/images" element={<Images />} />
          </Routes>
        </main>

      </div>
    </BrowserRouter>
  )
}