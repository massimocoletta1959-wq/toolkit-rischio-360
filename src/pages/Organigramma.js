import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

export const RUOLI_STANDARD = [
  { sigla: 'CdA',    nome: 'Consiglio di Amministrazione' },
  { sigla: 'DL',     nome: 'Direzione / Datore di Lavoro' },
  { sigla: 'AMM',    nome: 'Amministrazione' },
  { sigla: 'CG',     nome: 'Contabilità Generale' },
  { sigla: 'DC',     nome: 'Direzione Commerciale' },
  { sigla: 'ACQ',    nome: 'Acquisti e Contabilità Lavori / Subappalti' },
  { sigla: 'DTS',    nome: 'Direzione Tecnica Strutture' },
  { sigla: 'DTA',    nome: 'Direzione Tecnica Architettura' },
  { sigla: 'RC',     nome: 'Responsabili di Cantiere' },
  { sigla: 'HR',     nome: 'Responsabile Risorse Umane' },
  { sigla: 'RSPP',   nome: 'Responsabile Servizio Prevenzione e Protezione' },
  { sigla: 'RSGI',   nome: 'Responsabile Sistema di Gestione Integrato' },
  { sigla: 'MC',     nome: 'Medico Competente (esterno)' },
  { sigla: 'RLS',    nome: 'Rappresentante dei Lavoratori per la Sicurezza' },
  { sigla: 'SA8000', nome: 'Rappresentante dei Lavoratori SA8000' },
  { sigla: 'IT',     nome: 'Information Technology' },
]

// Ruoli standard per il settore SERVIZI
const RUOLI_SERVIZI = [
  { sigla: 'CdA',  nome: 'Consiglio di Amministrazione' },
  { sigla: 'DL',   nome: 'Direzione / Datore di Lavoro' },
  { sigla: 'AMM',  nome: 'Amministrazione' },
  { sigla: 'CG',   nome: 'Contabilità Generale' },
  { sigla: 'DC',   nome: 'Direzione Commerciale' },
  { sigla: 'ACQ',  nome: 'Acquisti e Fornitori' },
  { sigla: 'DTS',  nome: 'Direzione Tecnica / Operativa' },
  { sigla: 'RC',   nome: 'Responsabile Commessa / Progetto' },
  { sigla: 'HR',   nome: 'Responsabile Risorse Umane' },
  { sigla: 'IT',   nome: 'Information Technology' },
  { sigla: 'RSGI', nome: 'Responsabile Sistema di Gestione Integrato' },
  { sigla: 'RSPP', nome: 'Responsabile Servizio Prevenzione e Protezione' },
  { sigla: 'DPO',  nome: 'Responsabile Protezione Dati (Privacy)' },
  { sigla: 'MC',   nome: 'Medico Competente (esterno)' },
  { sigla: 'RLS',  nome: 'Rappresentante dei Lavoratori per la Sicurezza' },
]

// Ruoli standard per il settore HOTEL
const RUOLI_HOTEL = [
  { sigla: 'DG',    nome: 'Direttore Generale' },
  { sigla: 'VD',    nome: 'Vice Direttore' },
  { sigla: 'DL',    nome: 'Direzione / Datore di Lavoro' },
  { sigla: 'AMM',   nome: 'Amministrazione & Finanza' },
  { sigla: 'HR',    nome: 'Responsabile Risorse Umane' },
  { sigla: 'IT',    nome: 'Information Technology' },
  { sigla: 'RSGI',  nome: 'Responsabile Qualità / SGI' },
  { sigla: 'RSPP',  nome: 'Responsabile Sicurezza (RSPP)' },
  { sigla: 'DPO',   nome: 'Responsabile Protezione Dati (Privacy)' },
  { sigla: 'RD',    nome: 'Rooms Division Manager' },
  { sigla: 'FOM',   nome: 'Front Office Manager' },
  { sigla: 'GOV',   nome: 'Governante / Executive Housekeeper' },
  { sigla: 'NIGHT', nome: 'Night Auditor' },
  { sigla: 'FBM',   nome: 'F&B Manager' },
  { sigla: 'CHEF',  nome: 'Executive Chef' },
  { sigla: 'MTR',   nome: 'Maître / Responsabile Sala' },
  { sigla: 'HACCP', nome: 'Responsabile HACCP' },
  { sigla: 'SPA',   nome: 'Spa Manager' },
  { sigla: 'MICE',  nome: 'Responsabile Eventi & Banqueting' },
  { sigla: 'REV',   nome: 'Revenue Manager' },
  { sigla: 'MAINT', nome: 'Responsabile Manutenzione & Impianti' },
  { sigla: 'SEC',   nome: 'Responsabile Security & Antincendio' },
  { sigla: 'GRM',   nome: 'Guest Relations Manager' },
  { sigla: 'MC',    nome: 'Medico Competente (esterno)' },
  { sigla: 'RLS',   nome: 'Rappresentante dei Lavoratori per la Sicurezza' },
]

