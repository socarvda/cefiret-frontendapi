function getToken(){return localStorage.getItem('cefiret_token')}
function getUser(){try{return JSON.parse(localStorage.getItem('cefiret_user')||'null')}catch{return null}}
function setSession(token,user){localStorage.setItem('cefiret_token',token);localStorage.setItem('cefiret_user',JSON.stringify(user))}
function clearSession(){localStorage.removeItem('cefiret_token');localStorage.removeItem('cefiret_user')}
function authHeaders(json=true){const h={}; if(json) h['Content-Type']='application/json'; const t=getToken(); if(t) h['Authorization']=`Bearer ${t}`; return h}
async function apiFetch(path, options={}){
  const res = await fetch(`${API_BASE_URL}${path}`, {...options, headers:{...authHeaders(options.json!==false), ...(options.headers||{})}});
  const text = await res.text(); let data=null;
  try{data=text?JSON.parse(text):{}}catch{data={success:false,message:text||'Respuesta no válida del servidor'}}
  if(res.status===401){clearSession(); window.location.href='../auth/login.html'; return}
  if(!res.ok) throw data;
  return data;
}
function requireAuth(){if(!getToken()) window.location.href='../auth/login.html'}
function showAlert(id,type,message){const el=document.getElementById(id); if(!el)return; el.innerHTML=`<div class="alert alert-${type} alert-dismissible fade show" role="alert">${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`}
function getParam(n){return new URLSearchParams(window.location.search).get(n)}
function escapeHtml(v){if(v===null||v===undefined)return ''; return String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;').replaceAll("'",'&#039;')}
function formatDate(v){if(!v)return '—'; const d=new Date(String(v).slice(0,10)+'T00:00:00'); return isNaN(d)?v:d.toLocaleDateString('es-MX')}
function formatTime(v){return v?String(v).substring(0,5):'—'}
function formToObject(form){return Object.fromEntries(new FormData(form).entries())}
