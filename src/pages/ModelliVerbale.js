import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

// Segnaposto disponibili (mostrati nella legenda cliccabile)
const SEGNAPOSTI = [
  ['{{ORGANO}}', 'Nome esteso organo'],
  ['{{AZIENDA}}', 'Ragione sociale'],
  ['{{SETTORE}}', 'Settore azienda'],
  ['{{NUMERO}}', 'Numero verbale'],
  ['{{ANNO}}', 'Anno'],
  ['{{DATA}}', 'Data della seduta'],
  ['{{ORA_INIZIO}}', 'Ora di apertura'],
  ['{{ORA_CHIUSURA}}', 'Ora di chiusura'],
  ['{{LUOGO}}', 'Luogo'],
  ['{{MODALITA}}', 'Presenza/videoconferenza'],
  ['{{SESSIONE}}', 'Ordinaria/straordinaria'],
  ['{{PRESIDENTE}}', 'Presidente della seduta'],
  ['{{SEGRETARIO}}', 'Segretario'],
  ['{{PRESENTI}}', 'N. presenti'],
  ['{{AVENTI_DIRITTO}}', 'N. aventi diritto'],
  ['{{ODG}}', "Elenco punti dell'ordine del giorno"],
  ['{{DELIBERE}}', 'Blocco delle delibere con esiti'],
]

const ORGANO_OPZIONI = [
  ['', 'Qualsiasi organo'],
  ['assemblea', 'Assemblea dei soci'],
  ['cda', 'Consiglio di Amministrazione'],
  ['comitato', 'Comitato'],
  ['collegio_sindacale', 'Collegio Sindacale'],
]
const organoLabel = t => (ORGANO_OPZIONI.find(o => o[0] === (t || ''))?.[1]) || t

export default function ModelliVerbale() {
  const { azienda } = useApp()
  const [modelli, setModelli] = useState([])
  const [loading, setLoading] = useState(true)
  const [edit, setEdit] = useState(null)  // null | {} (nuovo) | {…} (esistente)

  const load = useCallback(async () => {
    if (!azienda?.id) return
    setLoading(true)
    const { data } = await supabase.from('verbale_template').select('*').eq('azienda_id', azienda.id).order('created_at')
    setModelli(data || [])
    setLoading(false)
  }, [azienda])

  useEffect(() => { load() }, [load])

  async function elimina(m) {
    if (!window.confirm(`Eliminare il modello "${m.nome}"?`)) return
    await supabase.from('verbale_template').delete().eq('id', m.id)
    load()
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Modelli di verbale</h2>
            <p>Facsimile riutilizzabili per <strong>{azienda?.nome}</strong>: incolla il tuo verbale tipo e inserisci i segnaposto</p>
          </div>
          <button className="btn btn-primary" onClick={() => setEdit({})}>+ Nuovo modello</button>
        </div>
      </div>

      {loading ? <div className="spinner" /> : modelli.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: 36 }}>📝</div>
            <p>Nessun modello. Crea il primo incollando un verbale che usi di solito (es. quello dell'anno scorso) e sostituendo le parti variabili con i segnaposto.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nome</th><th>Organo</th><th>Predefinito</th><th></th></tr></thead>
              <tbody>
                {modelli.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.nome}</td>
                    <td style={{ fontSize: 12, color: '#666' }}>{organoLabel(m.organo_tipo)}</td>
                    <td>{m.predefinito ? <span className="badge" style={{ background: '#E9F7EF', color: '#1E8449' }}>Predefinito</span> : <span style={{ color: '#bbb' }}>—</span>}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button className="btn btn-sm" onClick={() => setEdit(m)}>Modifica</button>
                        <button className="btn btn-sm btn-danger" onClick={() => elimina(m)}>Elimina</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {edit !== null && (
        <ModelloEditor azienda={azienda} modello={edit}
          onSaved={() => { setEdit(null); load() }} onClose={() => setEdit(null)} />
      )}
    </div>
  )
}

