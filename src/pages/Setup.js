import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { getRischiDefault, RISCHI_DEFAULT, RISCHI_PER_SETTORE } from '../lib/constants'

const SETTORI = ['Manifatturiero','Servizi','Commercio','Edilizia','Sanità','Tecnologia','Agricoltura','Trasporti','Altro']
const DIMENSIONI = ['Micro (< 10 dipendenti)','Piccola (10-49)','Media (50-249)','Grande (250+)']

export default function Setup({ onDone, userId, userEmail }) {
  const [step, setStep]           = useState(1)
  const [nome, setNome]           = useState('')
  const [settore, setSettore]     = useState('')
  const [dimensione, setDimensione] = useState('')
  const [nomeProfilo, setNomeProfilo] = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)
  const [aziendaId, setAziendaId] = useState(null)
  const [scelta, setScelta]       = useState(null) // 'standard' | 'settore' | 'tutti' | 'nessuno'

  const haSettoreSpecifico = !!(RISCHI_PER_SETTORE[settore]?.length)
  const numStandard  = RISCHI_DEFAULT.length
  const numSettore   = RISCHI_PER_SETTORE[settore]?.length || 0
  const numTutti     = numStandard + numSettore

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

  async function carica() {
    if (scelta === 'nessuno') { onDone(); return }
    setLoading(true)

    let rischiDaCaricare = []
    if (scelta === 'standard')  rischiDaCaricare = [...RISCHI_DEFAULT]
    if (scelta === 'settore')   rischiDaCaricare = [...(RISCHI_PER_SETTORE[settore] || [])]
    if (scelta === 'tutti')     rischiDaCaricare = [...RISCHI_DEFAULT, ...(RISCHI_PER_SETTORE[settore] || [])]

    const payload = rischiDaCaricare.map(r => ({ ...r, azienda_id: aziendaId }))
    const { error: err } = await supabase.from('rischi').insert(payload)
    if (err) { setError(err.message); setLoading(false); return }
    setLoading(false)
    onDone()
  }

  // Anteprima rischi in base alla scelta
  const preview = scelta === 'standard' ? RISCHI_DEFAULT
    : scelta === 'settore' ? (RISCHI_PER_SETTORE[settore] || [])
    : scelta === 'tutti'   ? [...RISCHI_DEFAULT, ...(RISCHI_PER_SETTORE[settore] || [])]
    : []

  if (step === 2) {
    return (
      <div className="login-page">
        <div className="login-card" style={{ maxWidth: 560 }}>
          <div className="login-logo">
            <div style={{ fontSize: 36, marginBottom: 8 }}>🛡️</div>
            <h1>Carica i rischi iniziali</h1>
            <p>Scegli da quale punto partire con la mappatura</p>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          {/* Opzioni di scelta */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>

            <div onClick={() => setScelta('standard')} style={{ cursor: 'pointer', padding: '14px 16px', border: `2px solid ${scelta === 'standard' ? '#2B5FA5' : '#E0E0E0'}`, borderRadius: 8, background: scelta === 'standard' ? '#EBF4FC' : 'white', transition: 'all 0.15s' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1A3A5C', fontSize: 14 }}>📋 Solo rischi standard</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>I {numStandard} rischi generici validi per qualsiasi azienda</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#2B5FA5', background: '#EBF4FC', padding: '3px 10px', borderRadius: 20 }}>{numStandard} rischi</span>
              </div>
            </div>

            {haSettoreSpecifico && (
              <div onClick={() => setScelta('settore')} style={{ cursor: 'pointer', padding: '14px 16px', border: `2px solid ${scelta === 'settore' ? '#2B5FA5' : '#E0E0E0'}`, borderRadius: 8, background: scelta === 'settore' ? '#EBF4FC' : 'white', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1A3A5C', fontSize: 14 }}>🏗️ Solo rischi {settore}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Rischi specifici per il settore {settore} con dati INAIL 2025</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#2B5FA5', background: '#EBF4FC', padding: '3px 10px', borderRadius: 20 }}>{numSettore} rischi</span>
                </div>
              </div>
            )}

            {haSettoreSpecifico && (
              <div onClick={() => setScelta('tutti')} style={{ cursor: 'pointer', padding: '14px 16px', border: `2px solid ${scelta === 'tutti' ? '#2B5FA5' : '#E0E0E0'}`, borderRadius: 8, background: scelta === 'tutti' ? '#EBF4FC' : 'white', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1A3A5C', fontSize: 14 }}>✅ Tutti — standard + {settore}</div>
                    <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Copertura completa: rischi generici + specifici di settore</div>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#27AE60', background: '#D5F5E3', padding: '3px 10px', borderRadius: 20 }}>{numTutti} rischi</span>
                </div>
              </div>
            )}

            <div onClick={() => setScelta('nessuno')} style={{ cursor: 'pointer', padding: '12px 16px', border: `2px solid ${scelta === 'nessuno' ? '#aaa' : '#E0E0E0'}`, borderRadius: 8, background: scelta === 'nessuno' ? '#F5F5F5' : 'white', transition: 'all 0.15s' }}>
              <div style={{ fontWeight: 500, color: '#888', fontSize: 13 }}>Parto da zero — inserirò i rischi manualmente</div>
            </div>
          </div>

          {/* Anteprima rischi selezionati */}
          {preview.length > 0 && (
            <div style={{ background: '#F7F8FA', borderRadius: 8, padding: '10px 14px', maxHeight: 200, overflowY: 'auto', marginBottom: 16 }}>
              {preview.slice(0, 8).map((r, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid #EEE', fontSize: 12 }}>
                  <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: '#E6F1FB', color: '#0C447C', flexShrink: 0 }}>{r.categoria}</span>
                  <span style={{ color: '#444' }}>{r.descrizione}</span>
                </div>
              ))}
              {preview.length > 8 && <div style={{ fontSize: 11, color: '#888', textAlign: 'center', paddingTop: 6 }}>+ altri {preview.length - 8} rischi...</div>}
            </div>
          )}

          <button
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            onClick={carica}
            disabled={!scelta || loading}
          >
            {loading ? 'Caricamento...' : scelta === 'nessuno' ? 'Inizia senza rischi →' : `Carica ${preview.length} rischi e inizia →`}
          </button>
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
          {settore && RISCHI_PER_SETTORE[settore] && (
            <div className="alert alert-info" style={{ marginBottom: 14 }}>
              🏗️ Per il settore <strong>{settore}</strong> abbiamo un catalogo di rischi specifici — potrai scegliere al passo successivo.
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
