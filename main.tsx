import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import Store from './store';
import {configured,adminAccess,signIn} from './backend';
import './style.css';
function App(){const wantsAdmin=new URLSearchParams(location.search).get('admin')==='1';const [admin,setAdmin]=useState(false),[checking,setChecking]=useState(wantsAdmin),[error,setError]=useState(''),[busy,setBusy]=useState(false);
useEffect(()=>{if(wantsAdmin&&configured())adminAccess().then(setAdmin).catch(()=>{}).finally(()=>setChecking(false));else setChecking(false);},[]);
if(!configured())return <main className="access"><img src="./logo.jpg" alt="اسحاقزاده"/><h1>اسحاقزاده آنلاین سټور</h1><p>د خپلواک سټور سرور لا نه دی نښلول شوی.</p><p>د اډمین له خوا تر تنظیم وروسته به جنسونه دلته ښکاره شي.</p></main>;
if(wantsAdmin&&checking)return <main className="access">حساب کتل کېږي…</main>;
if(wantsAdmin&&!admin)return <main className="access"><img src="./logo.jpg" alt="اسحاقزاده"/><h1>د اډمین ننوتل</h1><p>خپل د سټور ایمیل او پاسورډ ولیکئ.</p><form className="edit-form" onSubmit={async e=>{e.preventDefault();setBusy(true);setError('');const f=new FormData(e.currentTarget);try{await signIn(String(f.get('email')),String(f.get('password')));setAdmin(true);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}><label>ایمیل<input name="email" type="email" dir="ltr" autoComplete="username" defaultValue="nk6341350@gmail.com" required/></label><label>پاسورډ<input name="password" type="password" autoComplete="current-password" required/></label>{error&&<p role="alert">{error}</p>}<button className="primary" disabled={busy}>{busy?'انتظار…':'ننوتل'}</button></form><a href="./">سټور ته ورشئ</a></main>;
return <Store admin={wantsAdmin&&admin}/>;}
createRoot(document.getElementById('root')!).render(<App/>);
