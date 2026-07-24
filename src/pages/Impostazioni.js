import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

export default function Impostazioni() {
  const { azienda, aziende, profilo, switchAzienda, reload, logout, onNuovaAzienda } = useApp()
  const [delConfirm, setDelConfirm] = useState(false)
  const [delNome, setDelNome]       = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)

  async function eliminaAzienda() {
    if (delNome !== azienda.nome) { setError('Il nome inserito non corrisponde.'); return }
    setLoading(true); setError(null)
    const aid = azienda.id
    await supabase.from('ticket').delete().eq('azienda_id', aid)
    await supabase.from('azioni').delete().eq('azienda_id', aid)
    await supabase.from('rischi').delete().eq('azienda_id', aid)
    await supabase.from('membri').delete().eq('azienda_id', aid)
    await supabase.from('profili').delete().eq('azienda_id', aid)
    const { error: err } = await supabase.from('aziende').delete().eq('id', aid)
    if (err) { setError(err.message); setLoading(false); return }
    setLoading(false); setDelConfirm(false)
    await reload()
    const rimanenti = aziende.filter(a => a.id !== aid)
    if (rimanenti.length > 0) switchAzienda(rimanenti[0])
    else logout()
  }

  return (
    <div>
      <div className="page-header">
        <h2>Impostazioni</h2>
        <p>Gestione delle aziende e dei dati</p>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><span className="card-title">👤 Profilo consulente</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 14 }}>
          <div><span style={{ color: '#888', fontSize: 12 }}>Nome</span><div style={{ fontWeight: 600 }}>{profilo?.nome || '—'}</div></div>
          <div><span style={{ color: '#888', fontSize: 12 }}>Email</span><div>{profilo?.email}</div></div>
        </div>
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header">
          <span className="card-title">🏢 Aziende gestite ({aziende.length})</span>
          <button className="btn btn-sm btn-primary" onClick={onNuovaAzienda}>+ Nuova azienda</button>
        </div>
        {aziende.length === 0 ? (
          <div className="empty-state"><p>Nessuna azienda.</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {aziende.map(az => (
              <div key={az.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderRadius: 8, background: az.id === azienda?.id ? '#EBF4FC' : '#F7F8FA', border: `1px solid ${az.id === azienda?.id ? '#B5D4F4' : '#E0E0E0'}` }}>
                <div>
                  <div style={{ fontWeight: 600, color: az.id === azienda?.id ? '#1A3A5C' : '#333', display: 'flex', alignItems: 'center', gap: 8 }}>
                    {az.nome}
                    {az.id === azienda?.id && <span style={{ fontSize: 11, background: '#2B5FA5', color: 'white', padding: '1px 7px', borderRadius: 10 }}>Attiva</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
                    {az.settore && <span style={{ marginRight: 8 }}>📂 {az.settore}</span>}
                    {az.dimensione && <span>👥 {az.dimensione}</span>}
                  </div>
                </div>
                {az.id !== azienda?.id && (
                  <button className="btn btn-sm btn-primary" onClick={() => switchAzienda(az)}>Passa a questa →</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><span className="card-title">ℹ️ Dettagli azienda attiva</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
          <div><span style={{ color: '#888', fontSize: 12 }}>Nome</span><div style={{ fontWeight: 600 }}>{azienda?.nome}</div></div>
          <div><span style={{ color: '#888', fontSize: 12 }}>Settore</span><div>{azienda?.settore || '—'}</div></div>
          <div><span style={{ color: '#888', fontSize: 12 }}>Dimensione</span><div>{azienda?.dimensione || '—'}</div></div>
          <div><span style={{ color: '#888', fontSize: 12 }}>ID</span><div style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{azienda?.id?.slice(0,8)}...</div></div>
        </div>
      </div>

      <div className="card" style={{ border: '1px solid #FFAAAA' }}>
        <div className="card-header"><span className="card-title" style={{ color: '#C0392B' }}>⚠️ Zona di pericolo</span></div>
        <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>L'eliminazione è <strong>irreversibile</strong>. Verranno cancellati tutti i rischi, le azioni, i ticket e i membri dell'azienda <strong>{azienda?.nome}</strong>.</p>
        {!delConfirm ? (
          <button className="btn btn-danger" onClick={() => setDelConfirm(true)}>🗑️ Elimina azienda "{azienda?.nome}"</button>
        ) : (
          <div style={{ background: '#FCEBEB', borderRadius: 8, padding: 16 }}>
            <p style={{ fontSize: 13, color: '#C0392B', marginBottom: 12 }}>Per confermare scrivi: <strong>{azienda?.nome}</strong></p>
            {error && <div className="alert alert-error" style={{ marginBottom: 10 }}>{error}</div>}
            <input className="form-control" value={delNome} onChange={e => { setDelNome(e.target.value); setError(null) }} placeholder={`Scrivi "${azienda?.nome}" per confermare`} style={{ marginBottom: 12 }} />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => { setDelConfirm(false); setDelNome(''); setError(null) }}>Annulla</button>
              <button className="btn btn-danger" onClick={eliminaAzienda} disabled={loading || delNome !== azienda?.nome}>{loading ? 'Eliminazione...' : 'Elimina definitivamente'}</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
