import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getRischiDefault } from '../lib/constants'

const SETTORI = ['Manifatturiero','Servizi','Commercio','Edilizia','Sanità','Tecnologia','Agricoltura','Trasporti','Altro']
const DIMENSIONI = ['Micro (< 10 dipendenti)','Piccola (10-49)','Media (50-249)','Grande (250+)']

export default function Setup({ onDone, userId, userEmail }) {
  const [step, setStep]           = useState(1) // 1=dati azienda, 2=proposta default
  const [nome, setNome]           = useState('')
  const [settore, setSettore]     = useState('')
  const [dimensione, setDimensione] = useState('')
  const [nomeProfilo, setNomeProfilo] = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [aziendaId, setAziendaId] = useState(null)

  async function handleStep1(e) {
    e.preventDefault()
    setLoading(true); setError(null)
    const { data: az, error: e1 } = await supabase.from('aziende').insert({ nome, settore, dimensione }).select().single()
    if (e1) { setError(e1.message); setLoading(false); return }
    const { error: e2 } = await supabase.from('profili').insert({ id: userId, email: userEmail, nome: nomeProfilo, azienda_id: az.id })
    if (e2) { setError(e2.message); setLoading(false); return }
    setAziendaId(az.id)
    setLoading(false)
    setStep(2)
  }

  async function caricaDefault() {
    setLoading(true)
    const rischi = getRischiDefault(settore)
    const payload = rischi.map(r => ({ ...r, azienda_id: aziendaId }))
    const { error: err } = await supabase.from('rischi').insert(payload)
    if (err) { setError(err.message); setLoading(false); return }
    setLoading(false)
    onDone()
  }

  function saltaDefault() {
    onDone()
  }

  const rischiDefault = getRischiDefault(settore)
  const hasSettoreSpecifico = settore === 'Edilizia' // espandibile

  if (step === 2) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ maxWidth: 520 }}>
          <div className="login-logo">
            <div style={{ fontSize: 36, marginBottom: 8 }}>🛡️</div>
            <h1>Rischi di default</h1>
            <p>
              {hasSettoreSpecifico
                ? `Abbiamo ${rischiDefault.length} rischi specifici per il settore ${settore}`
                : `Abbiamo ${rischiDefault.length} rischi standard per iniziare subito`}
            </p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <div style={{ background: '#F7F8FA', borderRadius: 8, padding: '12px 16px', marginBottom: 20, maxHeight: 240, overflowY: 'auto' }}>
            {rischiDefault.slice(0, 8).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #EEE', fontSize: 13 }}>
                <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 10, background: '#E6F1FB', color: '#0C447C', flexShrink: 0 }}>{r.categoria}</span>
                <span style={{ color: '#444' }}>{r.descrizione}</span>
              </div>
            ))}
            {rischiDefault.length > 8 && (
              <div style={{ fontSize: 12, color: '#888', textAlign: 'center', paddingTop: 8 }}>
                + altri {rischiDefault.length - 8} rischi...
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={saltaDefault} disabled={loading}>
              Salta — parto da zero
            </button>
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={caricaDefault} disabled={loading}>
              {loading ? 'Caricamento...' : `Carica i ${rischiDefault.length} rischi →`}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 480 }}>
        <div className="login-logo">
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏢</div>
          <h1>Configura la tua azienda</h1>
          <p>Prima configurazione — ci vogliono 30 secondi</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleStep1}>
          <div className="form-group">
            <label className="form-label">Il tuo nome</label>
            <input className="form-control" value={nomeProfilo} onChange={e => setNomeProfilo(e.target.value)} required placeholder="Es. Mario Rossi" />
          </div>
          <div className="form-group">
            <label className="form-label">Nome azienda</label>
            <input className="form-control" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Es. Rossi S.r.l." />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Settore</label>
              <select className="form-control" value={settore} onChange={e => setSettore(e.target.value)} required>
                <option value="">Seleziona...</option>
                {SETTORI.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Dimensione</label>
              <select className="form-control" value={dimensione} onChange={e => setDimensione(e.target.value)} required>
                <option value="">Seleziona...</option>
                {DIMENSIONI.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          {settore === 'Edilizia' && (
            <div className="alert alert-info" style={{ marginBottom: 14 }}>
              🏗️ Per il settore Edilizia abbiamo un catalogo di rischi specifici con dati INAIL 2025 — potrai caricarlo al passo successivo.
            </div>
          )}
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} disabled={loading}>
            {loading ? 'Salvataggio...' : 'Avanti →'}
          </button>
        </form>
      </div>
    </div>
  )
}
