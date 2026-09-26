const KEY="costa_norte_sport_v3";
const defaults={settings:{price:40000,deposit:12000,courts:["Cancha 1","Cancha 2"],hours:["18:00","19:00","20:00","21:00","22:00"]},reservations:[],fixed:[],clients:[]};
let db=JSON.parse(localStorage.getItem(KEY)||"null")||defaults,page="agenda",selectedDate=today();
function save(){localStorage.setItem(KEY,JSON.stringify(db))}
function today(){return new Date().toISOString().slice(0,10)}
function computedStatus(r){
  if(r.status==="Cancelada") return "Cancelada";
  return (+r.deposit||0)>0 ? "Confirmada" : "Pendiente de seña";
}
function normalizeReservations(){
  let changed=false;
  db.reservations.forEach(r=>{
    if(r.status!=="Cancelada"){
      const nextStatus=computedStatus(r);
      const nextBalance=Math.max(0,(+r.price||0)-(+r.deposit||0));
      if(r.status!==nextStatus){r.status=nextStatus;changed=true}
      if(+r.balance!==nextBalance){r.balance=nextBalance;changed=true}
    }
  });
  if(changed) save();
}
normalizeReservations();
function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
function money(n){return "$"+Number(n||0).toLocaleString("es-AR")}
function next(h){return String((+h.slice(0,2)+1)%24).padStart(2,"0")+":00"}
function dow(date){return ["domingo","lunes","martes","miércoles","jueves","viernes","sábado"][new Date(date+"T12:00:00").getDay()]}
function nav(){let a=[["agenda","📅 Agenda"],["reservas","📋 Reservas"],["fijas","🔵 Reservas Fijas"],["clientes","👤 Clientes"],["historial","🕘 Historial"],["config","⚙️ Config."]];navEl().innerHTML=a.map(x=>`<button class="${page===x[0]?"active":""}" onclick="go('${x[0]}')">${x[1]}</button>`).join("")}
function navEl(){return document.querySelector("#nav")}
function go(p){page=p;render()}
function render(){nav();({agenda, reservas, fijas, clientes, historial, config}[page])()}
function fixedFor(date,court,hour){let day=dow(date);return db.fixed.find(f=>f.status==="Activa"&&f.day===day&&f.court===court&&f.hour===hour)}
function reservationFor(date,court,hour){return db.reservations.find(r=>r.status!=="Cancelada"&&r.date===date&&r.court===court&&r.hour===hour)}
function slotInfo(date,court,hour){
 let f=fixedFor(date,court,hour); if(f)return {type:"fixed",item:f};
 let r=reservationFor(date,court,hour); if(r)return {type:r.status==="Pendiente de seña"?"pending":"confirmed",item:r};
 return {type:"available",item:null}
}
function agenda(){
let s=db.settings;
document.querySelector("#app").innerHTML=`<div class="card"><div class="row between"><div><h2>Agenda</h2><small>Disponibilidad real · ${dow(selectedDate)}</small></div><button class="green" onclick="newRes()">+ Reserva</button></div>
<div style="margin-top:10px"><label>Fecha</label><input type="date" value="${selectedDate}" onchange="selectedDate=this.value;render()"></div></div>
${s.courts.map(c=>`<div class="card"><h3>${esc(c)}</h3>${s.hours.map(h=>{let q=slotInfo(selectedDate,c,h),x=q.item;
return `<div class="slot ${q.type}"><div class="row between"><strong>${h}–${next(h)}</strong><span class="badge">${q.type==="available"?"🟢 Disponible":q.type==="fixed"?"🔵 Reserva fija":x.status==="Pendiente de seña"?"🟡 Pendiente":"🔴 Confirmada"}</span></div>
${x?`<div style="margin-top:6px"><b>${esc(x.client)}</b> · ${esc(x.phone||"")}<br><small>${q.type==="fixed"?`Reserva semanal · ${money(x.price)}`:`${money(x.price)} · Seña ${money(x.deposit)} · Saldo ${money(x.balance)}`}</small></div>
<div class="row" style="margin-top:8px">${q.type==="fixed"?`<button class="blue" onclick="go('fijas')">Ver reserva fija</button>`:`<button class="secondary" onclick="editRes('${x.id}')">Editar</button><button class="red" onclick="cancelRes('${x.id}')">Cancelar</button>`}</div>`:
`<button class="green" style="margin-top:8px" onclick="newRes('${c}','${h}')">Reservar</button>`}</div>`}).join("")}</div>`).join("")}
<div class="card"><b>Estados</b><div style="margin-top:7px">🟢 Disponible · 🟡 Pendiente de seña · 🔴 Confirmada · 🔵 Reserva fija</div></div>`;
}
function formRes(r=null,c="",h=""){
let s=db.settings;
document.querySelector("#app").innerHTML=`<div class="card"><div class="row between"><h2>${r?"Editar reserva":"Nueva reserva"}</h2><button class="secondary" onclick="go('agenda')">Volver</button></div>
<div class="grid">
<div><label>Cliente</label><input id="client" value="${esc(r?.client||"")}"></div><div><label>Teléfono</label><input id="phone" value="${esc(r?.phone||"")}"></div>
<div><label>Fecha</label><input id="date" type="date" value="${r?.date||selectedDate}"></div>
<div><label>Cancha</label><select id="court">${s.courts.map(v=>`<option ${v===(r?.court||c)?"selected":""}>${esc(v)}</option>`).join("")}</select></div>
<div><label>Horario</label><select id="hour">${s.hours.map(v=>`<option ${v===(r?.hour||h)?"selected":""}>${v}–${next(v)}</option>`).join("")}</select></div>
<div><label>Precio</label><input id="price" type="number" value="${r?.price??s.price}"></div>
<div><label>Seña</label><input id="deposit" type="number" value="${r?.deposit??0}"></div>
<div><label>Estado automático</label><input id="statusDisplay" value="${computedStatus(r||{deposit:0})}" readonly></div>
<div><label>Saldo</label><input id="balance" type="number" value="${Math.max(0,(+(r?.price??s.price)||0)-(+((r?.deposit)??0)||0))}" readonly></div></div>
<div style="margin-top:10px"><label>Notas</label><textarea id="notes" rows="3">${esc(r?.notes||"")}</textarea></div>
<div class="row" style="margin-top:12px"><button class="green" onclick="saveRes('${r?.id||""}')">Guardar</button><button class="secondary" onclick="go('agenda')">Cancelar</button></div></div>`;
function updateResCalc(){
  const d=Math.max(0,+deposit.value||0),p=Math.max(0,+price.value||0);
  balance.value=Math.max(0,p-d);
  statusDisplay.value=d>0?"Confirmada":"Pendiente de seña";
}
deposit.oninput=updateResCalc;
price.oninput=updateResCalc;
updateResCalc();
}
function newRes(c="",h=""){formRes(null,c,h)}
function editRes(id){let r=db.reservations.find(x=>x.id===id);if(r)formRes(r)}
function saveRes(id){
let p=+price.value||0,d=Math.max(0,+deposit.value||0);
let x={id:id||crypto.randomUUID(),client:client.value.trim(),phone:phone.value.trim(),date:date.value,court:court.value,hour:hour.value.slice(0,5),price:p,deposit:d,balance:Math.max(0,p-d),status:d>0?"Confirmada":"Pendiente de seña",notes:notes.value.trim(),createdAt:id?(db.reservations.find(r=>r.id===id)?.createdAt||Date.now()):Date.now()};
if(!x.client||!x.date)return alert("Completá cliente y fecha.");
let f=fixedFor(x.date,x.court,x.hour);let other=reservationFor(x.date,x.court,x.hour);if(f){alert(`Horario ocupado por la reserva fija de ${f.client}.`);return}if(other&&other.id!==x.id){alert(`Ese horario ya está ocupado por ${other.client}.`);return}
let i=db.reservations.findIndex(r=>r.id===x.id);i>=0?db.reservations[i]=x:db.reservations.push(x);
let c=db.clients.find(c=>c.name.toLowerCase()===x.client.toLowerCase());if(!c)db.clients.push({id:crypto.randomUUID(),name:x.client,phone:x.phone});else if(x.phone)c.phone=x.phone;
save();selectedDate=x.date;go("agenda")
}
function cancelRes(id){let r=db.reservations.find(x=>x.id===id);if(r&&confirm(`¿Cancelar la reserva de ${r.client}?`)){r.status="Cancelada";r.cancelledAt=Date.now();save();render()}}
function reservas(){let a=db.reservations.filter(r=>r.status!=="Cancelada").sort((x,y)=>(x.date+x.hour).localeCompare(y.date+y.hour));document.querySelector("#app").innerHTML=`<div class="card"><div class="row between"><h2>Reservas</h2><button class="green" onclick="newRes()">+ Nueva</button></div>${a.length?`<table><tr><th>Fecha</th><th>Hora</th><th>Cancha</th><th>Cliente</th><th>Estado</th></tr>${a.map(r=>`<tr><td>${r.date}</td><td>${r.hour}</td><td>${esc(r.court)}</td><td>${esc(r.client)}</td><td>${r.status}</td></tr>`).join("")}</table>`:`<div class="empty">No hay reservas.</div>`}</div>`}
function fijas(){let a=db.fixed;document.querySelector("#app").innerHTML=`<div class="card"><div class="row between"><div><h2>Reservas Fijas</h2><small>Se repiten automáticamente cada semana.</small></div><button class="green" onclick="newFixed()">+ Reserva fija</button></div>${a.length?`<table><tr><th>Cliente</th><th>Día</th><th>Hora</th><th>Cancha</th><th>Precio</th><th>Estado</th><th></th></tr>${a.map(f=>`<tr><td>${esc(f.client)}</td><td>${f.day}</td><td>${f.hour}</td><td>${esc(f.court)}</td><td>${money(f.price)}</td><td>${f.status}</td><td><button class="secondary" onclick="editFixed('${f.id}')">Editar</button></td></tr>`).join("")}</table>`:`<div class="empty">Todavía no hay reservas fijas.</div>`}</div>`}
function fixedForm(f=null){
let s=db.settings,days=["lunes","martes","miércoles","jueves","viernes","sábado","domingo"];
document.querySelector("#app").innerHTML=`<div class="card"><div class="row between"><h2>${f?"Editar reserva fija":"Nueva reserva fija"}</h2><button class="secondary" onclick="go('fijas')">Volver</button></div>
<div class="grid"><div><label>Cliente</label><input id="fc" value="${esc(f?.client||"")}"></div><div><label>Teléfono</label><input id="fp" value="${esc(f?.phone||"")}"></div>
<div><label>Día</label><select id="fd">${days.map(d=>`<option ${d===(f?.day||"lunes")?"selected":""}>${d}</option>`).join("")}</select></div>
<div><label>Cancha</label><select id="ff">${s.courts.map(c=>`<option ${c===(f?.court||s.courts[0])?"selected":""}>${esc(c)}</option>`).join("")}</select></div>
<div><label>Horario</label><select id="fh">${s.hours.map(h=>`<option ${h===(f?.hour||s.hours[0])?"selected":""}>${h}–${next(h)}</option>`).join("")}</select></div>
<div><label>Precio semanal</label><input id="fprice" type="number" value="${f?.price??s.price}"></div>
<div><label>Seña</label><input id="fdep" type="number" value="${f?.deposit??s.deposit}"></div>
<div><label>Estado</label><select id="fst"><option ${f?.status!=="Pausada"?"selected":""}>Activa</option><option ${f?.status==="Pausada"?"selected":""}>Pausada</option><option ${f?.status==="Cancelada"?"selected":""}>Cancelada</option></select></div></div>
<div style="margin-top:10px"><label>Notas</label><textarea id="fn" rows="3">${esc(f?.notes||"")}</textarea></div>
<div class="row" style="margin-top:12px"><button class="green" onclick="saveFixed('${f?.id||""}')">Guardar</button><button class="secondary" onclick="go('fijas')">Cancelar</button></div></div>`
}
function newFixed(){fixedForm()}
function editFixed(id){let f=db.fixed.find(x=>x.id===id);if(f)fixedForm(f)}
function saveFixed(id){
let x={id:id||crypto.randomUUID(),client:fc.value.trim(),phone:fp.value.trim(),day:fd.value,court:ff.value,hour:fh.value.slice(0,5),price:+fprice.value||0,deposit:+fdep.value||0,balance:(+fprice.value||0)-(+fdep.value||0),status:fst.value,notes:fn.value.trim(),createdAt:id?(db.fixed.find(f=>f.id===id)?.createdAt||Date.now()):Date.now()};
if(!x.client)return alert("Completá el cliente.");
let clash=db.fixed.find(f=>f.id!==x.id&&f.status==="Activa"&&f.day===x.day&&f.court===x.court&&f.hour===x.hour);if(clash)return alert(`Ya existe una reserva fija para ese día, cancha y horario: ${clash.client}.`);
db.fixed=db.fixed.filter(f=>f.id!==x.id);db.fixed.push(x);let c=db.clients.find(c=>c.name.toLowerCase()===x.client.toLowerCase());if(!c)db.clients.push({id:crypto.randomUUID(),name:x.client,phone:x.phone});else if(x.phone)c.phone=x.phone;save();go("fijas")
}
function clientes(){document.querySelector("#app").innerHTML=`<div class="card"><h2>Clientes</h2>${db.clients.length?`<table><tr><th>Nombre</th><th>Teléfono</th><th>Reservas</th></tr>${db.clients.map(c=>`<tr><td>${esc(c.name)}</td><td>${esc(c.phone)}</td><td>${db.reservations.filter(r=>r.client===c.name&&r.status!=="Cancelada").length}</td></tr>`).join("")}</table>`:`<div class="empty">Los clientes se crean al guardar una reserva.</div>`}</div>`}
function historial(){let a=[...db.reservations].sort((x,y)=>y.createdAt-x.createdAt);document.querySelector("#app").innerHTML=`<div class="card"><h2>Historial</h2>${a.length?`<table><tr><th>Fecha</th><th>Cliente</th><th>Cancha</th><th>Estado</th><th>Importe</th></tr>${a.map(r=>`<tr><td>${r.date} ${r.hour}</td><td>${esc(r.client)}</td><td>${esc(r.court)}</td><td>${r.status}</td><td>${money(r.price)}</td></tr>`).join("")}</table>`:`<div class="empty">Sin movimientos.</div>`}</div>`}
function config(){let s=db.settings;document.querySelector("#app").innerHTML=`<div class="card"><h2>Configuración</h2><div class="grid"><div><label>Precio general</label><input id="cp" type="number" value="${s.price}"></div><div><label>Seña sugerida</label><input id="cd" type="number" value="${s.deposit}"></div></div><div style="margin-top:10px"><label>Canchas (una por línea)</label><textarea id="cc" rows="3">${s.courts.join("\n")}</textarea></div><div style="margin-top:10px"><label>Horarios (uno por línea)</label><textarea id="ch" rows="6">${s.hours.join("\n")}</textarea></div><button class="green" style="margin-top:10px" onclick="saveCfg()">Guardar</button></div><div class="card"><b>Privacidad</b><p>Los datos de esta versión se guardan localmente en el navegador de este dispositivo.</p></div>`}
function saveCfg(){db.settings.price=+cp.value||0;db.settings.deposit=+cd.value||0;db.settings.courts=cc.value.split("\n").map(x=>x.trim()).filter(Boolean);db.settings.hours=ch.value.split("\n").map(x=>x.trim()).filter(Boolean);save();alert("Configuración guardada.");render()}
render();