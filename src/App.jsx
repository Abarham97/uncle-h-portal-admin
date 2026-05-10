import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import Customers from './pages/Customers'
import Inquiries from './pages/Inquiries'
import Questions from './pages/Questions'
import Bookings from './pages/Bookings'
import Services from './pages/Services'
import Images from './pages/Images'
import { useIsMobile } from './hooks/useIsMobile'
import './App.css'

const NAV_ITEMS = [
  { to:'/', label:'Dashboard', icon:'📊' },
  { to:'/customers', label:'Customers', icon:'👥' },
  { to:'/inquiries', label:'Inquiries', icon:'📋' },
  { to:'/questions', label:'Questions', icon:'💬' },
  { to:'/bookings', label:'Bookings', icon:'📅' },
  { to:'/services', label:'Services', icon:'🔧' },
  { to:'/images', label:'Images', icon:'🖼️' },
]

export default function App() {
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const closeSidebar = () => setSidebarOpen(false)

  return (
    <BrowserRouter>
      <div style={{ display:'flex', height:'100vh', overflow:'hidden', background:'#0f0f0f', color:'#e0e0e0', fontFamily:'Segoe UI, sans-serif' }}>

        {/* Mobile backdrop */}
        {isMobile && sidebarOpen && (
          <div
            onClick={closeSidebar}
            style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:98 }}
          />
        )}

        {/* Sidebar */}
        <aside style={{
          width: 240, background:'#141414', borderRight:'1px solid #222',
          display:'flex', flexDirection:'column', padding:'24px 0', flexShrink:0,
          ...(isMobile ? {
            position:'fixed', top:0, left:0, height:'100vh', zIndex:99,
            transform: sidebarOpen ? 'translateX(0)' : 'translateX(-240px)',
            transition:'transform 0.25s ease',
          } : {}),
        }}>
          <div style={{ padding:'0 24px 32px', borderBottom:'1px solid #222' }}>
            <div style={{ fontFamily:'Georgia, serif', fontSize:22, fontWeight:700, color:'#fff' }}>
              UNCLE <span style={{ color:'#cc1414' }}>H</span>
            </div>
            <div style={{ fontSize:11, color:'#555', letterSpacing:2, marginTop:4 }}>ADMIN PORTAL</div>
          </div>

          <nav style={{ padding:'24px 0', flex:1 }}>
            {NAV_ITEMS.map(item => (
              <NavLink key={item.to} to={item.to} end={item.to === '/'}
                onClick={closeSidebar}
                style={({ isActive }) => ({
                  display:'flex', alignItems:'center', gap:12,
                  padding:'12px 24px', textDecoration:'none',
                  color: isActive ? '#fff' : '#666',
                  background: isActive ? 'rgba(204,20,20,0.1)' : 'transparent',
                  borderLeft: isActive ? '3px solid #cc1414' : '3px solid transparent',
                  fontSize:14, transition:'all 0.2s',
                })}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>

          <div style={{ padding:'16px 24px', borderTop:'1px solid #222', fontSize:11, color:'#444' }}>
            Uncle H Admin v1.0
          </div>
        </aside>

        {/* Main content */}
        <main style={{ flex:1, overflow:'auto', height:'100vh', minWidth:0, display:'flex', flexDirection:'column' }}>

          {/* Mobile top bar */}
          {isMobile && (
            <div style={{
              display:'flex', alignItems:'center', gap:12, padding:'0 16px', height:48,
              background:'#141414', borderBottom:'1px solid #222',
              position:'sticky', top:0, zIndex:50, flexShrink:0,
            }}>
              <button
                onClick={() => setSidebarOpen(true)}
                style={{ background:'none', border:'none', color:'#ccc', fontSize:22, cursor:'pointer', lineHeight:1, padding:0 }}
              >
                ☰
              </button>
              <span style={{ fontFamily:'Georgia, serif', fontSize:17, fontWeight:700, color:'#fff' }}>
                UNCLE <span style={{ color:'#cc1414' }}>H</span>
              </span>
            </div>
          )}

          <div style={{ flex:1, overflow:'auto' }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/customers" element={<Customers />} />
              <Route path="/inquiries" element={<Inquiries />} />
              <Route path="/questions" element={<Questions />} />
              <Route path="/bookings" element={<Bookings />} />
              <Route path="/services" element={<Services />} />
              <Route path="/images" element={<Images />} />
            </Routes>
          </div>

        </main>
      </div>
    </BrowserRouter>
  )
}
