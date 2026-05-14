import { useState } from 'react'
import MieiLavori from './pages/MieiLavori'

// ── PALETTE ──────────────────────────────────────────────
const C = {
  bg:'#060e06', surface:'#0d180d', card:'#112011', border:'#1e321e',
  accent:'#39ff6a', accent2:'#00e5ff', warn:'#ffb830', danger:'#ff4f4f', purple:'#c084fc',
  text:'#dff5df', muted:'#6b916b', dim:'#3a5a3a',
}
const JCOL: Record<string,string> = { urgente:C.danger, bloccato:C.warn, programmato:C.accent2, completato:C.accent }
const SQCOL: Record<string,string> = { alpha:C.accent, beta:C.accent2, gamma:C.purple }

// ── SEED DATA ────────────────────────────────────────────
const SEED_CLIENTI = [
  {id:1,nome:'Comune di Verona',tipo:'Pubblico',citta:'Verona',tel:'045-8001111',email:'verde@comune.vr.it',stato:'Attivo'},
  {id:2,nome:'Villa Rossi',tipo:'Privato',citta:'Verona',tel:'333-1234567',email:'rossi@villa.it',stato:'Attivo'},
  {id:3,nome:'Condominio Aurora',tipo:'Condominio',citta:'Verona',tel:'045-9876543',email:'admin@aurora.it',stato:'Attivo'},
  {id:4,nome:'Hotel Giardino',tipo:'Privato',citta:'Vicenza',tel:'0444-123456',email:'info@hotelgiardino.it',stato:'Attivo'},
  {id:5,nome:'Comune di Vicenza',tipo:'Pubblico',citta:'Vicenza',tel:'0444-221100',email:'manutenzione@vicenza.it',stato:'Attivo'},
  {id:6,nome:'Residence Parco',tipo:'Condominio',citta:'Verona',tel:'045-7654321',email:'parco@res.it',stato:'Sospeso'},
]
const SEED_CONTRATTI = [
  {id:1,clienteId:1,tipo:'Annuale',inizio:'2026-01-01',scadenza:'2026-12-31',valore:48000,stato:'Attivo'},
  {id:2,clienteId:2,tipo:'Mensile',inizio:'2026-01-01',scadenza:'2026-06-30',valore:1200,stato:'Attivo'},
  {id:3,clienteId:3,tipo:'Trimestrale',inizio:'2026-01-01',scadenza:'2026-09-15',valore:3600,stato:'Attivo'},
  {id:4,clienteId:4,tipo:'Annuale',inizio:'2025-01-01',scadenza:'2025-12-31',valore:9600,stato:'Scaduto'},
  {id:5,clienteId:5,tipo:'Biennale',inizio:'2025-03-01',scadenza:'2027-03-01',valore:72000,stato:'Attivo'},
  {id:6,clienteId:6,tipo:'Annuale',inizio:'2026-01-01',scadenza:'2026-12-31',valore:6000,stato:'Sospeso'},
]
const SEED_OPERATORI = [
  {id:1,nome:'Marco Ferretti',ruolo:'Caposquadra',squadra:'alpha',tel:'333-1111111',stato:'Disponibile'},
  {id:2,nome:'Luca Bianchi',ruolo:'Operatore',squadra:'alpha',tel:'333-2222222',stato:'In servizio'},
  {id:3,nome:'Sara Conti',ruolo:'Operatore',squadra:'beta',tel:'333-3333333',stato:'Disponibile'},
  {id:4,nome:'Giorgio Neri',ruolo:'Caposquadra',squadra:'beta',tel:'333-4444444',stato:'Ferie'},
  {id:5,nome:'Elena Mori',ruolo:'Operatore',squadra:'gamma',tel:'333-5555555',stato:'In servizio'},
  {id:6,nome:'Paolo Russo',ruolo:'Autista',squadra:'gamma',tel:'333-6666666',stato:'Disponibile'},
]
const SEED_ATTR = [
  {id:1,nome:'Trattorino rasaerba',tipo:'Macchina',targa:'AB123CD',km:1240,manutenzione:'2026-06-01',stato:'Operativo'},
  {id:2,nome:'Furgone Mercedes Sprinter',tipo:'Mezzo',targa:'GH456IJ',km:87430,manutenzione:'2026-05-30',stato:'Operativo'},
  {id:3,nome:'Motosega Stihl MS261',tipo:'Attrezzo',targa:'-',km:null,manutenzione:'2026-07-15',stato:'In manutenzione'},
  {id:4,nome:'Trinciatrice Kubota',tipo:'Macchina',targa:'KL789MN',km:3200,manutenzione:'2026-05-25',stato:'Operativo'},
  {id:5,nome:'Soffiatore a spalla',tipo:'Attrezzo',targa:'-',km:null,manutenzione:'2026-08-01',stato:'Operativo'},
  {id:6,nome:'Autocarro Iveco Daily',tipo:'Mezzo',targa:'OP012QR',km:134000,manutenzione:'2026-05-18',stato:'Fermo'},
]
const SEED_JOBS = [
  {id:1,titolo:'Parco Centrale — Taglio erba',clienteId:1,stato:'urgente',squadra:'alpha',priorita:'Alta',lat:45.4384,lng:10.9916,aperto:'2026-01-15',scadenza:'2026-05-10',note:'Erba alta oltre 30cm',attivita:[{t:'Taglio prato principale',done:false},{t:'Taglio bordi vialetti',done:false},{t:'Raccolta sfalci',done:false}]},
  {id:2,titolo:'Villa Rossi — Potatura siepi',clienteId:2,stato:'bloccato',squadra:'beta',priorita:'Media',lat:45.4450,lng:10.9980,aperto:'2026-02-20',scadenza:'2026-04-01',note:'In attesa autorizzazione',attivita:[{t:'Potatura siepe perimetrale',done:false},{t:'Potatura siepe interna',done:false},{t:'Smaltimento rami',done:false}]},
  {id:3,titolo:'Condominio Aurora — Diserbo',clienteId:3,stato:'programmato',squadra:'gamma',priorita:'Bassa',lat:45.4320,lng:11.0050,aperto:'2026-05-01',scadenza:'2026-05-20',note:'',attivita:[{t:'Diserbo cortile',done:true},{t:'Diserbo parcheggio',done:false},{t:'Trattamento preventivo',done:false}]},
  {id:4,titolo:'Viale Olimpia — Piantumazione',clienteId:5,stato:'urgente',squadra:null,priorita:'Alta',lat:45.5477,lng:11.5350,aperto:'2026-03-10',scadenza:'2026-05-05',note:'12 alberi urgenti',attivita:[{t:'Preparazione buche',done:false},{t:'Messa a dimora alberi',done:false},{t:'Installazione tutori',done:false}]},
  {id:5,titolo:'Hotel Giardino — Manutenzione',clienteId:4,stato:'completato',squadra:'alpha',priorita:'Media',lat:45.4600,lng:10.9700,aperto:'2026-04-28',scadenza:'2026-05-10',note:'',attivita:[{t:'Taglio prato',done:true},{t:'Pulizia aiuole',done:true},{t:'Potatura rose',done:true}]},
]
const SQUADS = [{id:'alpha',nome:'Squadra Alpha'},{id:'beta',nome:'Squadra Beta'},{id:'gamma',nome:'Squadra Gamma'}]

