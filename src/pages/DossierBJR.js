import React, { useState, useEffect, useCallback } from 'react'
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

const numFmt = a => `${a.numero != null ? String(a.numero).padStart(2, '0') : '—'}/${a.anno}`
const dataFmt = d => d ? new Date(d).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'
const nomeDi = m => m ? `${m.nome || ''} ${m.cognome || ''}`.trim() : '—'

// Calcola lo score di conformità solo sui criteri applicabili e verificabili sui dati reali.
// Ogni criterio pesa uguale; un criterio non applicabile (dato non pertinente a questa seduta) viene escluso.
function calcolaScore(d) {
  const criteri = []

  criteri.push({
    id: 'hash', label: 'Verbale congelato con hash',
    valore: d.ad.hash_documento ? 1 : 0,
    dettaglio: d.ad.hash_documento ? 'Presente' : 'Mancante',
  })

  if (d.delibere.length > 0) {
    const conVoti = d.delibere.filter(del => d.voti.some(v => v.delibera_id === del.id)).length
    criteri.push({ id: 'voti', label: 'Delibere con voto nominativo registrato', valore: conVoti / d.delibere.length, dettaglio: `${conVoti}/${d.delibere.length}` })
  }

  if (d.isAssemblea && d.componenti.length > 0) {
    const dichiarate = d.componenti.filter(c => d.presenze.some(p => p.membro_id === c.membro_id)).length
    criteri.push({ id: 'presenze', label: 'Presenza/delega dichiarata per i soci', valore: dichiarate / d.componenti.length, dettaglio: `${dichiarate}/${d.componenti.length}` })
  }

  const presaVisione = d.ticket.filter(t => t.tipo === 'presa_visione')
  if (d.richiami.length > 0 || presaVisione.length > 0) {
    criteri.push({ id: 'circolarizzazione', label: 'Circolarizzazione inviata', valore: presaVisione.length > 0 ? 1 : 0, dettaglio: presaVisione.length > 0 ? `${presaVisione.length} destinatari` : 'Nessun ticket di presa visione per questa seduta' })
    if (presaVisione.length > 0) {
      const confermati = presaVisione.filter(t => t.data_presa_visione).length
      criteri.push({ id: 'conferma', label: 'Presa visione confermata (datata)', valore: confermati / presaVisione.length, dettaglio: `${confermati}/${presaVisione.length}` })
    }
  }

  if (d.richiami.length > 0) {
    const conAllegati = d.richiami.filter(r => d.allegati.some(a => a.determina_id === r.determina_id)).length
    criteri.push({ id: 'allegati', label: 'Allegati presenti sugli atti istruiti', valore: conAllegati / d.richiami.length, dettaglio: `${conAllegati}/${d.richiami.length}` })
  }

  const attiRischioAlto = d.richiami.filter(r => d.rischi.some(rk => rk.determina_id === r.determina_id && rk.livello >= 4))
  if (attiRischioAlto.length > 0) {
    const conParere = attiRischioAlto.filter(r => d.pareri.some(p => p.determina_id === r.determina_id)).length
    criteri.push({ id: 'pareri', label: 'Parere presente quando il rischio è alto/critico', valore: conParere / attiRischioAlto.length, dettaglio: `${conParere}/${attiRischioAlto.length}` })
  }

  const punteggio = criteri.length ? Math.round((criteri.reduce((s, c) => s + c.valore, 0) / criteri.length) * 100) : null
  return { criteri, punteggio }
}

const scoreColore = p => p == null ? '#999' : p >= 80 ? '#1E8449' : p >= 50 ? '#B7791F' : '#C0392B'

