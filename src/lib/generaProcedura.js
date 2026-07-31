import { supabase } from './supabase'

export async function generaProcedura(proc, azienda) {
  const [tplRes, ruoliRes] = await Promise.all([
    supabase.from('procedure_template').select('*').eq('codice', proc.codice).single(),
    supabase.from('ruoli').select('sigla, nome, membri(nome, cognome)').eq('azienda_id', azienda.id),
  ])
  const tpl = tplRes.data
  if (!tpl) { alert('Template non trovato nel contenitore: ' + proc.codice); return }

  const mappa = {}
  ;(ruoliRes.data || []).forEach(r => { mappa[r.sigla] = r })

  let corpo = tpl.corpo_html.split('{{AZIENDA}}').join(azienda.nome)
  corpo = corpo.replace(/\{\{RUOLO:([A-Z0-9]+)\}\}/g, (m, sigla) => {
    const r = mappa[sigla]
    if (r && r.membri) return `${r.membri.nome} ${r.membri.cognome} — ${r.nome}`
    if (r) return `<span style="background:#FFF3CD;padding:0 4px;border-radius:3px">${r.nome} — da assegnare</span>`
    return `<span style="background:#FADBD8;padding:0 4px;border-radius:3px">${sigla} — ruolo mancante in organigramma</span>`
  })

  const oggi = new Date().toLocaleDateString('it-IT')
  const logo = azienda.logo_url ? `<img src="${azienda.logo_url}" style="max-height:60px;max-width:180px" alt="logo" />` : ''

  const w = window.open('', '_blank')
  if (!w) { alert('Il browser ha bloccato la finestra: consenti i popup per questo sito.'); return }
  w.document.write(`<!doctype html><html lang="it"><head><meta charset="utf-8">
<title>${tpl.codice} — ${azienda.nome}</title>
<style>
  body{font-family:Calibri,Arial,sans-serif;color:#222;max-width:920px;margin:24px auto;padding:0 20px;font-size:14px;line-height:1.5}
  table{border-collapse:collapse;width:100%;margin:10px 0}
  td,th{border:1px solid #999;padding:6px 8px;vertical-align:top;font-size:12.5px}
  th{background:#EAF0F6;text-align:left}
  h1{color:#1A3A5C;font-size:22px;margin:8px 0}
  blockquote{margin:0;padding:0}
  .testata{display:flex;justify-content:space-between;align-items:center;border-bottom:3px solid #1A3A5C;padding-bottom:10px;margin-bottom:16px}
  .piede{margin-top:26px;border-top:1px solid #CCC;padding-top:8px;font-size:11px;color:#777}
  @media print { .no-print{display:none} body{margin:0 auto} }
</style></head><body>
<div class="testata">
  <div>
    <div style="font-weight:700;font-size:18px;color:#1A3A5C">${azienda.nome}</div>
    <div style="font-size:12px;color:#666">Manuale delle Procedure Aziendali — ${tpl.codice} · versione ${tpl.versione}</div>
  </div>
  ${logo}
</div>
<button class="no-print" onclick="window.print()" style="padding:8px 16px;background:#2B5FA5;color:#fff;border:none;border-radius:6px;cursor:pointer;margin-bottom:14px">🖨️ Stampa / Salva PDF</button>
${corpo}
<div class="piede">${azienda.nome} — Documento generato da Rischio 360° il ${oggi} · Riservato — uso interno</div>
</body></html>`)
  w.document.close()
}
