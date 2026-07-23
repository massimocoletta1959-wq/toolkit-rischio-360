import React from 'react'
import { useApp } from '../App'

const NAV = [
  { id: 'cruscotto', label: 'Cruscotto',        icon: '📊' },
  { id: 'registro',  label: 'Registro Rischi',  icon: '📋' },
  { id: 'piano',     label: "Piano d'Azione",   icon: '✅' },
  { id: 'ticket',    label: 'Ticket',            icon: '🎫' },
  { id: 'membri',    label: 'Membri',            icon: '👥' },
]

export default function Layout({ children }) {
  const { azienda, profilo, page, setPage, logout } = useApp()
  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🛡️ Rischio 360°</h1>
          <p>Toolkit multiaziendale</p>
        </div>
        <div className="sidebar-azienda">
          <span>Azienda attiva</span>
          <strong>{azienda?.nome}</strong>
        </div>
        <nav className="sidebar-nav">
          {NAV.map(n => (
            <div key={n.id} className={`nav-item${page === n.id ? ' active' : ''}`} onClick={() => setPage(n.id)}>
              <span>{n.icon}</span>
              <span>{n.label}</span>
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{profilo?.email}</div>
          <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} onClick={logout}>
            Esci
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  )
}