// ── MICRO COMPONENTS ─────────────────────────────────────
const Badge = ({label,type}:{label:string,type:string}) => {
  const map:Record<string,{bg:string,color:string,border:string}> = {
    urgente:{bg:'rgba(255,79,79,.15)',color:C.danger,border:'rgba(255,79,79,.3)'},
    bloccato:{bg:'rgba(255,184,48,.15)',color:C.warn,border:'rgba(255,184,48,.3)'},
    programmato:{bg:'rgba(0,229,255,.1)',color:C.accent2,border:'rgba(0,229,255,.25)'},
    completato:{bg:'rgba(57,255,106,.1)',color:C.accent,border:'rgba(57,255,106,.2)'},
    Attivo:{bg:'rgba(57,255,106,.1)',color:C.accent,border:'rgba(57,255,106,.2)'},
    Scaduto:{bg:'rgba(255,79,79,.12)',color:C.danger,border:'rgba(255,79,79,.25)'},
    Sospeso:{bg:'rgba(255,184,48,.1)',color:C.warn,border:'rgba(255,184,48,.25)'},
  }
  const st = map[type]||map[label]||{bg:'rgba(107,145,107,.1)',color:C.muted,border:'rgba(107,145,107,.2)'}
  return <span style={{background:st.bg,color:st.color,border:`1px solid ${st.border}`,borderRadius:4,padding:'2px 7px',fontSize:10,fontWeight:700,fontFamily:'monospace',whiteSpace:'nowrap'}}>{label}</span>
}

