export const CATEGORIE = [
  'IT / Cyber',
  'Strategico',
  'Operativo',
  'Reputazionale',
  'Normativo / Compliance',
  'Finanziario',
  'Terze Parti / Fornitori',
  'Continuità Operativa',
]

export const CATALOGO = {
  'IT / Cyber': [
    'Attacco ransomware ai sistemi gestionali',
    'Violazione dei dati personali (GDPR)',
    'Perdita di accesso ai sistemi cloud',
    'Phishing e ingegneria sociale verso dipendenti',
    'Vulnerabilità software non aggiornato',
    'Mancanza di backup aggiornati',
    'Accesso non autorizzato da ex dipendenti',
    'Interruzione del provider di hosting/cloud',
  ],
  'Strategico': [
    'Perdita di un cliente chiave (>20% fatturato)',
    'Ingresso di nuovi competitor con prezzi aggressivi',
    'Dipendenza da un unico mercato o canale',
    'Cambio di leadership o uscita di figure chiave',
    "Fallimento di un'acquisizione o partnership",
    'Obsolescenza del modello di business',
    'Perdita di posizionamento competitivo',
  ],
  'Operativo': [
    'Guasto a macchinari o infrastrutture critiche',
    'Errori nel processo produttivo / servizio',
    'Dipendenza da un singolo fornitore critico',
    'Carenza di personale qualificato',
    'Infortuni sul lavoro',
    'Errori nella gestione degli ordini/contratti',
    'Perdita di know-how per turnover elevato',
    'Interruzione logistica o di consegna',
  ],
  'Reputazionale': [
    'Recensioni negative online (Google, social)',
    "Scandalo mediatico legato all'azienda",
    'Comportamento scorretto di un dipendente',
    'Gestione comunicazione di crisi inadeguata',
    'Perdita di certificazioni o riconoscimenti',
    'Controversie pubbliche con stakeholder',
    'Danni reputazionali da fornitori o partner',
  ],
  'Normativo / Compliance': [
    'Non conformità GDPR / privacy',
    'Violazione normativa sicurezza sul lavoro (D.Lgs 81/08)',
    'Inadempienza fiscale o tributaria',
    'Mancato rispetto normative ambientali',
    'Nuovo regolamento europeo di settore',
    "Controversie con l'Agenzia delle Entrate",
    'Mancanza di licenze o autorizzazioni aggiornate',
  ],
  'Finanziario': [
    'Crisi di liquidità a breve termine',
    'Insolvenza di clienti importanti',
    'Aumento improvviso dei costi energetici',
    'Variazioni sfavorevoli dei tassi di interesse',
    'Ritardi nei pagamenti della PA',
    'Costi non previsti su progetti in corso',
    'Difficoltà di accesso al credito bancario',
  ],
  'Terze Parti / Fornitori': [
    'Fallimento di un fornitore strategico',
    'Ritardi cronici nelle consegne',
    'Qualità insufficiente dei materiali/servizi forniti',
    'Dipendenza da un unico fornitore critico',
    'Rischi reputazionali da comportamento del fornitore',
    'Mancato rispetto contrattuale da partner',
    'Vulnerabilità cyber introdotte da terze parti',
  ],
  'Continuità Operativa': [
    'Assenza prolungata di figure chiave (malattia, dimissioni)',
    'Interruzione della rete internet / telecomunicazioni',
    'Blackout elettrico prolungato',
    'Catastrofe naturale o evento meteo estremo',
    'Incendio o danni fisici alla sede',
    'Pandemia o assenza massiva del personale',
    'Mancanza di piani di continuità documentati',
  ],
}

export const PROB_OPTIONS = [
  { value: 1, label: '1 — Bassa  (evento raro, < 10% annuo)' },
  { value: 2, label: '2 — Media  (evento possibile, 10-50% annuo)' },
  { value: 3, label: '3 — Alta   (evento probabile, > 50% annuo)' },
]

export const IMP_OPTIONS = [
  { value: 1, label: '1 — Limitato   (< 1% del fatturato)' },
  { value: 2, label: '2 — Rilevante  (1-7% del fatturato)' },
  { value: 3, label: '3 — Critico    (> 7% del fatturato)' },
]

