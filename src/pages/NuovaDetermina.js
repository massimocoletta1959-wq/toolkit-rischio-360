import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'
import { FASCICOLI } from '../lib/fascicoli'

// ── Costanti ────────────────────────────────────────────────────────────
const TIPI = [
  { id: 'beni_strumentali',      label: 'Acquisto beni strumentali',        icon: '🏭', desc: 'Macchinari, attrezzature, immobilizzazioni' },
  { id: 'contratto',             label: 'Approvazione contratto',           icon: '📄', desc: 'Fornitori, clienti, partner strategici' },
  { id: 'operazione_finanziaria',label: 'Operazione finanziaria',           icon: '💰', desc: 'Finanziamenti, leasing, garanzie' },
  { id: 'adempimenti_contabili', label: 'Adempimenti contabili e fiscali',  icon: '📊', desc: 'Bilancio, destinazione utili, variazioni di budget' },
  { id: 'personale',             label: 'Personale e organizzazione',       icon: '👥', desc: 'Mobilità interna, disciplinari, organigramma, mansioni' },
  { id: 'assunzione',            label: 'Assunzione rilevante',             icon: '👔', desc: 'Dirigenti, quadri, figure strategiche' },
  { id: 'consulenza',            label: 'Consulenza e incarichi esterni',   icon: '🧑‍💼', desc: 'Legali, commercialisti, revisori, tecnici' },
  { id: 'contenzioso',           label: 'Contenzioso e gestione legale',    icon: '⚖️', desc: 'Azioni legali, costituzione in giudizio, transazioni' },
  { id: 'rs_innovazione',        label: 'Ricerca, sviluppo e innovazione',  icon: '🔬', desc: 'Nuovi prodotti, digital transformation, brevetti, marchi' },
  { id: 'marketing',             label: 'Marketing, comunicazione, eventi', icon: '📣', desc: 'Campagne, sponsorizzazioni, fiere, agenzie' },
  { id: 'immobiliare',           label: 'Gestione immobiliare e manutenzioni', icon: '🏠', desc: 'Locazioni, dismissioni, manutenzione straordinaria' },
  { id: 'compliance',            label: 'Sicurezza e conformità',           icon: '🛡️', desc: 'Sicurezza lavoro, GDPR, 231, nomine (RSPP, DPO)' },
  { id: 'procura',               label: 'Concessione procura/delega',       icon: '✋', desc: 'Procuratori, agenti, rappresentanti' },
  { id: 'urgenza',               label: 'Emergenza / Urgenza',              icon: '⚡', desc: 'Decisioni urgenti non differibili' },
]
const TIPO_LABEL = Object.fromEntries(TIPI.map(t => [t.id, t.label]))

const RISK_CATS = [
  { id: 'finanziario',  label: 'Rischio finanziario',   hint: 'Sostenibilità, tassi, liquidità' },
  { id: 'operativo',    label: 'Rischio operativo',     hint: 'Esecuzione, fornitori, continuità' },
  { id: 'legale_231',   label: 'Rischio legale / 231',  hint: 'Aree sensibili, compliance' },
  { id: 'reputazionale',label: 'Rischio reputazionale', hint: 'Immagine, rapporti con stakeholder' },
]

const AREE_231 = ['', 'Rapporti con la PA', 'Gestione finanziaria', 'Salute e Sicurezza',
  'Reati informatici', 'Ambiente', 'Antiriciclaggio']

const LIV_LABEL = { 1: 'Basso', 2: 'Basso', 3: 'Medio', 4: 'Alto', 5: 'Critico' }
const livStyle = v => v >= 5 ? { background: '#FDEDEC', color: '#C0392B' }
  : v >= 4 ? { background: '#FEF5E7', color: '#B9770E' }
  : v >= 3 ? { background: '#FEF9E7', color: '#856404' }
  : { background: '#EAF2F8', color: '#2874A6' }

const STEPS = ['Tipo', 'Analisi', 'Rischio', 'Pareri', 'Redazione', 'Chiusura']

// Testo di aiuto fisso sotto ogni campo (le domande giuste a cui rispondere)
const HINT = {
  fin: 'Come si copre la spesa? Impatto su cassa e liquidità, sostenibilità nel tempo, eventuali indici (es. DSCR).',
  eco: 'Effetto su costi/ricavi e conto economico: ritorno atteso (ROI), tempo di rientro (payback), margini.',
  alt: 'Quali opzioni hai considerato e perché hai scelto questa? Cita anche il "non fare nulla" se pertinente.',
}

