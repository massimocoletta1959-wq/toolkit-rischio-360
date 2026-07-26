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
import IMieiTask from './pages/IMieiTask'
import Layout from './components/Layout'
import LayoutMembro from './components/LayoutMembro'

export const AppContext = createContext(null)
export const useApp = () => useContext(AppContext)

export default function App() {
  const [session, setSession]      = useState(undefined)
  const [profilo, setProfilo]      = useState(null)
  const [aziende, setAziende]      = useState([])
  const [azienda, setAziendaState] = useState(null)
  const [page, setPage]            = useState('cruscotto')
  const [showSetup, setShowSetup]  = useState(false)

  // Leggi token invito dall'URL
  const urlParams = new URLSearchParams(window.location.search)
  const tokenInvito = urlParams.get('invito')

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
        if (tokenInvito) window.history.replaceState({}, '', window.location.pathname)
      } else {
        setProfilo(null); setAziende([]); setAziendaState(null)
      }
    })
    return () => subscription.unsubscribe()
  }, [])

  async function accettaInvito(userId, token) {
    // Trova l'invito
    const { data: inviti } = await supabase
      .from('inviti').select('*').eq('token', token).eq('accettato', false)
    if (!inviti || inviti.length === 0) return

    const invito = inviti[0]

    // Controlla scadenza
    if (new Date(invito.expires_at) < new Date()) return

    // Crea o aggiorna profilo con ruolo 'membro' e collegamento all'azienda
    const { data: existingProf } = await supabase
      .from('profili').select('id').eq('id', userId).single()

    if (!existingProf) {
      const { data: { user } } = await supabase.auth.getUser()
      await supabase.from('profili').insert({
        id: userId,
        email: user.email,
        nome: '',
        azienda_id: invito.azienda_id,
        ruolo: 'membro',
        membro_id: invito.membro_id,
      })
    } else {
      await supabase.from('profili').update({
        azienda_id: invito.azienda_id,
        ruolo: 'membro',
        membro_id: invito.membro_id,
      }).eq('id', userId)
    }

    // Collega in utente_aziende
    await supabase.from('utente_aziende').upsert({
      utente_id: userId, azienda_id: invito.azienda_id
    }, { onConflict: 'utente_id,azienda_id' })

    // Marca invito come accettato
    await supabase.from('inviti').update({ accettato: true }).eq('id', invito.id)

    // Salva azienda come attiva
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
    setPage('cruscotto')
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

  if (!profilo && !showSetup) return (
    <Setup onDone={() => loadDati(session.user.id)} userId={session.user.id} userEmail={session.user.email} />
  )

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

  // ── Vista MEMBRO OPERATIVO ──────────────────────────────────────────────
  if (profilo.ruolo === 'membro') {
    return (
      <AppContext.Provider value={ctx}>
        <LayoutMembro>
          <IMieiTask />
        </LayoutMembro>
      </AppContext.Provider>
    )
  }

  // ── Vista CONSULENTE ────────────────────────────────────────────────────
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
