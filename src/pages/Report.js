import React, { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'
import { getTier } from '../lib/constants'

const STATI = ['Tutti', 'Aperto', 'In lavorazione', 'Completato', 'Scaduto']
const PRIORITA = ['Tutte', 'Alta', 'Media', 'Bassa']

const STATO_COLORS = {
  'Aperto':         { bg: '#E6F1FB', color: '#1A3A5C' },
  'In lavorazione': { bg: '#FEF9E7', color: '#856404' },
  'Completato':     { bg: '#D5F5E3', color: '#155724' },
  'Scaduto':        { bg: '#FADBD8', color: '#C0392B' },
}

export default function Report() {
  const { azienda } = useApp()
  const [tickets, setTickets]   = useState([])
  const [membri, setMembri]     = useState([])
  const [loading, setLoading]   = useState(true)
  const [mostraAnteprima, setMostraAnteprima] = useState(false)
  const printRef = useRef()

  // Filtri
  const [filtroStato, setFiltroStato]       = useState('Tutti')
  const [filtroMembro, setFiltroMembro]     = useState('Tutti')
  const [filtroPriorita, setFiltroPriorita] = useState('Tutte')
  const [filtroDataDa, setFiltroDataDa]     = useState('')
  const [filtroDataA, setFiltroDataA]       = useState('')
  const [raggruppa, setRaggruppa]           = useState('membro') // membro | stato | priorita

  useEffect(() => {
    async function load() {
      setLoading(true)
      const [{ data: t }, { data: m }] = await Promise.all([
        supabase.from('ticket').select('*, membri(nome, cognome, ruolo, email), rischi(descrizione, categoria, probabilita, impatto)')
          .eq('azienda_id', azienda.id)
          .order('created_at', { ascending: false }),
        supabase.from('membri').select('id, nome, cognome, ruolo').eq('azienda_id', azienda.id).order('cognome'),
      ])
      setTickets(t || [])
      setMembri(m || [])
      setLoading(false)
    }
    load()
  }, [azienda.id])

  // Applica filtri
  const filtered = tickets.filter(t => {
    if (filtroStato !== 'Tutti' && t.stato !== filtroStato) return false
    if (filtroMembro !== 'Tutti' && t.membro_id !== filtroMembro) return false
    if (filtroPriorita !== 'Tutte' && t.priorita !== filtroPriorita) return false
    if (filtroDataDa && t.created_at < filtroDataDa) return false
    if (filtroDataA && t.created_at > filtroDataA + 'T23:59:59') return false
    return true
  })

  // Raggruppa
  function getRaggruppati() {
    if (raggruppa === 'stato') {
      const groups = {}
      STATI.slice(1).forEach(s => {
        const items = filtered.filter(t => t.stato === s)
        if (items.length > 0) groups[s] = items
      })
      return groups
    }
    if (raggruppa === 'priorita') {
      const groups = {}
      PRIORITA.slice(1).forEach(p => {
        const items = filtered.filter(t => t.priorita === p)
        if (items.length > 0) groups[p] = items
      })
      return groups
    }
    // Default: per membro
    const groups = {}
    filtered.forEach(t => {
      const nome = t.membri ? `${t.membri.nome} ${t.membri.cognome}${t.membri.ruolo ? ' — ' + t.membri.ruolo : ''}` : 'Senza assegnatario'
      if (!groups[nome]) groups[nome] = []
      groups[nome].push(t)
    })
    return groups
  }

  const raggruppati = getRaggruppati()
  const oggi = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' })

  function stampa() {
    const contenuto = printRef.current.innerHTML
    const win = window.open('', '_blank')
    win.document.write(`<!DOCTYPE html><html lang="it"><head>
<meta charset="UTF-8">
<title>Report Ticket — ${azienda.nome}</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: -apple-system, Arial, sans-serif; font-size: 11pt; color: #333; padding: 20mm; }
  h1 { font-size: 18pt; color: #1A3A5C; margin-bottom: 4px; }
  .meta { font-size: 9pt; color: #888; margin-bottom: 16px; }
  .sezione { margin-bottom: 20px; }
  .sezione-titolo { font-size: 13pt; font-weight: 700; color: #1A3A5C; border-bottom: 2px solid #1A3A5C; padding-bottom: 4px; margin-bottom: 10px; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; margin-bottom: 8px; }
  thead tr { background: #1A3A5C; color: white; }
  thead th { padding: 6px 8px; text-align: left; font-weight: 600; }
  tbody tr { border-bottom: 1px solid #E0E0E0; }
  tbody tr:nth-child(even) { background: #F7F8FA; }
  tbody td { padding: 6px 8px; vertical-align: top; }
  .badge { display: inline-block; padding: 2px 6px; border-radius: 10px; font-size: 8pt; font-weight: 600; }
  .footer { margin-top: 20px; font-size: 8pt; color: #aaa; text-align: center; border-top: 1px solid #E0E0E0; padding-top: 8px; }
  .riepilogo { display: flex; gap: 20px; margin-bottom: 20px; }
  .stat { text-align: center; padding: 8px 16px; border: 1px solid #E0E0E0; border-radius: 6px; }
  .stat-num { font-size: 18pt; font-weight: 700; color: #1A3A5C; }
  .stat-label { font-size: 8pt; color: #888; }
  @media print { body { padding: 10mm; } }
</style>
</head><body>${contenuto}</body></html>`)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print() }, 500)
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Report Ticket</h2>
            <p>Genera report personalizzati per l'azienda {azienda.nome}</p>
          </div>
          <button className="btn btn-primary" onClick={stampa} disabled={filtered.length === 0}>
            🖨️ Stampa / Salva PDF
          </button>
        </div>
      </div>

      {/* Pannello filtri */}
      <div className="card" style={{ marginBottom: 16 }}>
        <div className="card-header"><span className="card-title">⚙️ Filtri report</span></div>
        <div className="grid-3" style={{ gap: 12 }}>
          <div className="form-group">
            <label className="form-label">Stato</label>
            <select className="form-control" value={filtroStato} onChange={e => setFiltroStato(e.target.value)}>
              {STATI.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Membro</label>
            <select className="form-control" value={filtroMembro} onChange={e => setFiltroMembro(e.target.value)}>
              <option value="Tutti">Tutti i membri</option>
              {membri.map(m => <option key={m.id} value={m.id}>{m.nome} {m.cognome}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Priorità</label>
            <select className="form-control" value={filtroPriorita} onChange={e => setFiltroPriorita(e.target.value)}>
              {PRIORITA.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>
        <div className="grid-3" style={{ gap: 12, marginTop: 4 }}>
          <div className="form-group">
            <label className="form-label">Data da</label>
            <input className="form-control" type="date" value={filtroDataDa} onChange={e => setFiltroDataDa(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Data a</label>
            <input className="form-control" type="date" value={filtroDataA} onChange={e => setFiltroDataA(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Raggruppa per</label>
            <select className="form-control" value={raggruppa} onChange={e => setRaggruppa(e.target.value)}>
              <option value="membro">Membro</option>
              <option value="stato">Stato</option>
              <option value="priorita">Priorità</option>
            </select>
          </div>
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: '#666' }}>
          {filtered.length} ticket selezionati su {tickets.length} totali
          {filtered.length === 0 && <span style={{ color: '#C0392B', marginLeft: 8 }}>— nessun risultato con i filtri selezionati</span>}
        </div>
      </div>

      {/* Anteprima report */}
      {loading ? <div className="spinner" /> : filtered.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <div style={{ fontSize: 36 }}>📋</div>
            <p>Nessun ticket corrisponde ai filtri selezionati.</p>
          </div>
        </div>
      ) : (
        <div className="card">
          {/* Contenuto stampabile */}
          <div ref={printRef}>
            {/* Intestazione */}
            <div style={{ marginBottom: 20 }}>
              <h1 style={{ fontSize: 22, color: '#1A3A5C', marginBottom: 4 }}>🛡️ Report Ticket — {azienda.nome}</h1>
              <div style={{ fontSize: 12, color: '#888' }}>
                Generato il {oggi} · 
                {filtroStato !== 'Tutti' && ` Stato: ${filtroStato} ·`}
                {filtroMembro !== 'Tutti' && ` Membro: ${membri.find(m => m.id === filtroMembro)?.cognome} ·`}
                {filtroPriorita !== 'Tutte' && ` Priorità: ${filtroPriorita} ·`}
                {filtroDataDa && ` Dal: ${new Date(filtroDataDa).toLocaleDateString('it-IT')} ·`}
                {filtroDataA && ` Al: ${new Date(filtroDataA).toLocaleDateString('it-IT')} ·`}
                {` Totale: ${filtered.length} ticket`}
              </div>
            </div>

            {/* Riepilogo statistiche */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
              {['Aperto','In lavorazione','Completato','Scaduto'].map(stato => {
                const n = filtered.filter(t => t.stato === stato).length
                if (n === 0) return null
                const sc = STATO_COLORS[stato]
                return (
                  <div key={stato} style={{ textAlign: 'center', padding: '10px 16px', border: `1px solid ${sc.color}40`, borderRadius: 8, background: sc.bg }}>
                    <div style={{ fontSize: 22, fontWeight: 700, color: sc.color }}>{n}</div>
                    <div style={{ fontSize: 11, color: sc.color }}>{stato}</div>
                  </div>
                )
              })}
            </div>

            {/* Sezioni raggruppate */}
            {Object.entries(raggruppati).map(([gruppo, items]) => (
              <div key={gruppo} style={{ marginBottom: 24 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#1A3A5C', borderBottom: '2px solid #1A3A5C', paddingBottom: 6, marginBottom: 12 }}>
                  {raggruppa === 'membro' ? '👤' : raggruppa === 'stato' ? '📌' : '⚡'} {gruppo}
                  <span style={{ fontSize: 11, fontWeight: 400, color: '#888', marginLeft: 8 }}>({items.length} ticket)</span>
                </div>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#1A3A5C' }}>
                      <th style={{ padding: '8px 10px', color: 'white', textAlign: 'left', fontWeight: 600 }}>Titolo / Istruzioni</th>
                      {raggruppa !== 'membro' && <th style={{ padding: '8px 10px', color: 'white', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>Membro</th>}
                      {raggruppa !== 'stato' && <th style={{ padding: '8px 10px', color: 'white', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap' }}>Stato</th>}
                      {raggruppa !== 'priorita' && <th style={{ padding: '8px 10px', color: 'white', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap' }}>Priorità</th>}
                      <th style={{ padding: '8px 10px', color: 'white', textAlign: 'center', fontWeight: 600, whiteSpace: 'nowrap' }}>Scadenza</th>
                      <th style={{ padding: '8px 10px', color: 'white', textAlign: 'left', fontWeight: 600 }}>Note membro</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((t, idx) => {
                      const sc = STATO_COLORS[t.stato] || STATO_COLORS['Aperto']
                      return (
                        <tr key={t.id} style={{ background: idx % 2 === 0 ? 'white' : '#F7F8FA', borderBottom: '1px solid #E0E0E0' }}>
                          <td style={{ padding: '8px 10px', maxWidth: 320 }}>
                            <div style={{ fontWeight: 600, marginBottom: 2 }}>{t.titolo}</div>
                            {t.rischi && <div style={{ fontSize: 11, color: '#888' }}>🔗 {t.rischi.descrizione?.substring(0, 60)}{t.rischi.descrizione?.length > 60 ? '...' : ''}</div>}
                          </td>
                          {raggruppa !== 'membro' && (
                            <td style={{ padding: '8px 10px', whiteSpace: 'nowrap', fontSize: 11 }}>
                              {t.membri ? `${t.membri.nome} ${t.membri.cognome}` : '—'}
                              {t.membri?.ruolo && <div style={{ color: '#888', fontSize: 10 }}>{t.membri.ruolo}</div>}
                            </td>
                          )}
                          {raggruppa !== 'stato' && (
                            <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                              <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 10, background: sc.bg, color: sc.color, fontWeight: 600, whiteSpace: 'nowrap' }}>{t.stato}</span>
                            </td>
                          )}
                          {raggruppa !== 'priorita' && (
                            <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 11 }}>
                              <span style={{ color: t.priorita === 'Alta' ? '#C0392B' : t.priorita === 'Media' ? '#E67E22' : '#27AE60', fontWeight: 600 }}>{t.priorita}</span>
                            </td>
                          )}
                          <td style={{ padding: '8px 10px', textAlign: 'center', fontSize: 11, whiteSpace: 'nowrap' }}>
                            {t.scadenza ? new Date(t.scadenza).toLocaleDateString('it-IT') : '—'}
                          </td>
                          <td style={{ padding: '8px 10px', fontSize: 11, color: '#555', maxWidth: 200 }}>
                            {t.note_membro || '—'}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            ))}

            {/* Footer */}
            <div style={{ marginTop: 24, fontSize: 10, color: '#aaa', textAlign: 'center', borderTop: '1px solid #E0E0E0', paddingTop: 8 }}>
              Rischi 360° — Report generato il {oggi} — {azienda.nome}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
