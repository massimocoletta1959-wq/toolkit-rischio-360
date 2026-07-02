import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'
import { getTier, STRATEGIA_OPTIONS, STATO_OPTIONS } from '../lib/constants'

const STATO_COLORS = {
  'Pianificato': { bg: '#F1EFE8', color: '#5F5E5A' },
  'In corso':    { bg: '#D6E8F7', color: '#1A3A5C' },
  'Completato':  { bg: '#D5F5E3', color: '#155724' },
  'Da rivedere': { bg: '#FADBD8', color: '#C0392B' },
}

// Azioni di mitigazione suggerite — estratte dal Piano d'Azione del Toolkit Rischio 360°.
// Chiave: descrizione esatta del rischio nel Registro. Precompila il modal, resta modificabile.
const AZIONI_SUGGERITE = {
  'Violazione dei dati personali (GDPR)': {
    azione: 'Eseguire un audit GDPR completo (mappatura trattamenti, verifica DPA con fornitori, aggiornamento informative). Nominare o verificare il DPO. Implementare registro dei trattamenti ex art. 30 GDPR.',
    responsabile: 'Resp. Compliance / Legale', scadenza: '60 giorni', strategia: 'Ridurre',
  },
  'Vulnerabilità software non aggiornato': {
    azione: 'Inventariare tutti i software aziendali e definire una patch policy mensile. Attivare aggiornamenti automatici. Eseguire vulnerability scan semestrale.',
    responsabile: 'Responsabile IT', scadenza: '30 giorni', strategia: 'Ridurre',
  },
  'Interruzione del provider di hosting/cloud': {
    azione: 'Definire strategia multi-cloud o hot-standby su provider secondario. Documentare RTO e RPO. Testare il failover annualmente.',
    responsabile: 'Responsabile IT', scadenza: '90 giorni', strategia: 'Ridurre',
  },
  'Cambio di leadership o uscita di figure chiave': {
    azione: 'Avviare succession planning: identificare ruoli critici, designare backup per ogni C-level. Inserire clausole retention nei contratti manager.',
    responsabile: 'HR / CEO', scadenza: '90 giorni', strategia: 'Ridurre',
  },
  'Carenza di personale qualificato': {
    azione: 'Attivare partnership con ITS e università. Piano di formazione e upskilling interno. Benchmark retributivo annuale.',
    responsabile: 'HR / Direzione', scadenza: '60 giorni', strategia: 'Ridurre',
  },
  'Non conformita GDPR / privacy': {
    azione: 'Audit GDPR (vedi azione GDPR). Formare il personale sulla gestione dati personali. Aggiornare clausole contrattuali con clienti e fornitori.',
    responsabile: 'Resp. Compliance', scadenza: '60 giorni', strategia: 'Ridurre',
  },
  'Violazione normativa sicurezza sul lavoro (D.Lgs 81/08)': {
    azione: 'Aggiornare DVR. Verificare scadenze formazione obbligatoria. Sopralluogo RSPP. Verifica DPI.',
    responsabile: 'RSPP / HR', scadenza: '45 giorni', strategia: 'Ridurre',
  },
  'Mancanza di piani di continuita documentati': {
    azione: 'Redigere BCP minimo: processi critici, procedure emergenza, responsabile BCP, drill annuale. Riferimento: ISO 22301.',
    responsabile: 'COO / Dir. Operativa', scadenza: '120 giorni', strategia: 'Ridurre',
  },
  'Attacco ransomware ai sistemi gestionali': {
    azione: 'Implementare EDR su tutti i dispositivi. Attivare MFA su VPN, email e gestionali. Formazione anti-phishing (simulazione annuale).',
    responsabile: 'Responsabile IT', scadenza: '45 giorni', strategia: 'Ridurre',
  },
  'Mancanza di backup aggiornati': {
    azione: 'Backup 3-2-1 (3 copie, 2 supporti, 1 offsite). Backup giornalieri automatici con verifica integrità. Test ripristino trimestrale.',
    responsabile: 'Responsabile IT', scadenza: '14 giorni', strategia: 'Ridurre',
  },
  'Perdita di un cliente chiave (>20% fatturato)': {
    azione: 'Piano diversificazione clienti: obiettivo <15% per singolo cliente entro 12 mesi. QBR sistematici con top client.',
    responsabile: 'Dir. Commerciale', scadenza: '30 giorni', strategia: 'Ridurre',
  },
  'Perdita di know-how per turnover elevato': {
    azione: 'Knowledge management: documentare processi chiave, wiki interna, affiancamenti strutturati. Monitorare turnover mensile come KPI HR.',
    responsabile: 'HR / Resp. funzione', scadenza: '60 giorni', strategia: 'Ridurre',
  },
  'Gestione comunicazione di crisi inadeguata': {
    azione: 'Crisis Communication Plan: portavoce, messaggi chiave per scenari tipici, approvazioni. Tabletop exercise annuale.',
    responsabile: 'Marketing / Direzione', scadenza: '60 giorni', strategia: 'Ridurre',
  },
  'Crisi di liquidita a breve termine': {
    azione: 'Cash flow forecast settimanale a 13 settimane. Linea di credito revolving con banca principale. Soglie di alert sulla liquidità.',
    responsabile: 'CFO / Amm.', scadenza: '30 giorni', strategia: 'Ridurre',
  },
  'Insolvenza di clienti importanti': {
    azione: 'Credit scoring per clienti >5% fatturato. Assicurazione crediti (SACE/Euler Hermes). Monitoraggio puntualità pagamenti mensile.',
    responsabile: 'CFO / Amm.', scadenza: '45 giorni', strategia: 'Trasferire',
  },
  'Difficolta di accesso al credito bancario': {
    azione: 'Dossier finanziario aggiornato. Diversificare fonti: Confidi, finanza agevolata, factoring. Relazione con almeno 2 istituti.',
    responsabile: 'CFO / Direzione', scadenza: '60 giorni', strategia: 'Ridurre',
  },
}