export default function DossierBJR() {
  const { azienda } = useApp()
  const [adunanze, setAdunanze] = useState([])
  const [loading, setLoading] = useState(true)
  const [selId, setSelId] = useState('')
  const [dossier, setDossier] = useState(null)
  const [loadingDossier, setLoadingDossier] = useState(false)

  const load = useCallback(async () => {
    if (!azienda?.id) return
    setLoading(true)
    const { data: ad } = await supabase.from('adunanze').select('*, organi(nome,tipo)')
      .eq('azienda_id', azienda.id).eq('stato', 'verbalizzata')
      .order('anno', { ascending: false }).order('data_verbale', { ascending: false })
    setAdunanze(ad || [])
    setLoading(false)
  }, [azienda])

  useEffect(() => { load() }, [load])

  const caricaDossier = useCallback(async (adunanzaId) => {
    if (!adunanzaId) { setDossier(null); return }
    const ad = adunanze.find(a => a.id === adunanzaId)
    if (!ad) { setDossier(null); return }
    setLoadingDossier(true)

    const organo = ad.organi || null
    const isAssemblea = organo?.tipo === 'assemblea'

    const [{ data: delibere }, { data: richiami }, { data: componenti }, { data: presenzeRes }, { data: ticket }, { data: eventi }] = await Promise.all([
      supabase.from('delibere').select('*').eq('adunanza_id', adunanzaId).order('created_at'),
      supabase.from('adunanza_delibere').select('*, determine(id,oggetto,tipo,stato,valore,descrizione,area_231)').eq('adunanza_id', adunanzaId).order('ordine'),
      supabase.from('organo_membri').select('membro_id, ruolo, quota, membri(nome,cognome,email)').eq('organo_id', ad.organo_id),
      isAssemblea ? supabase.from('adunanza_presenze').select('*').eq('adunanza_id', adunanzaId) : Promise.resolve({ data: [] }),
      supabase.from('ticket').select('*, membri(nome,cognome,email)').eq('riunione_id', adunanzaId).order('created_at'),
      supabase.from('governance_eventi').select('*').eq('adunanza_id', adunanzaId).order('created_at'),
    ])

    const idDelibere = (delibere || []).map(x => x.id)
    const { data: voti } = idDelibere.length
      ? await supabase.from('voti').select('*').in('delibera_id', idDelibere)
      : { data: [] }

    const idDetermine = [...new Set((richiami || []).map(r => r.determina_id).filter(Boolean))]
    const [allegatiRes, rischiRes, pareriRes] = idDetermine.length
      ? await Promise.all([
          supabase.from('determina_allegati').select('*').in('determina_id', idDetermine),
          supabase.from('determina_rischi').select('*').in('determina_id', idDetermine),
          supabase.from('determina_pareri').select('*').in('determina_id', idDetermine),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }]

    setDossier({
      ad, organo, isAssemblea,
      delibere: delibere || [], richiami: richiami || [], componenti: componenti || [],
      presenze: presenzeRes || [], ticket: ticket || [], eventi: eventi || [],
      voti: voti || [], allegati: allegatiRes.data || [], rischi: rischiRes.data || [], pareri: pareriRes.data || [],
    })
    setLoadingDossier(false)
  }, [adunanze])

  useEffect(() => { caricaDossier(selId) }, [selId, caricaDossier])

  const score = dossier ? calcolaScore(dossier) : null

  return (
    <div>
      <div className="page-header">
        <h2>📁 Dossier BJR</h2>
        <p>Fascicolo di conformità (Business Judgment Rule) di una seduta verbalizzata — evidenze reali, non stimate</p>
      </div>

      <div className="card">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Seduta</label>
          {loading ? <div className="spinner" /> : adunanze.length === 0 ? (
            <p style={{ fontSize: 13, color: '#999' }}>Nessuna seduta verbalizzata trovata per questa azienda.</p>
          ) : (
            <select className="form-control" value={selId} onChange={e => setSelId(e.target.value)}>
              <option value="">Seleziona una seduta verbalizzata...</option>
              {adunanze.map(a => (
                <option key={a.id} value={a.id}>
                  {ORGANO_LABEL[a.organi?.tipo] || 'Organo'} — {a.titolo} — N. {numFmt(a)} — {dataFmt(a.data_verbale)}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loadingDossier && <div className="card"><div className="spinner" /></div>}

      {!loadingDossier && dossier && (
        <>
          {/* Testata + score */}
          <div className="card" style={{ display: 'flex', gap: 20, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <div style={{ fontSize: 12, color: '#999', marginBottom: 4 }}>{ORGANO_LABEL[dossier.organo?.tipo] || 'Organo'}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1A3A5C' }}>{dossier.ad.titolo}</div>
              <div style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
                N. {numFmt(dossier.ad)} · Verbalizzata il {dataFmt(dossier.ad.data_verbale)}
              </div>
              <div style={{ fontSize: 11, color: '#999', marginTop: 6, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {dossier.ad.hash_documento ? `SHA-256: ${dossier.ad.hash_documento}` : 'Nessun hash documento'}
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 40, fontWeight: 800, color: scoreColore(score.punteggio) }}>
                {score.punteggio != null ? `${score.punteggio}%` : '—'}
              </div>
              <div style={{ fontSize: 11, color: '#999' }}>score conformità</div>
            </div>
          </div>

          {/* Criteri dello score */}
          <div className="card">
            <div className="card-header"><span className="card-title">Criteri verificati</span></div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {score.criteri.map(c => (
                <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, padding: '6px 0', borderBottom: '1px solid #F0F0F0' }}>
                  <span style={{ width: 44, textAlign: 'center', fontWeight: 700, color: scoreColore(Math.round(c.valore * 100)) }}>{Math.round(c.valore * 100)}%</span>
                  <span style={{ flex: 1 }}>{c.label}</span>
                  <span style={{ fontSize: 12, color: '#888' }}>{c.dettaglio}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Presenze soci */}
          {dossier.isAssemblea && dossier.componenti.length > 0 && (
            <div className="card">
              <div className="card-header"><span className="card-title">Presenze soci</span></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {dossier.componenti.map(c => {
                  const p = dossier.presenze.find(x => x.membro_id === c.membro_id)
                  return (
                    <div key={c.membro_id} style={{ display: 'flex', gap: 8, fontSize: 13 }}>
                      <span style={{ flex: 1 }}>{nomeDi(c.membri)}{c.quota != null ? ` — ${c.quota}%` : ''}</span>
                      <span style={{ color: p ? (p.modalita === 'delega' ? '#B7791F' : '#1E8449') : '#C0392B' }}>
                        {p ? (p.modalita === 'delega' ? `Per delega${p.delegato ? ` (${p.delegato})` : ''}` : 'In presenza') : 'Non dichiarato'}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Delibere */}
          <div className="card">
            <div className="card-header"><span className="card-title">Delibere trattate</span></div>
            {dossier.delibere.length === 0 ? (
              <p style={{ fontSize: 13, color: '#999' }}>Nessuna delibera registrata in questa seduta.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {dossier.delibere.map(del => {
                  const votiDel = dossier.voti.filter(v => v.delibera_id === del.id)
                  const richiamo = dossier.richiami.find(r => (r.testo_odg || '').trim() === (del.oggetto || '').trim()) || null
                  const det = richiamo?.determine || null
                  const allegatiDet = det ? dossier.allegati.filter(a => a.determina_id === det.id) : []
                  const rischiDet = det ? dossier.rischi.filter(r => r.determina_id === det.id) : []
                  const pareriDet = det ? dossier.pareri.filter(p => p.determina_id === det.id) : []
                  return (
                    <div key={del.id} style={{ border: '1px solid #E0E0E0', borderRadius: 8, padding: 12 }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, flex: 1 }}>{del.oggetto}</span>
                        <span className="badge" style={ESITO_STYLE[del.esito]}>{del.esito}</span>
                      </div>
                      {del.testo && <p style={{ fontSize: 13, color: '#444', marginBottom: 8, whiteSpace: 'pre-wrap' }}>{del.testo}</p>}
                      <div style={{ fontSize: 12, color: '#666', marginBottom: 8 }}>
                        Favorevoli{dossier.isAssemblea ? ' (%)' : ''}: <strong>{del.favorevoli}</strong> · Contrari: <strong>{del.contrari}</strong> · Astenuti: <strong>{del.astenuti}</strong>
                        {votiDel.length === 0 && <span style={{ color: '#B7791F' }}> — solo totale aggregato, nessun voto nominativo</span>}
                      </div>
                      {votiDel.length > 0 && (
                        <div style={{ background: '#F7F8FA', borderRadius: 6, padding: '8px 10px', marginBottom: 8, fontSize: 12.5 }}>
                          {votiDel.map(v => {
                            const c = dossier.componenti.find(x => x.membro_id === v.membro_id)
                            return <div key={v.id}>{c ? nomeDi(c.membri) : '—'}: <strong>{v.voto}</strong></div>
                          })}
                        </div>
                      )}
                      {det && (
                        <div style={{ borderTop: '1px dashed #E0E0E0', paddingTop: 8, marginTop: 4, fontSize: 12.5, color: '#555' }}>
                          <div><strong>Atto istruito:</strong> {det.oggetto} {det.valore ? `— € ${Number(det.valore).toLocaleString('it-IT')}` : ''}</div>
                          {rischiDet.length > 0 && <div>Rischi valutati: {rischiDet.map(r => `${r.categoria} (liv. ${r.livello})`).join(', ')}</div>}
                          <div>Pareri: {pareriDet.length > 0 ? pareriDet.map(p => p.tipo).join(', ') : 'nessuno'} · Allegati: {allegatiDet.length}</div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Circolarizzazione */}
          <div className="card">
            <div className="card-header"><span className="card-title">Circolarizzazione e presa visione</span></div>
            {dossier.ticket.length === 0 ? (
              <p style={{ fontSize: 13, color: '#999' }}>Nessun ticket di circolarizzazione collegato a questa seduta.</p>
            ) : (
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Destinatario</th><th>Tipo</th><th>Titolo</th><th>Presa visione</th></tr></thead>
                  <tbody>
                    {dossier.ticket.map(t => (
                      <tr key={t.id}>
                        <td>{nomeDi(t.membri)}</td>
                        <td style={{ fontSize: 12, color: '#666' }}>{t.tipo}</td>
                        <td style={{ fontSize: 13 }}>{t.titolo}</td>
                        <td style={{ fontSize: 12, color: t.data_presa_visione ? '#1E8449' : '#C0392B' }}>
                          {t.data_presa_visione ? dataFmt(t.data_presa_visione) : '— in attesa —'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Cronologia eventi */}
          <div className="card">
            <div className="card-header"><span className="card-title">Cronologia</span></div>
            {dossier.eventi.length === 0 ? (
              <p style={{ fontSize: 13, color: '#999' }}>Nessun evento registrato.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {dossier.eventi.map(e => (
                  <div key={e.id} style={{ fontSize: 12.5, color: '#555' }}>
                    <span style={{ color: '#999' }}>{dataFmt(e.created_at)}</span> — <strong>{e.evento}</strong>{e.dettaglio ? ` — ${e.dettaglio}` : ''}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
