import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

const SETTORI = ['Manifatturiero','Servizi','Commercio','Edilizia','Sanità','Tecnologia','Agricoltura','Trasporti','Altro']
const DIMENSIONI = ['Micro (< 10 dipendenti)','Piccola (10-49)','Media (50-249)','Grande (250+)']

function pivaValida(p) {
  if (!/^[0-9]{11}$/.test(p)) return false
  let s = 0
  for (let i = 0; i < 11; i++) {
    let n = p.charCodeAt(i) - 48
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9 }
    s += n
  }
  return s % 10 === 0
}

export default function Impostazioni() {
  const { azienda, aziende, profilo, switchAzienda, reload, logout, onNuovaAzienda } = useApp()
  const [delConfirm, setDelConfirm] = useState(false)
  const [delNome, setDelNome]       = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState(null)
  const [editMode, setEditMode]     = useState(false)
  const [editForm, setEditForm]     = useState({ nome: '', piva: '', settore: '', dimensione: '' })

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

  async function salvaModifiche() {
    setLoading(true); setError(null)
    const nomeClean = editForm.nome.trim()
    const pivaClean = (editForm.piva || '').replace(/[^0-9]/g, '')
    if (pivaClean && !pivaValida(pivaClean)) {
      setError('Partita IVA non valida: controlla le 11 cifre.')
      setLoading(false); return
    }
    if (pivaClean) {
      const { data: dup } = await supabase.from('aziende').select('id, nome').eq('piva', pivaClean).neq('id', azienda.id).limit(1)
      if (dup && dup.length > 0) {
        setError('Hai gia un\'altra azienda con questa Partita IVA: "' + dup[0].nome + '".')
        setLoading(false); return
      }
    }
    if (nomeClean.toLowerCase() !== (azienda.nome || '').toLowerCase()) {
      const { data: dupNome } = await supabase.from('aziende').select('id, nome').ilike('nome', nomeClean).neq('id', azienda.id).limit(1)
      if (dupNome && dupNome.length > 0) {
        const conferma = window.confirm('Hai gia un\'azienda chiamata "' + dupNome[0].nome + '". Vuoi davvero usare lo stesso nome?')
        if (!conferma) { setLoading(false); return }
      }
    }
    const { error: err } = await supabase.from('aziende')
      .update({ nome: nomeClean, settore: editForm.settore || null, dimensione: editForm.dimensione || null, piva: pivaClean || null })
      .eq('id', azienda.id)
    if (err) { setError(err.message); setLoading(false); return }
    setLoading(false); setEditMode(false)
    await reload()
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
        <div className="card-header">
          <span className="card-title">ℹ️ Dettagli azienda attiva</span>
          {!editMode && (
            <button className="btn btn-sm" onClick={() => {
              setEditForm({ nome: azienda?.nome || '', piva: azienda?.piva || '', settore: azienda?.settore || '', dimensione: azienda?.dimensione || '' })
              setEditMode(true); setError(null)
            }}>✏️ Modifica</button>
          )}
        </div>
        {!editMode ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, fontSize: 14 }}>
            <div><span style={{ color: '#888', fontSize: 12 }}>Nome</span><div style={{ fontWeight: 600 }}>{azienda?.nome}</div></div>
            <div><span style={{ color: '#888', fontSize: 12 }}>Partita IVA</span><div>{azienda?.piva || '—'}</div></div>
            <div><span style={{ color: '#888', fontSize: 12 }}>Settore</span><div>{azienda?.settore || '—'}</div></div>
            <div><span style={{ color: '#888', fontSize: 12 }}>Dimensione</span><div>{azienda?.dimensione || '—'}</div></div>
          </div>
        ) : (
          <div>
            {error && <div className="alert alert-error" style={{ marginBottom: 10 }}>{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div className="form-group">
                <label className="form-label">Nome azienda</label>
                <input className="form-control" value={editForm.nome} onChange={e => setEditForm({ ...editForm, nome: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Partita IVA</label>
                <input className="form-control" value={editForm.piva} onChange={e => setEditForm({ ...editForm, piva: e.target.value })} maxLength={11} inputMode="numeric" placeholder="11 cifre" />
              </div>
              <div className="form-group">
                <label className="form-label">Settore</label>
                <select className="form-control" value={editForm.settore} onChange={e => setEditForm({ ...editForm, settore: e.target.value })}>
                  <option value="">Seleziona...</option>
                  {SETTORI.map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Dimensione</label>
                <select className="form-control" value={editForm.dimensione} onChange={e => setEditForm({ ...editForm, dimensione: e.target.value })}>
                  <option value="">Seleziona...</option>
                  {DIMENSIONI.map(d => <option key={d}>{d}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
              <button className="btn" onClick={() => { setEditMode(false); setError(null) }}>Annulla</button>
              <button className="btn btn-primary" onClick={salvaModifiche} disabled={loading || !editForm.nome.trim()}>{loading ? 'Salvataggio...' : '💾 Salva modifiche'}</button>
            </div>
          </div>
        )}
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