export const FONTE_OPTIONS = [
  'Interna',
  'Esterna',
  'Mista',
]

export const STRATEGIA_OPTIONS = ['Ridurre', 'Evitare', 'Trasferire', 'Accettare']
export const STATO_OPTIONS = ['Pianificato', 'In corso', 'Completato', 'Da rivedere']

export function getTier(p, i) {
  const score = p * i
  if (score >= 6) return { tier: 'Tier 1', label: 'Critico', score, color: '#C0392B', bg: '#FADBD8' }
  if (score >= 4) return { tier: 'Tier 2', label: 'Significativo', score, color: '#E67E22', bg: '#FDEBD0' }
  if (score >= 2) return { tier: 'Tier 3', label: 'Moderato', score, color: '#856404', bg: '#FEF9E7' }
  return { tier: 'Tier 4', label: 'Accettabile', score, color: '#27AE60', bg: '#D5F5E3' }
}

export const CAT_COLORS = {
  'IT / Cyber':              { bg: '#E6F1FB', color: '#0C447C' },
  'Strategico':              { bg: '#EEEDFE', color: '#3C3489' },
  'Operativo':               { bg: '#F1EFE8', color: '#444441' },
  'Reputazionale':           { bg: '#FBEAF0', color: '#72243E' },
  'Normativo / Compliance':  { bg: '#FAEEDA', color: '#633806' },
  'Finanziario':             { bg: '#FCEBEB', color: '#791F1F' },
  'Terze Parti / Fornitori': { bg: '#E1F5EE', color: '#085041' },
  'Continuità Operativa':    { bg: '#EAF3DE', color: '#27500A' },
}

