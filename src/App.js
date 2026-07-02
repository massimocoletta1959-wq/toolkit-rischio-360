import React, { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Cruscotto from './pages/Cruscotto'
import RegistroRischi from './pages/RegistroRischi'
import PianoAzione from './pages/PianoAzione'
import Layout from './components/Layout'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

const AZIENDA_ATTIVA_KEY = 'rischio360_azienda_attiva'

export default function App() {
  const [session, setSession]   = useState(undefined)
  const [profilo, setProfilo]   = useState(null)
  const [aziende, setAziende]   = useState([])   // tutte le aziende collegate all'utente
  const [azienda, setAzienda]   = useState(null) // azienda attiva
  const [page, setPage]         = useState('cruscotto')
  const [addingAzienda, setAddingAzienda] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadTutto(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadTutto(session.user.id)
      else { setProfilo(null); setAziende([]); setAzienda(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadTutto(userId) {
    const { data: prof } = await supabase.from('profili').select('*').eq('id', userId).single()
    setProfilo(prof || null)

    const { data: legami } = await supabase
      .from('utente_aziende')
      .select('ruolo, aziende(*)')
      .eq('utente_id', userId)

    const listaAziende = (legami || []).map(l => l.aziende).filter(Boolean)
    setAziende(listaAziende)

    if (listaAziende.length > 0) {
      const savedId = localStorage.getItem(AZIENDA_ATTIVA_KEY)
      const attiva = listaAziende.find(a => a.id === savedId) || listaAziende[0]
      setAzienda(attiva)
    } else {
      setAzienda(null)
    }
  }

  function selezionaAzienda(az) {
    setAzienda(az)
    localStorage.setItem(AZIENDA_ATTIVA_KEY, az.id)
  }

  async function logout() {
    await supabase.auth.signOut()
    setSession(null); setProfilo(null); setAziende([]); setAzienda(null)
  }

  if (session === undefined) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}><div className="spinner" /></div>
  if (!session) return <Login />

  // Prima configurazione: l'utente non ha ancora nessuna azienda collegata
  if (aziende.length === 0 && !addingAzienda) {
    return (
      <Setup
        userId={session.user.id}
        userEmail={session.user.email}
        existingProfilo={profilo}
        onDone={(nuovaAziendaId) => {
          if (nuovaAziendaId) localStorage.setItem(AZIENDA_ATTIVA_KEY, nuovaAziendaId)
          loadTutto(session.user.id)
        }}
      />
    )
  }

  // Flusso "Aggiungi azienda" richiamato dalla sidebar da un account già configurato
  if (addingAzienda) {
    return (
      <Setup
        userId={session.user.id}
        userEmail={session.user.email}
        existingProfilo={profilo}
        onDone={(nuovaAziendaId) => {
          setAddingAzienda(false)
          if (nuovaAziendaId) localStorage.setItem(AZIENDA_ATTIVA_KEY, nuovaAziendaId)
          loadTutto(session.user.id)
        }}
        onCancel={() => setAddingAzienda(false)}
      />
    )
  }

  const ctx = {
    session, profilo, azienda, aziende,
    selezionaAzienda,
    apriAggiungiAzienda: () => setAddingAzienda(true),
    reload: () => loadTutto(session.user.id),
    page, setPage, logout,
  }
  const pages = { cruscotto: <Cruscotto />, registro: <RegistroRischi />, piano: <PianoAzione /> }
  return (
    <AppContext.Provider value={ctx}>
      <Layout>{pages[page] || <Cruscotto />}</Layout>
    </AppContext.Provider>
  )
}