// Esempi (placeholder) calibrati sul tipo di determina; 'default' per i tipi non elencati
const PLACEHOLDER = {
  default: {
    fin: 'Es. Copertura con cassa aziendale; impatto contenuto sulla liquidità corrente.',
    eco: 'Es. Beneficio atteso e tempi di rientro della spesa.',
    alt: 'Es. 1) Opzione A — scartata perché…; 2) Opzione B — scelta perché…',
  },
  beni_strumentali: {
    fin: 'Es. Leasing vs acquisto; impatto su cassa, DSCR post-investimento, fonte di copertura.',
    eco: 'Es. ROI atteso sulle commesse abilitate, payback in mesi, aumento capacità produttiva.',
    alt: 'Es. 1) Acquisto cash — escluso per liquidità; 2) Terzismo — escluso per costi; 3) Leasing — scelto.',
  },
  operazione_finanziaria: {
    fin: 'Es. Importo, tasso (fisso/variabile), durata, garanzie richieste, effetto su indebitamento e DSCR.',
    eco: 'Es. Costo complessivo del finanziamento, impatto su oneri finanziari, convenienza vs alternative.',
    alt: 'Es. Altri istituti/strumenti valutati (mutuo, apertura di credito, autofinanziamento) e motivo della scelta.',
  },
  contratto: {
    fin: 'Es. Valore del contratto, termini di pagamento, esposizione massima, penali.',
    eco: 'Es. Marginalità attesa, incidenza sui costi/ricavi annui, durata e rinnovi.',
    alt: 'Es. Altri fornitori/clienti valutati e criterio di selezione (prezzo, affidabilità, tempi).',
  },
  consulenza: {
    fin: 'Es. Compenso pattuito, modalità (a forfait/a ore), eventuali spese, copertura di budget.',
    eco: 'Es. Beneficio atteso dall\'incarico, alternativa "in house", rapporto costo/valore.',
    alt: 'Es. Altri professionisti/studi consultati, preventivi confrontati, motivazione della scelta.',
  },
  contenzioso: {
    fin: 'Es. Costi legali stimati, valore della causa, accantonamento a fondo rischi, spese soccombenza.',
    eco: 'Es. Probabilità di esito favorevole, importo recuperabile/rischio, convenienza vs transazione.',
    alt: 'Es. Transazione stragiudiziale, mediazione, rinuncia: valutazione comparata degli esiti.',
  },
  immobiliare: {
    fin: 'Es. Canone/prezzo, durata, oneri accessori, impatto su cassa, eventuale finanziamento.',
    eco: 'Es. Convenienza vs alternative, valorizzazione dell\'immobile, risparmio o ricavo atteso.',
    alt: 'Es. Altri immobili/soluzioni valutati, acquisto vs locazione, motivazione della scelta.',
  },
  marketing: {
    fin: 'Es. Budget della campagna/evento, ripartizione dei costi, copertura finanziaria.',
    eco: 'Es. Ritorno atteso (lead, vendite, notorietà), ROI di marketing, KPI di misurazione.',
    alt: 'Es. Altri canali/agenzie/eventi valutati e criterio di scelta.',
  },
  personale: {
    fin: 'Es. Costo annuo lordo, oneri, impatto sul costo del personale e sul budget.',
    eco: 'Es. Beneficio organizzativo atteso, produttività, copertura del fabbisogno.',
    alt: 'Es. Riorganizzazione interna, part-time, esternalizzazione: opzioni valutate.',
  },
  assunzione: {
    fin: 'Es. RAL e costo aziendale complessivo, incidenza sul budget del personale.',
    eco: 'Es. Valore aggiunto della figura, obiettivi attesi, tempi di inserimento.',
    alt: 'Es. Promozione interna, consulenza esterna, agenzia: alternative considerate.',
  },
  rs_innovazione: {
    fin: 'Es. Investimento previsto, eventuali crediti d\'imposta/agevolazioni, copertura.',
    eco: 'Es. Ritorno atteso, vantaggio competitivo, tempi di sviluppo e time-to-market.',
    alt: 'Es. Sviluppo interno vs acquisizione vs partnership: opzioni e scelta.',
  },
  compliance: {
    fin: 'Es. Costo dell\'adeguamento, sanzioni evitate, copertura di budget.',
    eco: 'Es. Riduzione del rischio, benefici organizzativi, impatto su continuità.',
    alt: 'Es. Livelli di adeguamento valutati, soluzioni interne vs esterne, motivazione.',
  },
  adempimenti_contabili: {
    fin: 'Es. Importi in gioco, impatto su liquidità e patrimonio, coerenza con il budget.',
    eco: 'Es. Effetto su risultato d\'esercizio, destinazione utili, riflessi economici.',
    alt: 'Es. Ipotesi alternative valutate (es. destinazione utili) e motivazione della scelta.',
  },
}
const ph = (tipo, campo) => (PLACEHOLDER[tipo] || PLACEHOLDER.default)[campo]

const eur = v => v == null || v === '' ? null
  : '€ ' + Number(v).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── Componente ──────────────────────────────────────────────────────────
