import { useState, useEffect, useRef } from 'react'
import type { Lavoro } from '../supabase'
import { supabase } from '../supabase'
import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  BarElement, Tooltip
} from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip)

const C = {
  accent: '#39ff6a', accent2: '#00e5ff', warn: '#ffb830',
  danger: '#ff4f4f', purple: '#c084fc', muted: '#6b916b',
  card: '#112011', border: '#1e321e', surface: '#0d180d', text: '#dff5df',
}

const fmt = {
  eur: (n: number) => '€ ' + n.toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
  ore: (n: number) => n.toLocaleString('it-IT', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + ' h',
  date: (s: string) => {
    const days = ['Dom', 'Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab']
    const dt = new Date(s + 'T12:00:00')
    const [y, m, d] = s.split('-')
    return `${days[dt.getDay()]} ${d}/${m}/${y}`
  },
}

type Filter = 'settimana' | 'mese' | 'tutto'
type TabKey = 'inserisci' | 'lista' | 'report' | 'clienti'

const today = () => new Date().toISOString().split('T')[0]

const tabStyle = (active: boolean) => ({
  flex: 1, padding: '11px 4px', fontSize: 11, fontWeight: 700,
  color: active ? C.accent : C.muted, textAlign: 'center' as const, cursor: 'pointer',
  borderBottom: `2px solid ${active ? C.accent : 'transparent'}`, transition: 'all .15s',
})

const pillStyle = (active: boolean) => ({
  padding: '7px 14px', borderRadius: 20,
  border: `1px solid ${active ? 'rgba(57,255,106,.4)' : C.border}`,
  background: active ? 'rgba(57,255,106,.15)' : C.card,
  fontSize: 12, fontWeight: 600,
  color: active ? C.accent : C.muted,
  cursor: 'pointer', whiteSpace: 'nowrap' as const, flexShrink: 0,
})

const inp: React.CSSProperties = {
  width: '100%', background: C.surface, border: `1px solid ${C.border}`,
  borderRadius: 8, padding: '10px 12px', fontSize: 15, color: C.text,
  fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
}

const card: React.CSSProperties = {
  background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 16,
}

const btn: React.CSSProperties = {
  width: '100%', padding: 13, borderRadius: 9, border: 'none', fontSize: 14,
  fontWeight: 700, cursor: 'pointer',
  background: `linear-gradient(135deg, ${C.accent}, #00c850)`, color: '#000',
  fontFamily: 'inherit',
}

const delBtn: React.CSSProperties = {
  background: 'rgba(255,79,79,.1)', border: '1px solid rgba(255,79,79,.25)',
  color: C.danger, padding: '5px 9px', fontSize: 12, borderRadius: 7,
  cursor: 'pointer', fontFamily: 'inherit',
}

export default function MieiLavori() {
  const [tab, setTab] = useState<TabKey>('inserisci')
  const [lavori, setLavori] = useState<Lavoro[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<Filter>('settimana')
  const [filterC, setFilterC] = useState<Filter>('settimana')
  const [search, setSearch] = useState('')
  const [toast, setToast] = useState('')
  const toastRef = useRef<ReturnType<typeof setTimeout>>(undefined)

  const [fCliente, setFCliente] = useState('')
  const [fData, setFData] = useState(today())
  const [fOre, setFOre] = useState('')
  const [fGuadagno, setFGuadagno] = useState('')
  const [fNote, setFNote] = useState('')

  const showToast = (msg: string) => {
    setToast(msg)
    clearTimeout(toastRef.current)
    toastRef.current = setTimeout(() => setToast(''), 2400)
  }

  useEffect(() => { fetchLavori() }, [])

  const fetchLavori = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('lavori').select('*').order('data', { ascending: false })
    if (!error && data) setLavori(data)
    setLoading(false)
  }

  const addLavoro = async () => {
    if (!fCliente.trim()) { showToast('⚠️ Inserisci il cliente'); return }
    if (!fData) { showToast('⚠️ Seleziona la data'); return }
    const ore = parseFloat(fOre)
    const guadagno = parseFloat(fGuadagno)
    if (isNaN(ore) || ore <= 0) { showToast('⚠️ Inserisci le ore'); return }
    if (isNaN(guadagno) || guadagno < 0) { showToast('⚠️ Inserisci il guadagno'); return }
    setSaving(true)
    const { data, error } = await supabase.from('lavori').insert([
      { cliente: fCliente.trim(), data: fData, ore, guadagno, note: fNote.trim() || null }
    ]).select()
    if (!error && data) {
      setLavori(prev => [data[0], ...prev])
      setFCliente(''); setFOre(''); setFGuadagno(''); setFNote('')
      showToast('✅ Voce aggiunta!')
    } else { showToast('❌ Errore salvataggio') }
    setSaving(false)
  }

  const delLavoro = async (id: number) => {
    if (!confirm('Eliminare questa voce?')) return
    const { error } = await supabase.from('lavori').delete().eq('id', id)
    if (!error) { setLavori(prev => prev.filter(l => l.id !== id)); showToast('🗑 Eliminata') }
    else showToast('❌ Errore eliminazione')
  }

  const byPeriod = (f: Filter) => {
    const now = new Date()
    return lavori.filter(l => {
      const d = new Date(l.data + 'T12:00:00')
      if (f === 'settimana') { const w = new Date(now); w.setDate(now.getDate() - 7); return d >= w }
      if (f === 'mese') return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      return true
    })
  }

  const exportCSV = () => {
    if (!lavori.length) { showToast('Nessun dato'); return }
    const sorted = [...lavori].sort((a, b) => a.data.localeCompare(b.data))
    const rows = [['Data', 'Cliente', 'Ore', 'Guadagno (€)', 'Note'],
      ...sorted.map(l => [l.data, l.cliente, String(l.ore).replace('.', ','), String(l.guadagno).replace('.', ','), l.note || ''])]
    const csv = '\uFEFF' + rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\r\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    a.download = `verdepro_lavori_${today()}.csv`; a.click()
    showToast('📥 CSV esportato!')
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: C.muted, fontSize: 14 }}>
      Caricamento dati...
    </div>
  )

  const oggiItems = lavori.filter(l => l.data === today())
  const oggiOre = oggiItems.reduce((s, l) => s + l.ore, 0)
  const oggiGua = oggiItems.reduce((s, l) => s + l.guadagno, 0)
  const clientiUnici = [...new Set(lavori.map(l => l.cliente))]

  const fl = byPeriod(filter)
  const totOre = fl.reduce((s, l) => s + l.ore, 0)
  const totGua = fl.reduce((s, l) => s + l.guadagno, 0)
  const giorni = new Set(fl.map(l => l.data)).size

  const labels: string[] = [], gData: number[] = [], oData: number[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i)
    const ds = d.toISOString().split('T')[0]
    labels.push(d.getDate() + '/' + (d.getMonth() + 1))
    const dl = lavori.filter(l => l.data === ds)
    gData.push(dl.reduce((s, l) => s + l.guadagno, 0))
    oData.push(dl.reduce((s, l) => s + l.ore, 0))
  }

  const chartOpts = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { ticks: { color: C.muted, font: { size: 9 } }, grid: { color: 'rgba(30,50,30,.4)' } },
      y: { ticks: { color: C.muted, font: { size: 9 } }, grid: { color: 'rgba(30,50,30,.4)' }, beginAtZero: true }
    }
  }

  const filtered = search ? lavori.filter(l => l.cliente.toLowerCase().includes(search.toLowerCase())) : lavori
  const byDay: Record<string, Lavoro[]> = {}
  filtered.forEach(l => { if (!byDay[l.data]) byDay[l.data] = []; byDay[l.data].push(l) })
  const days = Object.keys(byDay).sort((a, b) => b.localeCompare(a))

  const flC = byPeriod(filterC)
  const byC: Record<string, { ore: number; guadagno: number; n: number }> = {}
  flC.forEach(l => {
    if (!byC[l.cliente]) byC[l.cliente] = { ore: 0, guadagno: 0, n: 0 }
    byC[l.cliente].ore += l.ore; byC[l.cliente].guadagno += l.guadagno; byC[l.cliente].n++
  })
  const arrC = Object.entries(byC).sort((a, b) => b[1].guadagno - a[1].guadagno)
  const maxG = arrC[0]?.[1].guadagno || 1

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: C.surface, color: C.text, fontFamily: 'inherit' }}>
      {/* Tabs */}
      <div style={{ display: 'flex', background: C.card, borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
        {([['inserisci', '➕ Inserisci'], ['lista', '📋 Lista'], ['report', '📊 Report'], ['clienti', '👥 Clienti']] as [TabKey, string][]).map(([k, label]) => (
          <div key={k} style={tabStyle(tab === k)} onClick={() => setTab(k)}>{label}</div>
        ))}
      </div>

      {/* TAB INSERISCI */}
      {tab === 'inserisci' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={card}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', letterSpacing: '.07em', marginBottom: 12 }}>Nuovo Lavoro</div>
            <div style={{ marginBottom: 11 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4, textTransform: 'uppercase' }}>Cliente</label>
              <input style={inp} list="cl-suggest" value={fCliente} onChange={e => setFCliente(e.target.value)} placeholder="Es. Comune di Verona" />
              <datalist id="cl-suggest">{clientiUnici.map(c => <option key={c} value={c} />)}</datalist>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 11 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4, textTransform: 'uppercase' }}>Data</label>
                <input style={inp} type="date" value={fData} onChange={e => setFData(e.target.value)} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4, textTransform: 'uppercase' }}>Ore</label>
                <input style={inp} type="number" value={fOre} onChange={e => setFOre(e.target.value)} placeholder="0.0" min="0" step="0.5" inputMode="decimal" />
              </div>
            </div>
            <div style={{ marginBottom: 11 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4, textTransform: 'uppercase' }}>Guadagno (€)</label>
              <input style={inp} type="number" value={fGuadagno} onChange={e => setFGuadagno(e.target.value)} placeholder="0.00" min="0" step="0.01" inputMode="decimal" />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: C.muted, marginBottom: 4, textTransform: 'uppercase' }}>Note</label>
              <input style={inp} value={fNote} onChange={e => setFNote(e.target.value)} placeholder="Es. Potatura siepi" />
            </div>
            <button style={{ ...btn, opacity: saving ? .6 : 1 }} onClick={addLavoro} disabled={saving}>
              {saving ? 'Salvataggio...' : '+ Aggiungi Voce'}
            </button>
          </div>
          {oggiItems.length > 0 && (
            <div style={card}>
              <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 12 }}>Oggi — {fmt.date(today())}</div>
              {oggiItems.map(l => (
                <div key={l.id} style={{ padding: '10px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid rgba(30,50,30,.4)` }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{l.cliente}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{fmt.ore(l.ore)}{l.note ? ' · ' + l.note : ''}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontWeight: 800, color: C.accent, fontSize: 15 }}>{fmt.eur(l.guadagno)}</span>
                    <button style={delBtn} onClick={() => delLavoro(l.id!)}>🗑</button>
                  </div>
                </div>
              ))}
              <div style={{ paddingTop: 9, display: 'flex', justifyContent: 'space-between', borderTop: `1px solid ${C.border}`, marginTop: 4 }}>
                <span style={{ fontSize: 11, color: C.muted }}>Totale giornata</span>
                <span style={{ fontWeight: 700, color: C.accent, fontSize: 13 }}>{fmt.eur(oggiGua)} · {fmt.ore(oggiOre)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB LISTA */}
      {tab === 'lista' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input style={inp} value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Cerca cliente..." />
          {!days.length
            ? <div style={{ textAlign: 'center', padding: 40, color: C.muted }}><div style={{ fontSize: 40 }}>📭</div><p>Nessuna voce.</p></div>
            : days.map(d => {
              const items = byDay[d]
              const tOre = items.reduce((s, l) => s + l.ore, 0)
              const tGua = items.reduce((s, l) => s + l.guadagno, 0)
              return (
                <div key={d} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', background: C.surface, display: 'flex', justifyContent: 'space-between', borderBottom: `1px solid ${C.border}` }}>
                    <span style={{ fontSize: 13, fontWeight: 700 }}>{fmt.date(d)}</span>
                    <span style={{ fontSize: 11, color: C.muted }}>{fmt.ore(tOre)} · {fmt.eur(tGua)}</span>
                  </div>
                  {items.map((l, i) => (
                    <div key={l.id} style={{ padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: i < items.length - 1 ? `1px solid rgba(30,50,30,.4)` : 'none' }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 14 }}>{l.cliente}</div>
                        <div style={{ fontSize: 11, color: C.muted }}>{fmt.ore(l.ore)}{l.note ? ' · ' + l.note : ''}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 800, color: C.accent, fontSize: 15 }}>{fmt.eur(l.guadagno)}</span>
                        <button style={delBtn} onClick={() => delLavoro(l.id!)}>🗑</button>
                      </div>
                    </div>
                  ))}
                </div>
              )
            })}
        </div>
      )}

      {/* TAB REPORT */}
      {tab === 'report' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 7 }}>
            {(['settimana', 'mese', 'tutto'] as Filter[]).map(f => (
              <div key={f} style={pillStyle(filter === f)} onClick={() => setFilter(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[
              { label: 'Guadagno', value: fmt.eur(totGua), color: C.accent, sub: `${giorni} giorni` },
              { label: 'Ore Totali', value: fmt.ore(totOre), color: C.accent2, sub: giorni ? 'media ' + fmt.ore(totOre / giorni) : '—' },
              { label: 'Giorni', value: String(giorni), color: C.purple, sub: 'nel periodo' },
              { label: 'Media/giorno', value: fmt.eur(giorni ? totGua / giorni : 0), color: C.warn, sub: 'guadagno medio' },
            ].map(k => (
              <div key={k.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: '13px 14px' }}>
                <div style={{ fontSize: 10, fontWeight: 600, color: C.muted, textTransform: 'uppercase', marginBottom: 3 }}>{k.label}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: k.color, lineHeight: 1 }}>{k.value}</div>
                <div style={{ fontSize: 10, color: C.muted, marginTop: 2 }}>{k.sub}</div>
              </div>
            ))}
          </div>
          <div style={card}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 12 }}>Guadagno — ultimi 14 giorni</div>
            <div style={{ height: 160 }}>
              <Bar data={{ labels, datasets: [{ data: gData, backgroundColor: 'rgba(57,255,106,.5)', borderColor: C.accent, borderWidth: 1.5, borderRadius: 5 }] }} options={chartOpts as any} />
            </div>
          </div>
          <div style={card}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 12 }}>Ore — ultimi 14 giorni</div>
            <div style={{ height: 160 }}>
              <Bar data={{ labels, datasets: [{ data: oData, backgroundColor: 'rgba(0,229,255,.4)', borderColor: C.accent2, borderWidth: 1.5, borderRadius: 5 }] }} options={chartOpts as any} />
            </div>
          </div>
          <button style={{ ...btn, background: 'rgba(0,229,255,.15)', color: C.accent2, border: `1px solid rgba(0,229,255,.3)` }} onClick={exportCSV}>📥 Esporta CSV</button>
        </div>
      )}

      {/* TAB CLIENTI */}
      {tab === 'clienti' && (
        <div style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 7 }}>
            {(['settimana', 'mese', 'tutto'] as Filter[]).map(f => (
              <div key={f} style={pillStyle(filterC === f)} onClick={() => setFilterC(f)}>{f.charAt(0).toUpperCase() + f.slice(1)}</div>
            ))}
          </div>
          <div style={card}>
            <div style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: 'uppercase', marginBottom: 12 }}>Per Cliente</div>
            {!arrC.length
              ? <div style={{ fontSize: 12, color: C.muted }}>Nessun dato nel periodo</div>
              : arrC.map(([nome, v]) => (
                <div key={nome} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: `1px solid rgba(30,50,30,.4)` }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{nome}</div>
                    <div style={{ background: C.border, borderRadius: 3, height: 3, width: 120, marginTop: 5 }}>
                      <div style={{ width: Math.round(v.guadagno / maxG * 100) + '%', height: 3, borderRadius: 3, background: C.accent }} />
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: C.accent }}>{fmt.eur(v.guadagno)}</div>
                    <div style={{ fontSize: 11, color: C.muted }}>{fmt.ore(v.ore)} · {v.n} voce/i</div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: C.accent, color: '#000', padding: '10px 20px', borderRadius: 24, fontSize: 13, fontWeight: 700, zIndex: 999, whiteSpace: 'nowrap' }}>
          {toast}
        </div>
      )}
    </div>
  )
}