export const RISCHI_DEFAULT = [
  { categoria: 'IT / Cyber', descrizione: 'Attacco ransomware ai sistemi gestionali', fonte: 'Esterna', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'IT / Cyber', descrizione: 'Violazione dei dati personali (GDPR)', fonte: 'Esterna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'IT / Cyber', descrizione: 'Vulnerabilità software non aggiornato', fonte: 'Esterna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'IT / Cyber', descrizione: 'Mancanza di backup aggiornati', fonte: 'Interna', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'IT / Cyber', descrizione: 'Interruzione del provider di hosting/cloud', fonte: 'Esterna', probabilita: 1, impatto: 3, note: '' },
  { categoria: 'Strategico', descrizione: 'Perdita di un cliente chiave (>20% fatturato)', fonte: 'Esterna', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'Strategico', descrizione: 'Cambio di leadership o uscita di figure chiave', fonte: 'Interna', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Operativo', descrizione: 'Guasto a macchinari o infrastrutture critiche', fonte: 'Interna', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Operativo', descrizione: 'Dipendenza da un singolo fornitore critico', fonte: 'Esterna', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Operativo', descrizione: 'Carenza di personale qualificato', fonte: 'Interna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Operativo', descrizione: 'Errori nella gestione degli ordini/contratti', fonte: 'Interna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Operativo', descrizione: 'Perdita di know-how per turnover elevato', fonte: 'Interna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Operativo', descrizione: 'Interruzione logistica o di consegna', fonte: 'Esterna', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Comportamento scorretto di un dipendente', fonte: 'Interna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Gestione comunicazione di crisi inadeguata', fonte: 'Interna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Perdita di certificazioni o riconoscimenti', fonte: 'Esterna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Controversie pubbliche con stakeholder', fonte: 'Esterna', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Danni reputazionali da fornitori o partner', fonte: 'Esterna', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Normativo / Compliance', descrizione: 'Non conformita GDPR / privacy', fonte: 'Esterna', probabilita: 1, impatto: 3, note: '' },
  { categoria: 'Normativo / Compliance', descrizione: 'Violazione normativa sicurezza sul lavoro (D.Lgs 81/08)', fonte: 'Esterna', probabilita: 1, impatto: 3, note: '' },
  { categoria: 'Normativo / Compliance', descrizione: 'Inadempienza fiscale o tributaria', fonte: 'Esterna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Normativo / Compliance', descrizione: 'Controversie con l\'Agenzia delle Entrate', fonte: 'Esterna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Finanziario', descrizione: 'Crisi di liquidita a breve termine', fonte: 'Esterna', probabilita: 2, impatto: 1, note: '' },
  { categoria: 'Finanziario', descrizione: 'Insolvenza di clienti importanti', fonte: 'Esterna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Finanziario', descrizione: 'Difficolta di accesso al credito bancario', fonte: 'Esterna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Terze Parti / Fornitori', descrizione: 'Fallimento di un fornitore strategico', fonte: 'Esterna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Terze Parti / Fornitori', descrizione: 'Dipendenza da un unico fornitore critico', fonte: 'Esterna', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Terze Parti / Fornitori', descrizione: 'Mancato rispetto contrattuale da partner', fonte: 'Esterna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Continuità Operativa', descrizione: 'Assenza prolungata di figure chiave (malattia, dimissioni)', fonte: 'Esterna', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Continuità Operativa', descrizione: 'Interruzione della rete internet / telecomunicazioni', fonte: 'Esterna', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Continuità Operativa', descrizione: 'Blackout elettrico prolungato', fonte: 'Esterna', probabilita: 1, impatto: 3, note: '' },
  { categoria: 'Continuità Operativa', descrizione: 'Mancanza di piani di continuita documentati', fonte: 'Esterna', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'Continuità Operativa', descrizione: 'Pandemia o assenza massiva del personale', fonte: 'Esterna', probabilita: 1, impatto: 1, note: '' },
]

export const RISCHI_PER_SETTORE = {
  'Edilizia': [
  // IT / Cyber
  { categoria: 'IT / Cyber', descrizione: 'Furto o perdita di dati di progetto/gare d\'appalto', fonte: 'Esterna', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'IT / Cyber', descrizione: 'Interruzione dei sistemi BIM/gestionali di cantiere', fonte: 'Interna', probabilita: 1, impatto: 2, note: '' },

  // Strategico
  { categoria: 'Strategico', descrizione: 'Fluttuazione della domanda legata a cicli edilizi e incentivi pubblici', fonte: 'Esterna', probabilita: 3, impatto: 3, note: 'Settore in fase di assestamento dopo la forte espansione trainata da incentivi pubblici e investimenti infrastrutturali (INAIL, Dati Inail dic. 2025)' },
  { categoria: 'Strategico', descrizione: 'Dipendenza da un singolo grande appalto pubblico', fonte: 'Mista', probabilita: 2, impatto: 3, note: '' },

  // Operativo
  { categoria: 'Operativo', descrizione: 'Infortunio grave o mortale in cantiere (caduta dall\'alto o in profondità)', fonte: 'Interna', probabilita: 3, impatto: 3, note: 'Le cadute dall\'alto restano la principale causa di morte nei cantieri, il 58,3% degli incidenti mortali/gravi (Rapporto Inail-Regioni, set. 2025); settore Costruzioni +3% infortuni nel 2025 (Dati Inail)' },
  { categoria: 'Operativo', descrizione: 'Mancato rispetto del cronoprogramma lavori / ritardi di cantiere', fonte: 'Interna', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'Operativo', descrizione: 'Incidente con mezzi e macchinari (gru, escavatori, ponteggi)', fonte: 'Interna', probabilita: 2, impatto: 3, note: '' },
  { categoria: 'Operativo', descrizione: 'Furto di materiali o attrezzature da cantiere', fonte: 'Esterna', probabilita: 2, impatto: 1, note: '' },
  { categoria: 'Operativo', descrizione: 'Condizioni meteo avverse che bloccano i lavori', fonte: 'Esterna', probabilita: 2, impatto: 1, note: '' },
  { categoria: 'Operativo', descrizione: 'Carenza di manodopera specializzata (muratori, gruisti)', fonte: 'Interna', probabilita: 3, impatto: 2, note: 'I soggetti più colpiti dagli infortuni restano i muratori 55-64 anni, segnale anche di un problema di ricambio generazionale nel settore (Rapporto Inail-Regioni, 2025)' },
  { categoria: 'Operativo', descrizione: 'Difetti costruttivi/vizi dell\'opera con necessità di rifacimento', fonte: 'Interna', probabilita: 2, impatto: 2, note: '' },

  // Reputazionale
  { categoria: 'Reputazionale', descrizione: 'Incidente sul lavoro con eco mediatica negativa', fonte: 'Mista', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Contestazioni pubbliche legate al cantiere (rumore, polvere, disagio ai residenti)', fonte: 'Esterna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Contenziosi con il committente per ritardi o difetti', fonte: 'Mista', probabilita: 2, impatto: 2, note: '' },

  // Normativo / Compliance
  { categoria: 'Normativo / Compliance', descrizione: 'Violazione D.Lgs 81/08 sicurezza nei cantieri', fonte: 'Mista', probabilita: 2, impatto: 3, note: '43.931 infortuni denunciati nel comparto costruzioni nel 2024; malattie professionali denunciate +29,3% sull\'anno precedente (Dati Inail, dic. 2025) — segnale di ispezioni in intensificazione' },
  { categoria: 'Normativo / Compliance', descrizione: 'Mancato rispetto normative urbanistiche/permessi a costruire', fonte: 'Mista', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Normativo / Compliance', descrizione: 'Irregolarità DURC o violazioni nel Codice dei Contratti Pubblici', fonte: 'Mista', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Normativo / Compliance', descrizione: 'Sanzioni per lavoro irregolare o subappalto non autorizzato', fonte: 'Mista', probabilita: 1, impatto: 2, note: '' },

  // Finanziario
  { categoria: 'Finanziario', descrizione: 'Crisi di liquidità per SAL non pagati dal committente (specie PA)', fonte: 'Mista', probabilita: 2, impatto: 3, note: '' },
  { categoria: 'Finanziario', descrizione: 'Aumento improvviso del costo dei materiali (acciaio, cemento, energia)', fonte: 'Esterna', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'Finanziario', descrizione: 'Blocco o riduzione retroattiva di incentivi fiscali (superbonus/ecobonus)', fonte: 'Esterna', probabilita: 2, impatto: 3, note: '' },

  // Terze Parti / Fornitori
  { categoria: 'Terze Parti / Fornitori', descrizione: 'Fallimento o inadempienza di un subappaltatore', fonte: 'Mista', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'Terze Parti / Fornitori', descrizione: 'Ritardi nella fornitura di materiali edili', fonte: 'Esterna', probabilita: 2, impatto: 1, note: '' },
  { categoria: 'Terze Parti / Fornitori', descrizione: 'Comportamento scorretto o irregolare di un subappaltatore', fonte: 'Mista', probabilita: 1, impatto: 2, note: '' },

  // Continuità Operativa
  { categoria: 'Continuità Operativa', descrizione: 'Sequestro del cantiere per irregolarità o incidente grave', fonte: 'Mista', probabilita: 1, impatto: 3, note: '' },
  { categoria: 'Continuità Operativa', descrizione: 'Danni a strutture preesistenti o a terzi durante i lavori', fonte: 'Interna', probabilita: 1, impatto: 2, note: '' },
],
}

export function getRischiDefault(settore) {
  const settoreSpecifico = RISCHI_PER_SETTORE[settore] || []
  if (settoreSpecifico.length > 0) {
    // Combina: prima i rischi standard, poi quelli specifici del settore
    return [...RISCHI_DEFAULT, ...settoreSpecifico]
  }
  return RISCHI_DEFAULT
}

// Suggerimenti azioni di mitigazione per categoria e descrizione rischio
export const SUGGERIMENTI_AZIONI = {
  'IT / Cyber': {
    'Attacco ransomware': 'Implementare EDR su tutti i dispositivi. Attivare MFA su VPN, email e gestionali. Formare il personale sul riconoscimento del phishing con simulazione annuale.',
    'Violazione dei dati personali': 'Eseguire audit GDPR completo (mappatura trattamenti, verifica DPA). Nominare DPO. Implementare registro trattamenti ex art. 30 GDPR.',
    'Vulnerabilità software': 'Inventariare tutti i software e definire patch policy mensile. Attivare aggiornamenti automatici. Eseguire vulnerability scan semestrale.',
    'Mancanza di backup': 'Implementare regola backup 3-2-1 (3 copie, 2 supporti, 1 offsite). Automatizzare backup giornalieri. Testare ripristino ogni trimestre.',
    'Interruzione del provider': 'Definire strategia multi-cloud o hot-standby. Documentare RTO e RPO. Testare failover annualmente.',
    'default': 'Valutare il rischio con il responsabile IT e definire un piano di mitigazione specifico. Documentare le misure adottate.',
  },
  'Strategico': {
    'cliente chiave': 'Avviare piano diversificazione portafoglio clienti (obiettivo <15% per singolo cliente). QBR sistematici con top client.',
    'leadership': 'Avviare succession planning: identificare ruoli critici, designare backup per ogni C-level. Clausole retention nei contratti manager.',
    'default': 'Analizzare il rischio strategico con il CDA e definire un piano di risposta. Monitorare trimestralmente.',
  },
  'Operativo': {
    'personale qualificato': 'Attivare partnership con ITS e università. Piano formazione e upskilling interno. Benchmark retributivo annuale.',
    'know-how': 'Knowledge management: documentare processi chiave, wiki interna, affiancamenti strutturati. Monitorare turnover mensile come KPI HR.',
    'infortuni': 'Aggiornare DVR. Verificare scadenze formazione obbligatoria. Sopralluogo RSPP. Verifica DPI.',
    'default': 'Analizzare la causa del rischio operativo e definire procedure preventive. Assegnare responsabile e scadenza.',
  },
  'Reputazionale': {
    'crisi': 'Redigere Crisis Communication Plan: portavoce, messaggi chiave, canali, approvazioni. Tabletop exercise annuale.',
    'default': 'Definire procedura di gestione della reputazione e piano di comunicazione per scenari critici.',
  },
  'Normativo / Compliance': {
    'GDPR': 'Audit GDPR completo. Formare il personale sulla gestione dati personali. Aggiornare clausole contrattuali con clienti e fornitori.',
    '81/08': 'Aggiornare DVR. Verificare scadenze formazione obbligatoria (preposti, antincendio, primo soccorso). Sopralluogo RSPP.',
    'default': 'Consultare il consulente legale/compliance. Verificare la normativa applicabile e definire un piano di adeguamento.',
  },
  'Finanziario': {
    'liquidità': 'Cash flow forecast settimanale a 13 settimane. Linea di credito revolving con banca principale. Soglie di alert sulla liquidità.',
    'insolvenza': 'Credit scoring per clienti >5% fatturato. Assicurazione crediti (SACE/Euler Hermes). Monitoraggio puntualità pagamenti mensile.',
    'credito': 'Dossier finanziario aggiornato. Diversificare fonti: Confidi, finanza agevolata, factoring. Relazione con almeno 2 istituti.',
    'default': 'Analizzare il rischio finanziario con il CFO e definire misure di copertura o riduzione dell\'esposizione.',
  },
  'Terze Parti / Fornitori': {
    'fornitore': 'Identificare fornitori alternativi per ogni categoria critica. Inserire clausole contrattuali di continuità. Audit periodici sui fornitori strategici.',
    'default': 'Mappare la dipendenza dal fornitore e definire un piano di contingenza con alternative qualificate.',
  },
  'Continuità Operativa': {
    'BCP': 'Redigere Business Continuity Plan: processi critici, procedure emergenza, responsabile BCP, drill annuale. Riferimento: ISO 22301.',
    'pandemia': 'Definire protocollo di smart working esteso. Formare il personale sulle procedure di emergenza. Testare la continuità operativa da remoto.',
    'default': 'Redigere o aggiornare il Business Continuity Plan. Identificare processi critici e definire procedure di ripristino.',
  },
}

export function getSuggerimentoAzione(categoria, descrizione) {
  const catSugg = SUGGERIMENTI_AZIONI[categoria]
  if (!catSugg) return ''
  const descLower = (descrizione || '').toLowerCase()
  for (const [keyword, azione] of Object.entries(catSugg)) {
    if (keyword !== 'default' && descLower.includes(keyword.toLowerCase())) {
      return azione
    }
  }
  return catSugg['default'] || ''
}
