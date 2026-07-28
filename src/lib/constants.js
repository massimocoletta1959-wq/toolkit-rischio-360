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
  const desc = (descrizione || '').toLowerCase()

  // ── Suggerimenti specifici per descrizione esatta ────────────────────────

  // IT / Cyber
  if (desc.includes('ransomware'))
    return `Implementare soluzione EDR (Endpoint Detection & Response) su tutti i dispositivi aziendali. Attivare MFA obbligatorio su tutti gli accessi (VPN, email, gestionali, cloud). Predisporre un piano di risposta agli incidenti ransomware: procedura di isolamento, contatti CERT, comunicazione interna. Effettuare simulazioni di phishing semestrali. Testare il ripristino da backup almeno ogni trimestre verificando i tempi di recovery.`
  if (desc.includes('violazione dei dati personali') || desc.includes('gdpr'))
    return `Eseguire un audit GDPR completo: mappatura di tutti i trattamenti (art. 30), verifica dei DPA con i fornitori, aggiornamento delle informative. Verificare la nomina del DPO (obbligatoria per alcune categorie). Implementare procedure di data breach: notifica al Garante entro 72 ore, comunicazione agli interessati se il rischio è elevato. Effettuare DPIA per i trattamenti ad alto rischio. Formare tutto il personale con modulo e-learning annuale.`
  if (desc.includes('vulnerabilit') || desc.includes('software non aggiornato'))
    return `Inventariare tutti i software aziendali e definire una patch policy con cadenza mensile per patch ordinarie e 48 ore per patch critiche. Attivare aggiornamenti automatici dove possibile. Eseguire vulnerability scan semestrale con strumento dedicato (es. Tenable, OpenVAS). Rimuovere o isolare i sistemi che non ricevono più aggiornamenti dal produttore (end-of-life). Tenere un registro delle vulnerabilità aperte con priorità e responsabile.`
  if (desc.includes('backup'))
    return `Implementare la regola 3-2-1: 3 copie dei dati, su 2 supporti diversi, 1 offsite o cloud. Automatizzare i backup giornalieri con verifica di integrità automatica (hash check). Testare il ripristino completo almeno ogni trimestre, documentando i tempi effettivi di recovery. Definire RTO e RPO per ogni sistema critico. Conservare i backup offline (air-gapped) per proteggersi dal ransomware.`
  if (desc.includes('provider') || desc.includes('hosting') || desc.includes('cloud'))
    return `Definire una strategia di resilienza cloud: valutare un provider secondario (multi-cloud) o una soluzione hot-standby on-premise per i servizi critici. Documentare RTO e RPO negoziati contrattualmente con il provider. Inserire nel contratto SLA con penali per downtime. Testare il failover almeno una volta l'anno con verbale. Mantenere una copia locale dei dati critici aggiornata.`

  // Strategico
  if (desc.includes('cliente chiave') || desc.includes('>20% fatturato'))
    return `Avviare un piano di diversificazione del portafoglio clienti con obiettivo di ridurre la concentrazione sotto il 15% per singolo cliente entro 12 mesi. Implementare QBR (Quarterly Business Review) sistematici con i top 5 clienti per rafforzare la relazione. Sviluppare nuovi mercati o segmenti adiacenti. Monitorare mensilmente la concentrazione del fatturato come KPI strategico. Inserire in bilancio un accantonamento per rischio cliente.`
  if (desc.includes('leadership') || desc.includes('figure chiave'))
    return `Avviare un piano di succession planning: identificare le 5-10 posizioni chiave, valutare i potenziali successori interni, definire piani di sviluppo individuali. Designare un backup operativo per ogni ruolo C-level. Inserire clausole di retention (vesting, bonus pluriennali) nei contratti dei manager strategici. Documentare le conoscenze critiche in wiki interna. Effettuare revisione annuale del piano di successione.`

  // Operativo
  if (desc.includes('macchinari') || desc.includes('infrastrutture critiche'))
    return `Implementare un piano di manutenzione preventiva programmata per tutti i macchinari critici con registro degli interventi. Stipulare contratti di manutenzione con SLA definiti per i macchinari più critici. Identificare i macchinari senza ridondanza e valutare un backup o un contratto di noleggio di emergenza. Effettuare analisi FMEA (Failure Mode and Effects Analysis) per i processi produttivi critici.`
  if (desc.includes('dipendenza da un singolo fornitore') || desc.includes('unico fornitore'))
    return `Mappare tutti i fornitori critici (quelli la cui interruzione blocca la produzione). Per ognuno identificare almeno un fornitore alternativo qualificato e mantenere un rapporto attivo. Diversificare gli acquisti: massimo 60% da un singolo fornitore per le categorie critiche. Mantenere uno stock di sicurezza adeguato per i materiali a lungo lead time. Inserire clausole contrattuali di continuità fornitura.`
  if (desc.includes('carenza di personale qualificato'))
    return `Attivare partnership con ITS, università e agenzie per il lavoro per pipeline di talenti. Strutturare un piano di formazione interna e upskilling con budget dedicato. Rivedere la job architecture e i livelli retributivi rispetto al mercato (benchmark HR annuale con dati Assinform/Hay Group). Implementare un programma di employee retention: survey di clima, piani di carriera, benefit competitivi. Monitorare il turnover mensile come KPI HR.`
  if (desc.includes('ordini') || desc.includes('contratti'))
    return `Implementare un sistema di gestione dei contratti con alert automatici sulle scadenze. Introdurre una checklist di revisione contrattuale prima della firma (4-eyes principle). Formare il personale commerciale e operativo sulla corretta gestione degli ordini. Effettuare riconciliazione mensile tra ordini ricevuti, consegnati e fatturati. Conservare tutta la documentazione contrattuale in un repository centralizzato.`
  if (desc.includes('know-how') || desc.includes('turnover'))
    return `Avviare un programma di knowledge management: documentare i processi chiave in wiki interna, creare video tutorial per le attività critiche, istituire affiancamenti strutturati per ogni figura critica (almeno 3 mesi). Costruire una matrice delle competenze per identificare i punti di singola dipendenza. Monitorare il turnover mensile e condurre exit interview sistematiche. Inserire obiettivi di knowledge sharing nella valutazione delle performance.`
  if (desc.includes('logistica') || desc.includes('consegna'))
    return `Mappare la catena logistica e identificare i nodi critici senza ridondanza. Qualificare almeno 2 vettori alternativi per le rotte principali. Mantenere uno stock di sicurezza per i prodotti a maggiore rotazione. Inserire nei contratti logistici SLA con penali per ritardi. Definire un piano di emergenza logistica con procedure di rerouting. Monitorare le performance dei vettori con KPI mensili.`

  // Reputazionale
  if (desc.includes('comportamento scorretto') || desc.includes('dipendente'))
    return `Adottare un Codice Etico con norme di comportamento chiare e diffonderlo a tutto il personale con firma per ricevuta. Istituire un canale di segnalazione anonima (whistleblowing). Definire un processo disciplinare trasparente e proporzionato. Formare i responsabili HR sulla gestione dei casi di comportamento scorretto. Effettuare screening reputazionale per le posizioni di responsabilità.`
  if (desc.includes('comunicazione di crisi'))
    return `Redigere un Crisis Communication Plan: identificare il portavoce ufficiale, preparare messaggi chiave per gli scenari più probabili (infortuni, data breach, controversie contrattuali), definire i canali di comunicazione e le approvazioni necessarie. Effettuare un tabletop exercise annuale con simulazione di crisi. Monitorare la reputazione online con strumenti di social listening. Aggiornare il piano ogni anno.`
  if (desc.includes('certificazioni') || desc.includes('riconoscimenti'))
    return `Mappare tutte le certificazioni aziendali con scadenze e responsabili. Impostare alert automatici 90 e 30 giorni prima di ogni scadenza. Assegnare un responsabile certificazioni con delega formale. Effettuare audit interni di pre-certificazione 3 mesi prima del rinnovo. Valutare le certificazioni come leva competitiva e comunicarle nel materiale commerciale.`
  if (desc.includes('controversie pubbliche') || desc.includes('stakeholder'))
    return `Mappare gli stakeholder rilevanti e i potenziali temi di controversia. Istituire un processo di stakeholder engagement proattivo: incontri periodici, canali di comunicazione dedicati, report di sostenibilità. Definire una procedura di gestione delle controversie pubbliche con escalation verso la direzione. Formare i responsabili sulla comunicazione con stakeholder critici.`
  if (desc.includes('fornitori o partner') || desc.includes('reputazionali da fornitori'))
    return `Introdurre un processo di due diligence reputazionale sui fornitori strategici: verifica online, referenze di mercato, visita presso la sede. Inserire nei contratti clausole etiche (anti-corruzione, rispetto dei diritti del lavoro, compliance ambientale) con diritto di risoluzione in caso di violazioni. Monitorare la reputazione dei fornitori principali con alert online. Effettuare audit fornitori annuali per quelli critici.`

  // Normativo / Compliance
  if (desc.includes('non conformita gdpr') || desc.includes('gdpr / privacy'))
    return `Eseguire un audit GDPR completo: mappare tutti i trattamenti nel registro ex art. 30, verificare la base giuridica per ognuno, aggiornare le informative, rivedere i DPA con fornitori e partner. Formare tutto il personale con modulo e-learning annuale con test di verifica. Nominare o verificare il DPO. Implementare una procedura di gestione dei data breach con notifica al Garante entro 72 ore. Effettuare DPIA per i nuovi trattamenti ad alto rischio.`
  if (desc.includes('81/08') || desc.includes('sicurezza sul lavoro'))
    return `Aggiornare il DVR e verificare tutte le scadenze di formazione obbligatoria (preposti, addetti antincendio, primo soccorso). Pianificare un sopralluogo con l'RSPP entro 30 giorni. Verificare la disponibilità e l'adeguatezza di tutti i DPI in uso. Aggiornare il registro infortuni e dei quasi-infortuni. Effettuare simulazioni di emergenza semestrali con verbale.`
  if (desc.includes('fiscale') || desc.includes('tributaria'))
    return `Effettuare una revisione fiscale preventiva annuale con il commercialista. Verificare il rispetto di tutti gli adempimenti periodici (IVA, F24, dichiarazioni). Implementare un calendario degli adempimenti con alert automatici. Valutare un sistema di controllo interno sulla contabilità (internal audit). Conservare tutta la documentazione fiscale per almeno 10 anni.`

  // Finanziario
  if (desc.includes('liquidit'))
    return `Implementare un cash flow forecast settimanale a 13 settimane aggiornato ogni lunedì. Negoziare una linea di credito revolving di emergenza con la banca principale (anche se non utilizzata). Definire soglie di alert sulla liquidità disponibile (es. < 3 mensilità di costi fissi) e un protocollo di escalation immediata al CFO e CEO. Accelerare i tempi di incasso con incentivi per pagamento anticipato e gestione proattiva dei crediti scaduti.`
  if (desc.includes('insolvenza di clienti'))
    return `Implementare un sistema di credit scoring per tutti i clienti con esposizione superiore al 5% del fatturato. Attivare un'assicurazione crediti (SACE, Euler Hermes, Atradius) per i clienti principali. Monitorare mensilmente la puntualità dei pagamenti e intervenire entro 15 giorni dallo scaduto. Inserire nei contratti clausole di riserva di proprietà e fideiussioni per commesse rilevanti. Valutare il factoring pro-soluto per le fatture verso la PA.`
  if (desc.includes('credito bancario') || desc.includes('accesso al credito'))
    return `Predisporre e mantenere aggiornato un dossier finanziario (bilanci, business plan triennale, proiezioni di cash flow) pronto per presentazioni agli istituti di credito. Diversificare le fonti di finanziamento: esplorare Confidi di settore, finanza agevolata (SIMEST, SACE), factoring, minibond. Mantenere relazioni proattive con almeno 2 istituti di credito. Monitorare il rating bancario e intervenire per migliorarlo prima di necessità urgenti.`

  // Terze Parti
  if (desc.includes('fallimento di un fornitore strategico'))
    return `Identificare i fornitori strategici (quelli la cui interruzione blocca l'operatività) e qualificare per ognuno un fornitore alternativo. Richiedere ai fornitori critici bilanci e situazione finanziaria almeno annualmente. Monitorare i segnali di difficoltà (ritardi, riduzione qualità, richieste di anticipi). Inserire nei contratti clausole di continuità del servizio in caso di procedure concorsuali. Valutare l'opportunità di contratti pluriennali con garanzie.`
  if (desc.includes('mancato rispetto contrattuale') || desc.includes('partner'))
    return `Rafforzare la fase di due diligence prima di stipulare contratti con nuovi partner: verifica referenze, sopralluogo, analisi finanziaria. Inserire nei contratti SLA misurabili con penali proporzionate, clausole risolutive per inadempimenti gravi e diritto di audit. Monitorare le performance con KPI mensili. Prevedere un processo strutturato di contestazione e escalation prima di arrivare al contenzioso.`

  // Continuità Operativa
  if (desc.includes('assenza prolungata') || desc.includes('malattia, dimissioni'))
    return `Identificare le posizioni critiche (quelle la cui assenza blocca processi chiave) e designare un sostituto operativo per ognuna. Documentare i processi critici in procedure scritte. Garantire la copertura assicurativa (polizza key man) per le figure indispensabili. Effettuare rotazione delle responsabilità per ridurre le dipendenze da singole persone. Testare i piani di sostituzione almeno una volta l'anno.`
  if (desc.includes('rete internet') || desc.includes('telecomunicazioni'))
    return `Dotarsi di una connessione internet di backup su tecnologia diversa (es. fibra principale + 4G/5G backup) con failover automatico. Verificare che i sistemi critici possano operare in modalità offline o con banda ridotta. Contrattualizzare SLA con il provider con penali per downtime. Effettuare un test di failover semestrale. Identificare le attività che richiedono connessione continua e prioritizzarle nel piano di ripristino.`
  if (desc.includes('blackout') || desc.includes('elettrico'))
    return `Installare un UPS (Uninterruptible Power Supply) per i sistemi IT critici dimensionato per almeno 4 ore di autonomia. Valutare un gruppo elettrogeno per continuità oltre le 4 ore. Testare il sistema di backup elettrico ogni 6 mesi con verbale. Identificare i processi che possono continuare senza corrente e quelli che richiedono arresto controllato. Verificare i contratti con il fornitore di energia per gli SLA.`
  if (desc.includes('piani di continuita') || desc.includes('BCP'))
    return `Redigere un Business Continuity Plan (BCP) strutturato: (1) analisi d'impatto sui processi critici (BIA), (2) identificazione delle minacce principali, (3) definizione delle strategie di risposta, (4) procedure operative di emergenza, (5) piano di comunicazione interna ed esterna, (6) piano di test annuale. Nominare un BCP Manager con delega formale. Condurre un drill annuale e aggiornare il piano in base ai risultati. Riferimento: ISO 22301.`
  if (desc.includes('pandemia') || desc.includes('assenza massiva'))
    return `Definire un protocollo di smart working esteso: lista delle posizioni che possono lavorare da remoto, dotazione tecnologica adeguata, regole di sicurezza informatica per il lavoro da casa. Creare un team di gestione delle emergenze sanitarie. Identificare le attività che richiedono presenza fisica e le relative misure di protezione. Mantenere scorte di DPI. Testare la capacità di operare in modalità ridotta con una simulazione annuale.`

  // ── Edilizia specifica ───────────────────────────────────────────────────
  if (desc.includes('bim') || desc.includes('gestionali di cantiere'))
    return `Implementare policy di sicurezza specifica per i sistemi BIM e gestionali di cantiere: backup giornaliero dei modelli BIM, accesso con credenziali personali (mai condivise), log di ogni modifica, crittografia dei file di progetto in transito. Definire i diritti di accesso per ogni figura professionale. Prevedere una copia offline aggiornata settimanalmente. Inserire clausole di riservatezza nei contratti con studi esterni che accedono ai modelli.`
  if (desc.includes('furto o perdita di dati di progetto'))
    return `Classificare i dati di progetto per livello di riservatezza (gare in corso = massima riservatezza). Cifrare tutti i file relativi a gare pubbliche e progetti riservati. Vietare l'uso di dispositivi personali per dati di progetto. Implementare DLP (Data Loss Prevention) per bloccare l'invio di file riservati via email non aziendale. Prevedere NDA con tutti i collaboratori esterni. Effettuare audit semestrale sugli accessi ai file di progetto.`
  if (desc.includes('fluttuazione della domanda') || desc.includes('cicli edilizi'))
    return `Diversificare il portafoglio lavori per tipologia (privato, pubblico, manutenzione, nuova costruzione) e per area geografica per ridurre l'esposizione ai cicli settoriali. Monitorare gli indicatori anticipatori del mercato edile (permessi di costruire, bandi pubblici, indici di fiducia delle imprese). Mantenere una struttura di costi flessibile (subappalto vs personale diretto). Costruire una pipeline di commesse con copertura minima a 18 mesi.`
  if (desc.includes('appalto pubblico') || desc.includes('singolo grande appalto'))
    return `Limitare la dipendenza da un singolo committente pubblico al 40% del portafoglio ordini. Diversificare per stazione appaltante (Comuni, ANAS, RFI, privati). Monitorare la solidità finanziaria dei committenti pubblici prima di partecipare a gare rilevanti. Inserire nei contratti clausole di revisione prezzi (price revision) per commesse pluriennali. Verificare la disponibilità finanziaria effettiva del committente prima dell'avvio lavori.`
  if (desc.includes('infortunio grave') || desc.includes('caduta dall'))
    return `Implementare la procedura Zero Cadute: check-list obbligatoria giornaliera per ponteggi, trabattelli e aperture nel vuoto; verifica DPI anticaduta ad ogni inizio turno; stop immediato dei lavori in quota in caso di vento > 50 km/h o pioggia intensa. Effettuare sopralluogo di sicurezza settimanale con verbale firmato dal preposto. Installare sistemi di videosorveglianza nelle aree più rischiose. Segnalare e analizzare ogni quasi-infortunio entro 24 ore.`
  if (desc.includes('cronoprogramma') || desc.includes('ritardi di cantiere'))
    return `Implementare una gestione del cantiere con software dedicato (es. MS Project, Primavera) con aggiornamento settimanale del cronoprogramma. Identificare il percorso critico e monitorarlo quotidianamente. Istituire riunioni di avanzamento settimanali con verbale. Definire un sistema di early warning: alert automatico quando il ritardo supera il 10% su attività critiche. Prevedere contrattualmente penali e bonus per rispetto dei tempi con il committente.`
  if (desc.includes('mezzi e macchinari') || desc.includes('gru') || desc.includes('escavatori'))
    return `Implementare un registro di manutenzione per ogni mezzo con check-list pre-utilizzo giornaliera firmata dall'operatore. Verificare la formazione e l'abilitazione specifica per ogni mezzo (patentino gru, abilitazione escavatore). Effettuare verifiche periodiche obbligatorie (ISPESL/ASL) nei tempi previsti. Vietare l'utilizzo di mezzi senza manutenzione in regola. Prevedere un contratto di manutenzione con SLA per i mezzi critici.`
  if (desc.includes('furto di materiali') || desc.includes('attrezzature da cantiere'))
    return `Installare sistema di videosorveglianza perimetrale con registrazione H24 e alert in caso di movimento notturno. Inventariare e contrassegnare (incisione, RFID) tutti i macchinari e le attrezzature di valore. Stipulare polizza assicurativa All-Risk di cantiere specifica. Recinzione adeguata del cantiere con chiusura sicura. Valutare guardiania notturna per cantieri in zone ad alto rischio. Conservare le ricevute di acquisto per la denuncia e il rimborso assicurativo.`
  if (desc.includes('condizioni meteo') || desc.includes('bloccano i lavori'))
    return `Inserire nei contratti con i committenti clausole meteo che escludano i giorni di sospensione per maltempo dal computo dei giorni lavorativi (clausola intemperie). Pianificare le attività in quota e all'aperto nei periodi meteorologicamente favorevoli. Monitorare le previsioni meteo a 7 giorni per la pianificazione operativa. Prevedere attività alternative al coperto (lavori interni, prefabbricazione) da attivare in caso di blocco. Verificare la copertura assicurativa per danni da maltempo.`
  if (desc.includes('manodopera specializzata') || desc.includes('gruisti'))
    return `Costruire una rete di subappaltatori specializzati qualificati e mantenere relazioni anche nei periodi di bassa attività. Investire in programmi di formazione interna per le figure più carenti sul mercato. Anticipare le assunzioni rispetto all'avvio dei cantieri (lead time medio 2-3 mesi). Collaborare con le associazioni di categoria per segnalazioni di personale disponibile. Valutare la formazione tramite ITS e apprendistato per figure junior.`
  if (desc.includes('difetti costruttivi') || desc.includes('vizi'))
    return `Implementare un sistema di qualità di cantiere (ISO 9001 o equivalente): check-list di controllo qualità per ogni fase lavorativa, verbali di accettazione materiali, test e collaudi intermedi documentati. Nominare un Direttore Tecnico di Cantiere con poteri di stop ai lavori in caso di non conformità. Conservare tutta la documentazione di cantiere per 10 anni (termine prescrizione garanzia decennale). Stipulare polizza decennale postuma per opere strutturali. Effettuare ispezioni a campione durante le fasi nascoste.`
  if (desc.includes('eco mediatica') || desc.includes('infortunio') && desc.includes('mediatica'))
    return `Preparare un piano di comunicazione di crisi specifico per gli infortuni: portavoce designato (non il responsabile di cantiere), messaggio di condoglianze/vicinanza alla famiglia prima di qualsiasi altra comunicazione, nessuna dichiarazione sulle cause prima dell'indagine dell'ispettorato. Definire la procedura di notifica interna (chi avvisa chi e in quanto tempo). Monitorare i social media nelle ore successive. Prepararsi a comunicare le misure correttive adottate.`
  if (desc.includes('contestazioni pubbliche') || desc.includes('rumore') || desc.includes('polvere'))
    return `Prima dell'avvio del cantiere effettuare una riunione informativa con i residenti e le associazioni di zona. Affliggere all'esterno del cantiere il calendario previsto delle lavorazioni più rumorose. Rispettare le fasce orarie comunali per i lavori rumorosi. Installare sistemi di abbattimento polveri (nebulizzatori, teloni). Designare un referente del cantiere per le segnalazioni dei cittadini con risposta garantita entro 24 ore. Monitorare i livelli di rumore e vibrazione nelle fasi critiche.`
  if (desc.includes('contenziosi con il committente'))
    return `Tenere aggiornato il giornale dei lavori con annotazione di ogni evento rilevante (meteo, varianti, ordini verbali). Formalizzare per iscritto (PEC) ogni variante, riserva o contestazione entro i termini contrattuali. Non eseguire mai lavori in variante senza ordine scritto del committente. Avvalersi di un legale specializzato in contratti d'appalto per la redazione dei contratti. Valutare clausole ADR (mediazione, arbitrato) per evitare contenziosi lunghi e costosi.`
  if (desc.includes('violazione d.lgs 81') || desc.includes('sicurezza nei cantieri'))
    return `Effettuare un audit di sicurezza completo di tutti i cantieri attivi entro 30 giorni. Verificare la validità di tutti i documenti obbligatori (DVR, POS, PSC, PIMUS per ponteggi). Controllare le scadenze di formazione obbligatoria di tutto il personale. Nominare i preposti alla sicurezza per ogni cantiere con nomina scritta e formazione specifica. Istituire un sistema di segnalazione anonima dei rischi di sicurezza.`
  if (desc.includes('normative urbanistiche') || desc.includes('permessi a costruire'))
    return `Prima di ogni intervento verificare la conformità urbanistica con il professionista incaricato. Conservare copia di tutte le autorizzazioni edilizie nel fascicolo di cantiere. Aggiornare i permessi in caso di varianti significative prima di procedere. Effettuare sopralluogo con il tecnico comunale nei casi dubbi. Monitorare l'iter dei permessi con alert sulle scadenze. Prevedere in offerta i costi e i tempi per eventuali varianti in corso d'opera.`
  if (desc.includes('durc') || desc.includes('codice dei contratti'))
    return `Verificare il DURC in tempo reale prima di ogni pagamento ai subappaltatori (non accettare DURC cartacei, sempre verifica online su portale INPS/INAIL). Conservare evidenza delle verifiche. Verificare l'iscrizione alla CCIAA e l'oggetto sociale del subappaltatore. Per contratti pubblici verificare la conformità al Codice dei Contratti (D.Lgs. 36/2023): qualificazione SOA, subappalto nei limiti di legge, tracciabilità pagamenti L. 136/2010.`
  if (desc.includes('lavoro irregolare') || desc.includes('subappalto non autorizzato'))
    return `Istituire un sistema di controllo della regolarità del lavoro: lista nominativa obbligatoria di tutti i lavoratori presenti in cantiere con documento d'identità e contratto di lavoro. Verificare che ogni subappalto sia autorizzato dal committente e notificato alla Cassa Edile. Effettuare verifica documentale mensile su tutti i subappaltatori. Formare il responsabile di cantiere sulla responsabilità solidale del committente in caso di irregolarità del subappaltatore.`
  if (desc.includes('sal non pagati') || desc.includes('liquidit') && desc.includes('committente'))
    return `Inserire nei contratti con la PA e con i privati clausole di pagamento SAL con scadenze certe e interessi di mora ex D.Lgs. 231/2002. Monitorare i crediti verso la PA e attivare le procedure di sollecito/diffida entro 30 giorni dallo scaduto. Valutare il factoring dei crediti verso la PA (cessione del credito). Prevedere in piano finanziario la copertura di almeno 3 mesi di costi fissi senza incassi. Inserire in contratto clausole di sospensione lavori in caso di SAL non pagati oltre 60 giorni.`
  if (desc.includes('costo dei materiali') || desc.includes('acciaio') || desc.includes('cemento'))
    return `Inserire in tutti i contratti pluriennali una clausola di revisione prezzi agganciata agli indici DEI o ISTAT delle costruzioni. Per commesse brevi, effettuare acquisti anticipati dei materiali principali non appena aggiudicata la commessa. Diversificare i fornitori per le materie prime critiche. Monitorare mensilmente i prezzi di acciaio, cemento, energia e materie plastiche. Valutare strumenti di hedging per i materiali con mercato finanziario (es. acciaio).`
  if (desc.includes('incentivi fiscali') || desc.includes('superbonus') || desc.includes('ecobonus'))
    return `Monitorare costantemente l'evoluzione normativa degli incentivi fiscali (Superbonus, Ecobonus, Sismabonus) tramite circolari Agenzia delle Entrate e Enea. Non avviare lavori senza asseverazione tecnica preliminare. Inserire nei contratti con i clienti finali clausole di adeguamento in caso di modifica normativa e di restituzione degli acconti in caso di decadenza dell'incentivo. Diversificare il portafoglio tra lavori incentivati e non.`
  if (desc.includes('subappaltatore') && (desc.includes('fallimento') || desc.includes('inadempienza')))
    return `Prima di ogni subappalto verificare la solidità finanziaria del subappaltatore: visura CCIAA, bilancio degli ultimi 2 anni, DURC, referenze di cantieri analoghi. Non anticipare più del 20% dell'importo contrattuale. Inserire nel contratto clausola di risoluzione per inadempimento con preavviso di 10 giorni e liquidazione dei lavori eseguiti. Prevedere un subappaltatore alternativo qualificato per le lavorazioni più critiche. Effettuare SAL parziali mensili per limitare l'esposizione.`
  if (desc.includes('fornitura di materiali') || desc.includes('ritardi nella fornitura'))
    return `Diversificare i fornitori per le categorie di materiali più critiche (almeno 2 fornitori qualificati per categoria). Anticipare gli ordini di almeno 4-6 settimane per i materiali con lungo lead time. Inserire nei contratti di fornitura penali per ritardi e diritto di approvvigionamento alternativo a spese del fornitore inadempiente. Monitorare settimanalmente lo stato degli ordini in corso. Mantenere scorte di sicurezza per i materiali più utilizzati.`
  if (desc.includes('comportamento scorretto') && desc.includes('subappaltatore'))
    return `Adottare un codice di condotta per i fornitori (Supplier Code of Conduct) che includa requisiti etici, di sicurezza e ambientali. Effettuare audit periodici sui subappaltatori strategici (almeno annuali). Inserire nel contratto il diritto di risoluzione immediata per comportamenti illeciti del subappaltatore. Richiedere ai subappaltatori di aderire al codice etico aziendale con firma. Prevedere una valutazione della condotta del subappaltatore alla chiusura di ogni commessa.`
  if (desc.includes('sequestro del cantiere'))
    return `Istituire un sistema di controllo documentale preventivo: check-list mensile di tutti i documenti obbligatori di cantiere (autorizzazioni, DVR, POS, DURC, notifica preliminare). Nominare un responsabile della conformità di cantiere con potere di bloccare i lavori in caso di irregolarità. Prevedere un piano di risposta al sequestro: legale di riferimento reperibile H24, procedura di comunicazione al committente, piano di ripresa lavori. Effettuare simulazione annuale di ispezione ispettorato.`
  if (desc.includes('danni a strutture') || desc.includes('danni a terzi'))
    return `Prima dell'avvio del cantiere effettuare un rilievo fotografico e video documentato di tutti gli immobili e le infrastrutture adiacenti. Stipulare una polizza RCT/RCO (Responsabilità Civile Terzi/Operai) adeguata per importo e tipologia dei lavori. Installare sistemi di monitoraggio vibrazioni e cedimenti per cantieri vicini a strutture sensibili. Definire le soglie di allerta e le procedure di intervento. Informare preventivamente i proprietari degli immobili adiacenti.`

  // ── Suggerimenti per categorie 231 (per rischi inseriti manualmente) ─────
  if (categoria && categoria.includes('231')) {
    const catSugg231 = SUGGERIMENTI_AZIONI[categoria]
    if (catSugg231) {
      for (const [keyword, azione] of Object.entries(catSugg231)) {
        if (keyword !== 'default' && desc.includes(keyword.toLowerCase())) {
          return azione
        }
      }
      return catSugg231['default'] || ''
    }
    return `Consultare il consulente legale specializzato in D.Lgs. 231/2001. Verificare se il rischio rientra nelle aree sensibili del Modello Organizzativo e definire un protocollo specifico di presidio. Comunicare all'OdV e documentare le misure adottate.`
  }

  // ── Fallback per categorie standard ─────────────────────────────────────
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


