import React from 'react'
import { useApp } from '../App'

export default function LayoutMembro({ children }) {
  const { azienda, profilo, logout } = useApp()

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🛡️ Rischio 360°</h1>
          <p>Area personale</p>
        </div>
        <div className="sidebar-azienda">
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Azienda</span>
          <strong style={{ fontSize: 13 }}>{azienda?.nome}</strong>
        </div>
        <nav className="sidebar-nav">
          <div className="nav-item active">
            <span>🎫</span>
            <span>I miei task</span>
          </div>
        </nav>
        <div className="sidebar-footer">
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 4 }}>{profilo?.email}</div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginBottom: 8 }}>Membro operativo</div>
          <button
            className="btn btn-sm"
            style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}
            onClick={logout}
          >
            Esci
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  )
}
