import React, { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

// ── Costanti ────────────────────────────────────────────────────────────
const TIPI = [
  { id: 'beni_strumentali',      label: 'Acquisto beni strumentali', icon: '🏭', desc: 'Macchinari, attrezzature, immobilizzazioni' },
  { id: 'contratto',             label: 'Approvazione contratto',     icon: '📄', desc: 'Fornitori, clienti, partner strategici' },
  { id: 'operazione_finanziaria',label: 'Operazione finanziaria',     icon: '💰', desc: 'Finanziamenti, leasing, garanzie' },
  { id: 'procura',               label: 'Concessione procura/delega', icon: '✋', desc: 'Procuratori, agenti, rappresentanti' },
  { id: 'assunzione',            label: 'Assunzione rilevante',       icon: '👔', desc: 'Dirigenti, quadri, figure strategiche' },
  { id: 'urgenza',               label: 'Emergenza / Urgenza',        icon: '⚡', desc: 'Decisioni urgenti non differibili' },
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

const STEPS = ['Tipo', 'Analisi', 'Rischio', 'Pareri', 'Redazione', 'Firma']

const eur = v => v == null || v === '' ? null
  : '€ ' + Number(v).toLocaleString('it-IT', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// ── Componente ──────────────────────────────────────────────────────────
export default function NuovaDetermina() {
  const { azienda, setPage } = useApp()
  const anno = new Date().getFullYear()

  const [step, setStep] = useState(1)
  const [auNome, setAuNome] = useState('')          // titolare AU (da organi/organo_membri)
  const [saving, setSaving] = useState(false)
  const [errore, setErrore] = useState(null)

  // dati determina
  const [tipo, setTipo] = useState('')
  const [oggetto, setOggetto] = useState('')
  const [descrizione, setDescrizione] = useState('')
  const [valore, setValore] = useState('')
  const [analisiFin, setAnalisiFin] = useState('')
  const [analisiEco, setAnalisiEco] = useState('')
  const [alternative, setAlternative] = useState('')
  const [area231, setArea231] = useState('')
  const [risk, setRisk] = useState({ finanziario: 0, operativo: 0, legale_231: 0, reputazionale: 0 })
  const [mit, setMit] = useState({})
  const [pareri, setPareri] = useState([])
  const [nuovoParere, setNuovoParere] = useState({ tipo: 'legale', fonte: '', sintesi: '' })

  // Carica il titolare dell'Amministratore Unico
  useEffect(() => {
    (async () => {
      if (!azienda?.id) return
      const { data: org } = await supabase.from('organi')
        .select('id').eq('azienda_id', azienda.id).eq('tipo', 'amministratore_unico').limit(1)
      if (!org || !org.length) return
      const { data: comp } = await supabase.from('organo_membri')
        .select('membri(nome,cognome)').eq('organo_id', org[0].id).limit(1)
      const m = comp && comp[0] && comp[0].membri
      if (m) setAuNome(`${m.nome || ''} ${m.cognome || ''}`.trim())
    })()
  }, [azienda])

  const maxRisk = Math.max(0, ...Object.values(risk))
  const serveParere = maxRisk >= 4
  const setR = (cat, v) => setRisk(r => ({ ...r, [cat]: r[cat] === v ? 0 : v }))

  function aggiungiParere() {
    if (!nuovoParere.fonte.trim()) return
    setPareri(p => [...p, nuovoParere])
    setNuovoParere({ tipo: 'legale', fonte: '', sintesi: '' })
  }

  function generaCorpo(numero) {
    const dataOggi = new Date().toLocaleDateString('it-IT')
    const num = numero != null ? String(numero).padStart(3, '0') : '—'
    const chiRischi = RISK_CATS.filter(c => risk[c.id] > 0)
      .map(c => `${c.label.toLowerCase()}: ${LIV_LABEL[risk[c.id]]}`).join('; ')
    const righeParere = pareri.length
      ? `ACQUISITI i pareri professionali: ${pareri.map(p => `${p.tipo}${p.fonte ? ' (' + p.fonte + ')' : ''}`).join('; ')};`
      : ''
    return [
      `DETERMINA DELL'AMMINISTRATORE UNICO N. ${num}/${anno}`,
      `${azienda?.nome || ''}${azienda?.settore ? ' · ' + azienda.settore : ''} · ${dataOggi}`,
      ``,
      `PREMESSA. Il/La sottoscritto/a ${auNome || 'Amministratore Unico'}, in qualità di Amministratore Unico di ${azienda?.nome || 'questa società'}, avendo valutato la necessità e l'opportunità dell'operazione di seguito descritta;`,
      ``,
      `VISTE le analisi economico-finanziarie condotte e la documentazione istruttoria agli atti;`,
      alternative ? `VALUTATE le alternative considerate: ${alternative};` : '',
      chiRischi ? `ACCERTATO che i rischi connessi sono stati valutati (${chiRischi}) con i relativi piani di mitigazione;` : '',
      righeParere,
      area231 ? `RILEVATO che l'operazione ricade nell'area sensibile 231 "${area231}", per la quale sono stati rispettati i protocolli previsti dal Modello Organizzativo;` : '',
      ``,
      `DETERMINA`,
      `1. di approvare l'operazione avente ad oggetto: ${oggetto}${eur(valore) ? `, per un valore di ${eur(valore)}` : ''};`,
      descrizione ? `2. ${descrizione}` : '',
      `${descrizione ? '3' : '2'}. di autorizzare la sottoscrizione di tutti gli atti conseguenti.`,
    ].filter(Boolean).join('\n')
  }

  async function salva(firma) {
    setErrore(null)
    if (!tipo) { setStep(1); setErrore('Seleziona il tipo di determina.'); return }
    if (!oggetto.trim()) { setStep(1); setErrore("Indica l'oggetto della determina."); return }
    if (firma && serveParere && pareri.length === 0) {
      setStep(4); setErrore('Rischio alto/critico rilevato: è obbligatorio allegare almeno un parere prima di firmare.'); return
    }

    setSaving(true)
    try {
      let numero = null, data_firma = null, hash = null, stato = 'bozza'
      if (firma) {
        const { data: n, error: eN } = await supabase.rpc('prossimo_numero_determina', { p_azienda: azienda.id, p_anno: anno })
        if (eN) throw eN
        numero = n
        data_firma = new Date().toISOString()
        stato = 'firmata'
        hash = await sha256(generaCorpo(numero))
      }
      const corpo = generaCorpo(numero)

      const { data: det, error: eDet } = await supabase.from('determine').insert({
        azienda_id: azienda.id, anno, tipo, oggetto: oggetto.trim(), descrizione: descrizione || null,
        valore: valore === '' ? null : Number(valore),
        analisi_finanziaria: analisiFin || null, analisi_economica: analisiEco || null, alternative: alternative || null,
        area_231: area231 || null, corpo_html: corpo, stato, numero, data_firma, hash_documento: hash,
      }).select().single()
      if (eDet) throw eDet

      const righeRischi = RISK_CATS.filter(c => risk[c.id] > 0).map(c => ({
        determina_id: det.id, azienda_id: azienda.id, categoria: c.id, livello: risk[c.id], mitigazione: mit[c.id] || null,
      }))
      if (righeRischi.length) {
        const { error } = await supabase.from('determina_rischi').insert(righeRischi)
        if (error) throw error
      }

      if (pareri.length) {
        const righeP = pareri.map(p => ({
          determina_id: det.id, azienda_id: azienda.id, tipo: p.tipo, fonte: p.fonte || null,
          sintesi: p.sintesi || null, obbligatorio: serveParere,
        }))
        const { error } = await supabase.from('determina_pareri').insert(righeP)
        if (error) throw error
      }

      await supabase.from('governance_eventi').insert({
        azienda_id: azienda.id, determina_id: det.id,
        evento: firma ? 'firma' : 'creazione_bozza',
        dettaglio: `${TIPO_LABEL[tipo] || tipo} — ${oggetto.trim()}`,
      })

      setPage('au_registro')
    } catch (e) {
      setErrore(e.message || 'Errore durante il salvataggio.')
      setSaving(false)
    }
  }

  // ── UI ──────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2>Nuova Determina AU</h2>
            <p>Flusso guidato · {azienda?.nome}{auNome ? ` · AU: ${auNome}` : ''} · Anno {anno}</p>
          </div>
          <button className="btn btn-sm" onClick={() => setPage('au_registro')}>← Registro</button>
        </div>
      </div>

      {/* Indicatore step */}
      <div style={{ display: 'flex', borderRadius: 8, overflow: 'hidden', border: '1px solid #E0E0E0', marginBottom: 18 }}>
        {STEPS.map((s, i) => {
          const n = i + 1
          const active = n === step, done = n < step
          return (
            <div key={s} onClick={() => setStep(n)}
              style={{
                flex: 1, padding: '9px 6px', textAlign: 'center', fontSize: 12, fontWeight: 600, cursor: 'pointer',
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
          <div className="form-group">
            <label className="form-label">Tipo di determina *</label>
            <div className="grid-2" style={{ gap: 10 }}>
              {TIPI.map(t => (
                <div key={t.id} onClick={() => setTipo(t.id)}
                  style={{
                    border: `1.5px solid ${tipo === t.id ? '#7F77DD' : '#E0E0E0'}`,
                    background: tipo === t.id ? '#EDEBFA' : '#fff',
                    borderRadius: 10, padding: 14, cursor: 'pointer',
                  }}>
                  <div style={{ fontSize: 20, marginBottom: 4 }}>{t.icon}</div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#1A3A5C' }}>{t.label}</div>
                  <div style={{ fontSize: 11.5, color: '#666', marginTop: 2 }}>{t.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Oggetto della determina *</label>
            <input className="form-control" value={oggetto} onChange={e => setOggetto(e.target.value)}
              placeholder="es. Contratto di leasing macchinario CNC" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button className="btn btn-primary" onClick={() => setStep(2)}>Avanti →</button>
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
                placeholder="Copertura, impatto cash flow, DSCR..." />
            </div>
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Analisi economica</label>
              <textarea className="form-control" value={analisiEco} onChange={e => setAnalisiEco(e.target.value)}
                placeholder="Impatto conto economico, ROI, payback..." />
            </div>
            <div className="form-group">
              <label className="form-label">Alternative valutate</label>
              <textarea className="form-control" value={alternative} onChange={e => setAlternative(e.target.value)}
                placeholder="Opzioni considerate e motivazione della scelta..." />
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
              🚨 Rischio alto/critico rilevato: prima della firma sarà obbligatorio allegare almeno un parere (step successivo).
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
          <label className="form-label">Anteprima determina</label>
          <pre style={{
            whiteSpace: 'pre-wrap', fontFamily: 'inherit', fontSize: 13, lineHeight: 1.7, color: '#333',
            background: '#F7F8FA', border: '1px solid #E0E0E0', borderRadius: 8, padding: 16, marginTop: 6,
          }}>{generaCorpo(null)}</pre>
          <div style={{ fontSize: 11.5, color: '#999', marginTop: 8 }}>Il numero definitivo verrà assegnato alla firma. Puoi ancora tornare indietro per modificare i dati.</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 14 }}>
            <button className="btn" onClick={() => setStep(4)}>← Indietro</button>
            <button className="btn btn-primary" onClick={() => setStep(6)}>Avanti →</button>
          </div>
        </div>
      )}

      {/* STEP 6 — Firma */}
      {step === 6 && (
        <div className="card" style={{ textAlign: 'center', padding: 28 }}>
          <div style={{ fontSize: 40, marginBottom: 10 }}>✍️</div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1A3A5C', marginBottom: 6 }}>Salva o firma la determina</div>
          <div style={{ fontSize: 12.5, color: '#666', marginBottom: 18 }}>
            La firma assegna il numero progressivo definitivo e congela il documento con un hash SHA-256. La bozza resta modificabile.
          </div>
          <div style={{ display: 'inline-flex', gap: 8, marginBottom: 18, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span className="badge" style={{ background: '#E9F7EF', color: '#1E8449' }}>Tipo: {TIPO_LABEL[tipo] || '—'}</span>
            {eur(valore) && <span className="badge" style={{ background: '#EBF4FC', color: '#2B5FA5' }}>{eur(valore)}</span>}
            {maxRisk > 0 && <span className="badge" style={livStyle(maxRisk)}>Rischio max: {LIV_LABEL[maxRisk]}</span>}
            {pareri.length > 0 && <span className="badge" style={{ background: '#EDEBFA', color: '#5A4FCF' }}>{pareri.length} parere/i</span>}
          </div>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn" onClick={() => salva(false)} disabled={saving}>{saving ? 'Salvataggio…' : '💾 Salva come bozza'}</button>
            <button className="btn btn-primary" onClick={() => salva(true)} disabled={saving}>{saving ? 'Salvataggio…' : '✍️ Firma e registra'}</button>
          </div>
          <div style={{ marginTop: 14 }}>
            <button className="btn btn-sm" onClick={() => setStep(5)}>← Indietro</button>
          </div>
        </div>
      )}
    </div>
  )
}
