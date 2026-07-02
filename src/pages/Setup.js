import React, { useState } from 'react'
import { supabase } from '../lib/supabase'
const SETTORI = ['Manifatturiero','Servizi','Commercio','Edilizia','Sanità','Tecnologia','Agricoltura','Trasporti','Altro']
const DIMENSIONI = ['Micro (< 10 dipendenti)','Piccola (10-49)','Media (50-249)','Grande (250+)']

const FONTE_INTERNA = "Interna"
const FONTE_ESTERNA = "Esterna"
const FONTE_MISTA   = "Mista"

const RISCHI_DEFAULT = [
  { categoria: 'IT / Cyber', descrizione: 'Attacco ransomware ai sistemi gestionali', fonte: FONTE_ESTERNA, probabilita: 2, impatto: 2, note: '' },
  { categoria: 'IT / Cyber', descrizione: 'Violazione dei dati personali (GDPR)', fonte: FONTE_MISTA, probabilita: 2, impatto: 3, note: "GDPR: prob. media (controlli Garante in aumento) / impatto critico (sanzioni fino al 4% fatturato)" },
  { categoria: 'IT / Cyber', descrizione: 'Vulnerabilità software non aggiornato', fonte: FONTE_ESTERNA, probabilita: 3, impatto: 2, note: 'Vulnerabilità SW: prob. alta (causa n.1 di breach) / impatto rilevante' },
  { categoria: 'IT / Cyber', descrizione: 'Mancanza di backup aggiornati', fonte: FONTE_INTERNA, probabilita: 2, impatto: 2, note: '' },
  { categoria: 'IT / Cyber', descrizione: 'Interruzione del provider di hosting/cloud', fonte: FONTE_ESTERNA, probabilita: 2, impatto: 3, note: 'Cloud outage: prob. media (2-4 interruzioni/anno dei provider) / impatto critico confermato' },

  { categoria: 'Strategico', descrizione: 'Perdita di un cliente chiave (>20% fatturato)', fonte: FONTE_MISTA, probabilita: 2, impatto: 2, note: '' },
  { categoria: 'Strategico', descrizione: 'Cambio di leadership o uscita di figure chiave', fonte: FONTE_INTERNA, probabilita: 2, impatto: 3, note: 'Turnover management: prob. media (post-pandemia +25%) / impatto critico nelle PMI' },

  { categoria: 'Operativo', descrizione: 'Guasto a macchinari o infrastrutture critiche', fonte: FONTE_INTERNA, probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Operativo', descrizione: 'Dipendenza da un singolo fornitore critico', fonte: FONTE_MISTA, probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Operativo', descrizione: 'Carenza di personale qualificato', fonte: FONTE_INTERNA, probabilita: 3, impatto: 2, note: 'Carenza personale: prob. alta (45% PMI italiane, Unioncamere 2024) / impatto rilevante' },
  { categoria: 'Operativo', descrizione: 'Errori nella gestione degli ordini/contratti', fonte: FONTE_INTERNA, probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Operativo', descrizione: 'Perdita di know-how per turnover elevato', fonte: FONTE_INTERNA, probabilita: 2, impatto: 2, note: 'Perdita know-how: prob. media (turnover PMI >15%) / impatto rilevante' },
  { categoria: 'Operativo', descrizione: 'Interruzione logistica o di consegna', fonte: FONTE_MISTA, probabilita: 1, impatto: 2, note: '' },

  { categoria: 'Reputazionale', descrizione: 'Comportamento scorretto di un dipendente', fonte: FONTE_INTERNA, probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Gestione comunicazione di crisi inadeguata', fonte: FONTE_INTERNA, probabilita: 2, impatto: 2, note: 'Crisi comun.: prob. media (PMI senza piano crisi) / impatto rilevante (amplifica crisi primaria)' },
  { categoria: 'Reputazionale', descrizione: 'Perdita di certificazioni o riconoscimenti', fonte: FONTE_MISTA, probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Controversie pubbliche con stakeholder', fonte: FONTE_MISTA, probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Danni reputazionali da fornitori o partner', fonte: FONTE_MISTA, probabilita: 1, impatto: 2, note: '' },

  { categoria: 'Normativo / Compliance', descrizione: 'Non conformita GDPR / privacy', fonte: FONTE_MISTA, probabilita: 2, impatto: 3, note: 'GDPR non conformità: prob. media (controlli Garante frequenti) / impatto critico confermato' },
  { categoria: 'Normativo / Compliance', descrizione: 'Violazione normativa sicurezza sul lavoro (D.Lgs 81/08)', fonte: FONTE_MISTA, probabilita: 2, impatto: 3, note: 'D.Lgs 81/08: prob. media (ispezioni INL frequenti su PMI) / impatto critico confermato' },
  { categoria: 'Normativo / Compliance', descrizione: 'Inadempienza fiscale o tributaria', fonte: FONTE_MISTA, probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Normativo / Compliance', descrizione: "Controversie con l'Agenzia delle Entrate", fonte: FONTE_MISTA, probabilita: 1, impatto: 1, note: '' },

  { categoria: 'Finanziario', descrizione: 'Crisi di liquidita a breve termine', fonte: FONTE_MISTA, probabilita: 2, impatto: 2, note: 'Crisi liquidità: prob. media confermata / impatto rilevante (blocca pagamenti fornitori/stipendi)' },
  { categoria: 'Finanziario', descrizione: 'Insolvenza di clienti importanti', fonte: FONTE_ESTERNA, probabilita: 2, impatto: 2, note: 'Insolvenza clienti: prob. media (13.000+ procedure/anno in Italia) / impatto rilevante' },
  { categoria: 'Finanziario', descrizione: 'Difficolta di accesso al credito bancario', fonte: FONTE_MISTA, probabilita: 2, impatto: 2, note: 'Credito bancario: prob. media (stretta post-2022) / impatto rilevante su investimenti' },

  { categoria: 'Terze Parti / Fornitori', descrizione: 'Fallimento di un fornitore strategico', fonte: FONTE_MISTA, probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Terze Parti / Fornitori', descrizione: 'Dipendenza da un unico fornitore critico', fonte: FONTE_MISTA, probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Terze Parti / Fornitori', descrizione: 'Mancato rispetto contrattuale da partner', fonte: FONTE_MISTA, probabilita: 1, impatto: 1, note: '' },

  { categoria: 'Continuità Operativa', descrizione: 'Assenza prolungata di figure chiave (malattia, dimissioni)', fonte: FONTE_MISTA, probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Continuità Operativa', descrizione: 'Interruzione della rete internet / telecomunicazioni', fonte: FONTE_MISTA, probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Continuità Operativa', descrizione: 'Blackout elettrico prolungato', fonte: FONTE_MISTA, probabilita: 1, impatto: 3, note: '' },
  { categoria: 'Continuità Operativa', descrizione: 'Mancanza di piani di continuita documentati', fonte: FONTE_MISTA, probabilita: 3, impatto: 2, note: 'BCP mancante: prob. alta (>80% PMI senza BCP, Assinform) / impatto rilevante confermato' },
  { categoria: 'Continuità Operativa', descrizione: 'Pandemia o assenza massiva del personale', fonte: FONTE_MISTA, probabilita: 1, impatto: 3, note: 'Pandemia: prob. bassa confermata / impatto critico (blocco operativo per definizione)' },
]

export default function Setup({ onDone, onCancel, userId, userEmail, existingProfilo }) {
  const isAdditional = !!existingProfilo // true = aggiunta nuova azienda a un account esistente

  const [nome, setNome]           = useState('')
  const [settore, setSettore]     = useState('')
  const [dimensione, setDimensione] = useState('')
  const [nomeProfilo, setNomeProfilo] = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(null)

    // 1. Crea azienda
    const { data: az, error: e1 } = await supabase.from('aziende').insert({ nome, settore, dimensione }).select().single()
    if (e1) { setError(e1.message); setLoading(false); return }

    // 2. Crea (o salta, se già esiste) il profilo utente
    if (!isAdditional) {
      const { error: e2 } = await supabase.from('profili').insert({ id: userId, email: userEmail, nome: nomeProfilo })
      if (e2) { setError(e2.message); setLoading(false); return }
    }

    // 3. Collega l'utente alla nuova azienda tramite la tabella ponte
    const { error: e3 } = await supabase.from('utente_aziende').insert({ utente_id: userId, azienda_id: az.id, ruolo: 'owner' })
    if (e3) { setError(e3.message); setLoading(false); return }

    // 4. Carica i rischi di default del Toolkit Rischio 360°
    const rischiDaInserire = RISCHI_DEFAULT.map(r => ({ ...r, azienda_id: az.id }))
    const { error: e4 } = await supabase.from('rischi').insert(rischiDaInserire)
    if (e4) { setError(e4.message); setLoading(false); return }

    onDone(az.id)
  }

  return (
    <div className="login-page">
      <div className="login-card" style={{ maxWidth: 480 }}>
        <div className="login-logo">
          <div style={{ fontSize: 36, marginBottom: 8 }}>🏢</div>
          <h1>{isAdditional ? 'Aggiungi una nuova azienda' : 'Configura la tua azienda'}</h1>
          <p>{isAdditional ? 'Ci vogliono 30 secondi, come la prima volta' : 'Prima configurazione — ci vogliono 30 secondi'}</p>
        </div>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          {!isAdditional && (
            <div className="form-group">
              <label className="form-label">Il tuo nome</label>
              <input className="form-control" value={nomeProfilo} onChange={e => setNomeProfilo(e.target.value)} required placeholder="Es. Mario Rossi" />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Nome azienda</label>
            <input className="form-control" value={nome} onChange={e => setNome(e.target.value)} required placeholder="Es. Rossi S.r.l." />
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
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            {isAdditional && onCancel && (
              <button type="button" className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={onCancel} disabled={loading}>
                Annulla
              </button>
            )}
            <button className="btn btn-primary" style={{ flex: 2, justifyContent: 'center' }} disabled={loading}>
              {loading ? 'Salvataggio...' : 'Inizia →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