// Catalogo Rischi 231 GENERICO — per tutti i settori non edili
export const RISCHI_231_GENERICO = [

  // Art. 24/25 — PA e Anticorruzione
  { categoria: 'Normativo / Compliance', descrizione: 'Corruzione o induzione indebita di funzionari pubblici per ottenere vantaggi commerciali o autorizzazioni', fonte: 'Interna', probabilita: 1, impatto: 3, note: 'Art. 24-25 D.Lgs. 231/01 — area sensibile: gare pubbliche, concessioni, ispezioni' },
  { categoria: 'Normativo / Compliance', descrizione: 'Truffa aggravata ai danni dello Stato per accesso a fondi pubblici, contributi o agevolazioni', fonte: 'Interna', probabilita: 1, impatto: 3, note: 'Art. 24 D.Lgs. 231/01 — area sensibile: bandi, PNRR, incentivi regionali' },
  { categoria: 'Normativo / Compliance', descrizione: 'Turbata libertà degli incanti o delle procedure di gara pubblica', fonte: 'Interna', probabilita: 1, impatto: 3, note: 'Art. 25 D.Lgs. 231/01 — area sensibile: appalti pubblici e forniture alla PA' },

  // Art. 25-septies — Sicurezza
  { categoria: 'Normativo / Compliance', descrizione: 'Omicidio colposo o lesioni gravi per violazione delle norme sulla sicurezza nei luoghi di lavoro (D.Lgs. 81/08)', fonte: 'Interna', probabilita: 2, impatto: 3, note: 'Art. 25-septies D.Lgs. 231/01 — obbligo DVR, RSPP, formazione e DPI per tutti i settori' },
  { categoria: 'Normativo / Compliance', descrizione: 'Omessa o inadeguata valutazione dei rischi (DVR) e mancata nomina delle figure obbligatorie per la sicurezza', fonte: 'Interna', probabilita: 2, impatto: 2, note: 'Art. 25-septies D.Lgs. 231/01 — RSPP, medico competente, RLS obbligatori' },

  // Art. 25-undecies — Ambiente
  { categoria: 'Normativo / Compliance', descrizione: 'Gestione illecita di rifiuti speciali prodotti dall'attività aziendale', fonte: 'Interna', probabilita: 1, impatto: 2, note: 'Art. 25-undecies D.Lgs. 231/01 — registro carico/scarico, formulari, trasportatori qualificati' },
  { categoria: 'Normativo / Compliance', descrizione: 'Scarichi industriali o emissioni atmosferiche non conformi alle autorizzazioni', fonte: 'Interna', probabilita: 1, impatto: 2, note: 'Art. 25-undecies D.Lgs. 231/01 — autorizzazione AIA/AUA, monitoraggio emissioni' },

  // Art. 25-octies — Finanziario
  { categoria: 'Finanziario', descrizione: 'Riciclaggio o autoriciclaggio di proventi illeciti attraverso attività aziendali', fonte: 'Mista', probabilita: 1, impatto: 3, note: 'Art. 25-octies D.Lgs. 231/01 — monitoraggio flussi finanziari anomali, adeguata verifica' },
  { categoria: 'Finanziario', descrizione: 'Impiego di denaro di provenienza illecita nei pagamenti aziendali (contanti, triangolazioni)', fonte: 'Mista', probabilita: 1, impatto: 2, note: 'Art. 25-octies D.Lgs. 231/01 — tracciabilità dei pagamenti, divieto contanti oltre soglia' },

  // Art. 25-quinquiesdecies — Tributario
  { categoria: 'Finanziario', descrizione: 'Emissione o utilizzo di fatture per operazioni inesistenti per ridurre il carico fiscale', fonte: 'Interna', probabilita: 1, impatto: 3, note: 'Art. 25-quinquiesdecies D.Lgs. 231/01 — controllo sulla catena dei fornitori e dei costi' },
  { categoria: 'Finanziario', descrizione: 'Dichiarazione fraudolenta o omessa dichiarazione fiscale', fonte: 'Interna', probabilita: 1, impatto: 2, note: 'Art. 25-quinquiesdecies D.Lgs. 231/01 — separazione funzioni contabili, audit fiscale annuale' },

  // Art. 25-ter — Societario
  { categoria: 'Normativo / Compliance', descrizione: 'Falso in bilancio o comunicazioni sociali infedeli verso soci e mercato', fonte: 'Interna', probabilita: 1, impatto: 3, note: 'Art. 25-ter D.Lgs. 231/01 — revisione legale, trasparenza verso organi di controllo' },
  { categoria: 'Normativo / Compliance', descrizione: 'Impedimento o ostruzione al controllo da parte del Collegio Sindacale o del Revisore', fonte: 'Interna', probabilita: 1, impatto: 2, note: 'Art. 25-ter D.Lgs. 231/01 — flussi informativi regolari verso gli organi di controllo' },

  // Art. 25-quinquies — Lavoro
  { categoria: 'Operativo', descrizione: 'Intermediazione illecita e sfruttamento del lavoro (caporalato) nella gestione della manodopera', fonte: 'Mista', probabilita: 1, impatto: 3, note: 'Art. 25-quinquies D.Lgs. 231/01 — qualificazione fornitori manodopera, DURC, buste paga' },
  { categoria: 'Operativo', descrizione: 'Impiego di lavoratori stranieri con permesso di soggiorno irregolare o scaduto', fonte: 'Mista', probabilita: 1, impatto: 2, note: 'Art. 25-duodecies D.Lgs. 231/01 — verifica documenti obbligatoria prima dell'assunzione' },

  // Art. 24-bis — Informatico
  { categoria: 'IT / Cyber', descrizione: 'Accesso abusivo a sistemi informatici di concorrenti, clienti o pubbliche amministrazioni', fonte: 'Interna', probabilita: 1, impatto: 2, note: 'Art. 24-bis D.Lgs. 231/01 — policy sicurezza IT, accessi con autenticazione, log degli accessi' },

  // MOG 231 e presidi trasversali
  { categoria: 'Normativo / Compliance', descrizione: 'Assenza o inefficacia del Modello Organizzativo 231 e dell'Organismo di Vigilanza (OdV)', fonte: 'Interna', probabilita: 2, impatto: 3, note: 'Rischio trasversale: senza MOG 231 efficace la società risponde penalmente per tutti i reati presupposto' },
  { categoria: 'Normativo / Compliance', descrizione: 'Mancata formazione del personale sui contenuti del Modello 231 e del Codice Etico aziendale', fonte: 'Interna', probabilita: 2, impatto: 2, note: 'Requisito art. 6 D.Lgs. 231/01 — formazione differenziata obbligatoria per apicali e dipendenti' },
  { categoria: 'Normativo / Compliance', descrizione: 'Canale di whistleblowing assente o non conforme al D.Lgs. 24/2023', fonte: 'Interna', probabilita: 2, impatto: 2, note: 'Obbligo dal 2023 per aziende con >50 dipendenti — sanzioni fino a 50.000 euro per inadempienza' },
]

export const RISCHI_PER_SETTORE_231 = {
  'Edilizia': RISCHI_231_EDILIZIA,
  'Generico': RISCHI_231_GENERICO,
}
