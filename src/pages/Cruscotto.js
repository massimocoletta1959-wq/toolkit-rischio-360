import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useApp } from '../App'
import { getTier, CAT_COLORS, CATEGORIE } from '../lib/constants'

function Heatmap({ rischi }) {
  const matrix = {}
  for (let p = 1; p <= 3; p++)
    for (let i = 1; i <= 3; i++)
      matrix[`${p}_${i}`] = []

  rischi.forEach(r => {
    if (r.probabilita && r.impatto)
      matrix[`${r.probabilita}_${r.impatto}`].push(r.descrizione)
  })

  const cellColor = (p, i) => {
    const s = p * i
    if (s >= 6) return 'hm-red'
    if (s >= 4) return 'hm-orange'
    if (s >= 2) return 'hm-yellow'
    return 'hm-green'
  }

  return (
    <div>
      <div className="heatmap-grid" style={{ marginBottom: 6 }}>
        <div className="hm-header" />
        {['Limitato (1)', 'Rilevante (2)', 'Critico (3)'].map(l => (
          <div key={l} className="hm-header" style={{ fontSize: 11, color: '#888' }}>{l}</div>
        ))}
      </div>
      {[[3,'Alta (3)'], [2,'Media (2)'], [1,'Bassa (1)']].map(([p, pl]) => (
        <div key={p} className="heatmap-grid" style={{ marginBottom: 4 }}>
          <div className="hm-label" style={{ fontSize: 11 }}>{pl}</div>
          {[1,2,3].map(i => (
            <div key={i} className={`heatmap-cell ${cellColor(p, i)}`}>
              {matrix[`${p}_${i}`].map((n, idx) => (
                <span key={idx} className="risk-dot" title={n}>{n.substring(0, 14)}{n.length > 14 ? '…' : ''}</span>
              ))}
            </div>
          ))}
        </div>
      ))}
      <div style={{ display: 'flex', gap: 12, marginTop: 10, fontSize: 11, color: '#888', flexWrap: 'wrap' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: '#FADBD8', display: 'inline-block' }} />Critico (≥6)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: '#FDEBD0', display: 'inline-block' }} />Significativo (4-5)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: '#FEF9E7', display: 'inline-block' }} />Moderato (2-3)</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><span style={{ width: 12, height: 12, borderRadius: 2, background: '#D5F5E3', display: 'inline-block' }} />Accettabile (1)</span>
      </div>
    </div>
  )
}

function BarChart({ data }) {
  const max = Math.max(...data.map(d => d.count), 1)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {data.map(d => (
        <div key={d.cat} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 140, fontSize: 12, color: '#555', textAlign: 'right', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.cat}</div>
          <div style={{ flex: 1, background: '#F0F0F0', borderRadius: 4, height: 20, overflow: 'hidden' }}>
            <div style={{ width: `${(d.count / max) * 100}%`, background: '#2B5FA5', height: '100%', borderRadius: 4, transition: 'width 0.5s', minWidth: d.count ? 4 : 0 }} />
          </div>
          <div style={{ width: 24, fontSize: 12, fontWeight: 600, color: '#333' }}>{d.count}</div>
        </div>
      ))}
    </div>
  )
}