const Btn = ({children,onClick,variant='primary',style:sx={},disabled}:any) => {
  const styles:Record<string,any> = {
    primary:{bg:'rgba(57,255,106,.12)',border:'1px solid rgba(57,255,106,.3)',color:C.accent},
    secondary:{bg:'rgba(0,229,255,.08)',border:'1px solid rgba(0,229,255,.2)',color:C.accent2},
    warn:{bg:'rgba(255,184,48,.08)',border:'1px solid rgba(255,184,48,.2)',color:C.warn},
    danger:{bg:'rgba(255,79,79,.08)',border:'1px solid rgba(255,79,79,.2)',color:C.danger},
    ghost:{bg:'none',border:`1px solid ${C.border}`,color:C.muted},
  }
  const st = styles[variant]||styles.primary
  return <button onClick={onClick} disabled={disabled} style={{background:st.bg,border:st.border,color:st.color,borderRadius:7,padding:'6px 14px',fontSize:12,fontWeight:700,cursor:'pointer',fontFamily:'inherit',opacity:disabled?.5:1,...sx}}>{children}</button>
}

const Card = ({children,style:sx={}}:any) => (
  <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:10,padding:16,...sx}}>{children}</div>
)

const KpiCard = ({label,value,color=C.accent,icon}:any) => (
  <Card style={{flex:1,minWidth:110}}>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
      <div>
        <div style={{color:C.muted,fontSize:11,marginBottom:5}}>{label}</div>
        <div style={{color,fontSize:24,fontWeight:800,lineHeight:1}}>{value}</div>
      </div>
      <span style={{fontSize:20,opacity:.6}}>{icon}</span>
    </div>
  </Card>
)

const ProgBar = ({pct,color}:{pct:number,color:string}) => (
  <div style={{background:C.border,borderRadius:3,height:4}}>
    <div style={{width:`${pct}%`,height:4,borderRadius:3,background:color,transition:'width .4s'}}/>
  </div>
)

