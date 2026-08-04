import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

// Tipi di organo previsti dal database (tabella organi)
const TIPI = [
  { id: 'cda',                  label: 'Consiglio di Amministrazione', icon: '🏛️', mono: false },
  { id: 'amministratore_unico', label: 'Amministratore Unico',         icon: '👤', mono: true  },
  { id: 'comitato',             label: 'Comitato',                     icon: '👥', mono: false },
  { id: 'collegio_sindacale',   label: 'Collegio Sindacale',           icon: '⚖️', mono: false },
  { id: 'assemblea',            label: 'Assemblea',                    icon: '🗳️', mono: false },
  { id: 'altro',                label: 'Altro organo',                 icon: '📋', mono: false },
]
const tipoInfo = id => TIPI.find(t => t.id === id) || TIPI[TIPI.length - 1]

// Ruoli tipici dentro un organo (campo organo_membri.ruolo — testo libero lato DB)
const RUOLI = ['Presidente', 'Vice Presidente', 'Amministratore Delegato', 'Consigliere',
  'Amministratore Unico', 'Presidente del Collegio', 'Sindaco effettivo', 'Sindaco supplente', 'Membro']

const nomeMembro = m => m ? `${m.nome || ''} ${m.cognome || ''}`.trim() || m.email : '—'