// ── Editor modello ────────────────────────────────────────────────────
function ModelloEditor({ azienda, modello, onSaved, onClose }) {
  const editing = !!modello?.id
  const [nome, setNome] = useState(modello?.nome || '')
  const [organoTipo, setOrganoTipo] = useState(modello?.organo_tipo || '')
  const [corpo, setCorpo] = useState(modello?.corpo_html || '')
  const [predefinito, setPredefinito] = useState(modello?.predefinito || false)
  const [saving, setSaving] = useState(false)
  const [errore, setErrore] = useState(null)
  const areaRef = React.useRef(null)

  // inserisce il segnaposto nel punto del cursore
  function inserisci(tag) {
    const el = areaRef.current
    if (!el) { setCorpo(c => c + tag); return }
    const start = el.selectionStart, end = el.selectionEnd
    setCorpo(c => c.slice(0, start) + tag + c.slice(end))
    setTimeout(() => { el.focus(); el.selectionStart = el.selectionEnd = start + tag.length }, 0)
  }

  async function salva() {
    if (!nome.trim()) { setErrore('Dai un nome al modello.'); return }
    setSaving(true); setErrore(null)
    // se questo diventa predefinito, tolgo il flag agli altri dello stesso organo_tipo
    if (predefinito) {
      await supabase.from('verbale_template').update({ predefinito: false })
        .eq('azienda_id', azienda.id).eq('organo_tipo', organoTipo || null)
    }
    const payload = { azienda_id: azienda.id, nome: nome.trim(), organo_tipo: organoTipo || null, corpo_html: corpo, predefinito }
    const { error } = editing
      ? await supabase.from('verbale_template').update(payload).eq('id', modello.id)
      : await supabase.from('verbale_template').insert(payload)
    setSaving(false)
    if (error) { setErrore(error.message); return }
    onSaved()
  }

  return (
    <div className="modal-overlay" onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300, padding: 16 }}>
      <div className="card" style={{ width: 760, maxWidth: '96%', margin: 0, maxHeight: '92vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div className="card-header">
          <span className="card-title">{editing ? 'Modifica modello' : 'Nuovo modello di verbale'}</span>
          <button className="btn btn-sm" onClick={onClose}>✕</button>
        </div>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 2, minWidth: 200 }}>
            <label className="form-label">Nome del modello *</label>
            <input className="form-control" value={nome} onChange={e => setNome(e.target.value)} placeholder="es. Assemblea ordinaria - approvazione bilancio" />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Organo</label>
            <select className="form-control" value={organoTipo} onChange={e => setOrganoTipo(e.target.value)}>
              {ORGANO_OPZIONI.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Segnaposto (clicca per inserirli nel punto del cursore)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 4 }}>
            {SEGNAPOSTI.map(([tag, desc]) => (
              <button key={tag} type="button" className="btn btn-sm" title={desc}
                style={{ fontFamily: 'monospace', fontSize: 11 }} onClick={() => inserisci(tag)}>{tag}</button>
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#999' }}>
            <strong>{'{{ODG}}'}</strong> inserisce l'elenco numerato dei punti; <strong>{'{{DELIBERE}}'}</strong> il blocco delle delibere con gli esiti dei voti.
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Testo del facsimile *</label>
          <textarea ref={areaRef} className="form-control" style={{ minHeight: 300, fontFamily: 'inherit', lineHeight: 1.6 }}
            value={corpo} onChange={e => setCorpo(e.target.value)}
            placeholder={`Incolla qui il tuo verbale tipo e sostituisci le parti variabili con i segnaposto. Esempio:\n\nVERBALE {{ORGANO}} N. {{NUMERO}}/{{ANNO}}\n{{AZIENDA}}\n\nL'anno {{ANNO}}, il giorno {{DATA}}, alle ore {{ORA_INIZIO}}, presso {{LUOGO}}, si è riunita l'assemblea per deliberare sul seguente ordine del giorno:\n{{ODG}}\n\nAssume la presidenza {{PRESIDENTE}}...`} />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
            <input type="checkbox" checked={predefinito} onChange={e => setPredefinito(e.target.checked)} />
            Usa come predefinito per questo tipo di organo
          </label>
        </div>

        {errore && <div className="alert alert-error" style={{ marginBottom: 12 }}>{errore}</div>}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" onClick={onClose}>Annulla</button>
          <button className="btn btn-primary" onClick={salva} disabled={saving}>{saving ? 'Salvataggio…' : 'Salva modello'}</button>
        </div>
      </div>
    </div>
  )
}
