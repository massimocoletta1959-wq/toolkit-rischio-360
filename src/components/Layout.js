import React, { useState } from 'react'
import { useApp } from '../App'

const NAV = [
  { id: 'cruscotto', label: 'Cruscotto',       icon: '📊' },
  { id: 'registro',  label: 'Registro Rischi', icon: '📋' },
  { id: 'piano',     label: "Piano d'Azione",  icon: '✅' },
  { id: 'ticket',    label: 'Ticket',           icon: '🎫' },
  { id: 'membri',    label: 'Membri',           icon: '👥' },
]

export default function Layout({ children }) {
  const { azienda, aziende, profilo, page, setPage, logout, switchAzienda, onNuovaAzienda } = useApp()
  const [showSwitch, setShowSwitch] = useState(false)

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <h1>🛡️ Rischio 360°</h1>
          <p>Toolkit multiaziendale</p>
        </div>

        <div className="sidebar-azienda"
          style={{ cursor: aziende.length > 1 ? 'pointer' : 'default', userSelect: 'none', position: 'relative' }}
          onClick={() => aziende.length > 1 && setShowSwitch(!showSwitch)}
        >
          <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>Azienda attiva</span>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <strong style={{ fontSize: 13 }}>{azienda?.nome}</strong>
            {aziende.length > 1 && <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>▼</span>}
          </div>
          {showSwitch && (
            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200, background: 'white', borderRadius: '0 0 8px 8px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
              {aziende.map(az => (
                <div key={az.id}
                  onClick={e => { e.stopPropagation(); switchAzienda(az); setShowSwitch(false) }}
                  style={{ padding: '10px 14px', fontSize: 13, cursor: 'pointer', background: az.id === azienda?.id ? '#EBF4FC' : 'white', color: az.id === azienda?.id ? '#2B5FA5' : '#333', fontWeight: az.id === azienda?.id ? 600 : 400, borderBottom: '1px solid #F0F0F0' }}
                >
                  {az.id === azienda?.id && '✓ '}{az.nome}
                  {az.settore && <span style={{ fontSize: 11, color: '#aaa', marginLeft: 6 }}>{az.settore}</span>}
                </div>
              ))}
              <div onClick={e => { e.stopPropagation(); onNuovaAzienda(); setShowSwitch(false) }}
                style={{ padding: '10px 14px', fontSize: 13, cursor: 'pointer', color: '#2B5FA5', fontWeight: 600, background: '#F7F8FA' }}>
                + Aggiungi azienda
              </div>
            </div>
          )}
        </div>

        <nav className="sidebar-nav">
          {NAV.map(n => (
            <div key={n.id} className={`nav-item${page === n.id ? ' active' : ''}`} onClick={() => setPage(n.id)}>
              <span>{n.icon}</span><span>{n.label}</span>
            </div>
          ))}
          <div className="nav-item" style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }} onClick={() => onNuovaAzienda()}>
            <span>🏢</span><span>+ Nuova azienda</span>
          </div>
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