// ── LOGIN SCREEN ──────────────────────────────────────────
function LoginScreen({onSuccess}:{onSuccess:()=>void}) {
  const [entered, setEntered] = useState('')
  const [error, setError] = useState('')
  const currentPin = localStorage.getItem('vp_pin')||'1234'
  const bioEnabled = localStorage.getItem('vp_bio')==='1'
  const pushDigit = (n:string) => {
    if(entered.length>=4) return
    const next = entered+n
    setEntered(next)
    if(next.length===4) {
      setTimeout(()=>{
        if(next===currentPin){onSuccess()}
        else{setError('❌ PIN errato');setEntered('')}
      },120)
    }
  }

  const authBio = async () => {
    try {
      const b64 = localStorage.getItem('vp_bio_cred')
      const credId = b64?Uint8Array.from(atob(b64),c=>c.charCodeAt(0)):null
      await (navigator.credentials as any).get({publicKey:{
        challenge:crypto.getRandomValues(new Uint8Array(32)),
        allowCredentials:credId?[{id:credId,type:'public-key'}]:[],
        userVerification:'required',timeout:60000,
      }})
      onSuccess()
    } catch { setError('Autenticazione biometrica fallita') }
  }

  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'100vh',background:C.bg,gap:28,padding:32}}>
      <div style={{textAlign:'center'}}>
        <div style={{fontSize:52,marginBottom:8}}>🌿</div>
        <div style={{fontSize:26,fontWeight:800,color:C.accent}}>Verde<span style={{color:C.accent2}}>Pro</span></div>
        <div style={{fontSize:13,color:C.muted,marginTop:4}}>Inserisci il PIN per accedere</div>
      </div>
      <div style={{display:'flex',gap:16}}>
        {[0,1,2,3].map(i=>(
          <div key={i} style={{width:16,height:16,borderRadius:'50%',border:`2px solid ${C.accent}`,background:i<entered.length?C.accent:'transparent',transition:'background .15s'}}/>
        ))}
      </div>
      <div style={{color:C.danger,fontSize:12,fontWeight:600,height:16}}>{error}</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:10,maxWidth:270,width:'100%'}}>
        {[1,2,3,4,5,6,7,8,9].map(n=>(
          <button key={n} onClick={()=>pushDigit(String(n))} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:16,fontSize:22,fontWeight:700,color:C.text,cursor:'pointer'}}>
            {n}
          </button>
        ))}
        <div/>
        <button onClick={()=>pushDigit('0')} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:16,fontSize:22,fontWeight:700,color:C.text,cursor:'pointer'}}>0</button>
        <button onClick={()=>setEntered(p=>{setError('');return p.slice(0,-1)})} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:9,padding:16,fontSize:18,fontWeight:700,color:C.text,cursor:'pointer'}}>⌫</button>
      </div>
      {bioEnabled && (
        <button onClick={authBio} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:12,padding:'12px 24px',fontSize:14,fontWeight:600,color:C.accent2,cursor:'pointer',display:'flex',alignItems:'center',gap:8}}>
          🔒 Face ID / Impronta
        </button>
      )}
    </div>
  )
}

// ── NAV ───────────────────────────────────────────────────
const NAV = [
  {id:'dashboard',label:'Dashboard',icon:'🌿',group:'Operativo'},
  {id:'mappa',label:'Sala Operativa',icon:'🗺',group:'Operativo'},
  {id:'clienti',label:'Clienti',icon:'📋',group:'Gestione'},
  {id:'contratti',label:'Contratti',icon:'📝',group:'Gestione'},
  {id:'interventi',label:'Interventi',icon:'🔧',group:'Gestione'},
  {id:'squadre',label:'Squadre',icon:'👷',group:'Risorse'},
  {id:'attrezzature',label:'Attrezzature',icon:'🚐',group:'Risorse'},
  {id:'miei-lavori',label:'I Miei Lavori',icon:'💼',group:'Personale'},
]

