import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

export default function Impostazioni() {
  const { azienda, aziende, profilo, switchAzienda, reload, logout } = useApp()
  const [delConfirm, setDelConfirm] = useState(false)
  const [delNome, setDelNome]       = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [success, setSuccess]       = useState(null)

  async function eliminaAzienda() {
    if (delNome !== azienda.nome) {
      setError('Il nome inserito non corrisponde. Riprova.')
      return
    }
    setLoading(true); setError(null)
    // Elimina a cascata (azioni, rischi, ticket, membri, profili collegati)
    await supabase.from('notifiche').delete().eq('ticket_id', supabase.from('ticket').select('id').eq('azienda_id', azienda.id))
    await supabase.from('ticket').delete().eq('azienda_id', azienda.id)
    await supabase.from('azioni').delete().eq('azienda_id', azienda.id)
    await supabase.from('rischi').delete().eq('azienda_id', azienda.id)
    await supabase.from('membri').delete().eq('azienda_id', azienda.id)
    // Non eliminiamo il profilo utente — solo l'azienda
    const { error: err } = await supabase.from('aziende').delete().eq('id', azienda.id)
    if (err) { setError(err.message); setLoading(false); return }

    setLoading(false)
    setDelConfirm(false)

    // Ricarica le aziende e passa alla prima disponibile
    await reload()
    const rimanenti = aziende.filter(a => a.id !== azienda.id)
    if (rimanenti.length > 0) switchAzienda(rimanenti[0])
    else logout()
  }

  return (
    <div>
      <div className="page-header">
        <h2>Impostazioni</h2>
        <p>Gestione dell'azienda e dei dati</p>
      </div>

      {/* Info azienda */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><span className="card-title">🏢 Azienda attiva</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
          <div><span style={{ color: '#888', fontSize: 12 }}>Nome</span><div style={{ fontWeight: 600 }}>{azienda?.nome}</div></div>
          <div><span style={{ color: '#888', fontSize: 12 }}>Settore</span><div>{azienda?.settore || '—'}</div></div>
          <div><span style={{ color: '#888', fontSize: 12 }}>Dimensione</span><div>{azienda?.dimensione || '—'}</div></div>
          <div><span style={{ color: '#888', fontSize: 12 }}>ID</span><div style={{ fontSize: 11, color: '#aaa', fontFamily: 'monospace' }}>{azienda?.id?.slice(0,8)}...</div></div>
        </div>
      </div>

      {/* Lista aziende */}
      {aziende.length > 1 && (
        <div className="card" style={{ marginBottom: 16 }}>
          <div className="card-header"><span className="card-title">🏢 Tutte le aziende</span></div>
          {aziende.map(az => (
            <div key={az.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
              <div>
                <div style={{ fontWeight: az.id === azienda?.id ? 600 : 400 }}>{az.nome} {az.id === azienda?.id && <span style={{ fontSize: 11, color: '#2B5FA5' }}>(attiva)</span>}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{az.settore} · {az.dimensione}</div>
              </div>
              {az.id !== azienda?.id && (
                <button className="btn btn-sm" onClick={() => switchAzienda(az)}>Passa a questa</button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Zona pericolosa */}
      <div className="card" style={{ borderColor: '#FFAAAA', borderWidth: 1 }}>
        <div className="card-header">
          <span className="card-title" style={{ color: '#C0392B' }}>⚠️ Zona di pericolo</span>
        </div>
        <p style={{ fontSize: 13, color: '#555', marginBottom: 16 }}>
          L'eliminazione dell'azienda è <strong>irreversibile</strong>. Verranno cancellati tutti i rischi, le azioni, i ticket e i membri associati.
        </p>
        {!delConfirm ? (
          <button className="btn btn-danger" onClick={() => setDelConfirm(true)}>
            🗑️ Elimina azienda "{azienda?.nome}"
          </button>
        ) : (
          <div style={{ background: '#FCEBEB', borderRadius: 8, padding: 16 }}>
            <p style={{ fontSize: 13, color: '#C0392B', marginBottom: 12 }}>
              Per confermare, scrivi il nome dell'azienda: <strong>{azienda?.nome}</strong>
            </p>
            {error && <div className="alert alert-error" style={{ marginBottom: 10 }}>{error}</div>}
            <input
              className="form-control"
              value={delNome}
              onChange={e => { setDelNome(e.target.value); setError(null) }}
              placeholder={`Scrivi "${azienda?.nome}" per confermare`}
              style={{ marginBottom: 12 }}
            />
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" onClick={() => { setDelConfirm(false); setDelNome(''); setError(null) }}>Annulla</button>
              <button className="btn btn-danger" onClick={eliminaAzienda} disabled={loading || delNome !== azienda?.nome}>
                {loading ? 'Eliminazione...' : 'Elimina definitivamente'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
