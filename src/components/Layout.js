import React, { useState } from 'react'
import { useApp } from '../App'

// Funzioni comuni, disponibili sia dalla Home sia dentro un modulo
const COMUNI = [
  { id: 'impostazioni', label: 'Impostazioni',  icon: '⚙️' },
  { id: 'membri',       label: 'Membri',         icon: '👥' },
  { id: 'organigramma', label: 'Organigramma',   icon: '🏛️' },
]

// Menù specifico di ciascun modulo (colore + voci)
const MODULI = {
  rischi: {
    label: 'Rischi', colore: '#378ADD',
    voci: [
      { id: 'cruscotto', label: 'Cruscotto',       icon: '📊' },
      { id: 'registro',  label: 'Registro rischi', icon: '📋' },
      { id: 'piano',     label: "Piano d'azione",  icon: '✅' },
      { id: 'ticket',    label: 'Ticket',           icon: '🎫' },
    ],
  },
  procedure: {
    label: 'Procedure', colore: '#1D9E75',
    voci: [
      { id: 'procedure', label: 'Procedure', icon: '📘' },
      { id: 'ticket',    label: 'Ticket',    icon: '🎫' },
    ],
  },
  governance: {
    label: 'Governance', colore: '#7F77DD',
    voci: [
      { id: 'governance', label: 'Organi', icon: '⚖️' },
      { id: 'ticket',     label: 'Ticket', icon: '🎫' },
    ],
  },
}

export default function Layout({ children }) {
  const { azienda, aziende, profilo, page, setPage, logout, switchAzienda, onNuovaAzienda, modulo, tornaHome } = useApp()
  const [showSwitch, setShowSwitch] = useState(false)

  const mod = modulo ? MODULI[modulo] : null

  const NavItem = ({ item }) => (
    <div className={`nav-item${page === item.id ? ' active' : ''}`} onClick={() => setPage(item.id)}>
      <span>{item.icon}</span><span>{item.label}</span>
    </div>
  )

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
          {mod ? (
            <>
              <div className="nav-item" onClick={tornaHome}>
                <span>←</span><span>Torna alla Home</span>
              </div>
              {COMUNI.map(item => <NavItem key={item.id} item={item} />)}

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0 6px', padding: '0 4px' }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: mod.colore }} />
                <span style={{ fontSize: 11, letterSpacing: 0.5, color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase' }}>{mod.label}</span>
              </div>
              {mod.voci.map(item => <NavItem key={item.id} item={item} />)}
            </>
          ) : (
            <>
              <div className={`nav-item${page === 'home' ? ' active' : ''}`} onClick={() => setPage('home')}>
                <span>🏠</span><span>Home</span>
              </div>
              {COMUNI.map(item => <NavItem key={item.id} item={item} />)}
            </>
          )}

          <div className="nav-item" style={{ marginTop: 8, borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12 }} onClick={() => onNuovaAzienda()}>
            <span>🏢</span><span>+ Nuova azienda</span>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginBottom: 8 }}>{profilo?.email}</div>
          <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.85)', border: '1px solid rgba(255,255,255,0.15)', marginBottom: 8 }}
            onClick={() => { window.location.href = window.location.pathname + '?vista=membro' }}>
            ✅ La mia vista Membro
          </button>
          <button className="btn btn-sm" style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }} onClick={logout}>
            Esci
          </button>
        </div>
      </aside>
      <main className="main-content">{children}</main>
    </div>
  )
}
