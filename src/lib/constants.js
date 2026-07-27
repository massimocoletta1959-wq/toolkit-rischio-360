export const CATEGORIE = [
  'IT / Cyber',
  'Strategico',
  'Operativo',
  'Reputazionale',
  'Normativo / Compliance',
  'Finanziario',
  'Terze Parti / Fornitori',
  'Continuità Operativa',
  'Rischi 231 — PA e Anticorruzione',
  'Rischi 231 — Sicurezza sul Lavoro',
  'Rischi 231 — Ambiente',
  'Rischi 231 — Finanziario e Tributario',
  'Rischi 231 — Societario e Governance',
  'Rischi 231 — Lavoro e Caporalato',
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
  { categoria: 'IT / Cyber', descrizione: 'Violazione dei dati personali (GDPR)', fonte: 'Mista', probabilita: 2, impatto: 3, note: '' },
  { categoria: 'IT / Cyber', descrizione: 'Vulnerabilita software non aggiornato', fonte: 'Esterna', probabilita: 3, impatto: 2, note: '' },
  { categoria: 'IT / Cyber', descrizione: 'Mancanza di backup aggiornati', fonte: 'Interna', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'IT / Cyber', descrizione: 'Interruzione del provider di hosting/cloud', fonte: 'Esterna', probabilita: 2, impatto: 3, note: '' },
  { categoria: 'Strategico', descrizione: 'Perdita di un cliente chiave (>20% fatturato)', fonte: 'Mista', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'Strategico', descrizione: 'Cambio di leadership o uscita di figure chiave', fonte: 'Interna', probabilita: 2, impatto: 3, note: '' },
  { categoria: 'Operativo', descrizione: 'Guasto a macchinari o infrastrutture critiche', fonte: 'Interna', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Operativo', descrizione: 'Dipendenza da un singolo fornitore critico', fonte: 'Mista', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Operativo', descrizione: 'Carenza di personale qualificato', fonte: 'Interna', probabilita: 3, impatto: 2, note: '' },
  { categoria: 'Operativo', descrizione: 'Errori nella gestione degli ordini/contratti', fonte: 'Interna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Operativo', descrizione: 'Perdita di know-how per turnover elevato', fonte: 'Interna', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'Operativo', descrizione: 'Interruzione logistica o di consegna', fonte: 'Mista', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Comportamento scorretto di un dipendente', fonte: 'Interna', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Gestione comunicazione di crisi inadeguata', fonte: 'Interna', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Perdita di certificazioni o riconoscimenti', fonte: 'Mista', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Controversie pubbliche con stakeholder', fonte: 'Mista', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Reputazionale', descrizione: 'Danni reputazionali da fornitori o partner', fonte: 'Mista', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Normativo / Compliance', descrizione: 'Non conformita GDPR / privacy', fonte: 'Mista', probabilita: 2, impatto: 3, note: '' },
  { categoria: 'Normativo / Compliance', descrizione: 'Violazione normativa sicurezza sul lavoro (D.Lgs 81/08)', fonte: 'Mista', probabilita: 2, impatto: 3, note: '' },
  { categoria: 'Normativo / Compliance', descrizione: 'Inadempienza fiscale o tributaria', fonte: 'Mista', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Normativo / Compliance', descrizione: "Controversie con l'Agenzia delle Entrate", fonte: 'Mista', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Finanziario', descrizione: 'Crisi di liquidita a breve termine', fonte: 'Mista', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'Finanziario', descrizione: 'Insolvenza di clienti importanti', fonte: 'Esterna', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'Finanziario', descrizione: 'Difficolta di accesso al credito bancario', fonte: 'Mista', probabilita: 2, impatto: 2, note: '' },
  { categoria: 'Terze Parti / Fornitori', descrizione: 'Fallimento di un fornitore strategico', fonte: 'Mista', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Terze Parti / Fornitori', descrizione: 'Dipendenza da un unico fornitore critico', fonte: 'Mista', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Terze Parti / Fornitori', descrizione: 'Mancato rispetto contrattuale da partner', fonte: 'Mista', probabilita: 1, impatto: 1, note: '' },
  { categoria: 'Continuità Operativa', descrizione: 'Assenza prolungata di figure chiave (malattia, dimissioni)', fonte: 'Mista', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Continuità Operativa', descrizione: 'Interruzione della rete internet / telecomunicazioni', fonte: 'Mista', probabilita: 1, impatto: 2, note: '' },
  { categoria: 'Continuità Operativa', descrizione: 'Blackout elettrico prolungato', fonte: 'Mista', probabilita: 1, impatto: 3, note: '' },
  { categoria: 'Continuità Operativa', descrizione: 'Mancanza di piani di continuita documentati', fonte: 'Mista', probabilita: 3, impatto: 2, note: '' },
  { categoria: 'Continuità Operativa', descrizione: 'Pandemia o assenza massiva del personale', fonte: 'Mista', probabilita: 1, impatto: 3, note: '' },
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

  'Rischi 231 — PA e Anticorruzione': {
    'corruzione': 'Adottare una procedura formale per la gestione dei rapporti con la PA: vietare pagamenti informali, documentare ogni contatto con funzionari pubblici, prevedere doppia firma per pratiche edilizie. Inserire clausole anticorruzione nei contratti con intermediari e agenti. Formare tutto il personale coinvolto nei rapporti con enti locali.',
    'appalto': 'Definire una procedura scritta per la partecipazione alle gare d\'appalto: separare le funzioni di preparazione offerta e approvazione, vietare contatti informali con RUP e commissioni, documentare le fonti di ogni informazione di gara. Nominare un responsabile gare con delega specifica.',
    'truffa': 'Istituire un controllo interno sui requisiti per accesso a incentivi e agevolazioni (Superbonus, PNRR, bandi regionali). Verificare la documentazione tecnica prima della presentazione, conservare evidenza di ogni comunicazione con gli enti erogatori. Prevedere audit periodici sulle pratiche di accesso ai fondi pubblici.',
    'default': 'Adottare un protocollo scritto per i rapporti con la Pubblica Amministrazione. Vietare regalie e utilità a funzionari pubblici. Formare il personale sui reati di corruzione e sulle procedure da seguire. Istituire un registro dei contatti con la PA e un canale di segnalazione anonima.',
  },

  'Rischi 231 — Sicurezza sul Lavoro': {
    'omicidio': 'Implementare un sistema di gestione della sicurezza certificato OHSAS 18001/ISO 45001. Nominare RSPP qualificato e CSE per ogni cantiere con più imprese. Effettuare sopralluoghi mensili con verbale. Prevedere stop-work authority per chiunque rilevi pericolo immediato. Inserire KPI di sicurezza nella valutazione dei responsabili di cantiere.',
    'DVR': 'Aggiornare il DVR per ogni nuovo cantiere entro 30 giorni dall\'apertura. Predisporre POS specifico per ogni impresa subappaltatrice. Conservare evidenza delle verifiche periodiche. Effettuare audit interni sulla corretta applicazione delle misure di prevenzione.',
    'CSE': 'Nominare il Coordinatore per la Sicurezza in fase di Esecuzione prima dell\'avvio lavori per ogni cantiere con più imprese. Verificare la qualificazione e l\'iscrizione all\'albo. Prevedere riunioni di coordinamento documentate almeno mensili. Conservare il fascicolo del fabbricato aggiornato.',
    'subappalto': 'Prima di ogni subappalto verificare: DURC regolare, iscrizione alla CCIA, DVR del subappaltatore, formazione sicurezza dei lavoratori. Inserire clausole contrattuali di responsabilità solidale. Effettuare sopralluoghi a sorpresa sui cantieri subappaltati. Prevedere clausola risolutiva per gravi violazioni sicurezza.',
    'default': 'Implementare un sistema strutturato di gestione della sicurezza nei cantieri. Formare tutto il personale sui rischi specifici. Effettuare verifiche periodiche documentate. Nominare le figure obbligatorie (RSPP, CSE, preposti). Istituire un registro degli infortuni e dei quasi-infortuni.',
  },

  'Rischi 231 — Ambiente': {
    'rifiuti': 'Predisporre per ogni cantiere un piano di gestione dei rifiuti: classificazione (CER), formulari di identificazione, registro di carico/scarico. Qualificare e monitorare i trasportatori autorizzati. Effettuare audit trimestrali sulla corretta tenuta dei registri. Formare il responsabile di cantiere sulla normativa rifiuti speciali.',
    'terre': 'Per ogni cantiere con scavi redigere il Piano di Utilizzo delle terre e rocce da scavo (DPR 120/2017). Effettuare la caratterizzazione chimica del terreno prima dello scavo. Tracciare ogni movimento di materiale con DDT e documentazione analitica. Conservare la documentazione per almeno 5 anni.',
    'traffico': 'Verificare l\'autorizzazione al trasporto di tutti i vettori utilizzati (Albo Gestori Ambientali). Vietare la miscelazione di rifiuti di diversa classificazione. Effettuare audit a sorpresa sulle aree di stoccaggio temporaneo. Prevedere clausole contrattuali di responsabilità per i subappaltatori nella gestione dei rifiuti.',
    'inquinamento': 'Prima dell\'avvio cantieri in aree sensibili (vicino a corsi d\'acqua, aree protette) effettuare studio di impatto ambientale. Installare sistemi di contenimento per acque di lavaggio e cemento. Monitorare periodicamente acque di falda nei cantieri ad alto rischio. Nominare un responsabile ambientale di cantiere.',
    'bonifica': 'Prima di interventi su aree potenzialmente contaminate (ex siti industriali, discariche) effettuare indagine preliminare ambientale (fase I e II). In caso di contaminazione attivare immediatamente la procedura di bonifica ex art. 242 D.Lgs. 152/06. Conservare tutta la documentazione delle analisi effettuate.',
    'default': 'Predisporre un sistema di gestione ambientale per i cantieri. Formare il responsabile di cantiere sulla normativa rifiuti e terre da scavo. Verificare le autorizzazioni di tutti i soggetti coinvolti nello smaltimento.',
  },

  'Rischi 231 — Finanziario e Tributario': {
    'riciclaggio': 'Implementare procedure di adeguata verifica della clientela (AML) per acquisti e vendite immobiliari. Monitorare i flussi finanziari anomali (pagamenti in contanti, triangolazioni). Applicare rigorosamente la tracciabilità dei pagamenti prevista dalla L. 136/2010 per i contratti pubblici. Nominare un responsabile antiriciclaggio.',
    'fatture': 'Istituire un registro fornitori qualificati con verifica preventiva (visura CCIAA, DURC, coerenza fatturato). Vietare rapporti con fornitori non verificati o con prezzi anomali. Effettuare audit sulla coerenza tra fatture ricevute e lavori effettivamente eseguiti. Prevedere doppia firma per approvazione fatture superiori a soglie definite.',
    'dichiarazione': 'Separare le funzioni di contabilità e approvazione delle dichiarazioni fiscali. Effettuare una revisione interna delle scritture contabili prima della presentazione delle dichiarazioni. Conservare tutta la documentazione di supporto. Prevedere audit fiscali periodici da parte di un revisore esterno indipendente.',
    'default': 'Rafforzare i controlli interni sulla gestione finanziaria e fiscale. Implementare la segregazione dei compiti tra chi autorizza e chi esegue i pagamenti. Formare il personale amministrativo sui rischi di responsabilità 231 in ambito fiscale.',
  },

  'Rischi 231 — Societario e Governance': {
    'bilancio': 'Adottare procedure formali per la valutazione degli immobili e l\'avanzamento dei lavori. Prevedere la revisione legale obbligatoria anche sotto le soglie di legge. Garantire piena trasparenza documentale verso il Collegio Sindacale. Formare gli amministratori sui reati di falso in bilancio e sulle relative responsabilità.',
    'controllo': 'Garantire accesso pieno e tempestivo al Collegio Sindacale e al Revisore a tutta la documentazione richiesta. Vietare qualsiasi comportamento ostruzionistico verso gli organi di controllo. Prevedere sanzioni disciplinari per chi impedisca l\'attività di vigilanza. Istituire flussi informativi periodici verso il Collegio Sindacale.',
    'default': 'Rafforzare la governance societaria. Garantire trasparenza verso tutti gli organi di controllo. Formare gli amministratori sulle responsabilità penali in ambito societario.',
  },

  'Rischi 231 — Lavoro e Caporalato': {
    'caporalato': 'Adottare una procedura di qualificazione dei subappaltatori di manodopera: verificare l\'iscrizione all\'albo, i CCNL applicati, le buste paga dei lavoratori, il DURC in tempo reale. Effettuare sopralluoghi a sorpresa per verificare le condizioni di lavoro. Inserire clausole contrattuali di risoluzione immediata in caso di violazioni. Aderire a protocolli antiusura e anticaporalato di settore.',
    'criminali': 'Prima di ogni subappalto richiedere la documentazione antimafia (art. 83 D.Lgs. 159/2011) a tutte le imprese della catena. Verificare la congruità dei prezzi offerti rispetto ai costi di mercato. Monitorare la reputazione dei subappaltatori tramite banche dati pubbliche. Prevedere clausole contrattuali di risoluzione per interdittiva antimafia.',
    'stranieri': 'Verificare prima dell\'assunzione il permesso di soggiorno di tutti i lavoratori extracomunitari. Estendere la verifica a tutti i subappaltatori. Conservare copia dei documenti verificati. Effettuare verifiche periodiche sulla regolarità dei permessi durante il rapporto di lavoro. Formare il responsabile HR sui rischi penali connessi.',
    'default': 'Implementare una procedura strutturata di qualificazione e monitoraggio dei subappaltatori. Verificare DURC, CCNL applicato, regolarità contributiva e assicurativa di tutti i fornitori di manodopera. Effettuare audit periodici sulle condizioni di lavoro nei cantieri.',
  },
}

export function getSuggerimentoAzione(categoria, descrizione) {
  const catSugg = SUGGERIMENTI_AZIONI[categoria]
  if (!catSugg) return ''
  const descLower = (descrizione || '').toLowerCase()
  
  // Cerca corrispondenza per keyword nella descrizione
  for (const [keyword, azione] of Object.entries(catSugg)) {
    if (keyword !== 'default' && descLower.includes(keyword.toLowerCase())) {
      return azione
    }
  }
  
  // Per categorie 231, cerca anche per parole chiave nella descrizione
  if (categoria.includes('231')) {
    const keywords231 = {
      'corruzione': ['corruzione', 'concussione', 'pubblica', 'pa ', 'permesso', 'concessione', 'gara', 'appalto', 'bando', 'incant'],
      'omicidio': ['omicidio', 'lesioni', 'infortun', 'antinfortun', 'cantiere', '81/08', 'sicurezza'],
      'rifiuti': ['rifiuti', 'smaltim', 'rifiuto', 'eternit', 'amianto', 'speciali'],
      'terre': ['terre', 'rocce', 'scavo', 'scavi'],
      'fatture': ['fattur', 'inesistent', 'subappalto', 'subappalt'],
      'caporalato': ['caporalato', 'sfruttamento', 'manodopera', 'intermediaz'],
      'riciclaggio': ['riciclagg', 'riciclo', 'autoricicl'],
      'bilancio': ['bilancio', 'comunicazioni sociali', 'falso'],
    }
    for (const [key, words] of Object.entries(keywords231)) {
      if (words.some(w => descLower.includes(w))) {
        // Cerca in tutte le categorie 231
        for (const [cat, sugg] of Object.entries(SUGGERIMENTI_AZIONI)) {
          if (cat.includes('231') && sugg[key]) return sugg[key]
        }
      }
    }
  }
  
  return catSugg['default'] || ''
}

// Catalogo Rischi 231 per settore Edile
export const RISCHI_231_EDILIZIA = [

  // Art. 24/25 — Reati contro la Pubblica Amministrazione
  { categoria: 'Normativo / Compliance', descrizione: 'Corruzione di funzionari pubblici per ottenere permessi di costruire o concessioni edilizie', fonte: 'Interna', probabilita: 2, impatto: 3, note: 'Art. 24-25 D.Lgs. 231/01 — area sensibile: rapporti con enti locali e SUAP' },
  { categoria: 'Normativo / Compliance', descrizione: 'Turbata libertà degli incanti in gare di appalto pubbliche', fonte: 'Interna', probabilita: 2, impatto: 3, note: 'Art. 25 D.Lgs. 231/01 — area sensibile: partecipazione a bandi pubblici' },
  { categoria: 'Normativo / Compliance', descrizione: 'Truffa aggravata ai danni dello Stato per erogazioni pubbliche (incentivi, superbonus)', fonte: 'Interna', probabilita: 2, impatto: 3, note: 'Art. 24 D.Lgs. 231/01 — area sensibile: accesso a fondi pubblici e agevolazioni fiscali edilizie' },
  { categoria: 'Normativo / Compliance', descrizione: 'Frode nelle pubbliche forniture o nelle perizie tecniche richieste dalla PA', fonte: 'Interna', probabilita: 1, impatto: 3, note: 'Art. 24 D.Lgs. 231/01 — area sensibile: collaudi, certificazioni e direzione lavori' },
  { categoria: 'Normativo / Compliance', descrizione: 'Induzione indebita o concussione nel rilascio di autorizzazioni urbanistiche', fonte: 'Interna', probabilita: 1, impatto: 3, note: 'Art. 25 D.Lgs. 231/01 — area sensibile: varianti urbanistiche e piani attuativi' },

  // Art. 25-septies — Sicurezza sul lavoro
  { categoria: 'Operativo', descrizione: 'Omicidio colposo o lesioni gravi per violazione norme antinfortunistiche in cantiere (D.Lgs. 81/08)', fonte: 'Interna', probabilita: 2, impatto: 3, note: 'Art. 25-septies D.Lgs. 231/01 — AREA A RISCHIO MASSIMO: cadute dall\'alto, macchine, scavi' },
  { categoria: 'Operativo', descrizione: 'Omessa o inadeguata valutazione dei rischi (DVR) nei cantieri temporanei e mobili', fonte: 'Interna', probabilita: 2, impatto: 3, note: 'Art. 25-septies D.Lgs. 231/01 — obbligo PSC e POS per ogni cantiere' },
  { categoria: 'Operativo', descrizione: 'Mancata nomina o inadeguatezza del Coordinatore per la Sicurezza in fase di esecuzione (CSE)', fonte: 'Interna', probabilita: 2, impatto: 2, note: 'Art. 25-septies D.Lgs. 231/01 — obbligo per cantieri con più imprese' },
  { categoria: 'Operativo', descrizione: 'Infortuni gravi su lavoratori di ditte subappaltatrici per carente coordinamento sicurezza', fonte: 'Mista', probabilita: 2, impatto: 3, note: 'Art. 25-septies D.Lgs. 231/01 — responsabilità solidale del committente nei subappalti' },

  // Art. 25-undecies — Reati ambientali
  { categoria: 'Normativo / Compliance', descrizione: 'Gestione illecita di rifiuti speciali da cantiere (terra, calcestruzzo, eternit, amianto)', fonte: 'Interna', probabilita: 2, impatto: 3, note: 'Art. 25-undecies D.Lgs. 231/01 — area sensibile: smaltimento rifiuti, formulari e registri' },
  { categoria: 'Normativo / Compliance', descrizione: 'Violazione normativa terre e rocce da scavo (DPR 120/2017)', fonte: 'Interna', probabilita: 2, impatto: 2, note: 'Art. 25-undecies D.Lgs. 231/01 — obbligo di piano di utilizzo e tracciabilità' },
  { categoria: 'Normativo / Compliance', descrizione: 'Traffico illecito di rifiuti o miscelazione non autorizzata di rifiuti pericolosi', fonte: 'Mista', probabilita: 1, impatto: 3, note: 'Art. 25-undecies D.Lgs. 231/01 — reato doloso con sanzioni molto elevate' },
  { categoria: 'Normativo / Compliance', descrizione: 'Inquinamento ambientale da attività di cantiere (acque, suolo, aria)', fonte: 'Mista', probabilita: 1, impatto: 3, note: 'Art. 25-undecies D.Lgs. 231/01 — area sensibile: cantieri vicino a corsi d\'acqua o aree protette' },
  { categoria: 'Normativo / Compliance', descrizione: 'Omessa bonifica di siti contaminati su aree oggetto di intervento edilizio', fonte: 'Interna', probabilita: 1, impatto: 3, note: 'Art. 25-undecies D.Lgs. 231/01 — obbligo di caratterizzazione preventiva del terreno' },

  // Art. 25-octies — Riciclaggio e reati finanziari
  { categoria: 'Finanziario', descrizione: 'Riciclaggio attraverso appalti gonfiati, subappalti fittizi o compravendite immobiliari', fonte: 'Mista', probabilita: 1, impatto: 3, note: 'Art. 25-octies D.Lgs. 231/01 — area sensibile: acquisto e vendita immobili, gestione cassa' },
  { categoria: 'Finanziario', descrizione: 'Autoriciclaggio tramite reimpiego di proventi illeciti in attività edilizie', fonte: 'Interna', probabilita: 1, impatto: 3, note: 'Art. 25-octies D.Lgs. 231/01 — monitoraggio flussi finanziari anomali' },
  { categoria: 'Finanziario', descrizione: 'Impiego di denaro di provenienza illecita nei cantieri (pagamenti in contanti non tracciati)', fonte: 'Mista', probabilita: 2, impatto: 2, note: 'Art. 25-octies D.Lgs. 231/01 — obbligo tracciabilità pagamenti in edilizia (L. 136/2010)' },

  // Art. 25-quinquiesdecies — Reati tributari
  { categoria: 'Finanziario', descrizione: 'Emissione o utilizzo di fatture per operazioni inesistenti nella catena dei subappalti', fonte: 'Mista', probabilita: 2, impatto: 3, note: 'Art. 25-quinquiesdecies D.Lgs. 231/01 — area sensibile: subappalti a cascata e costi gonfiati' },
  { categoria: 'Finanziario', descrizione: 'Dichiarazione fraudolenta mediante uso di fatture false per ridurre il carico fiscale', fonte: 'Interna', probabilita: 1, impatto: 3, note: 'Art. 25-quinquiesdecies D.Lgs. 231/01 — controllo rigoroso sulla catena documentale' },
  { categoria: 'Finanziario', descrizione: 'Omessa dichiarazione o occultamento di documenti contabili relativi ai cantieri', fonte: 'Interna', probabilita: 1, impatto: 2, note: 'Art. 25-quinquiesdecies D.Lgs. 231/01 — tenuta corretta della contabilità di cantiere' },

  // Art. 25-ter — Reati societari
  { categoria: 'Normativo / Compliance', descrizione: 'Falso in bilancio o comunicazioni sociali infedeli nelle società del gruppo', fonte: 'Interna', probabilita: 1, impatto: 3, note: 'Art. 25-ter D.Lgs. 231/01 — area sensibile: valutazione immobili, avanzamento lavori, accantonamenti' },
  { categoria: 'Normativo / Compliance', descrizione: 'Impedimento al controllo da parte del Collegio Sindacale o del Revisore', fonte: 'Interna', probabilita: 1, impatto: 2, note: 'Art. 25-ter D.Lgs. 231/01 — obbligo di trasparenza verso organi di controllo' },

  // Art. 25-quater/quinquies — Criminalità organizzata e caporalato
  { categoria: 'Operativo', descrizione: 'Caporalato e sfruttamento del lavoro nella gestione della manodopera di cantiere', fonte: 'Mista', probabilita: 2, impatto: 3, note: 'Art. 25-quinquies D.Lgs. 231/01 — area ad ALTA CRITICITÀ: subappalti manodopera, cooperative false' },
  { categoria: 'Operativo', descrizione: 'Utilizzo di manodopera di imprese collegate alla criminalità organizzata nei subappalti', fonte: 'Esterna', probabilita: 1, impatto: 3, note: 'Art. 25-quater D.Lgs. 231/01 — verifica antimafia su tutti i subappaltatori' },
  { categoria: 'Operativo', descrizione: 'Impiego di cittadini stranieri con soggiorno irregolare nei cantieri', fonte: 'Mista', probabilita: 2, impatto: 2, note: 'Art. 25-duodecies D.Lgs. 231/01 — obbligo verifica documenti su tutta la catena di subappalto' },

  // Art. 24-bis — Reati informatici
  { categoria: 'IT / Cyber', descrizione: 'Accesso abusivo ai sistemi informatici di committenti pubblici o concorrenti (gare telematiche)', fonte: 'Interna', probabilita: 1, impatto: 3, note: 'Art. 24-bis D.Lgs. 231/01 — area sensibile: portali e-procurement, sistemi BIM condivisi' },
  { categoria: 'IT / Cyber', descrizione: 'Danneggiamento o alterazione di dati informatici di progetto o documentazione di gara', fonte: 'Interna', probabilita: 1, impatto: 2, note: 'Art. 24-bis D.Lgs. 231/01 — protezione integrità documentazione tecnica e amministrativa' },

  // OdV e presidi 231
  { categoria: 'Normativo / Compliance', descrizione: 'Assenza o inefficacia del Modello Organizzativo 231 e dell\'Organismo di Vigilanza (OdV)', fonte: 'Interna', probabilita: 2, impatto: 3, note: 'Rischio trasversale: senza MOG 231 efficace la società risponde penalmente per tutti i reati presupposto' },
  { categoria: 'Normativo / Compliance', descrizione: 'Mancata formazione del personale sui contenuti del Modello 231 e del Codice Etico', fonte: 'Interna', probabilita: 2, impatto: 2, note: 'Requisito art. 6 D.Lgs. 231/01: la formazione differenziata è condizione di efficacia del modello' },
  { categoria: 'Normativo / Compliance', descrizione: 'Canale di whistleblowing assente o non conforme al D.Lgs. 24/2023', fonte: 'Interna', probabilita: 2, impatto: 2, note: 'Obbligo dal 2023 per aziende con >50 dipendenti — sanzioni fino a 50.000 euro' },
]

export const RISCHI_PER_SETTORE_231 = {
  'Edilizia': RISCHI_231_EDILIZIA,
}