// ── DASHBOARD ─────────────────────────────────────────────
function PageDashboard({jobs,clienti,contratti,operatori}:any) {
  const totV = contratti.filter((c:any)=>c.stato==='Attivo').reduce((s:number,c:any)=>s+c.valore,0)
  return (
    <div style={{padding:24,overflowY:'auto',flex:1}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:22,fontWeight:800}}>Dashboard</div>
        <div style={{fontSize:12,color:C.muted}}>Panoramica operativa</div>
      </div>
      <div style={{display:'flex',gap:10,flexWrap:'wrap',marginBottom:20}}>
        <KpiCard label="Clienti Attivi" value={clienti.filter((c:any)=>c.stato==='Attivo').length} icon="🌿"/>
        <KpiCard label="Valore Contratti" value={`€${Math.round(totV/1000)}k`} color={C.accent2} icon="💶"/>
        <KpiCard label="Urgenti" value={jobs.filter((j:any)=>j.stato==='urgente').length} color={C.danger} icon="🔴"/>
        <KpiCard label="Op. Disponibili" value={operatori.filter((o:any)=>o.stato==='Disponibile').length} icon="👷"/>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:14}}>
        <Card>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:12}}>Ultimi Interventi</div>
          {jobs.slice(0,5).map((j:any)=>{
            const done=j.attivita.filter((a:any)=>a.done).length,tot=j.attivita.length
            return <div key={j.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'7px 0',borderBottom:`1px solid rgba(30,50,30,.3)`}}>
              <div><div style={{fontSize:12,fontWeight:600}}>{j.titolo}</div><div style={{fontSize:10,color:C.muted}}>{done}/{tot} attività</div></div>
              <Badge label={j.stato} type={j.stato}/>
            </div>
          })}
        </Card>
        <Card>
          <div style={{fontSize:10,fontWeight:700,color:C.muted,letterSpacing:'.08em',textTransform:'uppercase',marginBottom:12}}>Stato Squadre</div>
          {SQUADS.map(sq=>{
            const ops=operatori.filter((o:any)=>o.squadra===sq.id)
            const lib=ops.filter((o:any)=>o.stato==='Disponibile').length
            const sqJ=jobs.filter((j:any)=>j.squadra===sq.id&&j.stato!=='completato').length
            return <div key={sq.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:`1px solid rgba(30,50,30,.3)`}}>
              <div style={{display:'flex',alignItems:'center',gap:7}}>
                <div style={{width:8,height:8,borderRadius:'50%',background:SQCOL[sq.id]}}/>
                <span style={{fontSize:12,fontWeight:600}}>{sq.nome}</span>
              </div>
              <div style={{display:'flex',gap:8}}>
                <span style={{fontSize:10,color:C.accent}}>{lib} liberi</span>
                <span style={{fontSize:10,color:C.accent2}}>{sqJ} lavori</span>
              </div>
            </div>
          })}
        </Card>
      </div>
    </div>
  )
}

// ── SIMPLE PLACEHOLDER PAGES ──────────────────────────────
const PlaceholderPage = ({title,sub}:{title:string,sub:string}) => (
  <div style={{padding:24,flex:1,overflowY:'auto'}}>
    <div style={{fontSize:22,fontWeight:800,marginBottom:6}}>{title}</div>
    <div style={{fontSize:12,color:C.muted,marginBottom:20}}>{sub}</div>
    <Card><div style={{color:C.muted,fontSize:13}}>Sezione completa disponibile nella versione desktop del VerdePro.</div></Card>
  </div>
)

