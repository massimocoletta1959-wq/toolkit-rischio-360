import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'
import { AREE_PROCEDURE, MAPPA_SIGLE } from '../lib/procedure'
import { generaProcedura } from '../lib/generaProcedura'

const STATI = ['Adottata', 'Personalizzata', 'Non applicabile']
const STATO_STYLE = {
  'Adottata':        { bg: '#D5F5E3', color: '#155724' },
  'Personalizzata':  { bg: '#D6E8F7', color: '#1A3A5C' },
  'Non applicabile': { bg: '#EEE',    color: '#777' },
}

// ---------------------------------------------------------------------
// Modale: distribuisci una procedura per presa visione
// ---------------------------------------------------------------------
function DistribuzioneModal({ proc, defaultMembroId, membri, aziendaId, onClose, onDone }) {
  const [sel, setSel] = useState(() => {
    const init = {}
    if (defaultMembroId) init[defaultMembroId] = true
    return init
  })
  const [loading, setLoading] = useState(false)
  const [err, setErr] = useState(null)
  const [avvisaEmail, setAvvisaEmail] = useState(true)

  const nomeMembro = m => `${m.nome || ''} ${m.cognome || ''}`.trim() || m.email || '—'
  const toggle = id => setSel(s => ({ ...s, [id]: !s[id] }))
  const nSel = Object.values(sel).filter(Boolean).length

  async function invia() {
    const dest = membri.filter(m => sel[m.id])
    if (!dest.length) { setErr('Seleziona almeno una persona.'); return }
    setLoading(true); setErr(null)
    const righe = dest.map(m => ({
      azienda_id: aziendaId,
      membro_id: m.id,
      titolo: 'Presa visione: ' + proc.titolo,
      istruzioni: `Prendi visione della procedura ${proc.codice} — ${proc.titolo}, poi segna il ticket come "Completato" per confermare.`,
      tipo: 'presa_visione',
      procedura_id: proc.codice,
      priorita: 'Media',
      stato: 'Aperto',
    }))
    let { data: creati, error } = await supabase.from('ticket').insert(righe).select('id')
    if (error && /procedura_id|column|type|invalid|uuid/i.test(error.message)) {
      // ripiego: alcune installazioni hanno procedura_id non testuale
      const righe2 = righe.map(({ procedura_id, ...r }) => r)
      ;({ data: creati, error } = await supabase.from('ticket').insert(righe2).select('id'))
    }
    if (error) { setLoading(false); setErr(error.message); return }

    // Avvisa via email (stesso meccanismo dei ticket manuali)
    if (avvisaEmail && creati?.length) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        await Promise.all(creati.map(t =>
          fetch('https://vwbixmbbcutjcplskjvg.supabase.co/functions/v1/invia-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
            body: JSON.stringify({ ticket_id: t.id, tipo: 'assegnazione' }),
          }).catch(() => {})
        ))
      } catch (e) { /* l'email e' best-effort */ }
    }

    setLoading(false)
    onDone(dest.length)
  }

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
      <div className="card" style={{ width: 460, maxWidth: '92%', margin: 0, maxHeight: '85vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="card-header">
          <span className="card-title">📤 Distribuisci per presa visione</span>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>
        <div style={{ fontSize: 13, color: '#555', marginBottom: 12 }}>
          <strong>{proc.codice}</strong> — {proc.titolo}<br />
          Seleziona le persone che devono prenderne visione: a ciascuna arriverà un ticket.
        </div>
        {membri.length === 0 ? (
          <div className="alert alert-info">Non ci sono ancora persone in <strong>Membri</strong>: aggiungile prima di distribuire.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 12 }}>
            {membri.map(m => (
              <label key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, background: sel[m.id] ? '#EBF4FC' : '#FBFCFD', border: '1px solid #E8EAED', cursor: 'pointer' }}>
                <input type="checkbox" checked={!!sel[m.id]} onChange={() => toggle(m.id)} />
                <span style={{ fontSize: 13 }}>{nomeMembro(m)}</span>
                {m.id === defaultMembroId && <span className="badge" style={{ background: '#FEF9E7', color: '#856404', fontSize: 10 }}>responsabile</span>}
              </label>
            ))}
          </div>
        )}
        {err && <div style={{ background: '#FADBD8', color: '#C0392B', padding: '8px 10px', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>{err}</div>}
        {membri.length > 0 && (
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#555', marginBottom: 12 }}>
            <input type="checkbox" checked={avvisaEmail} onChange={e => setAvvisaEmail(e.target.checked)} />
            Avvisa via email chi ha un indirizzo
          </label>
        )}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onClose}>Annulla</button>
          <button className="btn btn-primary" onClick={invia} disabled={loading || nSel === 0}>{loading ? 'Invio…' : `Invia ${nSel || ''} prese visione`}</button>
        </div>
      </div>
    </div>
  )
}

export default function Procedure() {
  const { azienda } = useApp()
  const [catalogo, setCatalogo] = useState([])   // procedure del settore + generico
  const [adozioni, setAdozioni] = useState({})   // codice -> record procedure_azienda
  const [ruoli, setRuoli]       = useState([])
  const [membri, setMembri]     = useState([])
  const [distProc, setDistProc] = useState(null)   // { proc, defaultMembroId }
  const [msg, setMsg]           = useState(null)
  const [loading, setLoading]   = useState(true)
  const [areaSel, setAreaSel]   = useState('')
  const [error, setError]       = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [p, r, m, c] = await Promise.all([
      supabase.from('procedure_azienda').select('*').eq('azienda_id', azienda.id),
      supabase.from('ruoli').select('id, sigla, nome, membro_id').eq('azienda_id', azienda.id).order('sigla'),
      supabase.from('membri').select('id, nome, cognome, email').eq('azienda_id', azienda.id).order('cognome'),
      supabase.from('procedure_catalogo').select('codice, area, titolo, funzioni')
        .in('settore', [azienda.settore, 'generico'].filter(Boolean)).eq('attivo', true).order('codice'),
    ])
    const map = {}
    ;(p.data || []).forEach(x => { map[x.codice] = x })
    setAdozioni(map)
    setRuoli(r.data || [])
    setMembri(m.data || [])
    setCatalogo(c.data || [])
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
    const mancanti = catalogo.filter(p => !adozioni[p.codice]).map(p => ({
      azienda_id: azienda.id, codice: p.codice, stato: 'Adottata', ruolo_id: ruoloSuggerito(p),
    }))
    if (mancanti.length > 0) {
      const { error: err } = await supabase.from('procedure_azienda').insert(mancanti)
      if (err) setError(err.message)
    }
    load()
  }

  const lista = catalogo.filter(p => !areaSel || p.area === areaSel)
  const tot = catalogo.length
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
        {msg && <div className="alert alert-info" style={{ marginBottom: 12 }}>{msg}</div>}
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
                  <button className="btn btn-sm btn-icon" title="Distribuisci per presa visione"
                          disabled={!st || st === 'Non applicabile'}
                          onClick={() => setDistProc({ proc: p, defaultMembroId: ruoli.find(r => r.id === a?.ruolo_id)?.membro_id || null })}>📤</button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {distProc && (
        <DistribuzioneModal
          proc={distProc.proc}
          defaultMembroId={distProc.defaultMembroId}
          membri={membri}
          aziendaId={azienda.id}
          onClose={() => setDistProc(null)}
          onDone={n => {
            setDistProc(null)
            setMsg(`Distribuita "${distProc.proc.titolo}": create ${n} prese visione. Le trovi in Procedure → Ticket.`)
            setTimeout(() => setMsg(null), 6000)
          }}
        />
      )}
    </div>
  )
}
