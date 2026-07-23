import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'
import { getTier } from '../lib/constants'

const PRIORITA = ['Alta', 'Media', 'Bassa']
const STATI    = ['Aperto', 'In lavorazione', 'Completato', 'Scaduto']

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

function TicketModal({ ticket, aziendaId, rischi, membri, onSave, onClose }) {
  const editing = !!ticket?.id
  const [form, setForm] = useState({
    titolo:      ticket?.titolo || '',
    istruzioni:  ticket?.istruzioni || '',
    membro_id:   ticket?.membro_id || '',
    rischio_id:  ticket?.rischio_id || '',
    azione_id:   ticket?.azione_id || '',
    scadenza:    ticket?.scadenza || '',
    priorita:    ticket?.priorita || 'Media',
    stato:       ticket?.stato || 'Aperto',
  })
  const [inviaEmail, setInviaEmail] = useState(!editing)
  const [loading, setLoading]  = useState(false)
  const [error, setError]      = useState(null)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function save() {
    if (!form.titolo || !form.membro_id) {
      setError('Titolo e destinatario sono obbligatori')
      return
    }
    setLoading(true); setError(null)

    const payload = {
      ...form,
      azienda_id: aziendaId,
      membro_id:  form.membro_id || null,
      rischio_id: form.rischio_id || null,
      azione_id:  form.azione_id || null,
      scadenza:   form.scadenza || null,
    }

    let ticketId = ticket?.id
    if (editing) {
      const { error: err } = await supabase.from('ticket').update(payload).eq('id', ticketId)
      if (err) { setError(err.message); setLoading(false); return }
    } else {
      const { data, error: err } = await supabase.from('ticket').insert(payload).select().single()
      if (err) { setError(err.message); setLoading(false); return }
      ticketId = data.id
    }

    // Invia email se richiesto
    if (inviaEmail && ticketId) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        await fetch(`${process.env.REACT_APP_SUPABASE_URL}/functions/v1/invia-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.access_token}`,
          },
          body: JSON.stringify({ ticket_id: ticketId, tipo: 'assegnazione' }),
        })
      } catch (e) {
        console.warn('Email non inviata:', e)
      }
    }

    setLoading(false)
    onSave()
  }

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <h3 className="modal-title">{editing ? 'Modifica ticket' : 'Crea ticket'}</h3>
          <button className="btn btn-icon" onClick={onClose}>✕</button>
        </div>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="form-group">
          <label className="form-label">Titolo del task *</label>
          <input className="form-control" value={form.titolo} onChange={e => set('titolo', e.target.value)} placeholder="Es. Implementare backup 3-2-1 entro fine mese" />
        </div>

        <div className="form-group">
          <label className="form-label">Istruzioni operative</label>
          <textarea className="form-control" style={{ minHeight: 100 }} value={form.istruzioni} onChange={e => set('istruzioni', e.target.value)}
            placeholder="Descrivi nel dettaglio cosa deve fare il destinatario, come farlo e quali strumenti usare..." />
        </div>

        <div className="grid-2">
          <div className="form-group">
            <label className="form-label">Assegna a *</label>
            <select className="form-control" value={form.membro_id} onChange={e => set('membro_id', e.target.value)}>
              <option value="">Seleziona membro...</option>
              {membri.map(m => <option key={m.id} value={m.id}>{m.nome} {m.cognome} {m.ruolo ? `— ${m.ruolo}` : ''}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Rischio collegato</label>
            <select className="form-control" value={form.rischio_id} onChange={e => set('rischio_id', e.target.value)}>
              <option value="">Nessuno</option>
              {rischi.map(r => <option key={r.id} value={r.id}>{r.descrizione.substring(0, 50)}{r.descrizione.length > 50 ? '…' : ''}</option>)}
            </select>
          </div>
        </div>

        <div className="grid-3">
          <div className="form-group">
            <label className="form-label">Scadenza</label>
            <input className="form-control" type="date" value={form.scadenza} onChange={e => set('scadenza', e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Priorità</label>
            <select className="form-control" value={form.priorita} onChange={e => set('priorita', e.target.value)}>
              {PRIORITA.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Stato</label>
            <select className="form-control" value={form.stato} onChange={e => set('stato', e.target.value)}>
              {STATI.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 0', borderTop: '1px solid #EEE' }}>
          <input type="checkbox" id="inviaEmail" checked={inviaEmail} onChange={e => setInviaEmail(e.target.checked)} />
          <label htmlFor="inviaEmail" style={{ fontSize: 13, cursor: 'pointer' }}>
            📧 {editing ? 'Invia notifica email al destinatario' : 'Invia email di assegnazione al destinatario'}
          </label>
        </div>

        <div className="modal-footer">
          <button className="btn" onClick={onClose}>Annulla</button>
          <button className="btn btn-primary" onClick={save} disabled={loading}>
            {loading ? 'Salvataggio...' : editing ? 'Aggiorna' : 'Crea ticket'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function GestioneTicket() {
  const { azienda, profilo } = useApp()
  const [tickets, setTickets]   = useState([])
  const [rischi, setRischi]     = useState([])
  const [membri, setMembri]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(null)
  const [filterStato, setFilterStato]     = useState('')
  const [filterPriorita, setFilterPriorita] = useState('')
  const [filterMembro, setFilterMembro]   = useState('')
  const [delConfirm, setDelConfirm]       = useState(null)
  const [tab, setTab]           = useState('tutti') // tutti | miei

  const load = useCallback(async () => {
    setLoading(true)
    const [{ data: t }, { data: r }, { data: m }] = await Promise.all([
      supabase.from('ticket').select('*, membri(*), rischi(descrizione, probabilita, impatto)').eq('azienda_id', azienda.id).order('created_at', { ascending: false }),
      supabase.from('rischi').select('id, descrizione, probabilita, impatto').eq('azienda_id', azienda.id),
      supabase.from('membri').select('*').eq('azienda_id', azienda.id).order('cognome'),
    ])
    setTickets(t || [])
    setRischi(r || [])
    setMembri(m || [])
    setLoading(false)
  }, [azienda.id])

  useEffect(() => { load() }, [load])

  async function deleteTicket(id) {
    await supabase.from('ticket').delete().eq('id', id)
    setDelConfirm(null); load()
  }

  const filtered = tickets.filter(t => {
    if (tab === 'miei' && t.membri?.email !== profilo?.email) return false
    if (filterStato && t.stato !== filterStato) return false
    if (filterPriorita && t.priorita !== filterPriorita) return false
    if (filterMembro && t.membro_id !== filterMembro) return false
    return true
  })

  const aperti     = tickets.filter(t => t.stato === 'Aperto').length
  const inLav      = tickets.filter(t => t.stato === 'In lavorazione').length
  const completati = tickets.filter(t => t.stato === 'Completato').length
  const scaduti    = tickets.filter(t => t.stato === 'Scaduto').length

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Gestione Ticket</h2>
            <p>Task assegnati per la mitigazione dei rischi</p>
          </div>
          <button className="btn btn-primary" onClick={() => setModal({})}>+ Crea ticket</button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-num" style={{ color: '#1A3A5C' }}>{aperti}</div><div className="stat-label">Aperti</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#856404' }}>{inLav}</div><div className="stat-label">In lavorazione</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#27AE60' }}>{completati}</div><div className="stat-label">Completati</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#C0392B' }}>{scaduti}</div><div className="stat-label">Scaduti</div></div>
      </div>

      <div className="card">
        <div className="tabs" style={{ marginBottom: 16 }}>
          <div className={`tab${tab === 'tutti' ? ' active' : ''}`} onClick={() => setTab('tutti')}>Tutti i ticket</div>
          <div className={`tab${tab === 'miei' ? ' active' : ''}`} onClick={() => setTab('miei')}>I miei ticket</div>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <select className="form-control" style={{ maxWidth: 160 }} value={filterStato} onChange={e => setFilterStato(e.target.value)}>
            <option value="">Tutti gli stati</option>
            {STATI.map(s => <option key={s}>{s}</option>)}
          </select>
          <select className="form-control" style={{ maxWidth: 140 }} value={filterPriorita} onChange={e => setFilterPriorita(e.target.value)}>
            <option value="">Tutte le priorità</option>
            {PRIORITA.map(p => <option key={p}>{p}</option>)}
          </select>
          <select className="form-control" style={{ maxWidth: 200 }} value={filterMembro} onChange={e => setFilterMembro(e.target.value)}>
            <option value="">Tutti i membri</option>
            {membri.map(m => <option key={m.id} value={m.id}>{m.nome} {m.cognome}</option>)}
          </select>
          {(filterStato || filterPriorita || filterMembro) && (
            <button className="btn btn-sm" onClick={() => { setFilterStato(''); setFilterPriorita(''); setFilterMembro('') }}>✕ Reset</button>
          )}
        </div>

        {loading ? <div className="spinner" /> : filtered.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 36 }}>✅</div>
            <p>{tickets.length === 0 ? 'Nessun ticket creato. Clicca "+ Crea ticket" per iniziare.' : 'Nessun ticket corrisponde ai filtri.'}</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {filtered.map(t => {
              const sc = STATO_COLORS[t.stato] || STATO_COLORS['Aperto']
              const pc = PRIOR_COLORS[t.priorita] || PRIOR_COLORS['Media']
              const scadenzaDate = t.scadenza ? new Date(t.scadenza) : null
              const oggi = new Date()
              const giorniMancanti = scadenzaDate ? Math.ceil((scadenzaDate - oggi) / (1000 * 60 * 60 * 24)) : null
              const inScadenza = giorniMancanti !== null && giorniMancanti <= 3 && giorniMancanti >= 0 && t.stato !== 'Completato'

              return (
                <div key={t.id} style={{ border: `1px solid ${inScadenza ? '#FAC775' : '#E0E0E0'}`, borderRadius: 8, padding: '16px 20px', background: inScadenza ? '#FFFDF5' : 'white' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 6 }}>
                        <span style={{ fontWeight: 600, fontSize: 14 }}>{t.titolo}</span>
                        {inScadenza && <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 10, background: '#FAEEDA', color: '#854F0B' }}>⏰ Scade in {giorniMancanti} giorni</span>}
                      </div>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="badge" style={{ background: sc.bg, color: sc.color }}>{t.stato}</span>
                        <span className="badge" style={{ background: pc.bg, color: pc.color }}>{t.priorita}</span>
                        {t.membri && (
                          <span style={{ fontSize: 12, color: '#666' }}>
                            👤 {t.membri.nome} {t.membri.cognome}
                            {t.membri.ruolo && <span style={{ color: '#aaa' }}> — {t.membri.ruolo}</span>}
                          </span>
                        )}
                        {t.scadenza && (
                          <span style={{ fontSize: 12, color: '#666' }}>
                            📅 {new Date(t.scadenza).toLocaleDateString('it-IT')}
                          </span>
                        )}
                        {t.email_inviata && <span style={{ fontSize: 11, color: '#27AE60' }}>✓ Email inviata</span>}
                      </div>
                      {t.rischi && (
                        <div style={{ marginTop: 6, fontSize: 12, color: '#888' }}>
                          🔗 {t.rischi.descrizione.substring(0, 60)}{t.rischi.descrizione.length > 60 ? '…' : ''}
                          {t.rischi.probabilita && t.rischi.impatto && (() => {
                            const tier = getTier(t.rischi.probabilita, t.rischi.impatto)
                            return <span className="badge" style={{ background: tier.bg, color: tier.color, marginLeft: 6, fontSize: 10 }}>{tier.tier}</span>
                          })()}
                        </div>
                      )}
                      {t.note_membro && (
                        <div style={{ marginTop: 8, padding: '8px 12px', background: '#F7F8FA', borderRadius: 6, fontSize: 12, color: '#555' }}>
                          💬 <strong>Note del membro:</strong> {t.note_membro}
                        </div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button className="btn btn-sm btn-icon" onClick={() => setModal(t)}>✏️</button>
                      <button className="btn btn-sm btn-icon btn-danger" onClick={() => setDelConfirm(t)}>🗑️</button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {modal !== null && (
        <TicketModal
          ticket={modal}
          aziendaId={azienda.id}
          rischi={rischi}
          membri={membri}
          onSave={() => { setModal(null); load() }}
          onClose={() => setModal(null)}
        />
      )}

      {delConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <h3 className="modal-title" style={{ marginBottom: 12 }}>Elimina ticket</h3>
            <p style={{ fontSize: 14, color: '#555' }}>Vuoi eliminare il ticket "<strong>{delConfirm.titolo}</strong>"?</p>
            <div className="modal-footer">
              <button className="btn" onClick={() => setDelConfirm(null)}>Annulla</button>
              <button className="btn btn-danger" onClick={() => deleteTicket(delConfirm.id)}>Elimina</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
