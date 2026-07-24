import React, { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Cruscotto from './pages/Cruscotto'
import RegistroRischi from './pages/RegistroRischi'
import PianoAzione from './pages/PianoAzione'
import GestioneMembri from './pages/GestioneMembri'
import GestioneTicket from './pages/GestioneTicket'
import Impostazioni from './pages/Impostazioni'
import Layout from './components/Layout'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export default function App() {
  const [session, setSession]      = useState(undefined)
  const [profilo, setProfilo]      = useState(null)
  const [aziende, setAziende]      = useState([])
  const [azienda, setAziendaState] = useState(null)
  const [page, setPage]            = useState('cruscotto')
  const [showSetup, setShowSetup]  = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadDati(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadDati(session.user.id)
      else { setProfilo(null); setAziende([]); setAziendaState(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadDati(userId) {
    // 1. Carica profilo utente
    const { data: prof } = await supabase
      .from('profili').select('*').eq('id', userId).single()

    if (!prof) {
      setProfilo(null); setAziende([]); setAziendaState(null)
      return
    }
    setProfilo(prof)

    // 2. Carica TUTTE le aziende tramite la tabella utente_aziende
    const { data: ua } = await supabase
      .from('utente_aziende')
      .select('aziende(*)')
      .eq('user_id', userId)

    const tutteAziende = (ua || [])
      .map(r => r.aziende)
      .filter(Boolean)
      .filter((az, idx, arr) => arr.findIndex(a => a.id === az.id) === idx)

    setAziende(tutteAziende)

    // 3. Seleziona azienda attiva (ultima usata o prima disponibile)
    const savedId = localStorage.getItem('azienda_attiva')
    const saved   = tutteAziende.find(a => a.id === savedId)
    setAziendaState(saved || tutteAziende[0] || null)
  }

  function switchAzienda(az) {
    setAziendaState(az)
    localStorage.setItem('azienda_attiva', az.id)
    setPage('cruscotto')
  }

  async function logout() {
    await supabase.auth.signOut()
    localStorage.removeItem('azienda_attiva')
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
  if (!session) return <Login />

  // Prima volta: nessun profilo
  if (!profilo && !showSetup) return (
    <Setup onDone={() => loadDati(session.user.id)} userId={session.user.id} userEmail={session.user.email} />
  )

  // Crea nuova azienda (utente già loggato)
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
    onNuovaAzienda: () => setShowSetup(true),
  }

  const pages = {
    cruscotto:    <Cruscotto />,
    registro:     <RegistroRischi />,
    piano:        <PianoAzione />,
    ticket:       <GestioneTicket />,
    membri:       <GestioneMembri />,
    impostazioni: <Impostazioni />,
  }

  return (
    <AppContext.Provider value={ctx}>
      <Layout>{pages[page] || <Cruscotto />}</Layout>
    </AppContext.Provider>
  )
}
