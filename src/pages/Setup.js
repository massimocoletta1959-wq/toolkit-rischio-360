import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
import { RISCHI_DEFAULT, RISCHI_PER_SETTORE, RISCHI_231_EDILIZIA, RISCHI_231_GENERICO } from '../lib/constants'

const SETTORI = ['Manifatturiero','Servizi','Commercio','Edilizia','Sanità','Tecnologia','Agricoltura','Trasporti','Altro']
const DIMENSIONI = ['Micro (< 10 dipendenti)','Piccola (10-49)','Media (50-249)','Grande (250+)']

function pivaValida(p) {
  if (!/^[0-9]{11}$/.test(p)) return false
  let s = 0
  for (let i = 0; i < 11; i++) {
    let n = p.charCodeAt(i) - 48
    if (i % 2 === 1) { n *= 2; if (n > 9) n -= 9 }
    s += n
  }
  return s % 10 === 0
}

export default function Setup({ onDone, onAnnulla, userId, userEmail, nuovaAzienda = false }) {
  const [step, setStep]         = useState(1)
  const [nome, setNome]         = useState('')
  const [piva, setPiva]         = useState('')
  const [settore, setSettore]   = useState('')
  const [dimensione, setDimensione] = useState('')
  const [nomeProfilo, setNomeProfilo] = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)
  const [aziendaId, setAziendaId] = useState(null)
  const [scelta, setScelta]     = useState(null)
  const [visuraData, setVisuraData]       = useState(null)
  const [visuraLoading, setVisuraLoading] = useState(false)
  const [visuraError, setVisuraError]     = useState(null)

  const haSettore  = !!(RISCHI_PER_SETTORE[settore]?.length)
  const ha231Edil  = settore === 'Edilizia'
  const ha231      = true  // disponibile per tutti i settori
  const rischi231  = ha231Edil ? RISCHI_231_EDILIZIA : RISCHI_231_GENERICO
  const num231     = rischi231.length
  const label231   = ha231Edil ? 'Edilizia (D.Lgs. 231/01)' : 'PMI Generiche (D.Lgs. 231/01)'
  const numStd     = RISCHI_DEFAULT.length
  const numSet     = RISCHI_PER_SETTORE[settore]?.length || 0

  async function handleStep1(e) {
    e.preventDefault()
    setLoading(true); setError(null)

    // 0. Validazione P.IVA e controlli anti-duplicato
    const pivaClean = piva.replace(/[^0-9]/g, '')
    if (pivaClean && !pivaValida(pivaClean)) {
      setError('Partita IVA non valida: controlla le 11 cifre.')
      setLoading(false); return
    }
    if (pivaClean) {
      const { data: dup } = await supabase.from('aziende').select('id, nome').eq('piva', pivaClean).limit(1)
      if (dup && dup.length > 0) {
        setError('Hai gia un\'azienda con questa Partita IVA: "' + dup[0].nome + '".')
        setLoading(false); return
      }
    }
    const { data: dupNome } = await supabase.from('aziende').select('id, nome').ilike('nome', nome.trim()).limit(1)
    if (dupNome && dupNome.length > 0) {
      const conferma = window.confirm('Hai gia un\'azienda chiamata "' + dupNome[0].nome + '". Vuoi crearne davvero un\'altra con lo stesso nome?')
      if (!conferma) { setLoading(false); return }
    }

    // 1. Crea l'azienda (con i campi della visura, se importata)
    const a = visuraData?.azienda || {}
    const { data: az, error: e1 } = await supabase.from('aziende')
      .insert({
        nome: nome.trim(), settore, dimensione, piva: pivaClean || null,
        codice_fiscale: a.codice_fiscale || null,
        forma_giuridica: a.forma_giuridica || null,
        rea: a.rea || null,
        pec: a.pec || null,
        sede_via: a.sede_via || null,
        sede_comune: a.sede_comune || null,
        sede_provincia: a.sede_provincia || null,
        sede_cap: a.sede_cap || null,
        capitale_sociale: a.capitale_sociale || null,
        data_costituzione: a.data_costituzione || null,
        ateco: a.ateco || null,
        attivita: a.attivita || null,
        oggetto_sociale: a.oggetto_sociale || null,
      }).select().single()
    if (e1) { setError(e1.message); setLoading(false); return }

    // 2. Se è la prima azienda, crea anche il profilo utente
    if (!nuovaAzienda) {
      const { error: e2 } = await supabase.from('profili')
        .insert({ id: userId, email: userEmail, nome: nomeProfilo, azienda_id: az.id })
      if (e2) { setError(e2.message); setLoading(false); return }
    }

    // 3. Collega utente <-> azienda nella tabella di join
    const { error: e3 } = await supabase.from('utente_aziende')
      .insert({ utente_id: userId, azienda_id: az.id })
    if (e3 && !e3.message.includes('unique')) {
      setError(e3.message); setLoading(false); return
    }

    // 4. Se import da visura: crea l'organo e i suoi componenti (best-effort)
    if (visuraData?.componenti?.length) {
      try {
        const org = visuraData.organo || {}
        const { data: organo } = await supabase.from('organi').insert({
          azienda_id: az.id,
          tipo: org.tipo || 'cda',
          nome: org.nome || 'Consiglio di Amministrazione',
          monocratico: org.tipo === 'amministratore_unico',
        }).select().single()
        for (const c of visuraData.componenti) {
          const { data: m } = await supabase.from('membri').insert({
            azienda_id: az.id,
            nome: c.nome || '',
            cognome: c.cognome || '',
            email: c.pec || null,
            pec: c.pec || null,
            ruolo: c.ruolo || 'Amministratore',
          }).select().single()
          if (organo && m) {
            await supabase.from('organo_membri').insert({
              organo_id: organo.id, membro_id: m.id, ruolo: c.ruolo || 'Componente',
              data_nomina: c.data_nomina || null,
            })
          }
        }
      } catch (gErr) {
        console.error('Import governance da visura:', gErr)
      }
    }

    setAziendaId(az.id)
    setLoading(false)
    setStep(2)
  }

  async function importaVisura(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setVisuraLoading(true); setVisuraError(null)
    try {
      const b64 = await new Promise((res, rej) => {
        const r = new FileReader()
        r.onload = () => res(String(r.result).split(',')[1])
        r.onerror = () => rej(new Error('lettura del file fallita'))
        r.readAsDataURL(file)
      })
      const { data, error: err } = await supabase.functions.invoke('extract-visura', { body: { pdf_base64: b64 } })
      if (err) throw err
      if (data?.error) throw new Error(data.error)
      const a = data.azienda || {}
      setNome(a.denominazione || '')
      setPiva((a.partita_iva || '').replace(/[^0-9]/g, ''))
      setSettore(a.settore_suggerito === 'edilizia' ? 'Edilizia' : 'Servizi')
      setVisuraData(data)
    } catch (err) {
      setVisuraError('Non sono riuscito a leggere la visura: ' + (err.message || String(err)))
    } finally {
      setVisuraLoading(false)
    }
  }

  async function carica() {
    if (scelta === 'nessuno') { onDone(); return }
    setLoading(true)
    let lista = []
    if (scelta === 'standard') lista = [...RISCHI_DEFAULT]
    if (scelta === 'settore')  lista = [...(RISCHI_PER_SETTORE[settore] || [])]
    if (scelta === 'tutti')    lista = [...RISCHI_DEFAULT, ...(RISCHI_PER_SETTORE[settore] || [])]
    if (scelta === 'tutti231') lista = [...RISCHI_DEFAULT, ...(RISCHI_PER_SETTORE[settore] || []), ...rischi231]
    if (scelta === 'solo231')  lista = [...rischi231]
    if (lista.length > 0) {
      const payload = lista.map(r => ({ ...r, azienda_id: aziendaId }))
      const { error: err } = await supabase.from('rischi').insert(payload)
      if (err) { setError(err.message); setLoading(false); return }
    }
    setLoading(false)
    onDone()
  }

  const preview = scelta === 'standard' ? RISCHI_DEFAULT
    : scelta === 'settore'  ? (RISCHI_PER_SETTORE[settore] || [])
    : scelta === 'tutti'    ? [...RISCHI_DEFAULT, ...(RISCHI_PER_SETTORE[settore] || [])]
    : scelta === 'tutti231' ? [...RISCHI_DEFAULT, ...(RISCHI_PER_SETTORE[settore] || []), ...rischi231]
    : scelta === 'solo231'  ? rischi231
    : []

  if (step === 2) return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 560 }}>
        <div className="login-logo">
          <div style={{ fontSize: 36, marginBottom: 8 }}>🛡️</div>
          <h1>Carica i rischi iniziali</h1>
          <p>Scegli da quale punto partire con la mappatura</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>

          <div onClick={() => setScelta('standard')} style={{ cursor: 'pointer', padding: '14px 16px', border: `2px solid ${scelta === 'standard' ? '#2B5FA5' : '#E0E0E0'}`, borderRadius: 8, background: scelta === 'standard' ? '#EBF4FC' : 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: '#1A3A5C', fontSize: 14 }}>📋 Solo rischi standard</div>
                <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>I {numStd} rischi generici validi per qualsiasi azienda</div>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#2B5FA5', background: '#EBF4FC', padding: '3px 10px', borderRadius: 20 }}>{numStd} rischi</span>
            </div>
          </div>

          {haSettore && (
            <div onClick={() => setScelta('settore')} style={{ cursor: 'pointer', padding: '14px 16px', border: `2px solid ${scelta === 'settore' ? '#2B5FA5' : '#E0E0E0'}`, borderRadius: 8, background: scelta === 'settore' ? '#EBF4FC' : 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1A3A5C', fontSize: 14 }}>🏗️ Solo rischi {settore}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Rischi specifici per il settore {settore}</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#2B5FA5', background: '#EBF4FC', padding: '3px 10px', borderRadius: 20 }}>{numSet} rischi</span>
              </div>
            </div>
          )}

          {haSettore && (
            <div onClick={() => setScelta('tutti')} style={{ cursor: 'pointer', padding: '14px 16px', border: `2px solid ${scelta === 'tutti' ? '#2B5FA5' : '#E0E0E0'}`, borderRadius: 8, background: scelta === 'tutti' ? '#EBF4FC' : 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#1A3A5C', fontSize: 14 }}>✅ Tutti — standard + {settore}</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Copertura completa: {numStd} generici + {numSet} specifici</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#27AE60', background: '#D5F5E3', padding: '3px 10px', borderRadius: 20 }}>{numStd + numSet} rischi</span>
              </div>
            </div>
          )}

          <div onClick={() => setScelta('solo231')} style={{ cursor: 'pointer', padding: '14px 16px', border: `2px solid ${scelta === 'solo231' ? '#856404' : '#E0E0E0'}`, borderRadius: 8, background: scelta === 'solo231' ? '#FEF9E7' : 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#856404', fontSize: 14 }}>⚖️ Solo Rischi 231 — D.Lgs. 231/2001</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>Reati presupposto per {label231} (PA, sicurezza, ambiente, lavoro, societario)</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#856404', background: '#FEF9E7', padding: '3px 10px', borderRadius: 20 }}>{num231} rischi</span>
              </div>
            </div>

          <div onClick={() => setScelta('tutti231')} style={{ cursor: 'pointer', padding: '14px 16px', border: `2px solid ${scelta === 'tutti231' ? '#856404' : '#E0E0E0'}`, borderRadius: 8, background: scelta === 'tutti231' ? '#FEF9E7' : 'white' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontWeight: 600, color: '#856404', fontSize: 14 }}>🏆 Copertura completa — Standard + {haSettore ? 'Settore + ' : ''}231</div>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 2 }}>{numStd} standard{haSettore ? ` + ${numSet} settore` : ''} + {num231} rischi D.Lgs. 231/01</div>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#856404', background: '#FEF9E7', padding: '3px 10px', borderRadius: 20 }}>{numStd + numSet + num231} rischi</span>
              </div>
            </div>

          <div onClick={() => setScelta('nessuno')} style={{ cursor: 'pointer', padding: '12px 16px', border: `2px solid ${scelta === 'nessuno' ? '#aaa' : '#E0E0E0'}`, borderRadius: 8, background: scelta === 'nessuno' ? '#F5F5F5' : 'white' }}>
            <div style={{ fontWeight: 500, color: '#888', fontSize: 13 }}>Parto da zero — inserirò i rischi manualmente</div>
          </div>
        </div>

        {preview.length > 0 && (
          <div style={{ background: '#F7F8FA', borderRadius: 8, padding: '10px 14px', maxHeight: 180, overflowY: 'auto', marginBottom: 16 }}>
            {preview.slice(0, 8).map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 0', borderBottom: '1px solid #EEE', fontSize: 12 }}>
                <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 10, background: '#E6F1FB', color: '#0C447C', flexShrink: 0 }}>{r.categoria}</span>
                <span style={{ color: '#444' }}>{r.descrizione}</span>
              </div>
            ))}
            {preview.length > 8 && <div style={{ fontSize: 11, color: '#888', textAlign: 'center', paddingTop: 6 }}>+ altri {preview.length - 8} rischi...</div>}
          </div>
        )}

        <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={carica} disabled={!scelta || loading}>
          {loading ? 'Caricamento...' : scelta === 'nessuno' ? 'Inizia senza rischi →' : scelta ? `Carica ${preview.length} rischi e inizia →` : 'Seleziona un\'opzione'}
        </button>
      </div>
    </div>
  )

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 480 }}>
        <div className="login-logo">
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏢</div>
          <h1>{nuovaAzienda ? 'Nuova azienda' : 'Configura la tua azienda'}</h1>
          <p>Prima configurazione — ci vogliono 30 secondi</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleStep1}>
          {!nuovaAzienda && (
            <div className="form-group">
              <label className="form-label">Il tuo nome</label>
              <input className="form-control" value={nomeProfilo} onChange={e => setNomeProfilo(e.target.value)} required placeholder="Es. Mario Rossi" />
            </div>
          )}

          <div style={{ background: '#F4F9FF', border: '1px dashed #B9D4F0', borderRadius: 12, padding: 16, marginBottom: 18 }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#1A3A5C', marginBottom: 4 }}>📄 Importa da visura camerale</div>
            <div style={{ fontSize: 12, color: '#6B7683', marginBottom: 12, lineHeight: 1.5 }}>
              Carica il PDF della visura: compileremo l'anagrafica e creeremo l'organo amministrativo con i suoi componenti. Controlla e correggi i campi prima di salvare.
            </div>
            <label className="btn btn-sm" style={{ cursor: visuraLoading ? 'default' : 'pointer', background: '#2B5FA5', color: '#fff' }}>
              {visuraLoading ? 'Lettura in corso…' : '📎 Scegli il PDF della visura'}
              <input type="file" accept="application/pdf" style={{ display: 'none' }} disabled={visuraLoading} onChange={importaVisura} />
            </label>
            {visuraError && <div style={{ fontSize: 12, color: '#C0392B', marginTop: 10 }}>{visuraError}</div>}
            {visuraData && (
              <div style={{ fontSize: 12, color: '#0F6E56', marginTop: 10, lineHeight: 1.5 }}>
                ✓ Dati estratti dalla visura.
                {visuraData.componenti?.length ? ` Al salvataggio verranno creati l'organo “${visuraData.organo?.nome || 'organo'}” e ${visuraData.componenti.length} componenti.` : ''}
                {' '}Controlla i campi qui sotto.
              </div>
            )}
          </div>

          <div className="form-group">
            <label className="form-label">Nome azienda</label>
            <input className="form-control" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Es. Rossi S.r.l." />
          </div>
          <div className="form-group">
            <label className="form-label">Partita IVA <span style={{ color: '#888', fontWeight: 400 }}>(consigliata — evita duplicati)</span></label>
            <input className="form-control" value={piva} onChange={e => setPiva(e.target.value)} placeholder="11 cifre" maxLength={11} inputMode="numeric" />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Settore</label>
              <select className="form-control" value={settore} onChange={e => setSettore(e.target.value)} required>
                <option value="">Seleziona...</option>
                {SETTORI.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Dimensione</label>
              <select className="form-control" value={dimensione} onChange={e => setDimensione(e.target.value)} required>
                <option value="">Seleziona...</option>
                {DIMENSIONI.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
          {haSettore && (
            <div className="alert alert-info" style={{ marginBottom: 14 }}>
              🏗️ Per il settore <strong>{settore}</strong> abbiamo rischi specifici — potrai scegliere al passo successivo.
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
            {nuovaAzienda && onAnnulla && (
              <button type="button" className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={onAnnulla}>
                ← Annulla
              </button>
            )}
            <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Salvataggio...' : 'Avanti →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
