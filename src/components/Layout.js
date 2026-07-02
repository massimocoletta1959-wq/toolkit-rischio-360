import React, { useState } from 'react'
import { useApp } from '../App'
const NAV = [
  { id: 'cruscotto', label: 'Cruscotto', icon: '📊' },
  { id: 'registro',  label: 'Registro Rischi', icon: '📋' },
  { id: 'piano',     label: 'Piano d\'Azione', icon: '✅' },
]
export default function Layout({ children }) {
  const { azienda, aziende, selezionaAzienda, apriAggiungiAzienda, profilo, page, setPage, logout } = useApp()
  const [menuAperto, setMenuAperto] = useState(false)

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🛡️ Rischio 360°</h1>
          <p>Toolkit multiaziendale</p>
        </div>

        <div className="sidebar-azienda" style={{ position: 'relative' }}>
          <span>Azienda attiva</span>
          <div
            onClick={() => setMenuAperto(m => !m)}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
          >
            <strong>{azienda?.nome}</strong>
            {aziende.length > 1 && <span style={{ fontSize: 11, opacity: 0.7 }}>▾</span>}
          </div>

          {menuAperto && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, marginTop: 4,
              background: '#1A3A5C', border: '1px solid rgba(255,255,255,0.15)', borderRadius: 8,
              zIndex: 20, overflow: 'hidden', boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            }}>
              {aziende.map(a => (
                <div
                  key={a.id}
                  onClick={() => { selezionaAzienda(a); setMenuAperto(false) }}
                  style={{
                    padding: '10px 14px', fontSize: 13, cursor: 'pointer', color: 'white',
                    background: a.id === azienda?.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                  }}
                >
                  {a.id === azienda?.id ? '✓ ' : ''}{a.nome}
                </div>
              ))}
              <div
                onClick={() => { setMenuAperto(false); apriAggiungiAzienda() }}
                style={{
                  padding: '10px 14px', fontSize: 13, cursor: 'pointer', color: '#8FBCE6',
                  borderTop: '1px solid rgba(255,255,255,0.15)', fontWeight: 600,
                }}
              >
                + Aggiungi azienda
              </div>
            </div>
          )}
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