// ---------------------------------------------------------------------
// Modale: nuovo organo
// ---------------------------------------------------------------------
function OrganoModal({ aziendaId, organo, onSaved, onClose }) {
  const editing = !!organo?.id
  const [tipo, setTipo] = useState(organo?.tipo || 'cda')
  const [nome, setNome] = useState(organo?.nome || '')
  const [qPres, setQPres] = useState(organo?.quorum_presenza ?? '')
  const [qDelib, setQDelib] = useState(organo?.quorum_delibera ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const info = tipoInfo(tipo)

  async function salva() {
    if (!nome.trim()) { setError('Dai un nome all\'organo (es. "CdA", "Comitato Rischi").'); return }
    setLoading(true); setError(null)
    let err
    if (editing) {
      // In modifica cambiamo solo denominazione e quorum (il tipo resta invariato)
      ;({ error: err } = await supabase.from('organi').update({
        nome: nome.trim(),
        quorum_presenza: qPres === '' ? null : Number(qPres),
        quorum_delibera: qDelib === '' ? null : Number(qDelib),
      }).eq('id', organo.id))
    } else {
      ;({ error: err } = await supabase.from('organi').insert({
        azienda_id: aziendaId,
        tipo,
        nome: nome.trim(),
        monocratico: info.mono,
        quorum_presenza: qPres === '' ? null : Number(qPres),
        quorum_delibera: qDelib === '' ? null : Number(qDelib),
      }))
    }
    setLoading(false)
    if (err) { setError(err.message); return }
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}>
      <div className="card" style={{ width: 460, maxWidth: '92%', margin: 0 }} onClick={e => e.stopPropagation()}>
        <div className="card-header">
          <span className="card-title">{editing ? 'Modifica organo' : 'Nuovo organo'}</span>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="form-group">
          <label className="form-label">Tipo di organo</label>
          {editing ? (
            <div className="form-control" style={{ background: '#F5F5F5', color: '#666' }}>{info.icon}  {info.label}</div>
          ) : (
            <select className="form-control" value={tipo} onChange={e => setTipo(e.target.value)}>
              {TIPI.map(t => <option key={t.id} value={t.id}>{t.icon}  {t.label}</option>)}
            </select>
          )}
          {info.mono && <div style={{ fontSize: 11, color: '#666', marginTop: 5 }}>Organo monocratico: un solo componente.</div>}
        </div>

        <div className="form-group">
          <label className="form-label">Nome / denominazione</label>
          <input className="form-control" value={nome} onChange={e => setNome(e.target.value)}
            placeholder={info.mono ? 'es. Amministratore Unico' : 'es. Consiglio di Amministrazione'} />
        </div>

        {!info.mono && (
          <div style={{ display: 'flex', gap: 12 }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Quorum presenza</label>
              <input className="form-control" type="number" step="0.01" min="0" max="1" value={qPres}
                onChange={e => setQPres(e.target.value)} placeholder="es. 0.5" />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label className="form-label">Quorum delibera</label>
              <input className="form-control" type="number" step="0.01" min="0" max="1" value={qDelib}
                onChange={e => setQDelib(e.target.value)} placeholder="es. 0.5" />
            </div>
          </div>
        )}
        {!info.mono && <div style={{ fontSize: 11, color: '#999', marginTop: -6, marginBottom: 10 }}>Frazione dei componenti (0,5 = maggioranza). Lascia vuoto se non applicabile.</div>}

        {error && <div style={{ background: '#FADBD8', color: '#C0392B', padding: '8px 10px', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onClose}>Annulla</button>
          <button className="btn btn-primary" onClick={salva} disabled={loading}>{loading ? 'Salvataggio…' : (editing ? 'Salva modifiche' : 'Crea organo')}</button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// Riga per aggiungere un componente a un organo
// ---------------------------------------------------------------------
function AggiungiComponente({ organo, membri, giaPresenti, onAdded }) {
  const [membroId, setMembroId] = useState('')
  const [ruolo, setRuolo] = useState(organo.monocratico ? 'Amministratore Unico' : 'Consigliere')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const disponibili = membri.filter(m => !giaPresenti.includes(m.id))

  async function aggiungi() {
    if (!membroId) { setError('Scegli una persona.'); return }
    setLoading(true); setError(null)
    const { error: err } = await supabase.from('organo_membri').insert({
      organo_id: organo.id, membro_id: membroId, ruolo,
      data_nomina: new Date().toISOString().slice(0, 10),
    })
    setLoading(false)
    if (err) { setError(err.message.includes('duplicate') ? 'Persona già presente con questo ruolo.' : err.message); return }
    setMembroId(''); onAdded()
  }

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginTop: 12, flexWrap: 'wrap' }}>
      <select className="form-control" style={{ flex: 2, minWidth: 160 }} value={membroId} onChange={e => setMembroId(e.target.value)}>
        <option value="">+ Aggiungi persona…</option>
        {disponibili.map(m => <option key={m.id} value={m.id}>{nomeMembro(m)}</option>)}
      </select>
      <select className="form-control" style={{ flex: 1, minWidth: 130 }} value={ruolo} onChange={e => setRuolo(e.target.value)}>
        {RUOLI.map(r => <option key={r} value={r}>{r}</option>)}
      </select>
      <button className="btn btn-primary btn-sm" onClick={aggiungi} disabled={loading || !membroId}>Aggiungi</button>
      {error && <div style={{ width: '100%', color: '#C0392B', fontSize: 12 }}>{error}</div>}
    </div>
  )
}

// ---------------------------------------------------------------------
// Pagina Governance — Organi & composizione
// ---------------------------------------------------------------------
export default function Governance() {
  const { azienda } = useApp()
  const [organi, setOrgani] = useState([])
  const [membri, setMembri] = useState([])
  const [comp, setComp] = useState([])       // organo_membri con membri joinati
  const [loading, setLoading] = useState(true)
  const [showNuovo, setShowNuovo] = useState(false)
  const [editOrg, setEditOrg] = useState(null)

  const load = useCallback(async () => {
    if (!azienda?.id) return
    setLoading(true)
    const { data: orgs } = await supabase.from('organi').select('*').eq('azienda_id', azienda.id).order('created_at')
    const { data: mem } = await supabase.from('membri').select('id,nome,cognome,email,ruolo').eq('azienda_id', azienda.id).order('cognome')
    let composizione = []
    if (orgs && orgs.length) {
      const { data: c } = await supabase.from('organo_membri')
        .select('*, membri(nome,cognome,email)')
        .in('organo_id', orgs.map(o => o.id))
      composizione = c || []
    }
    setOrgani(orgs || []); setMembri(mem || []); setComp(composizione)
    setLoading(false)
  }, [azienda])

  useEffect(() => { load() }, [load])

  async function eliminaOrgano(o) {
    if (!window.confirm(`Eliminare "${o.nome}" e la sua composizione?`)) return
    await supabase.from('organi').delete().eq('id', o.id)
    load()
  }
  async function rimuoviComponente(id) {
    await supabase.from('organo_membri').delete().eq('id', id)
    load()
  }

  const compDi = organoId => comp.filter(c => c.organo_id === organoId)

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, color: '#1A3A5C', marginBottom: 2 }}>Governance — Organi</h2>
          <p style={{ fontSize: 13, color: '#666' }}>Organi societari di <strong>{azienda?.nome}</strong> e loro composizione.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowNuovo(true)}>+ Nuovo organo</button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div style={{ fontSize: 26, fontWeight: 700, color: '#1A3A5C' }}>{organi.length}</div>
          <div style={{ fontSize: 12, color: '#666' }}>Organi</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 26, fontWeight: 700, color: '#1A3A5C' }}>{comp.length}</div>
          <div style={{ fontSize: 12, color: '#666' }}>Cariche assegnate</div>
        </div>
        <div className="stat-card">
          <div style={{ fontSize: 26, fontWeight: 700, color: '#1A3A5C' }}>{membri.length}</div>
          <div style={{ fontSize: 12, color: '#666' }}>Persone disponibili</div>
        </div>
      </div>

      {loading ? (
        <div className="card" style={{ textAlign: 'center', color: '#999' }}>Caricamento…</div>
      ) : organi.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🏛️</div>
          <div style={{ color: '#666', marginBottom: 16 }}>Nessun organo ancora. Crea il primo — di solito il Consiglio di Amministrazione.</div>
          <button className="btn btn-primary" onClick={() => setShowNuovo(true)}>+ Crea il primo organo</button>
        </div>
      ) : (
        organi.map(o => {
          const info = tipoInfo(o.tipo)
          const membriOrgano = compDi(o.id)
          const idsPresenti = membriOrgano.map(c => c.membro_id)
          const pieno = o.monocratico && membriOrgano.length >= 1
          return (
            <div className="card" key={o.id}>
              <div className="card-header">
                <span className="card-title">{info.icon}  {o.nome}
                  <span className="badge" style={{ background: '#EBF4FC', color: '#2B5FA5', marginLeft: 8 }}>{info.label}</span>
                  {o.monocratico && <span className="badge" style={{ background: '#FEF9E7', color: '#856404', marginLeft: 6 }}>monocratico</span>}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className="btn btn-sm" onClick={() => setEditOrg(o)}>Modifica</button>
                  <button className="btn btn-sm btn-danger" onClick={() => eliminaOrgano(o)}>Elimina</button>
                </div>
              </div>

              {(o.quorum_presenza != null || o.quorum_delibera != null) && (
                <div style={{ fontSize: 12, color: '#666', marginBottom: 10 }}>
                  {o.quorum_presenza != null && <>Quorum presenza: <strong>{o.quorum_presenza}</strong>&nbsp;&nbsp;</>}
                  {o.quorum_delibera != null && <>Quorum delibera: <strong>{o.quorum_delibera}</strong></>}
                </div>
              )}

              {membriOrgano.length === 0 ? (
                <div style={{ fontSize: 13, color: '#999', padding: '4px 0' }}>Nessun componente assegnato.</div>
              ) : (
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Componente</th><th>Ruolo</th><th>Dal</th><th></th></tr></thead>
                    <tbody>
                      {membriOrgano.map(c => (
                        <tr key={c.id}>
                          <td>{nomeMembro(c.membri)}</td>
                          <td><span className="badge" style={{ background: '#EBF4FC', color: '#2B5FA5' }}>{c.ruolo}</span></td>
                          <td style={{ color: '#666', fontSize: 12 }}>{c.data_nomina || '—'}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button className="btn btn-sm btn-danger" onClick={() => rimuoviComponente(c.id)}>Rimuovi</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {!pieno && (
                membri.length === 0
                  ? <div style={{ fontSize: 12, color: '#999', marginTop: 10 }}>Aggiungi prima delle persone in “Membri” per poterle nominare qui.</div>
                  : <AggiungiComponente organo={o} membri={membri} giaPresenti={idsPresenti} onAdded={load} />
              )}
              {pieno && <div style={{ fontSize: 12, color: '#999', marginTop: 10 }}>Organo monocratico: componente già assegnato.</div>}
            </div>
          )
        })
      )}

      {showNuovo && (
        <OrganoModal aziendaId={azienda.id}
          onSaved={() => { setShowNuovo(false); load() }}
          onClose={() => setShowNuovo(false)} />
      )}

      {editOrg && (
        <OrganoModal aziendaId={azienda.id} organo={editOrg}
          onSaved={() => { setEditOrg(null); load() }}
          onClose={() => setEditOrg(null)} />
      )}
    </div>
  )
}
