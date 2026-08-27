import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

const ORGANO_LABEL = {
  cda: 'Consiglio di Amministrazione', amministratore_unico: 'Amministratore Unico',
  comitato: 'Comitato', collegio_sindacale: 'Collegio Sindacale', assemblea: 'Assemblea dei Soci', altro: 'Organo',
}
const ESITO_STYLE = {
  approvata: { background: '#E9F7EF', color: '#1E8449' },
  respinta:  { background: '#FDEDEC', color: '#C0392B' },
  rinviata:  { background: '#FEF9E7', color: '#856404' },
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

export default function DettaglioAdunanza() {
  const { azienda, setPage, adunanzaId } = useApp()
  const [caricata, setCaricata] = useState(false)
  const [saving, setSaving] = useState(false)
  const [errore, setErrore] = useState(null)
  const [soloLettura, setSoloLettura] = useState(false)

  const [ad, setAd] = useState(null)         // testata adunanza
  const [organo, setOrgano] = useState(null)
  const [punti, setPunti] = useState([])     // [{titolo, relatore, con_delibera}]
  const [delibere, setDelibere] = useState([]) // [{oggetto, testo, favorevoli, contrari, astenuti, esito}]
  const [verbale, setVerbale] = useState('')

  // Carica adunanza + organo + punti + delibere
  useEffect(() => {
    (async () => {
      if (!adunanzaId) { setCaricata(true); return }
      const { data: a } = await supabase.from('adunanze').select('*').eq('id', adunanzaId).single()
      if (!a) { setCaricata(true); return }
      setAd(a)
      setVerbale(a.verbale_html || '')
      if (a.stato === 'verbalizzata' || a.stato === 'annullata') setSoloLettura(true)

      const { data: org } = await supabase.from('organi').select('*').eq('id', a.organo_id).single()
      setOrgano(org || null)

      const { data: pp } = await supabase.from('adunanza_punti').select('*').eq('adunanza_id', adunanzaId).order('ordine')
      setPunti((pp || []).map(p => ({ titolo: p.titolo, relatore: p.relatore || '', con_delibera: p.con_delibera })))

      const { data: dd } = await supabase.from('delibere').select('*').eq('adunanza_id', adunanzaId).order('created_at')
      setDelibere((dd || []).map(d => ({
        oggetto: d.oggetto, testo: d.testo || '', favorevoli: d.favorevoli, contrari: d.contrari,
        astenuti: d.astenuti, esito: d.esito, area_231: d.area_231 || '',
      })))

      setCaricata(true)
    })()
  }, [adunanzaId])

  const setTestata = (k, v) => setAd(a => ({ ...a, [k]: v }))

  // ── Punti OdG ──
  const addPunto = () => setPunti(p => [...p, { titolo: '', relatore: '', con_delibera: true }])
  const setPunto = (i, k, v) => setPunti(p => p.map((x, j) => j === i ? { ...x, [k]: v } : x))
  const delPunto = i => setPunti(p => p.filter((_, j) => j !== i))
  const movePunto = (i, dir) => setPunti(p => {
    const j = i + dir
    if (j < 0 || j >= p.length) return p
    const c = [...p]; [c[i], c[j]] = [c[j], c[i]]; return c
  })

  // ── Delibere ──
  const addDelibera = () => setDelibere(d => [...d, { oggetto: '', testo: '', favorevoli: 0, contrari: 0, astenuti: 0, esito: 'approvata', area_231: '' }])
  const setDel = (i, k, v) => setDelibere(d => d.map((x, j) => j === i ? { ...x, [k]: v } : x))
  const delDelibera = i => setDelibere(d => d.filter((_, j) => j !== i))

  function generaVerbale() {
    if (!ad) return ''
    const tOrg = ORGANO_LABEL[organo?.tipo] || 'Organo'
    const isAssemblea = organo?.tipo === 'assemblea'
    const collegio = isAssemblea ? 'l\'assemblea' : 'il consiglio'
    const d = ad.data_ora ? new Date(ad.data_ora) : null
    const dataStr = d ? d.toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' }) : '____________'
    const oraInizio = d ? d.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }) : '____'
    const modLabel = { presenza: '', videoconferenza: ' in videoconferenza', mista: ' in modalità mista' }[ad.modalita] || ''
    const num = ad.numero != null ? String(ad.numero).padStart(2, '0') : '—'
    const R = []

    if (ad.intestazione && ad.intestazione.trim()) { R.push(ad.intestazione.trim()); R.push('') }

    R.push(`VERBALE ${tOrg.toUpperCase()} N. ${num}/${ad.anno}`)
    R.push(`${azienda?.nome || ''}`)
    R.push('')
    R.push(`L'anno ${ad.anno}, il giorno ${dataStr}, alle ore ${oraInizio}, presso ${ad.luogo || '____________'}${modLabel}, si è riunita${isAssemblea ? '' : 'o'} ${collegio} di ${azienda?.nome || 'questa società'}, in sessione ${ad.sessione}, per discutere e deliberare sul seguente`)
    R.push('')
    R.push('ORDINE DEL GIORNO')
    punti.forEach((p, i) => R.push(`${i + 1}. ${p.titolo || '(punto senza titolo)'}`))
    R.push('')

    // Apertura
    const pres = ad.presidente || (isAssemblea ? '____________' : 'il Presidente')
    const quorum = (ad.presenti != null || ad.aventi_diritto != null)
      ? ` — essendo presenti n. ${ad.presenti ?? '__'} ${isAssemblea ? 'soci' : 'componenti'} su n. ${ad.aventi_diritto ?? '__'} aventi diritto —`
      : ''
    R.push(`Assume la presidenza ${pres} il quale, constatata e fatta constatare la regolare costituzione dell'adunanza${quorum}, dichiara la seduta validamente costituita e atta a deliberare.`)
    if (ad.segretario) R.push(`Viene chiamato a fungere da segretario ${ad.segretario}, che accetta.`)
    R.push('')
    R.push('Si passa quindi alla trattazione degli argomenti all\'ordine del giorno.')
    R.push('')

    // Trattazione punto per punto — testo neutro (la narrazione la scrive l'utente)
    punti.forEach((p, i) => {
      R.push(`Punto ${i + 1} all'ordine del giorno: ${p.titolo || '____________'}.`)
      const del = delibere[i] // abbinamento posizionale punto→delibera
      if (del) {
        if (del.testo) R.push(del.testo)
        const unanime = (Number(del.contrari) === 0 && Number(del.astenuti) === 0)
        const modo = unanime ? 'all\'unanimità' : `con voti favorevoli ${del.favorevoli}, contrari ${del.contrari}, astenuti ${del.astenuti}`
        const verbo = del.esito === 'approvata' ? 'approva' : del.esito === 'respinta' ? 'respinge' : 'rinvia'
        R.push(`(${collegio.charAt(0).toUpperCase() + collegio.slice(1)} ${verbo} ${modo}.)`)
        if (del.area_231) R.push(`(Operazione ricadente nell'area sensibile 231: ${del.area_231}.)`)
      }
      R.push('')
    })

    // Chiusura
    R.push(`Null'altro essendovi da deliberare e nessuno chiedendo la parola, il Presidente dichiara sciolta la seduta alle ore ${ad.ora_chiusura || '____'}.`)
    R.push('')
    R.push('Letto, approvato e sottoscritto.')
    R.push('')
    R.push(`Il Segretario                                   Il Presidente`)
    R.push(`${ad.segretario || '____________'}                    ${ad.presidente || '____________'}`)
    return R.join('\n')
  }

  function stampaPdf() {
    const num = ad.numero != null ? String(ad.numero).padStart(2, '0') : '—'
    const titoloDoc = `Verbale ${num}-${ad.anno} ${azienda?.nome || ''}`.trim()
    const testo = (verbale && verbale.trim()) ? verbale : generaVerbale()
    const esc = s => (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const w = window.open('', '_blank')
    if (!w) { setErrore('Consenti le finestre popup per stampare il verbale.'); return }
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>${esc(titoloDoc)}</title>
      <style>
        @page { margin: 2.2cm; }
        body { font-family: Georgia, 'Times New Roman', serif; font-size: 12pt; line-height: 1.6; color: #1a1a1a; }
        pre { white-space: pre-wrap; font-family: inherit; margin: 0; }
        .hash { margin-top: 28px; padding-top: 10px; border-top: 1px solid #ccc; font-family: monospace; font-size: 8pt; color: #888; word-break: break-all; }
      </style></head><body>
      <pre>${esc(testo)}</pre>
      ${ad.hash_documento ? `<div class="hash">Impronta SHA-256: ${esc(ad.hash_documento)}</div>` : ''}
      <script>window.onload = function(){ window.print(); }</script>
      </body></html>`)
    w.document.close()
  }

  async function salva(verbalizza) {
    setErrore(null)
    if (!ad?.titolo?.trim()) { setErrore('Il titolo dell\'adunanza è obbligatorio.'); return }
    setSaving(true)
    try {
      let numero = ad.numero, data_verbale = ad.data_verbale, hash = ad.hash_documento
      let stato = ad.stato === 'programmata' ? 'svolta' : ad.stato
      const corpo = verbale && verbale.trim() ? verbale : generaVerbale()

      if (verbalizza) {
        if (ad.numero == null) {
          const { data: n, error: eN } = await supabase.rpc('prossimo_numero_adunanza', { p_organo: ad.organo_id, p_anno: ad.anno })
          if (eN) throw eN
          numero = n
        }
        data_verbale = new Date().toISOString()
        stato = 'verbalizzata'
        hash = await sha256(corpo.replace('N. —/', `N. ${String(numero).padStart(2, '0')}/`))
      }

      const corpoFinale = verbalizza
        ? corpo.replace('N. —/', `N. ${String(numero).padStart(2, '0')}/`)
        : corpo

      const { error: eUp } = await supabase.from('adunanze').update({
        titolo: ad.titolo.trim(), sessione: ad.sessione, data_ora: ad.data_ora, luogo: ad.luogo || null,
        modalita: ad.modalita, presenti: ad.presenti === '' ? null : ad.presenti,
        aventi_diritto: ad.aventi_diritto === '' ? null : ad.aventi_diritto,
        presidente: ad.presidente || null, segretario: ad.segretario || null, ora_chiusura: ad.ora_chiusura || null,
        intestazione: ad.intestazione || null,
        verbale_html: corpoFinale, stato, numero, data_verbale, hash_documento: hash,
      }).eq('id', adunanzaId)
      if (eUp) throw eUp

      // sync punti (delete + insert)
      await supabase.from('adunanza_punti').delete().eq('adunanza_id', adunanzaId)
      if (punti.length) {
        const rows = punti.map((p, i) => ({
          adunanza_id: adunanzaId, azienda_id: azienda.id, ordine: i + 1,
          titolo: p.titolo || `Punto ${i + 1}`, relatore: p.relatore || null, con_delibera: p.con_delibera,
        }))
        const { error } = await supabase.from('adunanza_punti').insert(rows)
        if (error) throw error
      }

      // sync delibere (delete + insert)
      await supabase.from('delibere').delete().eq('adunanza_id', adunanzaId)
      if (delibere.length) {
        const rows = delibere.map(d => ({
          adunanza_id: adunanzaId, azienda_id: azienda.id, oggetto: d.oggetto || 'Delibera',
          testo: d.testo || null, favorevoli: Number(d.favorevoli) || 0, contrari: Number(d.contrari) || 0,
          astenuti: Number(d.astenuti) || 0, esito: d.esito, area_231: d.area_231 || null,
        }))
        const { error } = await supabase.from('delibere').insert(rows)
        if (error) throw error
      }

      await supabase.from('governance_eventi').insert({
        azienda_id: azienda.id, adunanza_id: adunanzaId,
        evento: verbalizza ? 'verbalizzazione' : 'aggiornamento_adunanza',
        dettaglio: `${ORGANO_LABEL[organo?.tipo] || 'Organo'} — ${ad.titolo.trim()}`,
      })

      setPage('verbali')
    } catch (e) {
      setErrore(e.message || 'Errore durante il salvataggio.')
      setSaving(false)
    }
  }

  if (!caricata) return <div className="spinner" />
  if (!ad) return (
    <div className="card"><p>Adunanza non trovata. <button className="btn btn-sm" onClick={() => setPage('verbali')}>← Torna all'elenco</button></p></div>
  )

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>{soloLettura ? 'Verbale' : 'Adunanza'} · {ORGANO_LABEL[organo?.tipo] || 'Organo'}</h2>
            <p>{organo?.nome} · {azienda?.nome} · N. {ad.numero != null ? String(ad.numero).padStart(2, '0') : '—'}/{ad.anno}</p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-sm" onClick={stampaPdf}>🖨️ Stampa / PDF</button>
            <button className="btn btn-sm" onClick={() => setPage('verbali')}>← Elenco</button>
          </div>
        </div>
      </div>

      {soloLettura && (
        <div className="alert" style={{ marginBottom: 14, background: '#EAF2F8', color: '#1A5276' }}>
          🔒 Adunanza verbalizzata: consultabile ma non modificabile.
        </div>
      )}
      {errore && <div className="alert alert-error" style={{ marginBottom: 14 }}>{errore}</div>}

      {/* Testata */}
      <div className="card">
        <div className="card-header"><span className="card-title">Dati della seduta</span></div>
        <div className="form-group">
          <label className="form-label">Intestazione del verbale</label>
          <textarea className="form-control" style={{ minHeight: 70 }} value={ad.intestazione || ''} disabled={soloLettura}
            onChange={e => setTestata('intestazione', e.target.value)}
            placeholder="Testo libero che comparirà in cima al verbale (es. ragione sociale completa, sede legale, capitale sociale, C.F./P.IVA, n. R.E.A.)" />
        </div>
        <div className="form-group">
          <label className="form-label">Titolo *</label>
          <input className="form-control" value={ad.titolo || ''} disabled={soloLettura} onChange={e => setTestata('titolo', e.target.value)} />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">Sessione</label>
            <select className="form-control" value={ad.sessione} disabled={soloLettura} onChange={e => setTestata('sessione', e.target.value)}>
              <option value="ordinaria">Ordinaria</option><option value="straordinaria">Straordinaria</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 140 }}>
            <label className="form-label">Modalità</label>
            <select className="form-control" value={ad.modalita} disabled={soloLettura} onChange={e => setTestata('modalita', e.target.value)}>
              <option value="presenza">In presenza</option><option value="videoconferenza">Videoconferenza</option><option value="mista">Mista</option>
            </select>
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 90 }}>
            <label className="form-label">Presenti</label>
            <input className="form-control" type="number" min="0" value={ad.presenti ?? ''} disabled={soloLettura} onChange={e => setTestata('presenti', e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 90 }}>
            <label className="form-label">Aventi diritto</label>
            <input className="form-control" type="number" min="0" value={ad.aventi_diritto ?? ''} disabled={soloLettura} onChange={e => setTestata('aventi_diritto', e.target.value === '' ? '' : Number(e.target.value))} />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Luogo</label>
          <input className="form-control" value={ad.luogo || ''} disabled={soloLettura} onChange={e => setTestata('luogo', e.target.value)} placeholder="Sede legale / link videoconferenza" />
        </div>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Presidente della seduta</label>
            <input className="form-control" value={ad.presidente || ''} disabled={soloLettura} onChange={e => setTestata('presidente', e.target.value)} placeholder="Nome e cognome" />
          </div>
          <div className="form-group" style={{ flex: 1, minWidth: 160 }}>
            <label className="form-label">Segretario</label>
            <input className="form-control" value={ad.segretario || ''} disabled={soloLettura} onChange={e => setTestata('segretario', e.target.value)} placeholder="Nome e cognome" />
          </div>
          <div className="form-group" style={{ width: 120 }}>
            <label className="form-label">Ora chiusura</label>
            <input className="form-control" value={ad.ora_chiusura || ''} disabled={soloLettura} onChange={e => setTestata('ora_chiusura', e.target.value)} placeholder="es. 18:30" />
          </div>
        </div>
      </div>

      {/* Ordine del giorno */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Ordine del giorno</span>
          {!soloLettura && <button className="btn btn-sm btn-primary" onClick={addPunto}>+ Punto</button>}
        </div>
        {punti.length === 0 ? <p style={{ fontSize: 13, color: '#999' }}>Nessun punto all'ordine del giorno.</p> : punti.map((p, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: '#7F77DD', width: 20 }}>{i + 1}.</span>
            <input className="form-control" style={{ flex: 2, minWidth: 160 }} value={p.titolo} disabled={soloLettura} onChange={e => setPunto(i, 'titolo', e.target.value)} placeholder="Titolo del punto" />
            <input className="form-control" style={{ flex: 1, minWidth: 120 }} value={p.relatore} disabled={soloLettura} onChange={e => setPunto(i, 'relatore', e.target.value)} placeholder="Relatore" />
            {!soloLettura && <>
              <button className="btn btn-sm" onClick={() => movePunto(i, -1)} title="Su">↑</button>
              <button className="btn btn-sm" onClick={() => movePunto(i, 1)} title="Giù">↓</button>
              <button className="btn btn-sm btn-danger" onClick={() => delPunto(i)}>✕</button>
            </>}
          </div>
        ))}
      </div>

      {/* Delibere */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Delibere</span>
          {!soloLettura && <button className="btn btn-sm btn-primary" onClick={addDelibera}>+ Delibera</button>}
        </div>
        {delibere.length === 0 ? <p style={{ fontSize: 13, color: '#999' }}>Nessuna delibera registrata.</p> : delibere.map((d, i) => (
          <div key={i} style={{ border: '1px solid #E0E0E0', borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <span style={{ fontWeight: 700, color: '#7F77DD' }}>Delibera {i + 1}</span>
              {soloLettura && <span className="badge" style={ESITO_STYLE[d.esito]}>{d.esito}</span>}
              {!soloLettura && <button className="btn btn-sm btn-danger" style={{ marginLeft: 'auto' }} onClick={() => delDelibera(i)}>Rimuovi</button>}
            </div>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <input className="form-control" value={d.oggetto} disabled={soloLettura} onChange={e => setDel(i, 'oggetto', e.target.value)} placeholder="Oggetto della delibera" />
            </div>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <textarea className="form-control" value={d.testo} disabled={soloLettura} onChange={e => setDel(i, 'testo', e.target.value)} placeholder="Testo della delibera..." />
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
              <div className="form-group" style={{ marginBottom: 0, width: 90 }}>
                <label className="form-label">Favorevoli</label>
                <input className="form-control" type="number" min="0" value={d.favorevoli} disabled={soloLettura} onChange={e => setDel(i, 'favorevoli', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, width: 90 }}>
                <label className="form-label">Contrari</label>
                <input className="form-control" type="number" min="0" value={d.contrari} disabled={soloLettura} onChange={e => setDel(i, 'contrari', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, width: 90 }}>
                <label className="form-label">Astenuti</label>
                <input className="form-control" type="number" min="0" value={d.astenuti} disabled={soloLettura} onChange={e => setDel(i, 'astenuti', e.target.value)} />
              </div>
              <div className="form-group" style={{ marginBottom: 0, flex: 1, minWidth: 130 }}>
                <label className="form-label">Esito</label>
                <select className="form-control" value={d.esito} disabled={soloLettura} onChange={e => setDel(i, 'esito', e.target.value)}>
                  <option value="approvata">Approvata</option><option value="respinta">Respinta</option><option value="rinviata">Rinviata</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Verbale */}
      <div className="card">
        <div className="card-header">
          <span className="card-title">Verbale</span>
          {!soloLettura && <button className="btn btn-sm" onClick={() => setVerbale(generaVerbale())}>↻ Genera da dati</button>}
        </div>
        <p style={{ fontSize: 12, color: '#999', marginBottom: 8 }}>
          Genera la bozza dai dati inseriti, poi modificala liberamente. Alla verbalizzazione il testo viene congelato con un hash.
        </p>
        <textarea className="form-control" style={{ minHeight: 260, fontFamily: 'inherit', lineHeight: 1.6 }}
          value={verbale} disabled={soloLettura} onChange={e => setVerbale(e.target.value)}
          placeholder="Clicca «Genera da dati» per creare la bozza, oppure scrivi qui il verbale." />
      </div>

      {/* Azioni */}
      {!soloLettura && (
        <div className="card" style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <button className="btn" onClick={() => salva(false)} disabled={saving}>{saving ? 'Salvataggio…' : '💾 Salva bozza'}</button>
          <button className="btn btn-primary" onClick={() => salva(true)} disabled={saving}>{saving ? 'Salvataggio…' : '✍️ Verbalizza'}</button>
        </div>
      )}
    </div>
  )
}
