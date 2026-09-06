import React, { useState, useEffect, useCallback } from 'react'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
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
// Numero con cui l'atto istruito (delibera/determina) e' stato protocollato/firmato, se già assegnato
const numeroAttoLabel = det => det?.numero != null
  ? `${det.organo === 'cda' ? 'Delibera' : 'Determina'} n. ${String(det.numero).padStart(3, '0')}/${det.anno}`
  : null

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
  const [generandoPdf, setGenerandoPdf] = useState(false)

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
      supabase.from('adunanza_delibere').select('*, determine(id,oggetto,tipo,stato,valore,descrizione,area_231,numero,anno,organo)').eq('adunanza_id', adunanzaId).order('ordine'),
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

  async function apriAllegato(allegato) {
    const { data, error } = await supabase.storage.from('fascicoli').createSignedUrl(allegato.storage_path, 120)
    if (error || !data?.signedUrl) return
    window.open(data.signedUrl, '_blank')
  }

  // Genera un unico PDF che fonde il testo del fascicolo con il contenuto degli allegati:
  // le pagine dei PDF vengono fuse, le immagini incorporate come pagina; i formati non
  // incorporabili (Word, Excel, ecc.) restano solo elencati in coda con il riferimento.
  async function generaPdfCompleto() {
    if (!dossier || !score) return
    setGenerandoPdf(true)
    try {
      const pdfDoc = await PDFDocument.create()
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
      const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
      const PAGE_W = 595.28, PAGE_H = 841.89, MARGIN = 50
      const MAX_W = PAGE_W - MARGIN * 2
      const colTitolo = rgb(0.10, 0.23, 0.36), colGrigio = rgb(0.55, 0.58, 0.63), colAvviso = rgb(0.6, 0.45, 0.05)

      let page = pdfDoc.addPage([PAGE_W, PAGE_H])
      let y = PAGE_H - MARGIN
      const newPage = () => { page = pdfDoc.addPage([PAGE_W, PAGE_H]); y = PAGE_H - MARGIN }
      const ensureSpace = h => { if (y - h < MARGIN) newPage() }

      // Costruisce riga per riga controllando la larghezza col font scelto (word-wrap manuale)
      function drawText(text, { size = 9.5, f = font, color = rgb(0.15, 0.15, 0.18), gap = 3 } = {}) {
        String(text).split('\n').forEach(paragraph => {
          let line = ''
          const words = paragraph.split(/\s+/).filter(Boolean)
          const flush = () => { if (line) { ensureSpace(size + gap); page.drawText(line, { x: MARGIN, y, size, font: f, color }); y -= size + gap; line = '' } }
          if (words.length === 0) { ensureSpace(size + gap); y -= size + gap; return }
          words.forEach(w => {
            const test = line ? line + ' ' + w : w
            if (f.widthOfTextAtSize(test, size) > MAX_W && line) { flush(); line = w } else { line = test }
          })
          flush()
        })
      }
      function drawHeading(text) {
        ensureSpace(26); y -= 6
        page.drawText(text, { x: MARGIN, y, size: 13, font: fontBold, color: colTitolo })
        y -= 4
        page.drawLine({ start: { x: MARGIN, y }, end: { x: PAGE_W - MARGIN, y }, thickness: 0.5, color: rgb(0.8, 0.8, 0.85) })
        y -= 14
      }
      const spacer = (h = 8) => { y -= h }

      drawText(`Dossier BJR — ${dossier.ad.titolo}`, { size: 16, f: fontBold, color: colTitolo })
      drawText(`${ORGANO_LABEL[dossier.organo?.tipo] || 'Organo'} · N. ${numFmt(dossier.ad)} · Verbalizzata il ${dataFmt(dossier.ad.data_verbale)}`, { size: 10, color: colGrigio })
      if (dossier.ad.hash_documento) drawText(`SHA-256: ${dossier.ad.hash_documento}`, { size: 7, color: colGrigio })
      spacer(6)
      drawText(`Score conformità: ${score.punteggio != null ? score.punteggio + '%' : '—'}`, { size: 14, f: fontBold })
      spacer(10)

      drawHeading('Criteri verificati')
      score.criteri.forEach(c => drawText(`${Math.round(c.valore * 100)}%  ${c.label} — ${c.dettaglio}`))

      if (dossier.isAssemblea && dossier.componenti.length) {
        spacer(8); drawHeading('Presenze soci')
        dossier.componenti.forEach(c => {
          const p = dossier.presenze.find(x => x.membro_id === c.membro_id)
          const stato = p ? (p.modalita === 'delega' ? `Per delega${p.delegato ? ` (${p.delegato})` : ''}` : 'In presenza') : 'Non dichiarato'
          drawText(`${nomeDi(c.membri)}${c.quota != null ? ` — ${c.quota}%` : ''} — ${stato}`)
        })
      }

      spacer(8); drawHeading('Delibere trattate')
      const daIncorporare = []   // allegati da tentare di incorporare, con riferimento alla delibera
      if (dossier.delibere.length === 0) drawText('Nessuna delibera registrata in questa seduta.')
      dossier.delibere.forEach(del => {
        const votiDel = dossier.voti.filter(v => v.delibera_id === del.id)
        const richiamo = dossier.richiami.find(r => (r.testo_odg || '').trim() === (del.oggetto || '').trim()) || null
        const det = richiamo?.determine || null
        const allegatiDet = det ? dossier.allegati.filter(a => a.determina_id === det.id) : []
        const rischiDet = det ? dossier.rischi.filter(r => r.determina_id === det.id) : []
        const pareriDet = det ? dossier.pareri.filter(p => p.determina_id === det.id) : []

        drawText(`${del.oggetto}  [${del.esito}]`, { size: 11, f: fontBold })
        drawText(del.testo || 'Nessun testo registrato per questa delibera.', del.testo ? {} : { color: colAvviso })
        drawText(`Favorevoli${dossier.isAssemblea ? ' (%)' : ''}: ${del.favorevoli} · Contrari: ${del.contrari} · Astenuti: ${del.astenuti}`, { size: 9 })
        if (votiDel.length) {
          votiDel.forEach(v => {
            const c = dossier.componenti.find(x => x.membro_id === v.membro_id)
            drawText(`  • ${c ? nomeDi(c.membri) : '—'}: ${v.voto}`, { size: 9 })
          })
        } else {
          drawText('  solo totale aggregato, nessun voto nominativo', { size: 9, color: colAvviso })
        }
        if (det) {
          drawText(`Atto istruito: ${det.oggetto}${numeroAttoLabel(det) ? ` — ${numeroAttoLabel(det)}` : ' — non ancora protocollato'}${det.valore ? ` — € ${Number(det.valore).toLocaleString('it-IT')}` : ''}`, { size: 9 })
          if (rischiDet.length) drawText(`Rischi: ${rischiDet.map(r => `${r.categoria} (liv. ${r.livello})`).join(', ')}`, { size: 9 })
          drawText(`Pareri: ${pareriDet.length ? pareriDet.map(p => p.tipo).join(', ') : 'nessuno'}`, { size: 9 })
          drawText(`Allegati: ${allegatiDet.length ? allegatiDet.map(a => a.nome_file).join(', ') : 'nessuno'}`, { size: 9 })
          allegatiDet.forEach(a => daIncorporare.push({ ...a, deliberaOggetto: del.oggetto }))
        }
        spacer(10)
      })

      drawHeading('Circolarizzazione e presa visione')
      if (dossier.ticket.length === 0) drawText('Nessun ticket di circolarizzazione collegato a questa seduta.')
      dossier.ticket.forEach(t => drawText(`${nomeDi(t.membri)} — ${t.tipo} — ${t.titolo} — ${t.data_presa_visione ? dataFmt(t.data_presa_visione) : 'in attesa'}`, { size: 9 }))

      spacer(8); drawHeading('Cronologia')
      if (dossier.eventi.length === 0) drawText('Nessun evento registrato.')
      dossier.eventi.forEach(e => drawText(`${dataFmt(e.created_at)} — ${e.evento}${e.dettaglio ? ` — ${e.dettaglio}` : ''}`, { size: 9 }))

      // ── Allegati incorporati (una copertina + contenuto per ciascuno) ──
      const nonIncorporabili = []
      for (const a of daIncorporare) {
        const ext = (a.nome_file.split('.').pop() || '').toLowerCase()
        const embeddable = ext === 'pdf' || ext === 'png' || ext === 'jpg' || ext === 'jpeg'
        if (!embeddable) { nonIncorporabili.push(a); continue }
        try {
          const { data: blob, error } = await supabase.storage.from('fascicoli').download(a.storage_path)
          if (error || !blob) { nonIncorporabili.push(a); continue }
          const bytes = new Uint8Array(await blob.arrayBuffer())
          if (ext === 'pdf') {
            const src = await PDFDocument.load(bytes)
            const pagineCopiate = await pdfDoc.copyPages(src, src.getPageIndices())
            newPage()
            drawText(`Allegato: ${a.nome_file}`, { size: 12, f: fontBold, color: colTitolo })
            drawText(`Riferito a: ${a.deliberaOggetto}`, { size: 9, color: colGrigio })
            pagineCopiate.forEach(p => pdfDoc.addPage(p))
          } else {
            const img = ext === 'png' ? await pdfDoc.embedPng(bytes) : await pdfDoc.embedJpg(bytes)
            newPage()
            drawText(`Allegato: ${a.nome_file}`, { size: 12, f: fontBold, color: colTitolo })
            drawText(`Riferito a: ${a.deliberaOggetto}`, { size: 9, color: colGrigio })
            newPage()
            const scale = Math.min(MAX_W / img.width, (PAGE_H - MARGIN * 2) / img.height, 1)
            const w = img.width * scale, h = img.height * scale
            page.drawImage(img, { x: (PAGE_W - w) / 2, y: (PAGE_H - h) / 2, width: w, height: h })
          }
        } catch (e) {
          nonIncorporabili.push(a)
        }
      }

      if (nonIncorporabili.length) {
        newPage()
        drawHeading('Allegati non incorporabili in questo PDF')
        drawText('Formato non incorporabile (es. Word/Excel): apri il file originale dal fascicolo a schermo.', { size: 9, color: colGrigio })
        spacer(6)
        nonIncorporabili.forEach(a => drawText(`${a.nome_file} — riferito a: ${a.deliberaOggetto}`, { size: 9.5 }))
      }

      const bytes = await pdfDoc.save()
      const blob = new Blob([bytes], { type: 'application/pdf' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Dossier-BJR-${(dossier.ad.titolo || 'seduta').replace(/[^\w-]+/g, '_')}.pdf`
      document.body.appendChild(link); link.click(); document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (e) {
      alert('Errore nella generazione del PDF: ' + (e.message || e))
    }
    setGenerandoPdf(false)
  }

  function stampaFascicolo() {
    if (!dossier || !score) return
    const esc = s => (s == null ? '' : String(s)).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    const { ad, organo, isAssemblea, delibere, richiami, componenti, presenze, ticket, eventi, voti, allegati, rischi, pareri } = dossier

    const criteriHtml = score.criteri.map(c =>
      `<tr><td>${Math.round(c.valore * 100)}%</td><td>${esc(c.label)}</td><td>${esc(c.dettaglio)}</td></tr>`
    ).join('')

    const presenzeHtml = (isAssemblea && componenti.length > 0) ? `
      <h2>Presenze soci</h2>
      <table><thead><tr><th>Socio</th><th>Quota</th><th>Presenza</th></tr></thead><tbody>
      ${componenti.map(c => {
        const p = presenze.find(x => x.membro_id === c.membro_id)
        const stato = p ? (p.modalita === 'delega' ? `Per delega${p.delegato ? ` (${esc(p.delegato)})` : ''}` : 'In presenza') : 'Non dichiarato'
        return `<tr><td>${esc(nomeDi(c.membri))}</td><td>${c.quota != null ? c.quota + '%' : '—'}</td><td>${stato}</td></tr>`
      }).join('')}
      </tbody></table>` : ''

    const deliberetHtml = delibere.map(del => {
      const votiDel = voti.filter(v => v.delibera_id === del.id)
      const richiamo = richiami.find(r => (r.testo_odg || '').trim() === (del.oggetto || '').trim()) || null
      const det = richiamo?.determine || null
      const allegatiDet = det ? allegati.filter(a => a.determina_id === det.id) : []
      const rischiDet = det ? rischi.filter(r => r.determina_id === det.id) : []
      const pareriDet = det ? pareri.filter(p => p.determina_id === det.id) : []
      const votiHtml = votiDel.length ? `<div class="voti">${votiDel.map(v => {
        const c = componenti.find(x => x.membro_id === v.membro_id)
        return `${esc(c ? nomeDi(c.membri) : '—')}: <b>${esc(v.voto)}</b>`
      }).join('<br>')}</div>` : `<div class="nota">solo totale aggregato, nessun voto nominativo</div>`
      const attoHtml = det ? `<div class="atto"><b>Atto istruito:</b> ${esc(det.oggetto)} — ${numeroAttoLabel(det) ? esc(numeroAttoLabel(det)) : 'non ancora protocollato'}${det.valore ? ` — € ${Number(det.valore).toLocaleString('it-IT')}` : ''}
        ${rischiDet.length ? `<br>Rischi: ${rischiDet.map(r => `${esc(r.categoria)} (liv. ${r.livello})`).join(', ')}` : ''}
        <br>Pareri: ${pareriDet.length ? pareriDet.map(p => esc(p.tipo)).join(', ') : 'nessuno'}
        <br>Allegati: ${allegatiDet.length ? allegatiDet.map(a => esc(a.nome_file)).join(', ') : 'nessuno'}</div>` : ''
      return `<div class="delibera">
        <div class="dt"><span>${esc(del.oggetto)}</span><span class="esito ${esc(del.esito)}">${esc(del.esito)}</span></div>
        ${del.testo ? `<div class="testoLbl">TESTO DELLA DELIBERA</div><p>${esc(del.testo)}</p>` : '<p class="nota">Nessun testo registrato per questa delibera.</p>'}
        <div class="totali">Favorevoli${isAssemblea ? ' (%)' : ''}: <b>${del.favorevoli}</b> · Contrari: <b>${del.contrari}</b> · Astenuti: <b>${del.astenuti}</b></div>
        ${votiHtml}
        ${attoHtml}
      </div>`
    }).join('')

    const circHtml = ticket.length ? `
      <h2>Circolarizzazione e presa visione</h2>
      <table><thead><tr><th>Destinatario</th><th>Tipo</th><th>Titolo</th><th>Presa visione</th></tr></thead><tbody>
      ${ticket.map(t => `<tr><td>${esc(nomeDi(t.membri))}</td><td>${esc(t.tipo)}</td><td>${esc(t.titolo)}</td><td>${t.data_presa_visione ? dataFmt(t.data_presa_visione) : 'in attesa'}</td></tr>`).join('')}
      </tbody></table>` : ''

    const eventiHtml = eventi.length ? `
      <h2>Cronologia</h2>
      ${eventi.map(e => `<div class="evento">${dataFmt(e.created_at)} — <b>${esc(e.evento)}</b>${e.dettaglio ? ` — ${esc(e.dettaglio)}` : ''}</div>`).join('')}` : ''

    const w = window.open('', '_blank')
    if (!w) return
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>Dossier BJR — ${esc(ad.titolo)}</title>
      <style>
        @page { size: A4 portrait; margin: 1.6cm; }
        body { font-family: -apple-system, Arial, sans-serif; color: #1A3A5C; font-size: 12px; line-height: 1.5; }
        h1 { font-size: 18px; margin: 0 0 2px; }
        .sub { font-size: 12px; color: #8A94A0; margin-bottom: 4px; }
        .hash { font-size: 9px; color: #999; font-family: monospace; word-break: break-all; margin-bottom: 16px; }
        .score { text-align: center; font-size: 30px; font-weight: 800; margin: 10px 0 2px; }
        .scoreLbl { text-align: center; font-size: 11px; color: #999; margin-bottom: 14px; }
        h2 { font-size: 14px; color: #1A3A5C; border-bottom: 1px solid #CBD5E1; padding-bottom: 4px; margin-top: 22px; }
        table { width: 100%; border-collapse: collapse; font-size: 11.5px; margin-top: 6px; }
        th { text-align: left; background: #F2F5F9; padding: 5px 8px; font-size: 11px; color: #5B6673; }
        td { padding: 5px 8px; border-bottom: 1px solid #EEE; }
        .delibera { border: 1px solid #E0E0E0; border-radius: 6px; padding: 10px 12px; margin-top: 10px; page-break-inside: avoid; }
        .dt { display: flex; justify-content: space-between; font-weight: 700; margin-bottom: 4px; }
        .esito { font-size: 10px; padding: 2px 8px; border-radius: 10px; }
        .esito.approvata { background: #E9F7EF; color: #1E8449; } .esito.respinta { background: #FDEDEC; color: #C0392B; } .esito.rinviata { background: #FEF9E7; color: #856404; }
        .totali { font-size: 11.5px; color: #555; margin: 6px 0; }
        .voti { background: #F7F8FA; border-radius: 5px; padding: 6px 8px; font-size: 11px; margin-bottom: 6px; }
        .nota { font-size: 11px; color: #B7791F; margin-bottom: 6px; }
        .testoLbl { font-size: 10px; font-weight: 700; color: #888; margin-top: 4px; }
        .atto { border-top: 1px dashed #E0E0E0; padding-top: 6px; font-size: 11.5px; color: #555; }
        .evento { font-size: 11px; color: #555; margin-bottom: 2px; }
      </style></head><body>
      <h1>Dossier BJR — ${esc(ad.titolo)}</h1>
      <div class="sub">${esc(ORGANO_LABEL[organo?.tipo] || 'Organo')} · N. ${numFmt(ad)} · Verbalizzata il ${dataFmt(ad.data_verbale)}</div>
      ${ad.hash_documento ? `<div class="hash">SHA-256: ${esc(ad.hash_documento)}</div>` : ''}
      <div class="score" style="color:${scoreColore(score.punteggio)}">${score.punteggio != null ? score.punteggio + '%' : '—'}</div>
      <div class="scoreLbl">score conformità</div>
      <h2>Criteri verificati</h2>
      <table><thead><tr><th style="width:60px">%</th><th>Criterio</th><th>Dettaglio</th></tr></thead><tbody>${criteriHtml}</tbody></table>
      ${presenzeHtml}
      <h2>Delibere trattate</h2>
      ${deliberetHtml || '<p>Nessuna delibera registrata.</p>'}
      ${circHtml}
      ${eventiHtml}
      <script>window.onload = function(){ window.print(); }</script>
      </body></html>`)
    w.document.close()
  }

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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button className="btn btn-sm" onClick={stampaFascicolo}>🖨️ Stampa rapida</button>
              <button className="btn btn-sm btn-primary" onClick={generaPdfCompleto} disabled={generandoPdf}>
                {generandoPdf ? 'Generazione…' : '📄 PDF con allegati'}
              </button>
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
                      {del.testo ? (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#888' }}>TESTO DELLA DELIBERA</div>
                          <p style={{ fontSize: 13, color: '#444', margin: '2px 0 0', whiteSpace: 'pre-wrap' }}>{del.testo}</p>
                        </div>
                      ) : (
                        <p style={{ fontSize: 12, color: '#B7791F', marginBottom: 8, fontStyle: 'italic' }}>Nessun testo registrato per questa delibera.</p>
                      )}
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
                          <div><strong>Atto istruito:</strong> {det.oggetto} — {numeroAttoLabel(det) || 'non ancora protocollato'} {det.valore ? `— € ${Number(det.valore).toLocaleString('it-IT')}` : ''}</div>
                          {rischiDet.length > 0 && <div>Rischi valutati: {rischiDet.map(r => `${r.categoria} (liv. ${r.livello})`).join(', ')}</div>}
                          <div>Pareri: {pareriDet.length > 0 ? pareriDet.map(p => p.tipo).join(', ') : 'nessuno'}</div>
                          <div style={{ marginTop: 4 }}>
                            Allegati: {allegatiDet.length === 0 ? 'nessuno' : (
                              <span style={{ display: 'inline-flex', flexWrap: 'wrap', gap: 6, verticalAlign: 'middle' }}>
                                {allegatiDet.map(a => (
                                  <button key={a.id} type="button" className="btn btn-sm" style={{ fontSize: 11, padding: '2px 8px' }}
                                    onClick={() => apriAllegato(a)}>📎 {a.nome_file}</button>
                                ))}
                              </span>
                            )}
                          </div>
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
