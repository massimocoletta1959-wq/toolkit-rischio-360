import React, { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Cruscotto from './pages/Cruscotto'
import RegistroRischi from './pages/RegistroRischi'
import PianoAzione from './pages/PianoAzione'
import GestioneMembri from './pages/GestioneMembri'
import Organigramma from './pages/Organigramma'
import Procedure from './pages/Procedure'
import TracciamentoProcedure from './pages/TracciamentoProcedure'
import GestioneTicket from './pages/GestioneTicket'
import Impostazioni from './pages/Impostazioni'
import IMieiTask from './pages/IMieiTask'
import Report from './pages/Report'
import Governance from './pages/Governance'
import Home from './pages/Home'
import Layout from './components/Layout'
import LayoutMembro from './components/LayoutMembro'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export default function App() {
  const [session, setSession]      = useState(undefined)
  const [profilo, setProfilo]      = useState(null)
  const [aziende, setAziende]      = useState([])
  const [azienda, setAziendaState] = useState(null)
  const [page, setPage]            = useState('home')
  const [modulo, setModulo]        = useState(null)   // null = Home; 'rischi' | 'procedure' | 'governance'
  const [pagMembro, setPagMembro]  = useState('task') // vista membro: 'task' | 'procedure'
  const [showSetup, setShowSetup]  = useState(false)

  // Leggi token invito dall'URL e salvalo in localStorage per sopravvivere al redirect
  const urlParams = new URLSearchParams(window.location.search)
  const tokenDaUrl = urlParams.get('invito')
  if (tokenDaUrl) localStorage.setItem('token_invito', tokenDaUrl)
  const tokenInvito = tokenDaUrl || localStorage.getItem('token_invito')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadDati(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        // Se c'è un token invito, collegalo dopo il login/registrazione
        if (tokenInvito) await accettaInvito(session.user.id, tokenInvito)
        await loadDati(session.user.id)
        // Pulisci URL dopo aver processato l'invito
        if (tokenInvito) {
          window.history.replaceState({}, '', window.location.pathname)
          localStorage.removeItem('token_invito')
        }
      } else {
        setProfilo(null); setAziende([]); setAziendaState(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function accettaInvito(userId, token) {
    // Trova l'invito valido
    const { data: inviti } = await supabase
      .from('inviti').select('*').eq('token', token).eq('accettato', false)
    if (!inviti || inviti.length === 0) return
    const invito = inviti[0]
    if (new Date(invito.expires_at) < new Date()) return

    const { data: { user } } = await supabase.auth.getUser()

    // Controlla se il profilo esiste già (membro già registrato in un'altra azienda)
    const { data: existingProf } = await supabase
      .from('profili').select('*').eq('id', userId).single()

    if (!existingProf) {
      // Prima registrazione — crea profilo con ruolo membro
      await supabase.from('profili').insert({
        id: userId,
        email: user.email,
        nome: '',
        azienda_id: invito.azienda_id,  // azienda principale
        ruolo: 'membro',
        membro_id: invito.membro_id,
      })
    } else {
      // Profilo già esistente — aggiunge solo il collegamento alla nuova azienda
      // NON sovrascrive ruolo o azienda principale se è già consulente
      if (existingProf.ruolo !== 'consulente') {
        // Se è un membro, aggiorna il membro_id per includere questo invito
        // Usiamo un array di membro_ids nella tabella utente_aziende
        await supabase.from('profili').update({
          ruolo: 'membro',
        }).eq('id', userId)
      }
    }

    // Collega utente <-> azienda (anche se già registrato altrove)
    await supabase.from('utente_aziende').upsert({
      utente_id: userId,
      azienda_id: invito.azienda_id,
      ruolo: 'membro',
    }, { onConflict: 'utente_id,azienda_id' })

    // Collega il record membro all'utente (per trovare i ticket)
    await supabase.from('membri').update({ user_id: userId })
      .eq('id', invito.membro_id)

    // Marca invito come accettato
    await supabase.from('inviti').update({ accettato: true }).eq('id', invito.id)

    localStorage.setItem('azienda_attiva', invito.azienda_id)
  }

  async function loadDati(userId) {
    const { data: prof } = await supabase
      .from('profili').select('*').eq('id', userId).single()

    if (!prof) {
      setProfilo(null); setAziende([]); setAziendaState(null)
      return
    }
    setProfilo(prof)

    // Carica aziende tramite utente_aziende
    const { data: ua } = await supabase
      .from('utente_aziende').select('aziende(*)').eq('utente_id', userId)

    const tutteAziende = (ua || []).map(r => r.aziende).filter(Boolean)
      .filter((az, idx, arr) => arr.findIndex(a => a.id === az.id) === idx)

    setAziende(tutteAziende)

    const savedId = localStorage.getItem('azienda_attiva')
    const saved   = tutteAziende.find(a => a.id === savedId)
    setAziendaState(saved || tutteAziende[0] || null)
  }

  function switchAzienda(az) {
    setAziendaState(az)
    localStorage.setItem('azienda_attiva', az.id)
    setModulo(null)
    setPage('home')
  }

  // Entra in un modulo: imposta il modulo attivo e la sua pagina di default
  function entraModulo(m) {
    const defaultPage = { rischi: 'cruscotto', procedure: 'procedure', governance: 'governance' }[m]
    setModulo(m)
    setPage(defaultPage || 'home')
  }
  function tornaHome() {
    setModulo(null)
    setPage('home')
  }

  async function logout() {
    await supabase.auth.signOut()
    setSession(null); setProfilo(null); setAziende([]); setAziendaState(null)
  }

  async function onNuovaAziendaDone() {
    setShowSetup(false)
    if (session) await loadDati(session.user.id)
  }

  if (session === undefined) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}>
      <div className="spinner" />
    </div>
  )

  // Mostra login — se c'è token invito, lo gestiremo dopo il login
  if (!session) return <Login tokenInvito={tokenInvito} />

  // Se c'è un token invito nell'URL e non c'è ancora il profilo,
  // mostra un loader — accettaInvito creerà il profilo automaticamente
  if (!profilo && !showSetup) {
    if (tokenInvito) return (
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'100vh', gap: 16 }}>
        <div className="spinner" />
        <p style={{ color: '#1A3A5C', fontSize: 14 }}>Collegamento al portale in corso...</p>
      </div>
    )
    return (
      <Setup onDone={() => loadDati(session.user.id)} userId={session.user.id} userEmail={session.user.email} />
    )
  }

  if (showSetup) return (
    <Setup onDone={onNuovaAziendaDone} onAnnulla={() => setShowSetup(false)} userId={session.user.id} userEmail={session.user.email} nuovaAzienda={true} />
  )

  if (!azienda) return (
    <div className="login-page">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🏢</div>
        <h2 style={{ color: '#1A3A5C', marginBottom: 8 }}>Nessuna azienda</h2>
        <p style={{ color: '#666', marginBottom: 20 }}>Crea la tua prima azienda per iniziare.</p>
        <button className="btn btn-primary" onClick={() => setShowSetup(true)}>+ Crea azienda</button>
      </div>
    </div>
  )

  const ctx = {
    session, profilo, azienda, aziende,
    switchAzienda,
    reload: () => loadDati(session.user.id),
    page, setPage, logout,
    modulo, entraModulo, tornaHome,
    onNuovaAzienda: () => setShowSetup(true),
  }

  // ── Vista MEMBRO OPERATIVO ──────────────────────────────────────────────
  if (profilo.ruolo === 'membro') {
    return (
      <AppContext.Provider value={ctx}>
        <LayoutMembro page={pagMembro} setPage={setPagMembro}>
          <IMieiTask key={pagMembro} modo={pagMembro} />
        </LayoutMembro>
      </AppContext.Provider>
    )
  }

  // ── Vista CONSULENTE ────────────────────────────────────────────────────
  const pages = {
    home:         <Home />,
    cruscotto:    <Cruscotto />,
    registro:     <RegistroRischi />,
    piano:        <PianoAzione />,
    ticket:       <GestioneTicket />,
    membri:       <GestioneMembri />,
    organigramma: <Organigramma />,
    governance:   <Governance />,
    procedure:    <Procedure />,
    tracciamento: <TracciamentoProcedure />,
    impostazioni: <Impostazioni />,
    report: <Report />,
  }

  return (
    <AppContext.Provider value={ctx}>
      <Layout>{pages[page] || <Home />}</Layout>
    </AppContext.Provider>
  )
}