// Set di ruoli standard in base al settore dell'azienda
export const RUOLI_STANDARD_PER_SETTORE = {
  Edilizia: RUOLI_STANDARD,
  Servizi:  RUOLI_SERVIZI,
  Hotel:    RUOLI_HOTEL,
}

// Classificazione di default in base alla sigla (poi correggibile a mano)
const FASCE = [
  ['governance', 'Governance'],
  ['core', 'Operative (Core)'],
  ['staff', 'Supporto (Staff)'],
]
const FASCIA_LABEL = Object.fromEntries(FASCE)

const SIGLE_GOVERNANCE = ['CDA', 'DL', 'DG', 'VD', 'DIR']
const SIGLE_STAFF = ['AMM', 'CG', 'HR', 'IT', 'RSPP', 'RSGI', 'DPO', 'MC', 'RLS', 'SA8000', 'HACCP', 'SEC', 'MAINT']
// tutto il resto (commerciale, tecnico, produzione, cantiere, ecc.) -> core
function fasciaDaSigla(sigla) {
  const s = (sigla || '').toUpperCase()
  if (SIGLE_GOVERNANCE.includes(s)) return 'governance'
  if (SIGLE_STAFF.includes(s)) return 'staff'
  return 'core'
}

export default function Organigramma() {
  const { azienda } = useApp()
  const [ruoli, setRuoli]     = useState([])
  const [membri, setMembri]   = useState([])
  const [loading, setLoading] = useState(true)
  const [nuovo, setNuovo]     = useState(null)
  const [editNome, setEditNome] = useState(null)
  const [error, setError]     = useState(null)

  const load = useCallback(async () => {
    setLoading(true)
    const [r, m] = await Promise.all([
      supabase.from('ruoli').select('*').eq('azienda_id', azienda.id).order('sigla'),
      supabase.from('membri').select('id, nome, cognome').eq('azienda_id', azienda.id).order('cognome'),
    ])
    setRuoli(r.data || [])
    setMembri(m.data || [])
    setLoading(false)
  }, [azienda.id])

  useEffect(() => { load() }, [load])

  async function caricaStandard() {
    setLoading(true); setError(null)
    const esistenti = new Set(ruoli.map(r => r.sigla))
    const setRuoliStd = RUOLI_STANDARD_PER_SETTORE[azienda.settore] || RUOLI_STANDARD
    const payload = setRuoliStd.filter(r => !esistenti.has(r.sigla)).map(r => ({ ...r, azienda_id: azienda.id, fascia: fasciaDaSigla(r.sigla) }))
    if (payload.length > 0) {
      const { error: err } = await supabase.from('ruoli').insert(payload)
      if (err) setError(err.message)
    }
    load()
  }

  async function assegna(ruolo, membroId) {
    await supabase.from('ruoli').update({ membro_id: membroId || null }).eq('id', ruolo.id)
    load()
  }

  async function cambiaFascia(ruolo, fascia) {
    await supabase.from('ruoli').update({ fascia: fascia || null }).eq('id', ruolo.id)
    load()
  }
  async function cambiaParent(ruolo, parentId) {
    await supabase.from('ruoli').update({ parent_id: parentId || null }).eq('id', ruolo.id)
    load()
  }

  async function salvaNome(ruolo) {
    if (!editNome.nome.trim()) return
    await supabase.from('ruoli').update({ nome: editNome.nome.trim() }).eq('id', ruolo.id)
    setEditNome(null); load()
  }

  async function salvaNuovo() {
    if (!nuovo.sigla.trim() || !nuovo.nome.trim()) return
    const { error: err } = await supabase.from('ruoli').insert({
      azienda_id: azienda.id, sigla: nuovo.sigla.trim().toUpperCase(), nome: nuovo.nome.trim(),
      fascia: fasciaDaSigla(nuovo.sigla),
    })
    if (err) {
      setError(err.message.includes('duplicate') || err.message.includes('unique') ? 'Sigla già presente in questa azienda.' : err.message)
      return
    }
    setNuovo(null); setError(null); load()
  }

  async function elimina(id) {
    await supabase.from('ruoli').delete().eq('id', id)
    load()
  }

  const assegnati = ruoli.filter(r => r.membro_id).length
  const scoperti  = ruoli.length - assegnati

  return (
    <div>
      <div className="page-header">
        <h2>Organigramma</h2>
        <p>Ruoli e funzioni aziendali — la base per procedure e responsabilità</p>
      </div>

      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 18 }}>
        <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#1A3A5C' }}>{ruoli.length}</div>
          <div style={{ fontSize: 13, color: '#666' }}>Ruoli definiti</div>
        </div>
        <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: '#27AE60' }}>{assegnati}</div>
          <div style={{ fontSize: 13, color: '#666' }}>Assegnati</div>
        </div>
        <div className="card" style={{ textAlign: 'center', marginBottom: 0 }}>
          <div style={{ fontSize: 30, fontWeight: 700, color: scoperti > 0 ? '#C0392B' : '#27AE60' }}>{scoperti}</div>
          <div style={{ fontSize: 13, color: '#666' }}>Scoperti</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <span className="card-title">🏛️ Ruoli dell'azienda</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn btn-sm" onClick={caricaStandard}>⬇️ Carica i ruoli standard</button>
            <button className="btn btn-sm btn-primary" onClick={() => { setNuovo({ sigla: '', nome: '' }); setError(null) }}>+ Ruolo</button>
          </div>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: 12 }}>{error}</div>}

        {nuovo && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, padding: 12, background: '#F7F8FA', borderRadius: 8, alignItems: 'center' }}>
            <input className="form-control" style={{ width: 100 }} placeholder="Sigla" value={nuovo.sigla} onChange={e => setNuovo({ ...nuovo, sigla: e.target.value })} maxLength={6} />
            <input className="form-control" style={{ flex: 1 }} placeholder="Nome del ruolo (es. Responsabile Qualità)" value={nuovo.nome} onChange={e => setNuovo({ ...nuovo, nome: e.target.value })} />
            <button className="btn btn-sm btn-primary" onClick={salvaNuovo}>Salva</button>
            <button className="btn btn-sm" onClick={() => { setNuovo(null); setError(null) }}>Annulla</button>
          </div>
        )}

        {loading ? (
          <div className="empty-state"><p>Caricamento...</p></div>
        ) : ruoli.length === 0 ? (
          <div className="empty-state">
            <p>Nessun ruolo definito. Parti dai <strong>ruoli standard</strong> del Manuale delle Procedure, poi personalizza.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {ruoli.map(r => (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: '10px 14px', borderRadius: 8, background: r.membro_id ? '#F7FBF8' : '#FDF9F3', border: `1px solid ${r.membro_id ? '#CBE8D5' : '#F0E0C0'}` }}>
                <span style={{ fontWeight: 700, fontSize: 12, background: '#1A3A5C', color: 'white', padding: '3px 10px', borderRadius: 12, minWidth: 52, textAlign: 'center' }}>{r.sigla}</span>
                {editNome?.id === r.id ? (
                  <>
                    <input className="form-control" style={{ flex: 1 }} value={editNome.nome} onChange={e => setEditNome({ ...editNome, nome: e.target.value })} />
                    <button className="btn btn-sm btn-primary" onClick={() => salvaNome(r)}>✓</button>
                    <button className="btn btn-sm" onClick={() => setEditNome(null)}>×</button>
                  </>
                ) : (
                  <span style={{ flex: 1, fontSize: 14, fontWeight: 500, cursor: 'pointer' }} title="Clicca per rinominare" onClick={() => setEditNome({ id: r.id, nome: r.nome })}>{r.nome}</span>
                )}
                <select className="form-control" style={{ width: 150 }} value={r.fascia || ''} onChange={e => cambiaFascia(r, e.target.value)} title="Fascia">
                  <option value="">— Fascia —</option>
                  {FASCE.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
                <select className="form-control" style={{ width: 180 }} value={r.parent_id || ''} onChange={e => cambiaParent(r, e.target.value)} title="Riporta a (secondo livello)">
                  <option value="">— Primo livello —</option>
                  {ruoli.filter(x => x.id !== r.id && x.fascia === r.fascia).map(x => (
                    <option key={x.id} value={x.id}>↳ {x.sigla}</option>
                  ))}
                </select>
                <select className="form-control" style={{ width: 200 }} value={r.membro_id || ''} onChange={e => assegna(r, e.target.value)}>
                  <option value="">— Non assegnato —</option>
                  {membri.map(m => <option key={m.id} value={m.id}>{m.nome} {m.cognome}</option>)}
                </select>
                <button className="btn btn-sm btn-icon btn-danger" onClick={() => elimina(r.id)}>🗑️</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {membri.length === 0 && !loading && (
        <div className="alert alert-info" style={{ marginTop: 14 }}>
          💡 Non ci sono ancora membri in questa azienda: crea prima i membri in <strong>Membri</strong>, poi torna qui per assegnarli ai ruoli.
        </div>
      )}
    </div>
  )
}
