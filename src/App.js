import React, { useState, useEffect, createContext, useContext } from "react"
import { supabase } from "./lib/supabase"
import Login from "./pages/Login"
import Setup from "./pages/Setup"
import Cruscotto from "./pages/Cruscotto"
import RegistroRischi from "./pages/RegistroRischi"
import PianoAzione from "./pages/PianoAzione"
import Layout from "./components/Layout"

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export default function App() {
  const [session, setSession]   = useState(null)
  const [profilo, setProfilo]   = useState(null)
  const [azienda, setAzienda]   = useState(null)
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState("cruscotto")

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfilo(session.user.id)
      else setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadProfilo(session.user.id)
      else { setProfilo(null); setAzienda(null); setLoading(false) }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function loadProfilo(userId) {
    setLoading(true)
    const { data: prof } = await supabase.from("profili").select("*, aziende(*)").eq("id", userId).single()
    if (prof) {
      setProfilo(prof)
      setAzienda(prof.aziende)
    }
    setLoading(false)
  }

  async function logout() {
    await supabase.auth.signOut()
    setSession(null); setProfilo(null); setAzienda(null)
  }

  if (loading) return <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh" }}><div className="spinner" /></div>

  const ctx = { session, profilo, azienda, reload: () => loadProfilo(session.user.id), page, setPage, logout }
  const pages = { cruscotto: <Cruscotto />, registro: <RegistroRischi />, piano: <PianoAzione /> }

  return (
    <AppContext.Provider value={ctx}>
      <Layout>{pages[page] || <Cruscotto />}</Layout>
    </AppContext.Provider>
  )
}