export default function NuovaDetermina() {
  const { azienda, setPage, determinaId, determinaOrgano } = useApp()
  const anno = new Date().getFullYear()

  const [step, setStep] = useState(1)
  const [auNome, setAuNome] = useState('')          // titolare AU (da organi/organo_membri)
  const [saving, setSaving] = useState(false)
  const [errore, setErrore] = useState(null)
  const [soloLettura, setSoloLettura] = useState(false)  // determina già firmata → non modificabile
  const [caricata, setCaricata] = useState(!determinaId) // false finché carico una bozza esistente
  const [organoAzienda, setOrganoAzienda] = useState(undefined) // undefined=caricamento, 'amministratore_unico'|'cda'|null
  const [titolareNome, setTitolareNome] = useState('')          // AU: titolare; CdA: presidente

  // dati determina
  const [tipo, setTipo] = useState('')
  const [oggetto, setOggetto] = useState('')
  const [descrizione, setDescrizione] = useState('')
  const [valore, setValore] = useState('')
  const [analisiFin, setAnalisiFin] = useState('')
  const [analisiEco, setAnalisiEco] = useState('')
  const [conEconomica, setConEconomica] = useState(true)  // false = delibera senza impatti economici
  const [alternative, setAlternative] = useState('')
  const [area231, setArea231] = useState('')
  const [risk, setRisk] = useState({ finanziario: 0, operativo: 0, legale_231: 0, reputazionale: 0 })
  const [mit, setMit] = useState({})
  const [pareri, setPareri] = useState([])
  const [nuovoParere, setNuovoParere] = useState({ tipo: 'legale', fonte: '', sintesi: '' })

  // Rileva l'organo amministrativo ATTUALE (AU o CdA) e il nominativo di riferimento
  useEffect(() => {
    (async () => {
      if (!azienda?.id) return
      const { data: orgs } = await supabase.from('organi')
        .select('id,tipo').eq('azienda_id', azienda.id)
        .in('tipo', ['amministratore_unico', 'cda'])
      const org = orgs && orgs.length ? orgs[0] : null
      setOrganoAzienda(org ? org.tipo : null)
      if (!org) return
      if (org.tipo === 'amministratore_unico') {
        const { data: comp } = await supabase.from('organo_membri')
          .select('membri(nome,cognome)').eq('organo_id', org.id).limit(1)
        const m = comp && comp[0] && comp[0].membri
        if (m) { const nm = `${m.nome || ''} ${m.cognome || ''}`.trim(); setAuNome(nm); setTitolareNome(nm) }
      } else {
        // CdA: cerco il Presidente (o il primo componente)
        const { data: comp } = await supabase.from('organo_membri')
          .select('ruolo, membri(nome,cognome)').eq('organo_id', org.id)
        const pres = (comp || []).find(c => (c.ruolo || '').toLowerCase().includes('presidente')) || (comp || [])[0]
        const m = pres && pres.membri
        if (m) setTitolareNome(`${m.nome || ''} ${m.cognome || ''}`.trim())
      }
    })()
  }, [azienda])

  // Se sto riaprendo una determina esistente, carico i suoi dati
  useEffect(() => {
    (async () => {
      if (!determinaId) return
      const { data: det } = await supabase.from('determine').select('*').eq('id', determinaId).single()
      if (!det) { setCaricata(true); return }
      setTipo(det.tipo || '')
      setOggetto(det.oggetto || '')
      setDescrizione(det.descrizione || '')
      setValore(det.valore == null ? '' : String(det.valore))
      setAnalisiFin(det.analisi_finanziaria || '')
      setAnalisiEco(det.analisi_economica || '')
      if (det.con_analisi_economica === false) setConEconomica(false)
      setAlternative(det.alternative || '')
      setArea231(det.area_231 || '')
      if (det.stato === 'firmata' || det.stato === 'annullata') setSoloLettura(true)

      const { data: rr } = await supabase.from('determina_rischi').select('*').eq('determina_id', determinaId)
      if (rr && rr.length) {
        const rk = { finanziario: 0, operativo: 0, legale_231: 0, reputazionale: 0 }
        const mt = {}
        rr.forEach(r => { rk[r.categoria] = r.livello; if (r.mitigazione) mt[r.categoria] = r.mitigazione })
        setRisk(rk); setMit(mt)
      }
      const { data: pp } = await supabase.from('determina_pareri').select('*').eq('determina_id', determinaId)
      if (pp && pp.length) setPareri(pp.map(p => ({ tipo: p.tipo, fonte: p.fonte || '', sintesi: p.sintesi || '' })))

      setCaricata(true)
    })()
  }, [determinaId])

  const maxRisk = Math.max(0, ...Object.values(risk))
  const serveParere = maxRisk >= 4
  const setR = (cat, v) => setRisk(r => ({ ...r, [cat]: r[cat] === v ? 0 : v }))

  function aggiungiParere() {
    if (!nuovoParere.fonte.trim()) return
    setPareri(p => [...p, nuovoParere])
    setNuovoParere({ tipo: 'legale', fonte: '', sintesi: '' })
  }

  async function elimina() {
    if (!window.confirm(`Eliminare definitivamente questa bozza di ${isCda ? 'delibera' : 'determina'}? L'operazione non è reversibile.`)) return
    setSaving(true)
    try {
      await supabase.from('governance_eventi').insert({
        azienda_id: azienda.id, determina_id: determinaId,
        evento: 'eliminazione_bozza', dettaglio: oggetto || '(senza oggetto)',
      })
    } catch (_e) { /* l'evento è accessorio */ }
    const { error } = await supabase.from('determine').delete().eq('id', determinaId)
    setSaving(false)
    if (error) { setErrore(error.message); return }
    setPage('au_registro')
  }

  function generaCorpo(numero) {
    const num = numero != null ? String(numero).padStart(3, '0') : '—'
    const chiRischi = RISK_CATS.filter(c => risk[c.id] > 0)
      .map(c => `${c.label.toLowerCase()}: ${LIV_LABEL[risk[c.id]]}`).join('; ')
    const righeParere = pareri.length
      ? `ACQUISITI i pareri professionali: ${pareri.map(p => `${p.tipo}${p.fonte ? ' (' + p.fonte + ')' : ''}`).join('; ')};`
      : ''
    return [
      isCda
        ? `Proposta di DELIBERA DEL CONSIGLIO DI AMMINISTRAZIONE N. ${num}/${anno}`
        : `DETERMINA DELL'AMMINISTRATORE UNICO N. ${num}/${anno}`,
      ``,
      isCda
        ? `PREMESSA. Il Consiglio di Amministrazione di ${azienda?.nome || 'questa società'}, riunitosi e validamente costituito, avendo valutato la necessità e l'opportunità dell'operazione di seguito descritta;`
        : `PREMESSA. Il/La sottoscritto/a ${titolareNome || auNome || 'Amministratore Unico'}, in qualità di Amministratore Unico di ${azienda?.nome || 'questa società'}, avendo valutato la necessità e l'opportunità dell'operazione di seguito descritta;`,
      ``,
      `VISTE le analisi economico-finanziarie condotte e la documentazione istruttoria agli atti;`,
      alternative ? `VALUTATE le alternative considerate: ${alternative};` : '',
      chiRischi ? `ACCERTATO che i rischi connessi sono stati valutati (${chiRischi}) con i relativi piani di mitigazione;` : '',
      righeParere,
      area231 ? `RILEVATO che l'operazione ricade nell'area sensibile 231 "${area231}", per la quale sono stati rispettati i protocolli previsti dal Modello Organizzativo;` : '',
      ``,
      isCda ? `DELIBERA` : `DETERMINA`,
      `1. di approvare l'operazione avente ad oggetto: ${oggetto}${eur(valore) ? `, per un valore di ${eur(valore)}` : ''};`,
      descrizione ? `2. ${descrizione}` : '',
      `${descrizione ? '3' : '2'}. di autorizzare la sottoscrizione di tutti gli atti conseguenti.`,
    ].filter(Boolean).join('\n')
  }

  async function salva(firma) {
    setErrore(null)
    if (!tipo) { setStep(1); setErrore('Seleziona il tipo di determina, poi riprova.'); return }
    if (!oggetto.trim()) { setStep(1); setErrore("Manca l'oggetto della determina: lo trovi qui sotto. Compilalo e riprova — il resto del lavoro è al sicuro."); return }
    if (firma && conEconomica && serveParere && pareri.length === 0) {
      setStep(4); setErrore(isCda ? 'Rischio alto/critico rilevato: è obbligatorio allegare almeno un parere prima di protocollare.' : 'Rischio alto/critico rilevato: è obbligatorio allegare almeno un parere prima di firmare.'); return
    }

    setSaving(true)
    try {
      let numero = null, data_firma = null, hash = null, stato = 'bozza'
      if (firma) {
        const { data: n, error: eN } = await supabase.rpc('prossimo_numero_determina', { p_azienda: azienda.id, p_anno: anno, p_organo: organoAtto })
        if (eN) throw eN
        numero = n
        data_firma = new Date().toISOString()
        stato = 'firmata'
        hash = await sha256(generaCorpo(numero))
      }
      const corpo = generaCorpo(numero)

      const campi = {
        azienda_id: azienda.id, anno, tipo, organo: organoAtto, oggetto: oggetto.trim(), descrizione: descrizione || null,
        valore: valore === '' ? null : Number(valore),
        con_analisi_economica: conEconomica,
        analisi_finanziaria: conEconomica ? (analisiFin || null) : null,
        analisi_economica: conEconomica ? (analisiEco || null) : null,
        alternative: conEconomica ? (alternative || null) : null,
        area_231: area231 || null, corpo_html: corpo, stato,
      }
      // il numero/hash/data si scrivono solo alla firma (una bozza non li ha)
      if (firma) { campi.numero = numero; campi.data_firma = data_firma; campi.hash_documento = hash }

      let detId = determinaId
      if (determinaId) {
        const { error } = await supabase.from('determine').update(campi).eq('id', determinaId)
        if (error) throw error
        // ricarico rischi e pareri da zero (sostituzione pulita)
        await supabase.from('determina_rischi').delete().eq('determina_id', determinaId)
        await supabase.from('determina_pareri').delete().eq('determina_id', determinaId)
      } else {
        const { data: det, error } = await supabase.from('determine').insert(campi).select().single()
        if (error) throw error
        detId = det.id
      }

      const righeRischi = RISK_CATS.filter(c => risk[c.id] > 0).map(c => ({
        determina_id: detId, azienda_id: azienda.id, categoria: c.id, livello: risk[c.id], mitigazione: mit[c.id] || null,
      }))
      if (righeRischi.length) {
        const { error } = await supabase.from('determina_rischi').insert(righeRischi)
        if (error) throw error
      }

      if (pareri.length) {
        const righeP = pareri.map(p => ({
          determina_id: detId, azienda_id: azienda.id, tipo: p.tipo, fonte: p.fonte || null,
          sintesi: p.sintesi || null, obbligatorio: serveParere,
        }))
        const { error } = await supabase.from('determina_pareri').insert(righeP)
        if (error) throw error
      }

      await supabase.from('governance_eventi').insert({
        azienda_id: azienda.id, determina_id: detId,
        evento: firma ? 'firma' : (determinaId ? 'aggiornamento_bozza' : 'creazione_bozza'),
        dettaglio: `${TIPO_LABEL[tipo] || tipo} — ${oggetto.trim()}`,
      })

      setPage('au_registro')
    } catch (e) {
      setErrore(e.message || 'Errore durante il salvataggio.')
      setSaving(false)
    }
  }

  // ── UI ──────────────────────────────────────────────────────────────
  // Organo dell'atto che sto creando: da context (nuovo) o dall'organo attuale
  const organoAtto = determinaOrgano || organoAzienda || 'amministratore_unico'
  const isCda = organoAtto === 'cda'

  // GUARDIA DI ACCESSO (solo in creazione nuova; le bozze/atti esistenti si aprono sempre)
  if (!determinaId && organoAzienda !== undefined && organoAzienda && determinaOrgano && determinaOrgano !== organoAzienda) {
    const attesa = determinaOrgano === 'cda' ? 'il Consiglio di Amministrazione' : "l'Amministratore Unico"
    const reale = organoAzienda === 'cda' ? 'il Consiglio di Amministrazione' : "l'Amministratore Unico"
    return (
      <div>
        <div className="page-header">
          <h2>Operazione non consentita</h2>
        </div>
        <div className="alert alert-error">
          Questa società ha {reale} come organo amministrativo, quindi non è possibile creare un atto per {attesa}.
        </div>
        <button className="btn" onClick={() => setPage(organoAzienda === 'cda' ? 'au_registro' : 'au_registro')}>← Torna al registro</button>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>{soloLettura ? (isCda ? 'Delibera CdA' : 'Determina AU') : determinaId ? (isCda ? 'Modifica Delibera CdA' : 'Modifica Determina AU') : (isCda ? 'Nuova Delibera CdA' : 'Nuova Determina AU')}</h2>
            <p>
              {tipo
                ? <>{TIPI.find(t => t.id === tipo)?.icon} <strong>{TIPO_LABEL[tipo]}</strong> · {azienda?.nome}</>
                : <>Flusso guidato · {azienda?.nome}</>}
              {titolareNome ? (isCda ? ` · Presidente: ${titolareNome}` : ` · AU: ${titolareNome}`) : ''} · Anno {anno}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {determinaId && !soloLettura && <button className="btn btn-sm btn-danger" onClick={elimina} disabled={saving}>🗑 Elimina bozza</button>}
            <button className="btn btn-sm" onClick={() => setPage('au_registro')}>← Registro</button>
          </div>
        </div>
      </div>

      {soloLettura && (
        <div className="alert" style={{ marginBottom: 14, background: '#EAF2F8', color: '#1A5276' }}>
          🔒 {isCda ? 'Questa delibera ha l\'istruttoria chiusa ed è protocollata' : 'Questa determina è già firmata e registrata'}: è consultabile ma non modificabile.
        </div>
      )}

      {/* Indicatore step */}
      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E0E0E0', marginBottom: 18 }}>
        {STEPS.map((s, i) => {
          const n = i + 1
          const active = n === step, done = n < step
          const disabilitato = !conEconomica && (n === 2 || n === 3 || n === 4)
          return (
            <div key={s} onClick={() => { if (!disabilitato) setStep(n) }}
              style={{
                flex: 1, padding: '9px 6px', textAlign: 'center', fontSize: 12, fontWeight: 600,
                cursor: disabilitato ? 'not-allowed' : 'pointer', opacity: disabilitato ? 0.4 : 1,
                background: active ? '#7F77DD' : done ? '#EDEBFA' : '#F7F8FA',
                color: active ? '#fff' : done ? '#5A4FCF' : '#999',
              }}>{n} · {s}</div>
          )
        })}
      </div>

      {errore && <div className="alert alert-error" style={{ marginBottom: 14 }}>{errore}</div>}

      {/* STEP 1 — Tipo */}
      {step === 1 && (
        <div className="card">
          {/* Oggetto in cima, piena larghezza */}
          <div className="form-group">
            <label className="form-label">Oggetto {isCda ? 'della delibera' : 'della determina'} *</label>
            <input className="form-control" value={oggetto} onChange={e => setOggetto(e.target.value)}
              placeholder="es. Contratto di leasing macchinario CNC" />
          </div>

          {/* Due colonne: sinistra i tipi (stretti, 2 colonne), destra la guida */}
          <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'flex-start' }}>
            <div style={{ flex: '1 1 340px', minWidth: 280 }}>
              <label className="form-label">Tipo di {isCda ? 'delibera' : 'determina'} *</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {TIPI.map(t => (
                  <div key={t.id} onClick={() => setTipo(t.id)}
                    style={{
                      border: `1.5px solid ${tipo === t.id ? '#7F77DD' : '#E0E0E0'}`,
                      background: tipo === t.id ? '#EDEBFA' : '#fff',
                      borderRadius: 10, padding: '10px 12px', cursor: 'pointer',
                    }}>
                    <div style={{ fontSize: 18, marginBottom: 2 }}>{t.icon}</div>
                    <div style={{ fontWeight: 600, fontSize: 12.5, color: '#1A3A5C', lineHeight: 1.25 }}>{t.label}</div>
                    <div style={{ fontSize: 11, color: '#666', marginTop: 2, lineHeight: 1.3 }}>{t.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: '1 1 340px', minWidth: 280 }}>
              {tipo && FASCICOLI[tipo] ? (
                <div style={{ background: '#F4F8FF', border: '1px solid #CFE0F5', borderRadius: 12, padding: '14px 16px', position: 'sticky', top: 12 }}>
                  <div style={{ fontSize: 13, color: '#1A3A5C', marginBottom: 8 }}>
                    <strong>Cosa riguarda.</strong> {FASCICOLI[tipo].riguarda}
                  </div>
                  <div style={{ fontSize: 13, color: '#1A3A5C', marginBottom: 8 }}>
                    <strong>Funzionamento.</strong> {FASCICOLI[tipo].funzionamento}
                  </div>
                  <div style={{ fontSize: 13, color: '#1A3A5C', marginBottom: 10 }}>
                    <strong>Elementi chiave.</strong> {FASCICOLI[tipo].elementi}
                  </div>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: '#5A4FCF', marginBottom: 4 }}>📂 Giustificativi da conservare nel fascicolo</div>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18, fontSize: 12.5, color: '#44506A', lineHeight: 1.6 }}>
                    {FASCICOLI[tipo].giustificativi.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
              ) : (
                <div style={{ background: '#F7F8FA', border: '1px dashed #D5DCE6', borderRadius: 12, padding: '24px 16px', textAlign: 'center', color: '#9AA5B4', fontSize: 13 }}>
                  Scegli un tipo per vedere cosa riguarda e quali giustificativi conservare nel fascicolo.
                </div>
              )}
            </div>
          </div>

          <div className="form-group" style={{ background: '#F7F8FA', borderRadius: 10, padding: '12px 14px', marginTop: 16 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13.5 }}>
              <input type="checkbox" checked={conEconomica} onChange={e => setConEconomica(e.target.checked)} />
              <span>Questa {isCda ? 'delibera' : 'determina'} ha <strong>impatti economici</strong> da analizzare</span>
            </label>
            <div style={{ fontSize: 11.5, color: '#999', marginTop: 6 }}>
              {conEconomica
                ? 'Verranno chiesti analisi economico-finanziaria, valutazione del rischio ed eventuali pareri.'
                : 'Istruttoria semplificata: si passa direttamente alla redazione del testo (es. preparazione all\'approvazione del bilancio).'}
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => setStep(conEconomica ? 2 : 5)}>Avanti →</button>
          </div>
        </div>
      )}

      {/* STEP 2 — Analisi */}
      {step === 2 && (
        <div className="card">
          <div className="form-group">
            <label className="form-label">Descrizione dell'operazione</label>
            <textarea className="form-control" value={descrizione} onChange={e => setDescrizione(e.target.value)}
              placeholder="Descrivi in dettaglio l'operazione oggetto della determina..." />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Valore (€)</label>
              <input className="form-control" type="number" min="0" step="0.01" value={valore}
                onChange={e => setValore(e.target.value)} placeholder="es. 525000" />
            </div>
            <div className="form-group">
              <label className="form-label">Analisi finanziaria</label>
              <textarea className="form-control" value={analisiFin} onChange={e => setAnalisiFin(e.target.value)}
                placeholder={ph(tipo, 'fin')} />
              <div style={{ fontSize: 11.5, color: '#999', marginTop: 4 }}>{HINT.fin}</div>
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Analisi economica</label>
              <textarea className="form-control" value={analisiEco} onChange={e => setAnalisiEco(e.target.value)}
                placeholder={ph(tipo, 'eco')} />
              <div style={{ fontSize: 11.5, color: '#999', marginTop: 4 }}>{HINT.eco}</div>
            </div>
            <div className="form-group">
              <label className="form-label">Alternative valutate</label>
              <textarea className="form-control" value={alternative} onChange={e => setAlternative(e.target.value)}
                placeholder={ph(tipo, 'alt')} />
              <div style={{ fontSize: 11.5, color: '#999', marginTop: 4 }}>{HINT.alt}</div>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn" onClick={() => setStep(1)}>← Indietro</button>
            <button className="btn btn-primary" onClick={() => setStep(3)}>Avanti →</button>
          </div>
        </div>
      )}

      {/* STEP 3 — Rischio */}
      {step === 3 && (
        <div className="card">
          <div className="form-group">
            <label className="form-label">Valuta ogni categoria di rischio (1 = basso · 5 = critico)</label>
            {RISK_CATS.map(c => (
              <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', padding: '8px 0', borderBottom: '1px solid #F0F0F0' }}>
                <div style={{ width: 150 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{c.label}</div>
                  <div style={{ fontSize: 11, color: '#999' }}>{c.hint}</div>
                </div>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[1, 2, 3, 4, 5].map(v => (
                    <button key={v} onClick={() => setR(c.id, v)}
                      style={{
                        width: 30, height: 30, borderRadius: 6, cursor: 'pointer', fontWeight: 600, fontSize: 13,
                        border: `1.5px solid ${risk[c.id] >= v ? '#7F77DD' : '#E0E0E0'}`,
                        background: risk[c.id] >= v ? '#7F77DD' : '#fff',
                        color: risk[c.id] >= v ? '#fff' : '#999',
                      }}>{v}</button>
                  ))}
                </div>
                {risk[c.id] > 0 && <span className="badge" style={livStyle(risk[c.id])}>{LIV_LABEL[risk[c.id]]}</span>}
                {risk[c.id] >= 3 && (
                  <input className="form-control" style={{ flex: 1, minWidth: 180 }} value={mit[c.id] || ''}
                    onChange={e => setMit(m => ({ ...m, [c.id]: e.target.value }))} placeholder="Piano di mitigazione..." />
                )}
              </div>
            ))}
          </div>
          <div className="form-group">
            <label className="form-label">Area sensibile 231 (se applicabile)</label>
            <select className="form-control" value={area231} onChange={e => setArea231(e.target.value)}>
              {AREE_231.map(a => <option key={a} value={a}>{a || '— Nessuna / non pertinente'}</option>)}
            </select>
          </div>
          {serveParere && (
            <div className="alert alert-error" style={{ marginBottom: 14 }}>
              🚨 Rischio alto/critico rilevato: prima di {isCda ? 'protocollare' : 'firmare'} sarà obbligatorio allegare almeno un parere (step successivo).
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <button className="btn" onClick={() => setStep(2)}>← Indietro</button>
            <button className="btn btn-primary" onClick={() => setStep(4)}>Avanti →</button>
          </div>
        </div>
      )}

      {/* STEP 4 — Pareri */}
      {step === 4 && (
        <div className="card">
          {serveParere
            ? <div className="alert alert-error" style={{ marginBottom: 14 }}>Obbligatorio: il rischio rilevato richiede almeno un parere professionale.</div>
            : <p style={{ fontSize: 13, color: '#666', marginBottom: 14 }}>Puoi allegare pareri professionali a supporto della decisione (facoltativo per questo livello di rischio).</p>}

          {pareri.map((p, i) => (
            <div key={i} style={{ border: '1px solid #E0E0E0', borderRadius: 8, padding: 12, marginBottom: 8, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>Parere {p.tipo}{p.fonte ? ` — ${p.fonte}` : ''}</div>
                {p.sintesi && <div style={{ fontSize: 12, color: '#666', marginTop: 3 }}>{p.sintesi}</div>}
              </div>
              <button className="btn btn-sm btn-danger" onClick={() => setPareri(pareri.filter((_, j) => j !== i))}>Rimuovi</button>
            </div>
          ))}

          <div style={{ background: '#F7F8FA', borderRadius: 8, padding: 12, marginTop: 8 }}>
            <div className="grid-2">
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Tipo di parere</label>
                <select className="form-control" value={nuovoParere.tipo} onChange={e => setNuovoParere({ ...nuovoParere, tipo: e.target.value })}>
                  <option value="legale">Legale</option>
                  <option value="finanziario">Finanziario</option>
                  <option value="tecnico">Tecnico</option>
                  <option value="odv">OdV</option>
                </select>
              </div>
              <div className="form-group" style={{ marginBottom: 8 }}>
                <label className="form-label">Fonte / professionista</label>
                <input className="form-control" value={nuovoParere.fonte} onChange={e => setNuovoParere({ ...nuovoParere, fonte: e.target.value })} placeholder="es. Studio Legale Rossi" />
              </div>
            </div>
            <div className="form-group" style={{ marginBottom: 8 }}>
              <label className="form-label">Sintesi del parere</label>
              <textarea className="form-control" value={nuovoParere.sintesi} onChange={e => setNuovoParere({ ...nuovoParere, sintesi: e.target.value })} placeholder="Conclusione del parere..." />
            </div>
            <button className="btn btn-sm btn-primary" onClick={aggiungiParere} disabled={!nuovoParere.fonte.trim()}>+ Aggiungi parere</button>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
            <button className="btn" onClick={() => setStep(3)}>← Indietro</button>
            <button className="btn btn-primary" onClick={() => setStep(5)}>Avanti →</button>
          </div>
        </div>
      )}

      {/* STEP 5 — Redazione */}
      {step === 5 && (
        <div className="card">
          <label className="form-label">Anteprima {isCda ? 'delibera' : 'determina'}</label>
          <pre style={{
            whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.7, color: '#333',
            background: '#F7F8FA', border: '1px solid #E0E0E0', borderRadius: 8, padding: 16, marginTop: 6,
          }}>{generaCorpo(null)}</pre>
          <div style={{ fontSize: 11.5, color: '#999', marginTop: 8 }}>Il numero definitivo verrà assegnato alla {isCda ? 'protocollazione' : 'firma'}. Puoi ancora tornare indietro per modificare i dati.</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
            <button className="btn" onClick={() => setStep(conEconomica ? 4 : 1)}>← Indietro</button>
            <button className="btn btn-primary" onClick={() => setStep(6)}>Avanti →</button>
          </div>
        </div>
      )}

      {/* STEP 6 — Firma */}
      {step === 6 && (
        <div className="card" style={{ textAlign: 'center', padding: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✍️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1A3A5C', marginBottom: 6 }}>{isCda ? 'Salva o chiudi l\'istruttoria' : 'Salva o firma la determina'}</div>
          <div style={{ fontSize: 12.5, color: '#666', marginBottom: 18 }}>
            {isCda ? 'La chiusura dell\'istruttoria assegna il numero progressivo definitivo e congela il documento preparatorio con un hash SHA-256.' : 'La firma assegna il numero progressivo definitivo e congela il documento con un hash SHA-256.'} La bozza resta modificabile.
          </div>
          <div style={{ display: 'inline-flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="badge" style={{ background: '#E9F7EF', color: '#1E8449' }}>Tipo: {TIPO_LABEL[tipo] || '—'}</span>
            {eur(valore) && <span className="badge" style={{ background: '#EBF4FC', color: '#2B5FA5' }}>{eur(valore)}</span>}
            {maxRisk > 0 && <span className="badge" style={livStyle(maxRisk)}>Rischio max: {LIV_LABEL[maxRisk]}</span>}
            {pareri.length > 0 && <span className="badge" style={{ background: '#EDEBFA', color: '#5A4FCF' }}>{pareri.length} parere/i</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => salva(false)} disabled={saving || soloLettura}>{saving ? 'Salvataggio…' : '💾 Salva come bozza'}</button>
            <button className="btn btn-primary" onClick={() => salva(true)} disabled={saving || soloLettura}>{saving ? 'Salvataggio…' : (isCda ? '📋 Chiudi l\'istruttoria e protocolla' : '✍️ Firma e registra')}</button>
          </div>
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-sm" onClick={() => setStep(5)}>← Indietro</button>
          </div>
        </div>
      )}
    </div>
  )
}