// ── SETTINGS MODAL ────────────────────────────────────────
function SettingsModal({onClose}:{onClose:()=>void}) {
  const [oldPin,setOldPin]=useState('')
  const [newPin,setNewPin]=useState('')
  const [confPin,setConfPin]=useState('')
  const [msg,setMsg]=useState('')
  const [bioEnabled,setBioEnabled]=useState(localStorage.getItem('vp_bio')==='1')
  const [bioSupported]=useState(!!window.PublicKeyCredential)

  const savePin = () => {
    const cur=localStorage.getItem('vp_pin')||'1234'
    if(oldPin!==cur){setMsg('PIN attuale errato');return}
    if(!/^\d{4}$/.test(newPin)){setMsg('Il PIN deve essere di 4 cifre');return}
    if(newPin!==confPin){setMsg('I PIN non coincidono');return}
    localStorage.setItem('vp_pin',newPin)
    setMsg('✅ PIN aggiornato!');setOldPin('');setNewPin('');setConfPin('')
  }

  const toggleBio = async () => {
    if(bioEnabled){
      localStorage.setItem('vp_bio','0');localStorage.removeItem('vp_bio_cred')
      setBioEnabled(false);setMsg('Biometrica disattivata')
    } else {
      try {
        const cred=await (navigator.credentials as any).create({publicKey:{
          challenge:crypto.getRandomValues(new Uint8Array(32)),
          rp:{name:'VerdePro'},
          user:{id:new Uint8Array(16),name:'utente',displayName:'Utente'},
          pubKeyCredParams:[{alg:-7,type:'public-key'},{alg:-257,type:'public-key'}],
          authenticatorSelection:{userVerification:'required',authenticatorAttachment:'platform'},
          timeout:60000,
        }})
        localStorage.setItem('vp_bio_cred',btoa(String.fromCharCode(...new Uint8Array(cred.rawId))))
        localStorage.setItem('vp_bio','1');setBioEnabled(true);setMsg('✅ Biometrica attivata!')
      } catch { setMsg('Registrazione biometrica fallita') }
    }
  }

  return (
    <div onClick={onClose} style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:1000,display:'flex',alignItems:'flex-end',justifyContent:'center'}}>
      <div onClick={e=>e.stopPropagation()} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:'20px 20px 0 0',padding:'24px 20px 36px',width:'100%',maxWidth:480,maxHeight:'88vh',overflowY:'auto'}}>
        <div style={{fontSize:17,fontWeight:800,color:C.accent,marginBottom:18}}>⚙️ Impostazioni</div>
        <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:'uppercase',marginBottom:10}}>Cambia PIN</div>
        {[['PIN attuale',oldPin,setOldPin],['Nuovo PIN',newPin,setNewPin],['Conferma',confPin,setConfPin]].map(([l,v,set])=>(
          <div key={l as string} style={{marginBottom:10}}>
            <label style={{display:'block',fontSize:11,color:C.muted,marginBottom:4}}>{l as string}</label>
            <input type="password" inputMode="numeric" maxLength={4} value={v as string} onChange={e=>(set as any)(e.target.value)}
              style={{width:'100%',background:C.surface,border:`1px solid ${C.border}`,borderRadius:8,padding:'10px',fontSize:20,color:C.text,fontFamily:'inherit',outline:'none',textAlign:'center',letterSpacing:8,boxSizing:'border-box'}}/>
          </div>
        ))}
        {msg && <div style={{fontSize:12,color:msg.includes('✅')?C.accent:C.danger,marginBottom:8}}>{msg}</div>}
        <Btn variant="primary" onClick={savePin} style={{width:'100%',padding:11,marginBottom:16}}>Salva PIN</Btn>
        {bioSupported && (
          <>
            <div style={{fontSize:12,fontWeight:700,color:C.muted,textTransform:'uppercase',marginBottom:10}}>Biometrica</div>
            <Btn variant={bioEnabled?'danger':'secondary'} onClick={toggleBio} style={{width:'100%',padding:11,marginBottom:16}}>
              {bioEnabled?'Disattiva biometrica':'Attiva Face ID / Impronta'}
            </Btn>
          </>
        )}
        <Btn variant="ghost" onClick={onClose} style={{width:'100%',padding:11}}>Chiudi</Btn>
      </div>
    </div>
  )
}

