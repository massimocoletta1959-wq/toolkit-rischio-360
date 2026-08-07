import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

// Configurazione dei tre moduli: posizione nella costellazione + gradiente
const MODULI = [
  { id: 'rischi',     label: 'Rischi',     grad: 'gRischi',     c1: '#5AA9F0', c2: '#2B6FD0', cx: 205, cy: 175, sub: 'gestione rischi' },
  { id: 'procedure',  label: 'Procedure',  grad: 'gProc',       c1: '#37C79C', c2: '#128A66', cx: 555, cy: 175, sub: 'procedure aziendali' },
  { id: 'governance', label: 'Governance', grad: 'gGov',        c1: '#9B8CF0', c2: '#6A5ED0', cx: 380, cy: 385, sub: 'organi societari' },
]

const DEFAULT = {
  rischi:     { n: 0, critici: 0, azioni: 0 },
  procedure:  { n: 0, catalogo: 0, daFirmare: 0 },
  governance: { n: 0, componenti: 0, prossima: null },
}

export default function Home() {
  const { azienda, session, entraModulo, setPage } = useApp()
  const [dati, setDati] = useState(DEFAULT)
  const [lic, setLic] = useState(null)

  const attivo = {
    rischi: !!azienda?.mod_rischi,
    procedure: !!azienda?.mod_procedure,
    governance: !!azienda?.mod_governance,
  }

  const load = useCallback(async () => {
    if (!azienda?.id) return
    const A = azienda.id
    const res = await Promise.allSettled([
      supabase.from('rischi').select('probabilita,impatto').eq('azienda_id', A),
      supabase.from('procedure_adottate').select('stato').eq('azienda_id', A),
      supabase.from('organi').select('id').eq('azienda_id', A),
      supabase.from('azioni').select('id').eq('azienda_id', A),
      supabase.from('riunioni').select('data_riunione').eq('azienda_id', A),
      supabase.from('procedure_template').select('id'),
    ])
    const val = i => (res[i].status === 'fulfilled' ? (res[i].value.data || []) : [])
    const rischiRows = val(0), procRows = val(1), organiRows = val(2)
    const azioniRows = val(3), riunioniRows = val(4), templateRows = val(5)

    // componenti degli organi (tabella senza azienda_id: si risale dagli organi)
    let componenti = 0
    const organiIds = organiRows.map(o => o.id)
    if (organiIds.length) {
      try {
        const c = await supabase.from('organo_membri').select('id').in('organo_id', organiIds)
        componenti = c.data?.length || 0
      } catch (e) { /* ignora */ }
    }

    const critici = rischiRows.filter(r => (Number(r.probabilita) || 0) * (Number(r.impatto) || 0) >= 6).length
    const daFirmare = procRows.filter(p => p.stato === 'distribuita').length
    const oggi = new Date().toISOString().slice(0, 10)
    const prossime = riunioniRows.map(r => r.data_riunione).filter(d => d && d.slice(0, 10) >= oggi).sort()

    setDati({
      rischi:     { n: rischiRows.length, critici, azioni: azioniRows.length },
      procedure:  { n: procRows.length, catalogo: templateRows.length, daFirmare },
      governance: { n: organiIds.length, componenti, prossima: prossime[0] || null },
    })

    if (session?.user?.id) {
      const { data } = await supabase.from('gestori')
        .select('ragione_sociale,piano,data_scadenza').eq('user_id', session.user.id).maybeSingle()
      setLic(data || null)
    }
  }, [azienda, session])

  useEffect(() => { load() }, [load])

  const clic = m => (attivo[m.id] ? entraModulo(m.id) : setPage('impostazioni'))
  const numero = id => dati[id].n
  const fmtGiorno = d => d ? new Date(d + 'T00:00:00').toLocaleDateString('it-IT', { day: 'numeric', month: 'short' }) : null
  const fmtData = d => d ? new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : null

  // Le due righe di dettaglio sotto ciascun anello
  const righe = id => {
    if (id === 'rischi') return [`${dati.rischi.critici} critici`, `${dati.rischi.azioni} azioni nel piano`]
    if (id === 'procedure') return [`${dati.procedure.catalogo} nel catalogo`, `${dati.procedure.daFirmare} da firmare`]
    const p = dati.governance.prossima
    return [`${dati.governance.componenti} componenti`, p ? `prossima ${fmtGiorno(p)}` : 'nessuna riunione']
  }

  return (
    <div>
      <style>{`
        .anello { transition: transform .2s ease; transform-box: fill-box; transform-origin: center; cursor: pointer; }
        .anello:hover { transform: scale(1.06); }
        .anello .glow { transition: opacity .2s ease; }
        .anello:hover .glow { opacity: 1; }
      `}</style>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 2 }}>
        <div>
          <h2 style={{ fontSize: 21, color: '#1A3A5C', marginBottom: 2 }}>{azienda?.nome}</h2>
          <p style={{ fontSize: 13, color: '#888' }}>Seleziona un modulo per iniziare</p>
        </div>
        {lic && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'linear-gradient(135deg,#F7F9FC,#EEF3FA)', border: '1px solid #E3EAF3', borderRadius: 999, padding: '7px 16px', boxShadow: '0 1px 3px rgba(26,58,92,0.06)' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg,#2B5FA5,#1A3A5C)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
              {(lic.ragione_sociale || '?').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A3A5C' }}>
                {lic.ragione_sociale || 'Licenza'} <span style={{ color: '#A0AAB5', fontWeight: 500, textTransform: 'capitalize' }}>· {lic.piano}</span>
              </div>
              {lic.data_scadenza && <div style={{ fontSize: 11.5, color: '#8A94A0' }}>valida fino al {fmtData(lic.data_scadenza)}</div>}
            </div>
          </div>
        )}
      </div>

      <svg width="100%" viewBox="0 0 760 540" style={{ display: 'block', maxWidth: 860, margin: '0 auto' }}>
        <defs>
          <radialGradient id="bgGlow" cx="50%" cy="42%" r="58%">
            <stop offset="0%" stopColor="#EAF2FC" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="gRischi" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#5AA9F0" /><stop offset="100%" stopColor="#2B6FD0" />
          </linearGradient>
          <linearGradient id="gProc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#37C79C" /><stop offset="100%" stopColor="#128A66" />
          </linearGradient>
          <linearGradient id="gGov" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#9B8CF0" /><stop offset="100%" stopColor="#6A5ED0" />
          </linearGradient>
          <linearGradient id="gCenter" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#2B5FA5" /><stop offset="100%" stopColor="#163352" />
          </linearGradient>
          <filter id="soft" x="-60%" y="-60%" width="220%" height="220%">
            <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#1A3A5C" floodOpacity="0.16" />
          </filter>
        </defs>

        {/* sfondo soffuso + cerchi decorativi */}
        <rect x="0" y="0" width="760" height="540" fill="url(#bgGlow)" />
        <circle cx="380" cy="250" r="150" fill="none" stroke="#DCE7F4" strokeWidth="1" strokeDasharray="2 9" opacity="0.7" />
        <circle cx="380" cy="250" r="215" fill="none" stroke="#E4ECF6" strokeWidth="1" strokeDasharray="2 11" opacity="0.5" />

        {/* connettori dai moduli al nucleo */}
        {MODULI.map(m => (
          <line key={'l' + m.id} x1={m.cx} y1={m.cy} x2="380" y2="250"
            stroke={attivo[m.id] ? m.c2 : '#CBD5E1'} strokeWidth="1.5" opacity="0.35" />
        ))}

        {/* nodo centrale: Toolkit */}
        <circle cx="380" cy="250" r="52" fill="url(#gCenter)" filter="url(#soft)" />
        <circle cx="380" cy="250" r="52" fill="none" stroke="#ffffff" strokeWidth="1" opacity="0.25" />
        <text x="380" y="244" textAnchor="middle" style={{ fontSize: 17, fontWeight: 700, fill: '#fff', letterSpacing: 0.3 }}>Toolkit</text>
        <text x="380" y="266" textAnchor="middle" style={{ fontSize: 12, fontWeight: 600, fill: '#9FC0E8', letterSpacing: 2 }}>360°</text>

        {/* i tre anelli */}
        {MODULI.map(m => {
          const on = attivo[m.id]
          const [r1, r2] = righe(m.id)
          return (
            <g key={m.id} className="anello" onClick={() => clic(m)}>
              {/* alone che compare al hover */}
              <circle className="glow" cx={m.cx} cy={m.cy} r="66" fill={on ? m.c1 : '#CBD5E1'} opacity="0" style={{ filter: 'blur(10px)' }} />
              {/* traccia */}
              <circle cx={m.cx} cy={m.cy} r="60" fill="#ffffff" stroke="#EEF2F7" strokeWidth="13" />
              {/* anello colorato */}
              <circle cx={m.cx} cy={m.cy} r="60" fill="none"
                stroke={on ? `url(#${m.grad})` : '#D5DBE3'} strokeWidth="13" strokeLinecap="round"
                strokeDasharray={on ? undefined : '3 10'} filter={on ? 'url(#soft)' : undefined} />
              {/* numero */}
              <text x={m.cx} y={m.cy - 2} textAnchor="middle" style={{ fontSize: 34, fontWeight: 700, fill: on ? '#1A3A5C' : '#B4BCC6' }}>{numero(m.id)}</text>
              <text x={m.cx} y={m.cy + 20} textAnchor="middle" style={{ fontSize: 11.5, fill: '#9AA4B0', letterSpacing: 0.4 }}>{m.sub.split(' ')[0]}</text>

              {/* etichetta + dettagli sotto */}
              <text x={m.cx} y={m.cy + 92} textAnchor="middle" style={{ fontSize: 16, fontWeight: 700, fill: on ? '#1A3A5C' : '#B4BCC6' }}>{m.label}</text>
              {on ? (
                <>
                  <text x={m.cx} y={m.cy + 112} textAnchor="middle" style={{ fontSize: 12.5, fill: '#6B7683' }}>{r1}</text>
                  <text x={m.cx} y={m.cy + 129} textAnchor="middle" style={{ fontSize: 12.5, fill: '#98A2AE' }}>{r2}</text>
                </>
              ) : (
                <text x={m.cx} y={m.cy + 112} textAnchor="middle" style={{ fontSize: 12, fill: '#AEB6C0' }}>non attivo · attiva in Impostazioni</text>
              )}
            </g>
          )
        })}
      </svg>
    </div>
  )
}