export default function Cruscotto() {
  const { azienda, setPage } = useApp()
  const [rischi, setRischi]   = useState([])
  const [azioni, setAzioni]   = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!azienda || !azienda.id) return;
    setLoading(true)
    const [{ data: r }, { data: a }] = await Promise.all([
      supabase.from('rischi').select('*').eq('azienda_id', azienda?.id || ''),
      supabase.from('azioni').select('*').eq('azienda_id', azienda?.id || ''),
    ])
    setRischi(r || [])
    setAzioni(a || [])
    setLoading(false)
  }, [azienda?.id])

  useEffect(() => { load() }, [load])

  const valutati = rischi.filter(r => r.probabilita && r.impatto)
  const tier1 = valutati.filter(r => getTier(r.probabilita, r.impatto).tier === 'Tier 1').length
  const tier2 = valutati.filter(r => getTier(r.probabilita, r.impatto).tier === 'Tier 2').length
  const completate = azioni.filter(a => a.stato === 'Completato').length
  const inCorso    = azioni.filter(a => a.stato === 'In corso').length

  const catData = CATEGORIE.map(cat => ({
    cat: cat.replace(' / Fornitori', '').replace(' / Compliance', ''),
    count: rischi.filter(r => r.categoria === cat).length,
  })).filter(d => d.count > 0)

  const critici = valutati
    .filter(r => getTier(r.probabilita, r.impatto).tier === 'Tier 1')
    .sort((a, b) => (b.probabilita * b.impatto) - (a.probabilita * a.impatto))
    .slice(0, 5)

  if (loading || !azienda) return <div className="spinner" />

  return (
    <div>
      <div className="page-header">
        <h2>Cruscotto — {azienda?.nome || ''}</h2>
        <p>Panoramica aggiornata in tempo reale</p>
      </div>

      {rischi.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🛡️</div>
          <h3 style={{ color: '#1A3A5C', marginBottom: 8 }}>Benvenuto nel Toolkit Rischio 360°</h3>
          <p style={{ color: '#666', marginBottom: 20 }}>Inizia aggiungendo i rischi della tua azienda nel Registro Rischi.</p>
          <button className="btn btn-primary" onClick={() => setPage('registro')}>Vai al Registro Rischi →</button>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-num">{rischi.length}</div><div className="stat-label">Rischi identificati</div></div>
            <div className="stat-card"><div className="stat-num" style={{ color: '#C0392B' }}>{tier1}</div><div className="stat-label">Tier 1 — Critici</div></div>
            <div className="stat-card"><div className="stat-num" style={{ color: '#E67E22' }}>{tier2}</div><div className="stat-label">Tier 2 — Significativi</div></div>
            <div className="stat-card"><div className="stat-num">{azioni.length}</div><div className="stat-label">Azioni nel piano</div></div>
            <div className="stat-card"><div className="stat-num" style={{ color: '#27AE60' }}>{completate}</div><div className="stat-label">Azioni completate</div></div>
            <div className="stat-card"><div className="stat-num" style={{ color: '#2B5FA5' }}>{inCorso}</div><div className="stat-label">In corso</div></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div className="card">
              <div className="card-header"><span className="card-title">Heatmap Rischi</span></div>
              <Heatmap rischi={valutati} />
            </div>
            <div className="card">
              <div className="card-header"><span className="card-title">Distribuzione per categoria</span></div>
              {catData.length ? <BarChart data={catData} /> : <p style={{ color: '#aaa', fontSize: 13 }}>Nessun dato</p>}
            </div>
          </div>

          {critici.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">🔴 Rischi Tier 1 — Azione immediata richiesta</span>
                <button className="btn btn-sm btn-primary" onClick={() => setPage('piano')}>Vai al Piano →</button>
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead><tr style={{ background: '#FADBD8' }}>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#C0392B', fontWeight: 600, fontSize: 12 }}>Rischio</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#C0392B', fontWeight: 600, fontSize: 12 }}>Categoria</th>
                  <th style={{ padding: '8px 12px', textAlign: 'center', color: '#C0392B', fontWeight: 600, fontSize: 12 }}>Score</th>
                  <th style={{ padding: '8px 12px', textAlign: 'left', color: '#C0392B', fontWeight: 600, fontSize: 12 }}>Azioni</th>
                </tr></thead>
                <tbody>
                  {critici.map(r => {
                    const t = getTier(r.probabilita, r.impatto)
                    const numAzioni = azioni.filter(a => a.rischio_id === r.id).length
                    const cc = CAT_COLORS[r.categoria] || { bg: '#F5F5F5', color: '#333' }
                    return (
                      <tr key={r.id} style={{ borderBottom: '1px solid #FEE' }}>
                        <td style={{ padding: '10px 12px' }}>{r.descrizione}</td>
                        <td style={{ padding: '10px 12px' }}><span className="badge" style={{ background: cc.bg, color: cc.color, fontSize: 11 }}>{r.categoria}</span></td>
                        <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                          <span className="score-pill" style={{ background: t.bg, color: t.color }}>{t.score}</span>
                        </td>
                        <td style={{ padding: '10px 12px' }}>
                          {numAzioni > 0
                            ? <span style={{ color: '#27AE60', fontWeight: 600 }}>✓ {numAzioni} azione{numAzioni > 1 ? 'i' : ''}</span>
                            : <span style={{ color: '#C0392B', fontSize: 12 }}>⚠️ Nessuna azione definita</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}

          {azioni.length > 0 && (
            <div className="card">
              <div className="card-header"><span className="card-title">Avanzamento Piano d'Azione</span></div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['Pianificato','In corso','Completato','Da rivedere'].map(stato => {
                  const n = azioni.filter(a => a.stato === stato).length
                  const pct = azioni.length ? Math.round((n / azioni.length) * 100) : 0
                  const colors = { 'Pianificato': '#aaa', 'In corso': '#2B5FA5', 'Completato': '#27AE60', 'Da rivedere': '#C0392B' }
                  return (
                    <div key={stato} style={{ flex: 1, minWidth: 120, textAlign: 'center', padding: '12px 8px', background: '#F7F8FA', borderRadius: 8 }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: colors[stato] }}>{n}</div>
                      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{stato}</div>
                      <div style={{ fontSize: 11, color: colors[stato], fontWeight: 600 }}>{pct}%</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