// ── ROOT APP ──────────────────────────────────────────────
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [page, setPage] = useState('dashboard')
  const [showSettings, setShowSettings] = useState(false)
  const [jobs] = useState(SEED_JOBS)
  const [clienti] = useState(SEED_CLIENTI)
  const [contratti] = useState(SEED_CONTRATTI)
  const [operatori] = useState(SEED_OPERATORI)
  const [attrezzature] = useState(SEED_ATTR)

  const u = jobs.filter(j=>j.stato==='urgente').length
  const b = jobs.filter(j=>j.stato==='bloccato').length
  const ok = jobs.filter(j=>j.stato==='completato').length

  if(!loggedIn) return <LoginScreen onSuccess={()=>setLoggedIn(true)}/>

  const groups = [...new Set(NAV.map(n=>n.group))]

  return (
    <div style={{fontFamily:'-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif',background:C.bg,color:C.text,height:'100vh',display:'flex',flexDirection:'column',overflow:'hidden'}}>
      {/* Topbar */}
      <div style={{background:C.surface,borderBottom:`1px solid ${C.border}`,height:50,display:'flex',alignItems:'center',padding:'0 16px',gap:12,flexShrink:0,zIndex:600}}>
        <div style={{fontSize:18,fontWeight:800}}>
          <span style={{color:C.accent}}>Verde</span><span style={{color:C.accent2}}>Pro</span>
        </div>
        <span style={{fontSize:11,color:C.muted,fontFamily:'monospace'}}>Gestionale</span>
        <div style={{marginLeft:'auto',display:'flex',gap:6}}>
          {[[`🔴`,u,C.danger,'urgenti'],[`🟡`,b,C.warn,'bloccati'],[`✅`,ok,C.accent,'completati']].map(([ic,n,col,l])=>(
            <div key={l as string} style={{background:`${col}18`,border:`1px solid ${col}44`,color:col as string,borderRadius:20,padding:'3px 10px',fontSize:11,fontWeight:700,fontFamily:'monospace'}}>{ic} {n} {l}</div>
          ))}
          <button onClick={()=>setShowSettings(true)} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:8,padding:'5px 10px',fontSize:16,cursor:'pointer'}}>⚙️</button>
        </div>
      </div>

      <div style={{display:'flex',flex:1,overflow:'hidden'}}>
        {/* Sidebar */}
        <div style={{width:190,background:C.surface,borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',padding:'10px 8px',flexShrink:0,overflowY:'auto'}}>
          {groups.map(g=>(
            <div key={g}>
              <div style={{fontSize:9,fontWeight:700,color:C.dim,letterSpacing:'.1em',textTransform:'uppercase',padding:'10px 8px 4px'}}>{g}</div>
              {NAV.filter(n=>n.group===g).map(n=>(
                <button key={n.id} onClick={()=>setPage(n.id)}
                  style={{width:'100%',display:'flex',alignItems:'center',gap:9,padding:'8px 10px',borderRadius:7,border:page===n.id?`1px solid rgba(57,255,106,.2)`:'1px solid transparent',cursor:'pointer',fontFamily:'inherit',fontSize:13,fontWeight:page===n.id?700:400,textAlign:'left',background:page===n.id?'rgba(57,255,106,.1)':'none',color:page===n.id?C.accent:C.muted,marginBottom:2,borderLeft:page===n.id?`3px solid ${C.accent}`:'3px solid transparent'}}>
                  <span>{n.icon}</span>{n.label}
                </button>
              ))}
            </div>
          ))}
          <div style={{marginTop:'auto',paddingTop:10,borderTop:`1px solid ${C.border}`,fontSize:10,color:C.dim,padding:'10px 8px 0'}}>v3.0 · Verde Pro</div>
        </div>

        {/* Main */}
        <div style={{flex:1,display:'flex',flexDirection:'column',overflow:'hidden'}}>
          {page==='dashboard'    && <PageDashboard jobs={jobs} clienti={clienti} contratti={contratti} operatori={operatori} attrezzature={attrezzature}/>}
          {page==='mappa'        && <PlaceholderPage title="Sala Operativa" sub="Mappa interventi e squadre"/>}
          {page==='clienti'      && <PlaceholderPage title="Clienti" sub="Anagrafica clienti"/>}
          {page==='contratti'    && <PlaceholderPage title="Contratti" sub="Gestione contratti"/>}
          {page==='interventi'   && <PlaceholderPage title="Interventi" sub="Pianificazione lavori"/>}
          {page==='squadre'      && <PlaceholderPage title="Squadre" sub="Gestione operatori"/>}
          {page==='attrezzature' && <PlaceholderPage title="Attrezzature" sub="Inventario mezzi"/>}
          {page==='miei-lavori'  && <MieiLavori/>}
        </div>
      </div>

      {showSettings && <SettingsModal onClose={()=>setShowSettings(false)}/>}
    </div>
  )
}