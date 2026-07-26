import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

const STATO_COLORS = {
  'Aperto':        { bg: '#E6F1FB', color: '#1A3A5C' },
  'In lavorazione':{ bg: '#FEF9E7', color: '#856404' },
  'Completato':    { bg: '#D5F5E3', color: '#155724' },
  'Scaduto':       { bg: '#FADBD8', color: '#C0392B' },
}

const PRIOR_COLORS = {
  'Alta':  { bg: '#FADBD8', color: '#C0392B' },
  'Media': { bg: '#FDEBD0', color: '#E67E22' },
  'Bassa': { bg: '#D5F5E3', color: '#27AE60' },
}

function AggiornaModal({ ticket, onSave, onClose }) {
  const [stato, setStato]       = useState(ticket.stato)
  const [note, setNote]         = useState(ticket.note_membro || '')
  const [loading, setLoading]   = useState(false)

  async function save() {
    setLoading(true)
    await supabase.from('ticket').update({ stato, note_membro: note }).eq('id', ticket.id)
    setLoading(false)
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h3 className="modal-title">Aggiorna task</h3>
          <button className="btn btn-icon" onClick={onClose}>✕</button>
        </div>
        <div style={{ background: '#F7F8FA', borderRadius: 6, padding: '10px 14px', marginBottom: 16, fontSize: 13 }}>
          <strong>{ticket.titolo}</strong>
        </div>
        <div className="form-group">
          <label className="form-label">Stato</label>
          <select className="form-control" value={stato} onChange={e => setStato(e.target.value)}>
            {['Aperto','In lavorazione','Completato','Scaduto'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Note / Aggiornamenti</label>
          <textarea className="form-control" value={note} onChange={e => setNote(e.target.value)}
            placeholder="Descrivi l'avanzamento, eventuali problemi o aggiornamenti..." />
        </div>
        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Annulla</button>
          <button className="btn btn-primary" onClick={save} disabled={loading}>{loading ? 'Salvataggio...' : 'Aggiorna'}</button>
        </div>
      </div>
    </div>
  )
}

export default function IMieiTask() {
  const { profilo } = useApp()
  const [tickets, setTickets]   = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
  const [filterStato, setFilterStato] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    // Carica i ticket assegnati al membro collegato a questo utente
    const { data: prof } = await supabase
      .from('profili').select('membro_id').eq('id', profilo.id).single()

    if (!prof?.membro_id) { setTickets([]); setLoading(false); return }

    const { data } = await supabase
      .from('ticket')
      .select('*, rischi(descrizione, categoria), aziende(nome)')
      .eq('membro_id', prof.membro_id)
      .order('created_at', { ascending: false })

    setTickets(data || [])
    setLoading(false)
  }, [profilo.id])

  useEffect(() => { load() }, [load])

  const filtered = tickets.filter(t => !filterStato || t.stato === filterStato)
  const aperti     = tickets.filter(t => t.stato === 'Aperto').length
  const inLav      = tickets.filter(t => t.stato === 'In lavorazione').length
  const completati = tickets.filter(t => t.stato === 'Completato').length

  return (
    <div>
      <div className="page-header">
        <h2>I miei task</h2>
        <p>Task assegnati a te — aggiorna lo stato e lascia note per il responsabile</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-num" style={{ color: '#1A3A5C' }}>{aperti}</div><div className="stat-label">Da fare</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#856404' }}>{inLav}</div><div className="stat-label">In lavorazione</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#27AE60' }}>{completati}</div><div className="stat-label">Completati</div></div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['','Tutti'],['Aperto','Da fare'],['In lavorazione','In lavorazione'],['Completato','Completati']].map(([v,l]) => (
          <button key={v} className={`btn btn-sm${filterStato === v ? ' btn-primary' : ''}`} onClick={() => setFilterStato(v)}>{l}</button>
        ))}
      </div>

      {loading ? <div className="spinner" /> : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: 36 }}>✅</div>
            <p>{tickets.length === 0 ? 'Nessun task assegnato al momento.' : 'Nessun task con questo filtro.'}</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {filtered.map(t => {
            const sc = STATO_COLORS[t.stato] || STATO_COLORS['Aperto']
            const pc = PRIOR_COLORS[t.priorita] || PRIOR_COLORS['Media']
            const scadenzaDate = t.scadenza ? new Date(t.scadenza) : null
            const oggi = new Date()
            const giorniMancanti = scadenzaDate ? Math.ceil((scadenzaDate - oggi) / (1000*60*60*24)) : null
            const inScadenza = giorniMancanti !== null && giorniMancanti <= 3 && giorniMancanti >= 0 && t.stato !== 'Completato'

            return (
              <div key={t.id} className="card" style={{ borderLeft: `4px solid ${sc.color}`, marginBottom: 0, background: inScadenza ? '#FFFDF5' : 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: 15 }}>{t.titolo}</span>
                      {inScadenza && <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 10, background: '#FAEEDA', color: '#854F0B' }}>⏰ Scade in {giorniMancanti} giorni</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
                      <span className="badge" style={{ background: sc.bg, color: sc.color }}>{t.stato}</span>
                      <span className="badge" style={{ background: pc.bg, color: pc.color }}>{t.priorita}</span>
                      {t.scadenza && <span style={{ fontSize: 12, color: '#666' }}>📅 Scadenza: {new Date(t.scadenza).toLocaleDateString('it-IT')}</span>}
                      {t.aziende && <span style={{ fontSize: 12, color: '#888' }}>🏢 {t.aziende.nome}</span>}
                    </div>
                    {t.rischi && (
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>
                        🔗 Rischio: {t.rischi.descrizione}
                      </div>
                    )}
                    {t.istruzioni && (
                      <div style={{ background: '#F7F8FA', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#444', lineHeight: 1.6, marginBottom: 8 }}>
                        <strong style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>ISTRUZIONI</strong>
                        {t.istruzioni}
                      </div>
                    )}
                    {t.note_membro && (
                      <div style={{ background: '#E8F4FD', borderRadius: 6, padding: '8px 14px', fontSize: 12, color: '#2B5FA5' }}>
                        💬 <strong>Tue note:</strong> {t.note_membro}
                      </div>
                    )}
                  </div>
                  <button
                    className="btn btn-sm btn-primary"
                    style={{ flexShrink: 0 }}
                    onClick={() => setModal(t)}
                    disabled={t.stato === 'Completato'}
                  >
                    {t.stato === 'Completato' ? '✓ Completato' : 'Aggiorna'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <AggiornaModal ticket={modal} onSave={() => { setModal(null); load() }} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