function AzioneModal({ azione, rischio, aziendaId, onSave, onClose }) {
  const editing = !!azione?.id
  const suggerita = !editing ? AZIONI_SUGGERITE[rischio?.descrizione] : null
  const [form, setForm] = useState({
    azione:       azione?.azione || suggerita?.azione || '',
    responsabile: azione?.responsabile || suggerita?.responsabile || '',
    scadenza:     azione?.scadenza || suggerita?.scadenza || '',
    strategia:    azione?.strategia || suggerita?.strategia || 'Ridurre',
    stato:        azione?.stato || 'Pianificato',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))
  async function save() {
    if (!form.azione) { setError('Descrivi l\'azione di mitigazione'); return }
    setLoading(true); setError(null)
    const payload = { ...form, rischio_id: rischio.id, azienda_id: aziendaId }
    const { error: err } = editing
      ? await supabase.from('azioni').update(payload).eq('id', azione.id)
      : await supabase.from('azioni').insert(payload)
    if (err) { setError(err.message); setLoading(false); return }
    onSave()
  }
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <h3 className="modal-title">{editing ? 'Modifica azione' : 'Nuova azione'}</h3>
          <button className="btn btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ background: '#F7F8FA', borderRadius: 6, padding: '8px 12px', marginBottom: 16, fontSize: 13, color: '#555' }}>
          Rischio: <strong>{rischio.descrizione}</strong>
          {rischio.probabilita && rischio.impatto && (() => {
            const t = getTier(rischio.probabilita, rischio.impatto)
            return <span className="badge" style={{ background: t.bg, color: t.color, marginLeft: 8 }}>{t.tier}</span>
          })()}
        </div>
        {!editing && suggerita && (
          <div style={{ background: '#EBF4FC', borderRadius: 6, padding: '8px 12px', marginBottom: 16, fontSize: 12, color: '#1A3A5C' }}>
            💡 Campi precompilati con l'azione suggerita dal Toolkit Rischio 360° — modificali pure liberamente.
          </div>
        )}
        {error && <div className="alert alert-error">{error}</div>}
        <div className="form-group">
          <label className="form-label">Azione di mitigazione *</label>
          <textarea className="form-control" value={form.azione} onChange={e => set('azione', e.target.value)} placeholder="Descrivi l'azione concreta da intraprendere..." />
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Responsabile</label>
            <input className="form-control" value={form.responsabile} onChange={e => set('responsabile', e.target.value)} placeholder="Es. Responsabile IT" />
          </div>
          <div className="form-group">
            <label className="form-label">Scadenza</label>
            <input className="form-control" value={form.scadenza} onChange={e => set('scadenza', e.target.value)} placeholder="Es. 30 giorni / 31/12/2025" />
          </div>
        </div>
        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Strategia</label>
            <select className="form-control" value={form.strategia} onChange={e => set('strategia', e.target.value)}>
              {STRATEGIA_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Stato</label>
            <select className="form-control" value={form.stato} onChange={e => set('stato', e.target.value)}>
              {STATO_OPTIONS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Annulla</button>
          <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? 'Salvataggio...' : 'Salva'}</button>
        </div>
      </div>
    </div>
  )
}
export default function PianoAzione() {
  const { azienda } = useApp()
  const [rischi, setRischi]   = useState([])
  const [azioni, setAzioni]   = useState({}) // rischio_id → [azioni]
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState(null) // { rischio, azione? }
  const [filterTier, setFilterTier] = useState('12') // 12 = Tier1+2 default
  const [delConfirm, setDelConfirm] = useState(null)
  const load = useCallback(async () => {
    setLoading(true)
    const { data: r } = await supabase.from('rischi').select('*').eq('azienda_id', azienda.id).order('created_at')
    const { data: a } = await supabase.from('azioni').select('*').eq('azienda_id', azienda.id)
    const aMap = {}
    ;(a || []).forEach(az => { if (!aMap[az.rischio_id]) aMap[az.rischio_id] = []; aMap[az.rischio_id].push(az) })
    setRischi(r || [])
    setAzioni(aMap)
    setLoading(false)
  }, [azienda.id])
  useEffect(() => { load() }, [load])
  async function deleteAzione(id) {
    await supabase.from('azioni').delete().eq('id', id)
    setDelConfirm(null); load()
  }
  const rischiFiltered = rischi.filter(r => {
    if (!r.probabilita || !r.impatto) return false
    const t = getTier(r.probabilita, r.impatto)
    if (filterTier === '12') return t.tier === 'Tier 1' || t.tier === 'Tier 2'
    if (filterTier === '1')  return t.tier === 'Tier 1'
    if (filterTier === '2')  return t.tier === 'Tier 2'
    return true
  }).sort((a, b) => {
    const ta = getTier(a.probabilita, a.impatto)
    const tb = getTier(b.probabilita, b.impatto)
    return ta.score !== tb.score ? tb.score - ta.score : a.descrizione.localeCompare(b.descrizione)
  })
  const totAzioni = Object.values(azioni).flat().length
  const completate = Object.values(azioni).flat().filter(a => a.stato === 'Completato').length
  return (
    <div>
      <div className="page-header">
        <h2>Piano d'Azione</h2>
        <p>Azioni di mitigazione per i rischi prioritari — si aggiorna automaticamente dal Registro</p>
      </div>
      <div className="stats-grid">
        <div className="stat-card"><div className="stat-num">{rischiFiltered.length}</div><div className="stat-label">Rischi in piano</div></div>
        <div className="stat-card"><div className="stat-num">{totAzioni}</div><div className="stat-label">Azioni totali</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#27AE60' }}>{completate}</div><div className="stat-label">Completate</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#E67E22' }}>{totAzioni - completate}</div><div className="stat-label">Da completare</div></div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['12','Tier 1 + 2'], ['1','Solo Tier 1'], ['2','Solo Tier 2'], ['all','Tutti']].map(([v, l]) => (
          <button key={v} className={`btn btn-sm${filterTier === v ? ' btn-primary' : ''}`} onClick={() => setFilterTier(v)}>{l}</button>
        ))}
      </div>
      {loading ? <div className="spinner" /> : rischiFiltered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: 36 }}>✅</div>
            <p>Nessun rischio {filterTier !== 'all' ? 'Tier 1/2 ' : ''}trovato. Aggiungi rischi con probabilità e impatto nel Registro.</p>
          </div>
        </div>
      ) : rischiFiltered.map(r => {
        const t = getTier(r.probabilita, r.impatto)
        const az = azioni[r.id] || []
        return (
          <div key={r.id} className="card" style={{ borderLeft: `4px solid ${t.color}` }}>
            <div className="card-header" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                <span className="badge" style={{ background: t.bg, color: t.color, flexShrink: 0 }}>{t.tier}</span>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{r.descrizione}</span>
                <span style={{ color: '#aaa', fontSize: 12, flexShrink: 0 }}>P:{r.probabilita} × I:{r.impatto} = {t.score}</span>
              </div>
              <button className="btn btn-sm btn-primary" style={{ flexShrink: 0 }} onClick={() => setModal({ rischio: r })}>+ Azione</button>
            </div>
            {az.length === 0 ? (
              <div style={{ color: '#aaa', fontSize: 13, fontStyle: 'italic', padding: '8px 0' }}>
                Nessuna azione definita — clicca "+ Azione" per aggiungerne una.
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: '#F7F8FA' }}>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 11 }}>Azione</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 11 }}>Responsabile</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 11 }}>Scadenza</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 11 }}>Strategia</th>
                    <th style={{ padding: '6px 10px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 11 }}>Stato</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {az.map(a => {
                    const sc = STATO_COLORS[a.stato] || STATO_COLORS['Pianificato']
                    return (
                      <tr key={a.id} style={{ borderTop: '1px solid #F0F0F0' }}>
                        <td style={{ padding: '8px 10px', maxWidth: 280 }}>{a.azione}</td>
                        <td style={{ padding: '8px 10px', color: '#555' }}>{a.responsabile || '—'}</td>
                        <td style={{ padding: '8px 10px', color: '#2B5FA5', fontWeight: 600 }}>{a.scadenza || '—'}</td>
                        <td style={{ padding: '8px 10px' }}><span style={{ fontSize: 12, color: '#856404' }}>{a.strategia}</span></td>
                        <td style={{ padding: '8px 10px' }}><span className="badge" style={{ background: sc.bg, color: sc.color }}>{a.stato}</span></td>
                        <td style={{ padding: '8px 6px' }}>
                          <div style={{ display: 'flex', gap: 3 }}>
                            <button className="btn btn-sm btn-icon" onClick={() => setModal({ rischio: r, azione: a })}>✏️</button>
                            <button className="btn btn-sm btn-icon btn-danger" onClick={() => setDelConfirm(a)}>🗑️</button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        )
      })}
      {modal && (
        <AzioneModal
          azione={modal.azione}
          rischio={modal.rischio}
          aziendaId={azienda.id}
          onSave={() => { setModal(null); load() }}
          onClose={() => setModal(null)}
        />
      )}
      {delConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <h3 className="modal-title" style={{ marginBottom: 12 }}>Elimina azione</h3>
            <p style={{ fontSize: 14, color: '#555' }}>Confermi l'eliminazione di questa azione?</p>
            <div className="modal-footer">
              <button className="btn" onClick={() => setDelConfirm(null)}>Annulla</button>
              <button className="btn btn-danger" onClick={() => deleteAzione(delConfirm.id)}>Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
