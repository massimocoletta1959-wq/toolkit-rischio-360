import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'
import { CATALOGO_PROCEDURE, AREE_PROCEDURE, MAPPA_SIGLE } from '../lib/procedure'
import { generaProcedura } from '../lib/generaProcedura'

const STATI = ['Adottata', 'Personalizzata', 'Non applicabile']
const STATO_STYLE = {
  'Adottata':        { bg: '#D5F5E3', color: '#155724' },
  'Personalizzata':  { bg: '#D6E8F7', color: '#1A3A5C' },
  'Non applicabile': { bg: '#EEE',    color: '#777' },
}

export default function Procedure() {
  const { azienda } = useApp()
  const [adozioni, setAdozioni] = useState({})   // codice -> record procedure_azienda
  const [ruoli, setRuoli]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [areaSel, setAreaSel]   = useState('')
  const [error, setError]       = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [p, r] = await Promise.all([
      supabase.from('procedure_azienda').select('*').eq('azienda_id', azienda.id),
      supabase.from('ruoli').select('id, sigla, nome, membro_id').eq('azienda_id', azienda.id).order('sigla'),
    ])
    const map = {}
    ;(p.data || []).forEach(x => { map[x.codice] = x })
    setAdozioni(map)
    setRuoli(r.data || [])
    setLoading(false)
  }, [azienda.id])

  useEffect(() => { load() }, [load])

  function ruoloSuggerito(proc) {
    const sigla = MAPPA_SIGLE[proc.funzioni[0]] || proc.funzioni[0]
    return ruoli.find(r => r.sigla === sigla)?.id || null
  }

  async function setCampo(proc, campo, valore) {
    setError(null)
    const esistente = adozioni[proc.codice]
    const payload = {
      azienda_id: azienda.id,
      codice: proc.codice,
      stato: campo === 'stato' ? valore : (esistente?.stato || 'Adottata'),
      ruolo_id: campo === 'ruolo_id' ? (valore || null) : (esistente?.ruolo_id ?? ruoloSuggerito(proc)),
    }
    const { error: err } = await supabase.from('procedure_azienda').upsert(payload, { onConflict: 'azienda_id,codice' })
    if (err) { setError(err.message); return }
    load()
  }

  async function adottaTutte() {
    setError(null); setLoading(true)
    const mancanti = CATALOGO_PROCEDURE.filter(p => !adozioni[p.codice]).map(p => ({
      azienda_id: azienda.id, codice: p.codice, stato: 'Adottata', ruolo_id: ruoloSuggerito(p),
    }))
    if (mancanti.length > 0) {
      const { error: err } = await supabase.from('procedure_azienda').insert(mancanti)
      if (err) setError(err.message)
    }
    load()
  }

  const lista = CATALOGO_PROCEDURE.filter(p => !areaSel || p.area === areaSel)
  const tot = CATALOGO_PROCEDURE.length
  const nAdott = Object.values(adozioni).filter(a => a.stato === 'Adottata').length
  const nPers  = Object.values(adozioni).filter(a => a.stato === 'Personalizzata').length
  const nNA    = Object.values(adozioni).filter(a => a.stato === 'Non applicabile').length
  const daVal  = tot - nAdott - nPers - nNA
  const senzaResp = Object.values(adozioni).filter(a => a.stato !== 'Non applicabile' && !a.ruolo_id).length

  return (
    <div>
      <div className="page-header">
        <h2>Procedure Aziendali</h2>
        <p>Il Manuale delle Procedure ({tot}) applicato all'azienda: adozione e responsabilità</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginBottom: 18 }}>
        {[
          ['Da valutare', daVal, daVal > 0 ? '#B7791F' : '#27AE60'],
          ['Adottate', nAdott, '#27AE60'],
          ['Personalizzate', nPers, '#2B5FA5'],
          ['Non applicabili', nNA, '#888'],
          ['Senza responsabile', senzaResp, senzaResp > 0 ? '#C0392B' : '#27AE60'],
        ].map(([lab, val, col]) => (
          <div key={lab} className="card" style={{ textAlign: 'center', marginBottom: 0, padding: '14px 8px' }}>
            <div style={{ fontSize: 26, fontWeight: 700, color: col }}>{val}</div>
            <div style={{ fontSize: 12, color: '#666' }}>{lab}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">📘 Catalogo procedure</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select className="form-control" style={{ width: 260 }} value={areaSel} onChange={e => setAreaSel(e.target.value)}>
              <option value="">Tutte le aree</option>
              {Object.entries(AREE_PROCEDURE).map(([sigla, nome]) => <option key={sigla} value={sigla}>{sigla} — {nome}</option>)}
            </select>
            <button className="btn btn-sm btn-primary" onClick={adottaTutte}>✓ Adotta tutte</button>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}
        {ruoli.length === 0 && !loading && (
          <div className="alert alert-info" style={{ marginBottom: 12 }}>
            💡 L'organigramma è vuoto: carica prima i ruoli in <strong>Organigramma</strong> per poter assegnare i responsabili.
          </div>
        )}

        {loading ? (
          <div className="empty-state"><p>Caricamento...</p></div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {lista.map(p => {
              const a = adozioni[p.codice]
              const st = a?.stato
              const stile = st ? STATO_STYLE[st] : { bg: '#FDF6E7', color: '#B7791F' }
              return (
                <div key={p.codice} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: '#FBFCFD', border: '1px solid #E8EAED', opacity: st === 'Non applicabile' ? 0.55 : 1 }}>
                  <span style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: '#1A3A5C', minWidth: 96 }}>{p.codice}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>{p.titolo}</div>
                    <div style={{ fontSize: 11, color: '#999' }}>{p.funzioni.join(' + ')}</div>
                  </div>
                  <select className="form-control" style={{ width: 150, background: stile.bg, color: stile.color, fontWeight: 600, fontSize: 12 }}
                          value={st || ''} onChange={e => setCampo(p, 'stato', e.target.value)}>
                    <option value="" disabled>Da valutare</option>
                    {STATI.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select className="form-control" style={{ width: 200, fontSize: 12 }} disabled={st === 'Non applicabile'}
                          value={a?.ruolo_id || ''} onChange={e => setCampo(p, 'ruolo_id', e.target.value)}>
                    <option value="">— Responsabile —</option>
                    {ruoli.map(r => <option key={r.id} value={r.id}>{r.sigla} — {r.nome}</option>)}
                  </select>
                  <button className="btn btn-sm btn-icon" title="Genera documento personalizzato"
                          disabled={!st || st === 'Non applicabile'}
                          onClick={() => generaProcedura(p, azienda)}>📄</button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
