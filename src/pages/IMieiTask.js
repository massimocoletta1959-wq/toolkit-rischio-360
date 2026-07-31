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

function AggiornaModal({ ticket, autore, onSave, onClose }) {
  const [stato, setStato] = useState(ticket.stato)
  const [note, setNote]   = useState('')
  const [loading, setLoading] = useState(false)

  async function save() {
    setLoading(true)
    await supabase.from('ticket').update({ stato }).eq('id', ticket.id)
    if (stato !== ticket.stato) {
      await supabase.from('ticket_note').insert({
        ticket_id: ticket.id, autore, ruolo: 'sistema',
        testo: 'Stato: ' + ticket.stato + ' → ' + stato,
      })
    }
    if (note.trim()) {
      await supabase.from('ticket_note').insert({
        ticket_id: ticket.id, autore, ruolo: 'membro',
        testo: note.trim(), stato_al_momento: stato,
      })
    }
    setLoading(false); onSave()
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
          {ticket.aziende && <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>— {ticket.aziende.nome}</span>}
        </div>
        <div className="form-group">
          <label className="form-label">Stato</label>
          <select className="form-control" value={stato} onChange={e => setStato(e.target.value)}>
            {['Aperto','In lavorazione','Completato','Scaduto'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Aggiungi una nota (resta nello storico del ticket)</label>
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

function TicketCard({ t, onAggiorna }) {
  const sc = STATO_COLORS[t.stato] || STATO_COLORS['Aperto']
  const pc = PRIOR_COLORS[t.priorita] || PRIOR_COLORS['Media']
  const scadenzaDate = t.scadenza ? new Date(t.scadenza) : null
  const oggi = new Date()
  const giorniMancanti = scadenzaDate ? Math.ceil((scadenzaDate - oggi) / (1000*60*60*24)) : null
  const inScadenza = giorniMancanti !== null && giorniMancanti <= 3 && giorniMancanti >= 0 && t.stato !== 'Completato'

  return (
    <div className="card" style={{ borderLeft: `4px solid ${sc.color}`, marginBottom: 0, background: inScadenza ? '#FFFDF5' : 'white' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
            <span style={{ fontWeight: 700, fontSize: 15 }}>{t.titolo}</span>
            {inScadenza && <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 10, background: '#FAEEDA', color: '#854F0B' }}>⏰ Scade in {giorniMancanti} giorni</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
            <span className="badge" style={{ background: sc.bg, color: sc.color }}>{t.stato}</span>
            <span className="badge" style={{ background: pc.bg, color: pc.color }}>{t.priorita}</span>
            {t.scadenza && <span style={{ fontSize: 12, color: '#666' }}>📅 {new Date(t.scadenza).toLocaleDateString('it-IT')}</span>}
            {t.created_at && <span style={{ fontSize: 12, color: '#999' }}>🕓 Creato il {new Date(t.created_at).toLocaleDateString('it-IT')}</span>}
          </div>
          {t.rischi && <div style={{ fontSize: 12, color: '#888', marginBottom: 8 }}>🔗 {t.rischi.descrizione}</div>}
          {t.istruzioni && (
            <div style={{ background: '#F7F8FA', borderRadius: 6, padding: '10px 14px', fontSize: 13, color: '#444', lineHeight: 1.6, marginBottom: 8 }}>
              <strong style={{ fontSize: 11, color: '#888', display: 'block', marginBottom: 4 }}>ISTRUZIONI</strong>
              {t.istruzioni}
            </div>
          )}
          {((t.ticket_note && t.ticket_note.length > 0) || t.note_membro) && (
            <div style={{ background: '#E8F4FD', borderRadius: 6, padding: '8px 14px', fontSize: 12, color: '#2B5FA5' }}>
              <strong style={{ fontSize: 11, display: 'block', marginBottom: 4 }}>💬 STORICO AGGIORNAMENTI</strong>
              {[...(t.ticket_note || [])].sort((a, b) => new Date(a.created_at) - new Date(b.created_at)).map(n => (
                <div key={n.id} style={{ marginBottom: 3, lineHeight: 1.5, fontStyle: n.ruolo === 'sistema' ? 'italic' : 'normal', opacity: n.ruolo === 'sistema' ? 0.75 : 1 }}>
                  <span style={{ color: '#7A9CC4' }}>{new Date(n.created_at).toLocaleDateString('it-IT')} {new Date(n.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}</span> — {n.ruolo === 'sistema' ? '🔄 ' : n.ruolo === 'consulente' ? <strong>👔 {n.autore}: </strong> : ''}{n.testo}
                </div>
              ))}
              {(!t.ticket_note || t.ticket_note.length === 0) && t.note_membro && <div>{t.note_membro}</div>}
            </div>
          )}
        </div>
        <button className="btn btn-sm btn-primary" style={{ flexShrink: 0 }} onClick={() => onAggiorna(t)} disabled={t.stato === 'Completato'}>
          {t.stato === 'Completato' ? '✓ Fatto' : 'Aggiorna'}
        </button>
      </div>
    </div>
  )
}

export default function IMieiTask() {
  const { profilo, session } = useApp()
  const [tickets, setTickets]       = useState([])
  const [aziendeFiltro, setAziendeFiltro] = useState([]) // aziende disponibili
  const [aziendaSelezionata, setAziendaSelezionata] = useState('tutte')
  const [loading, setLoading]       = useState(true)
  const [modal, setModal]           = useState(null)
  const [filterStato, setFilterStato] = useState('')
  const [filterCategoria, setFilterCategoria] = useState('')

  const load = useCallback(async () => {
    setLoading(true)

    // Trova tutti i record membri collegati a questo utente (per user_id O per email)
    const { data: membriUtente } = await supabase
      .from('membri').select('id, azienda_id, user_id')
      .or('user_id.eq.' + session.user.id + ',email.eq.' + session.user.email)

    let membroIds = []
    if (membriUtente && membriUtente.length > 0) {
      membroIds = membriUtente.map(m => m.id)
      // Auto-aggancio: collega l'account ai record trovati solo via email
      const daAgganciare = membriUtente.filter(m => !m.user_id).map(m => m.id)
      if (daAgganciare.length > 0) {
        await supabase.from('membri').update({ user_id: session.user.id }).in('id', daAgganciare)
      }
    } else {
      // Fallback: usa membro_id dal profilo
      const { data: prof } = await supabase
        .from('profili').select('membro_id').eq('id', profilo.id).single()
      if (prof?.membro_id) membroIds = [prof.membro_id]
    }

    if (membroIds.length === 0) { setTickets([]); setLoading(false); return }

    const { data } = await supabase
      .from('ticket')
      .select('*, rischi(descrizione, categoria), aziende(nome, id), ticket_note(id, autore, ruolo, testo, created_at)')
      .in('membro_id', membroIds)
      .order('scadenza', { ascending: true, nullsLast: true })

    const allTickets = data || []
    setTickets(allTickets)

    // Estrai aziende uniche
    const azUniche = []
    const azIds = new Set()
    allTickets.forEach(t => {
      if (t.aziende && !azIds.has(t.aziende.id)) {
        azIds.add(t.aziende.id)
        azUniche.push(t.aziende)
      }
    })
    setAziendeFiltro(azUniche)
    setLoading(false)
  }, [profilo.id, session.user.id])

  useEffect(() => { load() }, [load])

  // Filtra per azienda e stato
  const filtered = tickets.filter(t => {
    if (aziendaSelezionata !== 'tutte' && t.aziende?.id !== aziendaSelezionata) return false
    if (filterStato && t.stato !== filterStato) return false
    if (filterCategoria && t.rischi?.categoria !== filterCategoria) return false
    return true
  })

  const aperti     = tickets.filter(t => t.stato === 'Aperto').length
  const inLav      = tickets.filter(t => t.stato === 'In lavorazione').length
  const completati = tickets.filter(t => t.stato === 'Completato').length
  const multiAz    = aziendeFiltro.length > 1

  return (
    <div>
      <div className="page-header">
        <h2>I miei task</h2>
        <p>Tutti i task assegnati a te{multiAz ? ` — ${aziendeFiltro.length} aziende` : ''}</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-num">{tickets.length}</div><div className="stat-label">Totali</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#1A3A5C' }}>{aperti}</div><div className="stat-label">Da fare</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#856404' }}>{inLav}</div><div className="stat-label">In lavorazione</div></div>
        <div className="stat-card"><div className="stat-num" style={{ color: '#27AE60' }}>{completati}</div><div className="stat-label">Completati</div></div>
      </div>

      {/* Filtri */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {/* Selezione azienda — solo se multi-azienda */}
        {multiAz && (
          <select className="form-control" style={{ maxWidth: 220 }} value={aziendaSelezionata} onChange={e => setAziendaSelezionata(e.target.value)}>
            <option value="tutte">🏢 Tutte le aziende</option>
            {aziendeFiltro.map(az => (
              <option key={az.id} value={az.id}>{az.nome}</option>
            ))}
          </select>
        )}
        {[['','Tutti'],['Aperto','Da fare'],['In lavorazione','In lavorazione'],['Completato','Completati']].map(([v,l]) => (
          <button key={v} className={`btn btn-sm${filterStato === v ? ' btn-primary' : ''}`} onClick={() => setFilterStato(v)}>{l}</button>
        ))}
        <select className="form-control" style={{ maxWidth: 220 }} value={filterCategoria} onChange={e => setFilterCategoria(e.target.value)}>
          <option value="">Tutte le categorie rischio</option>
          {[...new Set(tickets.map(t => t.rischi?.categoria).filter(Boolean))].sort().map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        {filterCategoria && <button className="btn btn-sm" onClick={() => setFilterCategoria('')}>✕</button>}
      </div>

      {loading ? <div className="spinner" /> : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: 36 }}>✅</div>
            <p>{tickets.length === 0 ? 'Nessun task assegnato al momento.' : 'Nessun task con questo filtro.'}</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {/* Se tutte le aziende, mostra header azienda */}
          {aziendaSelezionata === 'tutte' && multiAz ? (
            Object.entries(
              filtered.reduce((acc, t) => {
                const nome = t.aziende?.nome || 'Sconosciuta'
                if (!acc[nome]) acc[nome] = []
                acc[nome].push(t)
                return acc
              }, {})
            ).map(([nomeAz, tasks]) => (
              <div key={nomeAz} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#1A3A5C' }}>🏢 {nomeAz}</span>
                  <span style={{ fontSize: 12, color: '#888', background: '#F0F0F0', padding: '2px 8px', borderRadius: 10 }}>{tasks.length} task</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {tasks.map(t => <TicketCard key={t.id} t={t} onAggiorna={setModal} />)}
                </div>
              </div>
            ))
          ) : (
            filtered.map(t => <TicketCard key={t.id} t={t} onAggiorna={setModal} />)
          )}
        </div>
      )}

      {modal && (
        <AggiornaModal ticket={modal} autore={profilo?.nome || session.user.email} onSave={() => { setModal(null); load() }} onClose={() => setModal(null)} />
      )}
    </div>
  )
}
