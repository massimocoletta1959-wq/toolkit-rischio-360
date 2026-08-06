import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'

const MODULI = [
  { id: 'rischi',     label: 'Rischi',     colore: '#378ADD', cx: 200, cy: 150, sub: 'gestione rischi',      subNum: 'rischi'  },
  { id: 'procedure',  label: 'Procedure',  colore: '#1D9E75', cx: 480, cy: 150, sub: 'procedure aziendali',  subNum: 'adottate' },
  { id: 'governance', label: 'Governance', colore: '#7F77DD', cx: 340, cy: 340, sub: 'organi societari',     subNum: 'organi'  },
]

export default function Home() {
  const { azienda, session, entraModulo, setPage } = useApp()
  const [conteggi, setConteggi] = useState({ rischi: 0, procedure: 0, governance: 0 })
  const [lic, setLic] = useState(null)

  const attivo = {
    rischi: !!azienda?.mod_rischi,
    procedure: !!azienda?.mod_procedure,
    governance: !!azienda?.mod_governance,
  }

  const load = useCallback(async () => {
    if (!azienda?.id) return
    const q = t => supabase.from(t).select('id').eq('azienda_id', azienda.id)
    const [r, p, o] = await Promise.all([q('rischi'), q('procedure_adottate'), q('organi')])
    setConteggi({
      rischi: r.data?.length || 0,
      procedure: p.data?.length || 0,
      governance: o.data?.length || 0,
    })
    if (session?.user?.id) {
      const { data } = await supabase.from('gestori')
        .select('ragione_sociale,piano,data_scadenza').eq('user_id', session.user.id).maybeSingle()
      setLic(data || null)
    }
  }, [azienda, session])

  useEffect(() => { load() }, [load])

  const numero = id => id === 'rischi' ? conteggi.rischi : id === 'procedure' ? conteggi.procedure : conteggi.governance
  const clic = m => attivo[m.id] ? entraModulo(m.id) : setPage('impostazioni')
  const fmtData = d => d ? new Date(d).toLocaleDateString('it-IT', { day: 'numeric', month: 'short', year: 'numeric' }) : null

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 6 }}>
        <div>
          <h2 style={{ fontSize: 20, color: '#1A3A5C', marginBottom: 2 }}>{azienda?.nome}</h2>
          <p style={{ fontSize: 13, color: '#666' }}>Seleziona un modulo</p>
        </div>
        {lic && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#F7F8FA', border: '1px solid #E0E0E0', borderRadius: 999, padding: '6px 14px' }}>
            <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#EBF4FC', color: '#2B5FA5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600 }}>
              {(lic.ragione_sociale || '?').slice(0, 2).toUpperCase()}
            </div>
            <div style={{ lineHeight: 1.25 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A3A5C' }}>
                {lic.ragione_sociale || 'Licenza'} <span style={{ color: '#999', fontWeight: 400 }}>· {lic.piano}</span>
              </div>
              {lic.data_scadenza && <div style={{ fontSize: 12, color: '#666' }}>licenza valida fino al {fmtData(lic.data_scadenza)}</div>}
            </div>
          </div>
        )}
      </div>

      <svg width="100%" viewBox="0 0 680 470" style={{ display: 'block', maxWidth: 760, margin: '0 auto' }}>
        <line x1="230" y1="185" x2="315" y2="215" stroke="#E0E0E0" strokeWidth="1.5" />
        <line x1="450" y1="185" x2="365" y2="215" stroke="#E0E0E0" strokeWidth="1.5" />
        <line x1="340" y1="280" x2="340" y2="270" stroke="#E0E0E0" strokeWidth="1.5" />

        {MODULI.map(m => {
          const on = attivo[m.id]
          return (
            <g key={m.id} onClick={() => clic(m)} style={{ cursor: 'pointer' }}>
              <circle cx={m.cx} cy={m.cy} r="60" fill="#fff" stroke="#EFEFEF" strokeWidth="10" />
              <circle cx={m.cx} cy={m.cy} r="60" fill="none" stroke={on ? m.colore : '#D8D8D8'} strokeWidth="10"
                strokeLinecap="round" strokeDasharray={on ? undefined : '4 9'} />
              <text x={m.cx} y={m.cy - 4} textAnchor="middle" style={{ fontSize: 30, fontWeight: 700, fill: on ? '#1A3A5C' : '#B8B8B8' }}>{numero(m.id)}</text>
              <text x={m.cx} y={m.cy + 18} textAnchor="middle" style={{ fontSize: 12, fill: '#9A9A9A' }}>{m.subNum}</text>
              <text x={m.cx} y={m.cy + 92} textAnchor="middle" style={{ fontSize: 15, fontWeight: 600, fill: on ? '#1A3A5C' : '#B8B8B8' }}>{m.label}</text>
              <text x={m.cx} y={m.cy + 111} textAnchor="middle" style={{ fontSize: 12, fill: '#9A9A9A' }}>{on ? m.sub : 'non attivo · attiva in Impostazioni'}</text>
            </g>
          )
        })}

        <circle cx="340" cy="230" r="40" fill="#F1EFE8" stroke="#E0E0E0" strokeWidth="1" />
        <text x="340" y="226" textAnchor="middle" style={{ fontSize: 12, fontWeight: 600, fill: '#7A756A' }}>nucleo</text>
        <text x="340" y="242" textAnchor="middle" style={{ fontSize: 10, fill: '#9A958A' }}>condiviso</text>
      </svg>

      <p style={{ textAlign: 'center', fontSize: 12, color: '#888', marginTop: 4 }}>
        Nucleo condiviso: Membri · Organigramma. Ogni modulo apre le proprie funzioni, ticket e report.
      </p>
    </div>
  )
}
