import React, { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from './lib/supabase'
import Login from './pages/Login'
import Setup from './pages/Setup'
import Cruscotto from './pages/Cruscotto'
import RegistroRischi from './pages/RegistroRischi'
import PianoAzione from './pages/PianoAzione'
import GestioneMembri from './pages/GestioneMembri'
import GestioneTicket from './pages/GestioneTicket'
import Layout from './components/Layout'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export default function App() {
  const [session, setSession] = useState(undefined)
  const [profilo, setProfilo] = useState(null)
  const [azienda, setAzienda] = useState(null)
  const [page, setPage]       = useState('cruscotto')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfilo(session.user.id)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadProfilo(session.user.id)
      else { setProfilo(null); setAzienda(null) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfilo(userId) {
    const { data } = await supabase.from('profili').select('*, aziende(*)').eq('id', userId).single()
    if (data) { setProfilo(data); setAzienda(data.aziende) }
  }

  async function logout() {
    await supabase.auth.signOut()
    setSession(null); setProfilo(null); setAzienda(null)
  }

  if (session === undefined) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:'100vh' }}><div className="spinner" /></div>
  if (!session) return <Login />
  if (!azienda) return <Setup onDone={() => loadProfilo(session.user.id)} userId={session.user.id} userEmail={session.user.email} />

  const ctx = { session, profilo, azienda, reload: () => loadProfilo(session.user.id), page, setPage, logout }
  const pages = {
    cruscotto: <Cruscotto />,
    registro:  <RegistroRischi />,
    piano:     <PianoAzione />,
    membri:    <GestioneMembri />,
    ticket:    <GestioneTicket />,
  }

  return (
    <AppContext.Provider value={ctx}>
      <Layout>{pages[page] || <Cruscotto />}</Layout>
    </AppContext.Provider>
  )
}
