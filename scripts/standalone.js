/* Punto de Juego · versión de un solo archivo (sin servidor)
   Toda la lógica en vanilla JS. CSS embebido desde src/app/globals.css. */
(function () {
"use strict";

/* ─────────────────────────── Datos ─────────────────────────── */
var POS=[[.5,.131],[.509,.113],[.517,.113],[.523,.114],[.491,.113],[.483,.113],[.477,.114],[.526,.128],[.474,.128],[.51,.151],[.49,.151],[.561,.256],[.44,.253],[.578,.4],[.422,.397],[.575,.538],[.422,.537],[.566,.566],[.431,.565],[.568,.565],[.431,.564],[.568,.548],[.43,.548],[.538,.533],[.462,.532],[.543,.701],[.459,.7],[.546,.88],[.451,.88],[.543,.928],[.455,.928],[.563,.951],[.436,.951]];
var DEMO_POINTS=POS.map(function(p,i){return {x:p[0],y:p[1],z:i<11?-.16:i<23?-.06:.01,v:.97+(i%3)*.009};});
var DEMO_METRICS={shoulders:1.2,hips:.8,knees:2.4,axis:.5,leftKnee:177.6,rightKnee:178.1,leftElbow:176.2,rightElbow:177.3,confidence:98,score:92};
var CONN=[[0,7],[0,8],[11,12],[11,13],[13,15],[15,17],[15,19],[15,21],[12,14],[14,16],[16,18],[16,20],[16,22],[11,23],[12,24],[23,24],[23,25],[25,27],[27,29],[29,31],[27,31],[24,26],[26,28],[28,30],[30,32],[28,32]];
var L=[
["Nariz","Cabeza","Referencia central del rostro para observar la orientación de la cabeza."],
["Ojo izquierdo · interno","Cabeza","Comisura interna del ojo izquierdo."],
["Ojo izquierdo","Cabeza","Centro aproximado del ojo izquierdo."],
["Ojo izquierdo · externo","Cabeza","Comisura externa del ojo izquierdo."],
["Ojo derecho · interno","Cabeza","Comisura interna del ojo derecho."],
["Ojo derecho","Cabeza","Centro aproximado del ojo derecho."],
["Ojo derecho · externo","Cabeza","Comisura externa del ojo derecho."],
["Oreja izquierda","Cabeza","Referencia lateral izquierda de la cabeza."],
["Oreja derecha","Cabeza","Referencia lateral derecha de la cabeza."],
["Comisura labial izquierda","Cabeza","Extremo izquierdo de la boca."],
["Comisura labial derecha","Cabeza","Extremo derecho de la boca."],
["Hombro izquierdo","Tren superior","Centro articular estimado; referencia de simetría escapular."],
["Hombro derecho","Tren superior","Centro articular estimado; referencia de simetría escapular."],
["Codo izquierdo","Tren superior","Permite calcular la flexión del codo izquierdo."],
["Codo derecho","Tren superior","Permite calcular la flexión del codo derecho."],
["Muñeca izquierda","Tren superior","Referencia distal del antebrazo izquierdo."],
["Muñeca derecha","Tren superior","Referencia distal del antebrazo derecho."],
["Meñique izquierdo","Manos","Referencia del quinto dedo izquierdo."],
["Meñique derecho","Manos","Referencia del quinto dedo derecho."],
["Índice izquierdo","Manos","Referencia del segundo dedo izquierdo."],
["Índice derecho","Manos","Referencia del segundo dedo derecho."],
["Pulgar izquierdo","Manos","Referencia del primer dedo izquierdo."],
["Pulgar derecho","Manos","Referencia del primer dedo derecho."],
["Cadera izquierda","Tren inferior","Centro articular estimado; no equivale a una referencia ósea palpada."],
["Cadera derecha","Tren inferior","Centro articular estimado; no equivale a una referencia ósea palpada."],
["Rodilla izquierda","Tren inferior","Centro estimado para observar el eje de la extremidad."],
["Rodilla derecha","Tren inferior","Centro estimado para observar el eje de la extremidad."],
["Tobillo izquierdo","Tren inferior","Centro aproximado del tobillo izquierdo."],
["Tobillo derecho","Tren inferior","Centro aproximado del tobillo derecho."],
["Talón izquierdo","Pies","Referencia posterior del pie izquierdo."],
["Talón derecho","Pies","Referencia posterior del pie derecho."],
["Punta del pie izquierdo","Pies","Referencia anterior del pie izquierdo."],
["Punta del pie derecho","Pies","Referencia anterior del pie derecho."]];
var F=[
["height","Estatura","cm","Morfometría",50,250,"Medir de pie, sin calzado, con estadímetro."],
["weight","Peso corporal","kg","Morfometría",10,350,"Báscula calibrada y ropa ligera."],
["waist","Perímetro de cintura","cm","Morfometría",20,250,"Entre la última costilla y la cresta ilíaca, al final de una espiración normal."],
["hip","Perímetro de cadera","cm","Morfometría",20,250,"Cinta horizontal sobre la mayor prominencia glútea."],
["chest","Perímetro torácico","cm","Morfometría",20,250,"Cinta horizontal y respiración normal."],
["armLeft","Brazo izquierdo","cm","Morfometría",5,100,"Perímetro a nivel medio del brazo relajado."],
["armRight","Brazo derecho","cm","Morfometría",5,100,"Perímetro a nivel medio del brazo relajado."],
["thighLeft","Muslo izquierdo","cm","Morfometría",10,150,"Anota un punto de referencia reproducible."],
["thighRight","Muslo derecho","cm","Morfometría",10,150,"Anota un punto de referencia reproducible."],
["calfLeft","Pantorrilla izquierda","cm","Morfometría",5,100,"Perímetro máximo de la pantorrilla."],
["calfRight","Pantorrilla derecha","cm","Morfometría",5,100,"Perímetro máximo de la pantorrilla."],
["bodyFat","Grasa corporal","%","Composición",2,65,"Valor de un equipo validado; anota el método. No se estima con la cámara."],
["muscleMass","Masa muscular","kg","Composición",1,150,"Valor de una evaluación de composición corporal; anota el método."],
["heartRate","Frecuencia cardíaca","lpm","Signos vitales",25,240,"En reposo, con dispositivo o pulso manual durante 60 segundos."],
["systolic","Presión sistólica","mmHg","Signos vitales",50,260,"Tensiómetro validado tras 5 minutos de reposo."],
["diastolic","Presión diastólica","mmHg","Signos vitales",30,180,"Componente diastólico de la medición."],
["spo2","Saturación de oxígeno","%","Signos vitales",50,100,"Pulsioxímetro estable, mano tibia y en reposo."]];
var EX=[
{id:"squat",name:"Sentadilla",cat:"Tren inferior",view:"Lateral",desc:"Control de rodillas, cadera y tronco.",metric:"Flexión de rodilla",target:"80–110° en el descenso",cues:["Pies firmes, separados al ancho de los hombros.","Flexiona la cadera y las rodillas de forma controlada.","Mantén las rodillas alineadas con los pies.","Vuelve a la posición inicial sin bloquear las rodillas."]},
{id:"lunge",name:"Zancada",cat:"Estabilidad",view:"Lateral",desc:"Equilibrio y simetría del movimiento.",metric:"Flexión de rodilla",target:"80–110° en el descenso",cues:["Da un paso amplio y mantén el tronco erguido.","Desciende de forma vertical y controlada.","Evita el colapso de la rodilla hacia dentro.","Vuelve a la posición inicial antes de repetir."]},
{id:"press",name:"Press de hombros",cat:"Tren superior",view:"Frontal",desc:"Rango articular y control de hombros.",metric:"Extensión de codo",target:"Más de 155° al elevar",cues:["Mantén el abdomen activo y la pelvis estable.","Comienza con los codos flexionados.","Eleva los brazos con un movimiento simétrico.","Baja de forma lenta, sin arquear la espalda."]},
{id:"plank",name:"Plancha",cat:"Core",view:"Lateral",desc:"Alineación corporal y control del core.",metric:"Ángulo de cadera",target:"160–180° de alineación",cues:["Apoya los antebrazos bajo los hombros.","Mantén cadera, hombros y tobillos en una línea.","Evita hundir la zona lumbar o elevar la cadera.","Respira con normalidad; detente si hay dolor."]}];
var NAV=[["overview","Resumen","grid"],["posture","Evaluación postural","scan"],["biometrics","Morfo / biometría","ruler"],["routines","Rutinas de ejercicios","dumbbell"],["athletes","Deportistas","users"],["history","Historial","clock"]];
var TITLES={overview:["Tu centro de rendimiento","Una visión de cada deportista. Un paso más hacia su mejor versión."],posture:["Evaluación postural","Observa con precisión. Comprende su postura. Acompaña su evolución."],biometrics:["Morfometría y biometría","Cada medida es una referencia para entender su evolución."],routines:["Postura en movimiento","Evalúa la técnica y acompaña cada repetición con una mejor perspectiva."],athletes:["Tus deportistas","Personas, objetivos y progreso. Todo en un mismo lugar."],history:["Historial de evaluaciones","El progreso se construye con cada registro. Explora su recorrido."]};

/* ─────────────────────────── Utilidades ─────────────────────────── */
function $(s,r){return (r||document).querySelector(s);} function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function esc(s){return String(s==null?"":s).replace(/[&<>"']/g,function(c){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c];});}
function uid(){return "id-"+Date.now().toString(36)+"-"+Math.random().toString(36).slice(2,8);}
function fmt(v,withTime){var d=new Date(v);try{return new Intl.DateTimeFormat("es",withTime?{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"}:{day:"2-digit",month:"short",year:"numeric"}).format(d);}catch(e){return d.toLocaleDateString();}}
function initials(n){return n.split(" ").slice(0,2).map(function(s){return s[0]||"";}).join("").toUpperCase();}
function round(n,d){var m=Math.pow(10,d||1);return Math.round(n*m)/m;}
var P={grid:'<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
scan:'<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2"/><circle cx="12" cy="12" r="3"/>',
ruler:'<path d="M3 15 15 3l6 6L9 21z"/><path d="m7 11 2 2M11 7l2 2M11 15l2 2"/>',
dumbbell:'<path d="M6.5 6.5v11M17.5 6.5v11M3.5 9.5v5M20.5 9.5v5M6.5 12h11"/>',
users:'<circle cx="9" cy="8" r="3.2"/><path d="M3 20a6 6 0 0 1 12 0"/><path d="M16 5.5a3.2 3.2 0 0 1 0 6M17 14.5a6 6 0 0 1 4 5.5"/>',
clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
camera:'<path d="M4 8h3l1.5-2h7L17 8h3a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z"/><circle cx="12" cy="13" r="3.5"/>',
video:'<rect x="3" y="6" width="12" height="12" rx="2"/><path d="m15 11 6-3v8l-6-3z"/>',
videoOff:'<path d="M3 3l18 18"/><path d="M15 10.5 21 7v10l-3-1.5M13 6H5a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h11"/>',
image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m4 18 5-4 4 3 3-2 4 3"/>',
switchCam:'<path d="M4 8h13l-3-3M20 16H7l3 3"/>',
settings:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1"/>',
help:'<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.6 2.6 0 1 1 3.4 2.5c-.6.2-.9.7-.9 1.3v.4"/><circle cx="12" cy="17" r=".7" fill="currentColor"/>',
bell:'<path d="M6 9a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6z"/><path d="M10 19a2 2 0 0 0 4 0"/>',
menu:'<path d="M4 7h16M4 12h16M4 17h16"/>',
plus:'<path d="M12 5v14M5 12h14"/>',
x:'<path d="M6 6l12 12M18 6 6 18"/>',
check:'<path d="m5 12 5 5 9-10"/>',
chevron:'<path d="m9 6 6 6-6 6"/>',
chevronDown:'<path d="m6 9 6 6 6-6"/>',
arrow:'<path d="M5 12h14M13 6l6 6-6 6"/>',
download:'<path d="M12 4v11M8 11l4 4 4-4M4 20h16"/>',
trash:'<path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13"/>',
eye:'<path d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>',
play:'<path d="M7 5l12 7-12 7z"/>',
pause:'<path d="M8 5v14M16 5v14"/>',
flag:'<path d="M5 21V4h13l-2.5 4L18 12H5"/>',
activity:'<path d="M3 12h4l3 8 4-16 3 8h4"/>',
heart:'<path d="M12 20s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 3.5C19 15.6 12 20 12 20z"/>',
shield:'<path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="m9 12 2 2 4-4"/>',
book:'<path d="M4 5a2 2 0 0 1 2-2h13v18H6a2 2 0 0 1-2-2z"/><path d="M8 3v18"/>',
target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3.5"/>',
sparkles:'<path d="M12 3l1.7 4.8L18.5 9l-4.8 1.7L12 15.5l-1.7-4.8L5.5 9l4.8-1.2z"/><path d="M18 15l.9 2.4 2.4.9-2.4.9L18 21l-.9-2.4-2.4-.9 2.4-.9z"/>',
info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5"/><circle cx="12" cy="8" r=".7" fill="currentColor"/>',
focus:'<circle cx="12" cy="12" r="3"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
gridIcon:'<path d="M4 9h16M4 15h16M9 4v16M15 4v16"/>',
maximize:'<path d="M4 9V4h5M20 15v5h-5M20 9V4h-5M4 15v5h5"/>',
chart:'<path d="M4 20V11M10 20V4M16 20v-6M22 20H2"/>',
user:'<circle cx="12" cy="8" r="3.5"/><path d="M5 20a7 7 0 0 1 14 0"/>',
sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4"/>',
refresh:'<path d="M21 12a9 9 0 1 1-2.6-6.4M21 4v5h-5"/>'};
function ic(name,size,cls){var s=size||18;return '<svg xmlns="http://www.w3.org/2000/svg" width="'+s+'" height="'+s+'" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="'+(cls||"")+'" aria-hidden="true">'+(P[name]||"")+'</svg>';}

/* ─────────────────────────── Estado ─────────────────────────── */
var KEY="pdj_single_v1";
function seed(){
 var now=Date.now(),d=86400000;
 var a1={id:"a1",name:"Mateo López",age:26,sex:"Masculino",sport:"Entrenamiento funcional",height:178,weight:74,demo:true};
 var a2={id:"a2",name:"Valentina Torres",age:24,sex:"Femenino",sport:"Atletismo",height:166,weight:58,demo:true};
 var a3={id:"a3",name:"Daniel García",age:31,sex:"Masculino",sport:"Ciclismo",height:182,weight:79,demo:true};
 return {profile:{name:"Dra. Andrea Ríos",role:"Fisioterapeuta"},
  athletes:[a1,a2,a3],
  evaluations:[
   {id:"e1",athleteId:"a1",type:"postural",view:"Frontal",demo:true,score:92,points:DEMO_POINTS,metrics:DEMO_METRICS,notes:"Registro de demostración. Ligera asimetría de rodillas. Valores ilustrativos.",landmarkNotes:{},snapshot:null,exercise:null,reps:0,duration:0,createdAt:new Date(now-d).toISOString()},
   {id:"e2",athleteId:"a1",type:"postural",view:"Frontal",demo:true,score:89,points:DEMO_POINTS,metrics:Object.assign({},DEMO_METRICS,{score:89,shoulders:1.8,knees:3.1}),notes:"Evaluación inicial de muestra.",landmarkNotes:{},snapshot:null,exercise:null,reps:0,duration:0,createdAt:new Date(now-8*d).toISOString()},
   {id:"e3",athleteId:"a1",type:"rutina",view:"Lateral",demo:true,score:90,points:DEMO_POINTS,metrics:Object.assign({},DEMO_METRICS,{score:90}),notes:"Sesión de ejemplo; no se han analizado movimientos reales.",landmarkNotes:{},snapshot:null,exercise:"Sentadilla",reps:12,duration:48,createdAt:new Date(now-3*d).toISOString()}],
  measurements:[
   {id:"m1",athleteId:"a1",demo:true,notes:"Valores de muestra. Composición corporal ilustrativa; no obtenida con la cámara.",values:{height:178,weight:74,waist:79,hip:96,chest:98,armLeft:31.5,armRight:32,thighLeft:54,thighRight:54.5,calfLeft:36,calfRight:36,bodyFat:16.5,muscleMass:34.2,heartRate:64,systolic:118,diastolic:76,spo2:98},createdAt:new Date(now-d).toISOString()},
   {id:"m2",athleteId:"a1",demo:true,notes:"Medición de referencia de muestra.",values:{height:178,weight:74.5,waist:80,hip:96.5,chest:98,armLeft:31,armRight:31.5,thighLeft:54,thighRight:54.5,calfLeft:36,calfRight:36,bodyFat:17,heartRate:66,systolic:120,diastolic:78,spo2:98},createdAt:new Date(now-8*d).toISOString()}],
  athleteId:"a1"};
}
var state;
try{var raw=localStorage.getItem(KEY);state=raw?JSON.parse(raw):null;if(!state||!state.athletes||!state.athletes.length)state=seed();}catch(e){state=seed();}
function persist(){try{localStorage.setItem(KEY,JSON.stringify(state));}catch(e){}}
var section="posture",view="Frontal",recTab="points",histTab="all",histSearch="",pointRegion="Todas las regiones",pointSearch="",selectedExercise="squat";
var frame={points:DEMO_POINTS,metrics:DEMO_METRICS,source:"demo",snapshot:null,width:1568,height:1045};
var cam={on:false,stream:null,raf:0,model:null,loading:false,error:"",settings:false,mirror:true,timer:false,quality:"1080",devices:[],deviceId:"",uploaded:"",pointsVisible:true,guides:true,countdown:0,lastTime:-1,prev:[]};
var session={active:false,started:false,reps:0,seconds:0,angle:null,phase:"En posición inicial",tick:0,lastCount:0,phaseState:"up",lastGood:null};
function athlete(){var a=state.athletes.filter(function(x){return x.id===state.athleteId;})[0];return a||state.athletes[0];}
function evals(){return state.evaluations.filter(function(e){return e.athleteId===athlete().id;});}
function meas(){return state.measurements.filter(function(m){return m.athleteId===athlete().id;});}

/* ─────────────────────────── Métricas ─────────────────────────── */
function angle(a,b,c,asp){var ux=(a.x-b.x)*asp,uy=a.y-b.y,vx=(c.x-b.x)*asp,vy=c.y-b.y;var den=Math.hypot(ux,uy)*Math.hypot(vx,vy);if(!den)return 0;var cos=Math.max(-1,Math.min(1,(ux*vx+uy*vy)/den));return round(Math.acos(cos)*180/Math.PI);}
function metrics(p,asp){
 if(!p||p.length!==33)return null;
 function vis(){for(var i=0;i<arguments.length;i++)if(p[arguments[i]].v<.55)return false;return true;}
 var left=vis(11,23,25,27),right=vis(12,24,26,28);if(!left&&!right)return null;
 function tilt(a,b){if(!(vis(a,b)))return null;return round(Math.atan2(Math.abs(p[a].y-p[b].y),Math.abs(p[a].x-p[b].x)*asp)*180/Math.PI);}
 var sh=tilt(11,12),hp=tilt(23,24);
 var top=left&&right?{x:(p[11].x+p[12].x)/2,y:(p[11].y+p[12].y)/2}:p[left?11:12];
 var bot=left&&right?{x:(p[27].x+p[28].x)/2,y:(p[27].y+p[28].y)/2}:p[left?27:28];
 var axis=round(Math.atan2(Math.abs(top.x-bot.x)*asp,Math.abs(top.y-bot.y))*180/Math.PI);
 function ang(a,b,c){return vis(a,b,c)?angle(p[a],p[b],p[c],asp):null;}
 var lk=ang(23,25,27),rk=ang(24,26,28);
 var knees=(lk!==null&&rk!==null)?round((Math.abs(180-lk)+Math.abs(180-rk))/2):null;
 var conf=Math.round(p.reduce(function(s,x){return s+x.v;},0)/p.length*100);
 var score=(sh!==null&&hp!==null&&knees!==null)?Math.max(0,Math.min(100,Math.round(100-sh*1.4-hp*1.4-axis*2-knees*.7))):null;
 return {shoulders:sh,hips:hp,knees:knees,axis:axis,leftKnee:lk,rightKnee:rk,leftElbow:ang(11,13,15),rightElbow:ang(12,14,16),confidence:conf,score:score};
}
function angleVal(v,unit){return v==null?"—":v+(unit||"°");}

/* ─────────────────────────── Notificaciones y modales ─────────────────────────── */
function toast(msg,err){
 var root=$("#toast-root");root.innerHTML='<div class="toast '+(err?"error":"")+'" role="status"><span>'+ic(err?"info":"check",18)+'</span><p>'+esc(msg)+'</p><button data-act="close-toast" aria-label="Cerrar notificación">'+ic("x",16)+'</button></div>';
 clearTimeout(toast._t);toast._t=setTimeout(function(){root.innerHTML="";},6500);
}
function openModal(title,subtitle,body,wide){
 var root=$("#modal-root");
 root.innerHTML='<div class="modal-backdrop" data-backdrop><div class="modal '+(wide?"modal-wide":"")+'" role="dialog" aria-modal="true" aria-labelledby="mtitle"><div class="modal-header"><div><h2 id="mtitle">'+esc(title)+'</h2>'+(subtitle?'<p>'+esc(subtitle)+'</p>':"")+'</div><button class="icon-button" data-act="close-modal" aria-label="Cerrar ventana">'+ic("x",20)+'</button></div><div class="modal-body">'+body+'</div></div></div>';
 document.body.style.overflow="hidden";
 var f=root.querySelector("input,textarea,select,button:not([data-act='close-modal'])");if(f)setTimeout(function(){f.focus();},60);
}
function closeModal(){ $("#modal-root").innerHTML="";document.body.style.overflow=""; }
document.addEventListener("keydown",function(e){if(e.key==="Escape")closeModal();});

/* ─────────────────────────── Plantillas ─────────────────────────── */
function brand(){return '<button class="brand" data-act="nav" data-section="overview" aria-label="Punto de Juego · Inicio"><span class="brand-mark"><svg viewBox="0 0 32 32" fill="none"><circle cx="18" cy="7" r="3.3" fill="currentColor"/><path d="m7 13 8-1 8 5m-8-5 2 9 8 4m-8-4-7 6" stroke="currentColor" stroke-width="3.4" stroke-linecap="round" stroke-linejoin="round"/><circle cx="7" cy="7" r="1.5" fill="currentColor" opacity=".5"/></svg></span><span class="brand-wordmark">punto de juego<span>CIENCIA EN MOVIMIENTO</span></span></button>';}
function sidebar(){
 var nav=NAV.map(function(n){return '<button data-act="nav" data-section="'+n[0]+'" class="'+(section===n[0]?"active":"")+'">'+ic(n[2],18)+'<span>'+n[1]+'</span>'+(n[0]==="routines"?'<span class="new-nav-dot"></span>':"")+(section===n[0]?'<span class="active-nav-indicator"></span>':"")+'</button>';}).join("");
 return '<aside class="sidebar '+(document.body.dataset.menu==="1"?"open":"")+'" id="sidebar">'+brand()+
 '<div class="workspace-label"><span class="workspace-icon">'+ic("target",17)+'</span><div><strong>Mi espacio profesional</strong><span>Centro de rendimiento</span></div>'+ic("chevronDown",13)+'</div>'+
 '<div class="nav-label">ESPACIO DE TRABAJO</div><nav class="main-navigation">'+nav+'</nav>'+
 '<div class="sidebar-bottom"><div class="sidebar-help"><span class="sidebar-help-icon">'+ic("sparkles",19)+'</span><span class="help-decoration">✳</span><h3>Cada movimiento<br>cuenta.</h3><p>Hagamos que cada evaluación también.</p><button data-act="help">Explora la guía'+ic("arrow",14)+'</button></div>'+
 '<button class="settings-nav" data-act="settings">'+ic("settings",17)+'Configuración</button>'+
 '<button class="sidebar-profile" data-act="settings"><span class="avatar profile-avatar">AR</span><span><strong>'+esc(state.profile.name)+'</strong><small>'+esc(state.profile.role)+'</small></span>'+ic("chevronDown",14)+'</button></div></aside>';
}
function topbar(){
 var label=(NAV.filter(function(n){return n[0]===section;})[0]||["",""])[1];
 var today=new Intl.DateTimeFormat("es",{day:"numeric",month:"long",year:"numeric"}).format(new Date());
 return '<header class="topbar"><div class="breadcrumbs"><button class="icon-button mobile-menu" data-act="toggle-menu" aria-label="Abrir menú">'+ic("menu",20)+'</button><span>Mi espacio</span>'+ic("chevron",12)+'<strong>'+esc(label)+'</strong></div>'+
 '<div class="topbar-actions"><span class="today">'+ic("clock",14)+today+'</span><span class="topbar-divider"></span>'+
 '<button class="icon-button" data-act="help" aria-label="Abrir ayuda">'+ic("help",18)+'</button>'+
 '<button class="icon-button notification-button" data-act="notifications" aria-label="Actividad reciente"><i></i>'+ic("bell",18)+'</button>'+
 '<button class="avatar topbar-avatar" data-act="settings" aria-label="Mi perfil">AR</button></div></header>';
}
function pageHeading(){var t=TITLES[section];return '<div class="page-heading"><div><p class="eyebrow page-eyebrow"><span></span>OBSERVA. COMPRENDE. MEJORA.</p><h1>'+esc(t[0])+'<span class="heading-dot">.</span></h1><p class="page-description">'+esc(t[1])+'</p></div><div class="page-heading-actions"><button class="button guide-button" data-act="help">'+ic("book",15)+'Guía de captura</button><button class="button primary" data-act="new-eval">'+ic("plus",17)+'Nueva evaluación</button></div></div>';}
function athleteBar(){
 var a=athlete(),ev=evals()[0];
 var h=latestValue("height")||a.height,w=latestValue("weight")||a.weight;
 var idx=state.athletes.indexOf(a)+1;
 return '<section class="athlete-bar"><div class="athlete-summary"><span class="athlete-avatar">'+initials(a.name)+'<i></i></span><div><div class="athlete-name-row"><h2>'+esc(a.name)+'</h2><span class="athlete-tag">Deportista</span></div><p>'+esc(a.sex)+' <b>·</b> '+a.age+' años <b>·</b> ID: DEP-'+String(idx).padStart(3,"0")+(a.demo?'<span class="profile-sample">Perfil de muestra</span>':"")+'</p></div></div>'+
 '<div class="athlete-vitals"><div><span>ESTATURA</span><strong>'+h+'<small>cm</small></strong></div><div><span>PESO</span><strong>'+w+'<small>kg</small></strong></div><div class="last-evaluation"><span>ÚLTIMA EVALUACIÓN</span><strong>'+(ev?fmt(ev.createdAt):"Sin registros")+'</strong></div></div>'+
 '<button class="button compact change-athlete" data-act="choose-athlete">Cambiar deportista'+ic("chevronDown",13)+'</button></section>';
}
function tabs(){
 var t=[["posture","Evaluación postural","scan"],["biometrics","Morfo / biometría","ruler"],["routines","Rutinas de ejercicios","dumbbell"],["history","Historial","clock"]];
 return '<div class="workspace-tabs"><div role="tablist">'+t.map(function(x){return '<button role="tab" aria-selected="'+(section===x[0])+'" class="'+(section===x[0]?"active":"")+'" data-act="nav" data-section="'+x[0]+'">'+ic(x[2],16)+'<span>'+x[1]+'</span>'+(x[0]==="routines"?'<small>Nuevo</small>':"")+'</button>';}).join("")+'</div><span class="data-privacy-label">'+ic("shield",13)+'Procesamiento local</span></div>';
}
function footer(){return '<footer class="workspace-footer"><span><span class="footer-brand-dot"></span>Punto de Juego<span class="footer-separator">/</span>El conocimiento también se mueve.</span><span>Herramienta de apoyo profesional<span class="footer-separator">·</span>Versión 2.0</span></footer>';}
function banner(eb,title,text,motif){
 return '<div class="media-banner" data-reveal><div class="media-banner-copy"><span class="eyebrow">'+esc(eb)+'</span><h3>'+esc(title)+'</h3><p>'+esc(text)+'</p></div><div class="banner-art" aria-hidden="true">'+motif+'</div><span class="media-banner-glow"></span></div>';
}
function ringsMotif(){
 return '<svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#dff0e4"/><stop offset="1" stop-color="#bcd9c6"/></linearGradient></defs><ellipse cx="100" cy="72" rx="78" ry="52" stroke="#a9c9b4" stroke-dasharray="4 6" opacity=".8"/><ellipse cx="100" cy="72" rx="58" ry="38" stroke="#8fbaa0" opacity=".55"/><circle cx="100" cy="46" r="14" fill="url(#g1)"/><path d="M100 60v34M100 70l-20 12M100 70l20 12M100 94l-13 22M100 94l13 22" stroke="#7fae93" stroke-width="7" stroke-linecap="round"/><circle cx="80" cy="82" r="4.5" fill="#5f9e7f"/><circle cx="120" cy="82" r="4.5" fill="#5f9e7f"/><circle cx="100" cy="94" r="4.5" fill="#5f9e7f"/><circle cx="30" cy="34" r="3.5" fill="#9ec6ac"/><circle cx="172" cy="106" r="3.5" fill="#9ec6ac"/></svg>';
}
function figureMotif(){
 return '<svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="118" cy="70" r="56" fill="#e6f1e6"/><circle cx="118" cy="70" r="56" stroke="#b9d6c1" stroke-dasharray="3 7"/><path d="M40 70h136" stroke="#cfe4d5"/><circle cx="118" cy="36" r="12" fill="#9dc4a9"/><path d="M118 48v30M118 56l-24 10M118 56l26 6M118 78l-18 30M118 78l20 28" stroke="#7fb192" stroke-width="11" stroke-linecap="round"/><circle cx="94" cy="66" r="5" fill="#4f9070"/><circle cx="144" cy="62" r="5" fill="#4f9070"/><circle cx="100" cy="108" r="5" fill="#4f9070"/><circle cx="138" cy="106" r="5" fill="#4f9070"/></svg>';
}

/* ─────────────────────────── Cámara ─────────────────────────── */
function previewSrc(){
 if(cam.uploaded)return cam.uploaded;
 if(view==="Lateral")return "IMGLATERAL";
 if(view==="Posterior")return "IMGBACK";
 return "IMGFRONT";
}
function cameraPanel(exerciseMode){
 var visible=frame.points.filter(function(p){return p.v>.55;}).length;
 var src=cam.on?"camera":(cam.uploaded?"upload":"demo");
 var label=src==="demo"?"Modo demostración":src==="camera"?"Cámara en directo":"Fotografía cargada";
 var p=previewSrc();
 var draw=cam.pointsVisible&&(src!=="demo"||view==="Frontal");
 return '<div class="camera-wrap"><section class="card camera-card '+(cam.on?"is-live":"")+'" id="camera-card">'+
 '<div class="card-heading camera-heading"><div><h2>'+(exerciseMode?"Observa la técnica en movimiento":"Análisis en tiempo real")+'</h2><p>'+(exerciseMode?"Cada repetición es una oportunidad para mejorar.":"Más precisión. Una mejor perspectiva de su postura.")+'</p></div><button class="icon-button '+(cam.settings?"selected":"")+'" data-act="cam-settings" aria-label="Configurar cámara">'+ic("settings",18)+'</button></div>'+
 '<div class="camera-modebar"><div class="segmented">'+["Frontal","Lateral","Posterior"].map(function(v){return '<button class="'+(view===v?"active":"")+'" data-act="view" data-view="'+v+'">'+v+'</button>';}).join("")+'</div>'+
 '<button class="camera-device" data-act="cam-settings">'+ic("video",14)+'<span>Cámara HD</span>'+ic("chevronDown",13)+'</button></div>'+
 (cam.settings?settingsPanel():"")+
 '<div class="camera-preview">'+
 (src!=="camera"?'<div class="preview-reference-bg" style="background-image:url('+p+')"></div>':"")+
 '<div class="pose-source '+(src!=="camera"?"reference-source":"")+'" style="'+(src!=="camera"?"aspect-ratio:"+frame.width+" / "+frame.height:"")+'">'+
 (src!=="camera"?'<img class="pose-media" src="'+p+'" alt="Fotografía de referencia de un deportista en posición anatómica" onerror="this.onerror=null;this.src=\'IMGFRONT\'">':"")+
 '<video class="pose-media '+(src!=="camera"?"hidden-media ":"")+(cam.mirror?"mirrored":"")+'" muted playsinline autoplay aria-label="Vista de la cámara en directo"></video>'+
 (draw?'<svg class="pose-overlay '+(cam.mirror&&src==="camera"?"mirrored":"")+'" viewBox="0 0 '+frame.width+' '+frame.height+'" preserveAspectRatio="xMidYMid meet" id="pose-svg"></svg>':"")+
 '</div>'+
 '<div class="preview-top"><span class="live-badge '+(src==="camera"?"is-live":"")+'"><i></i>'+label+'</span><span class="resolution-badge">'+(src==="camera"?(frame.width?frame.width+" × "+frame.height:"HD"):src==="upload"?"IMAGEN":"HD")+'<span class="resolution-icon">'+ic("focus",12)+'</span></span></div>'+
 (cam.guides?'<div class="alignment-guides"><span class="guide vertical"></span><span class="guide horizontal shoulders"></span><span class="guide horizontal hips"></span><span class="guide horizontal floor"></span><i class="corner tl"></i><i class="corner tr"></i><i class="corner bl"></i><i class="corner br"></i></div>':"")+
 (src==="camera"&&cam.guides?'<span class="scan-sweep" aria-hidden="true"></span><span class="scan-corners" aria-hidden="true"><i></i><i></i><i></i><i></i></span>':"")+
 (src==="demo"&&view==="Frontal"&&cam.pointsVisible?'<div class="anatomy-label shoulder-label"><span>Hombros</span><strong>1.2° '+ic("check",10)+'</strong></div><div class="anatomy-label hip-label"><span>Cadera</span><strong>0.8° '+ic("check",10)+'</strong></div>':"")+
 (cam.loading?'<div class="preview-loading">'+ic("refresh",28,"spin")+'<strong>Preparando tu evaluación</strong><span>Iniciando cámara y motor de postura…</span></div>':"")+
 (cam.countdown>0?'<div class="countdown-overlay">'+cam.countdown+'</div>':"")+
 (src==="demo"&&!cam.loading?'<button class="activate-camera" data-act="start-camera">'+ic("video",16)+'<span>Activar mi cámara</span><span class="activate-arrow">↗</span></button>':"")+
 (src==="camera"&&!cam.loading&&!frame.points.length?'<div class="body-hint">'+ic("scan",17)+'Colócate de cuerpo completo frente a la cámara</div>':"")+
 '<div class="preview-bottom"><button class="overlay-tool '+(cam.pointsVisible?"on":"")+'" data-act="toggle-points"><span class="mini-switch"></span><span>Puntos anatómicos</span></button><div class="overlay-tools-right"><button class="overlay-icon '+(cam.guides?"on":"")+'" data-act="toggle-guides" aria-label="Guías de alineación">'+ic("gridIcon",16)+'</button><button class="overlay-icon" data-act="fullscreen" aria-label="Pantalla completa">'+ic("maximize",16)+'</button></div></div>'+
 '</div>'+
 (cam.error?'<div class="camera-error" role="alert">'+ic("help",16)+'<span>'+esc(cam.error)+'</span><button data-act="dismiss-error" aria-label="Ocultar aviso">'+ic("x",14)+'</button></div>':"")+
 '<div class="camera-actions"><div class="tracking-info"><span class="tracking-icon">'+ic("scan",17)+'</span><div><strong>'+(src==="demo"?"33 puntos de referencia":visible+" de 33 puntos visibles")+'</strong><span>'+(src==="demo"?"Explora el análisis con una muestra":frame.metrics?"Seguimiento activo y estabilizado":"Buscando una postura completa")+'</span></div></div>'+
 '<div class="capture-buttons"><input type="file" id="file-input" accept="image/jpeg,image/png,image/webp" class="sr-only" aria-label="Subir fotografía">'+
 '<button class="button icon-only" data-act="upload" aria-label="Subir fotografía">'+ic("image",17)+'</button>'+
 '<button class="button icon-only switch-camera-button" data-act="switch-camera" aria-label="Cambiar cámara">'+ic("switchCam",18)+'</button>'+
 '<button class="button primary capture-button" data-act="capture">'+(cam.timer&&src==="camera"?ic("clock",16):ic("camera",16))+'<span>'+(exerciseMode?"Capturar postura":"Capturar evaluación")+'</span></button></div></div>'+
 '<div class="camera-quality"><span>'+ic("check",12)+'Iluminación uniforme</span><span>'+ic("check",12)+'Cuerpo completo</span><span>'+ic("focus",12)+'Distancia: 2–3 metros</span>'+(cam.on?'<button data-act="stop-camera">'+ic("videoOff",12)+'Apagar</button>':"")+'</div>'+
 '</section><p class="camera-privacy">'+ic("shield",13)+'<span>Tu video se procesa en este dispositivo. Solo se guarda la captura que confirmes.</span></p></div>';
}
function settingsPanel(){
 return '<div class="camera-settings"><div class="flex-between"><h3>Ajustes de cámara</h3><button class="icon-button small" data-act="cam-settings" aria-label="Cerrar ajustes">'+ic("x",16)+'</button></div>'+
 '<label>Dispositivo<select id="cam-device"><option value="">Cámara predeterminada</option>'+cam.devices.map(function(d,i){return '<option value="'+esc(d.deviceId)+'" '+(d.deviceId===cam.deviceId?"selected":"")+'>'+esc(d.label||("Cámara "+(i+1)))+'</option>';}).join("")+'</select></label>'+
 '<label>Resolución preferida<select id="cam-quality"><option value="1080" '+(cam.quality==="1080"?"selected":"")+'>Full HD · 1080p</option><option value="720" '+(cam.quality==="720"?"selected":"")+'>HD · 720p (mayor fluidez)</option></select></label>'+
 '<label class="setting-toggle"><span>Vista en espejo</span><input type="checkbox" id="cam-mirror" '+(cam.mirror?"checked":"")+'></label>'+
 '<label class="setting-toggle"><span>Temporizador de 3 segundos</span><input type="checkbox" id="cam-timer" '+(cam.timer?"checked":"")+'></label>'+
 '<p>La resolución final depende de tu dispositivo. El análisis funciona localmente.</p>'+
 '<button class="button primary full" data-act="start-camera">'+ic("video",15)+(cam.on?"Aplicar y reiniciar":"Activar cámara")+'</button></div>';
}
function drawOverlay(animate){
 var svg=$("#pose-svg");if(!svg)return;
 var W=frame.width,H=frame.height,cls=animate?" animated":"";
 var out="";
 CONN.forEach(function(c){var a=frame.points[c[0]],b=frame.points[c[1]];if(a&&b&&a.v>.5&&b.v>.5)out+='<line pathLength="1" x1="'+(a.x*W)+'" y1="'+(a.y*H)+'" x2="'+(b.x*W)+'" y2="'+(b.y*H)+'" class="skeleton-line'+cls+'"/>';});
 frame.points.forEach(function(p,i){if(p.v>.5)out+='<circle cx="'+(p.x*W)+'" cy="'+(p.y*H)+'" r="'+(Math.max(W,H)*.0047)+'" class="skeleton-point'+cls+(i===25||i===26?" attention-point":"")+'" data-act="point" data-point="'+i+'" tabindex="0" role="button"><title>'+esc(L[i][0])+" · "+Math.round(p.v*100)+'% de visibilidad</title></circle>';});
 svg.innerHTML=out;
}
function setFrame(next){frame=next;var s=$("#pose-svg");if(s){if(frame.source==="camera")drawOverlay(false);else drawOverlay(true);}updateSummary();updateTracking();}

/* ─────────────────────────── MediaPipe ─────────────────────────── */
var VISION_URL="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/+esm";
var WASM_URL="https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.21/wasm";
var MODEL_URL="https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task";
function loadVision(){
 if(window.__vision)return Promise.resolve(window.__vision);
 if(window.__visionP)return window.__visionP;
 window.__visionP=new Promise(function(res,rej){
  var s=document.createElement("script");s.type="module";
  s.textContent='import * as m from "'+VISION_URL+'";window.__vision=m;window.dispatchEvent(new Event("vision:ready"));';
  s.onerror=function(){rej(new Error("No se pudo cargar el motor de postura. Comprueba tu conexión."));};
  window.addEventListener("vision:ready",function(){res(window.__vision);},{once:true});
  document.head.appendChild(s);
  setTimeout(function(){if(!window.__vision)rej(new Error("El motor de postura tardó demasiado en cargar. Inténtalo de nuevo."));},25000);
 });
 return window.__visionP;
}
async function getModel(mode){
 if(cam.model){await cam.model.setOptions({runningMode:mode});return cam.model;}
 var vision=await loadVision();
 if(!window.__fileset)window.__fileset=await vision.FilesetResolver.forVisionTasks(WASM_URL);
 var opts={baseOptions:{modelAssetPath:MODEL_URL,delegate:"GPU"},runningMode:mode,numPoses:1,minPoseDetectionConfidence:.6,minPosePresenceConfidence:.6,minTrackingConfidence:.65};
 try{cam.model=await vision.PoseLandmarker.createFromOptions(window.__fileset,opts);}
 catch(e){opts.baseOptions.delegate="CPU";cam.model=await vision.PoseLandmarker.createFromOptions(window.__fileset,opts);}
 return cam.model;
}

/* ─────────────────────────── Secciones ─────────────────────────── */
function latestValue(key){var ms=meas().filter(function(m){return m.values[key]!==undefined;});return ms.length?ms[0].values[key]:null;}
function postureSummary(){
 var m=frame.metrics,sc=(view==="Frontal"&&m)?m.score:null;
 var rows;
 if(view==="Frontal")rows=[["Hombros","Inclinación estimada",m?m.shoulders:null,2],["Cadera","Inclinación estimada",m?m.hips:null,2],["Rodillas","Desviación media del eje",m?m.knees:null,2],["Eje corporal","Respecto a la vertical",m?m.axis:null,2]];
 else rows=[["Rodilla izquierda","Ángulo articular",m?m.leftKnee:null,180],["Rodilla derecha","Ángulo articular",m?m.rightKnee:null,180],["Codo izquierdo","Ángulo articular",m?m.leftElbow:null,180],["Codo derecho","Ángulo articular",m?m.rightElbow:null,180]];
 var body;
 if(sc!=null){
  var c=2*Math.PI*42;
  body='<div class="posture-score"><div class="score-ring" style="width:106px;height:106px"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" class="ring-track"/><circle cx="50" cy="50" r="42" class="ring-progress" stroke-dasharray="'+c+'" stroke-dashoffset="'+(c*(1-sc/100))+'" transform="rotate(-90 50 50)"/></svg><div><strong data-count="'+sc+'">0</strong><span>de 100</span></div></div>'+
  '<div><span class="alignment-badge '+(sc<85?"review":"")+'"><i></i>'+(sc>=85?"Buena alineación":"Por revisar")+'</span><h3>El equilibrio<br>en cada punto.</h3><p>Simetría frontal orientativa.</p></div></div>';
 }else{
  body='<div class="awaiting-analysis"><span>'+ic("scan",27)+'</span><div><h3>'+(view!=="Frontal"?"Lectura "+view.toLowerCase():"Esperando una postura")+'</h3><p>'+(view!=="Frontal"?"Observa los ángulos del lado visible.":"Encuadra el cuerpo completo para obtener una lectura.")+'</p></div></div>';
 }
 var mrows=rows.map(function(r,i){
  var warn=r[2]!=null&&r[2]>r[3];
  var icon= i===0?'<path d="M5 12 8 9h8l3 3M12 9v10m-4-7v7m8-7v7" />':i===1?'<path d="M8 9h8l-1 7H9L8 9Zm1 7-2 5m8-5 2 5M5 10l3-1m8 0 3 1"/>':i===2?'<path d="M9 9h6l1 6-2 6m-5-12-1 6 2 6m-3-7 3 2m4 0 3-2"/>':'<path d="M12 8v13m-5-10 5-3 5 3M5 18h14"/>';
  return '<div class="summary-metric"><span class="metric-body-icon '+(warn?"caution":"")+'"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round">'+icon+'</svg></span><div><strong>'+r[0]+'</strong><span>'+r[1]+'</span></div><span class="angle-value '+(warn?"caution":"")+'">'+(r[2]==null?"—":round(r[2],1)+"°")+(r[2]!=null?"<i></i>":"")+'</span></div>';}).join("");
 return '<section class="card posture-summary"><div class="flex-between"><h2>Resumen de postura</h2><button class="icon-button small" data-act="help">'+ic("help",16)+'</button></div>'+
 '<p class="summary-source">Vista '+view.toLowerCase()+'<span>·</span>'+(frame.source==="demo"?"Muestra de referencia":frame.source==="upload"?"Fotografía":"Lectura en directo")+'</p>'+
 body+'<div class="summary-metrics">'+mrows+'</div>'+
 '<button class="all-points-link" data-act="nav" data-section="biometrics">Ver detalle de los 33 puntos'+ic("arrow",14)+'</button>'+
 '<div class="summary-disclaimer">'+ic("shield",12)+'<span>Lecturas orientativas. No sustituyen una valoración profesional.</span></div></section>';
}
function tipsCard(){
 var t=["Ubícate a <strong>2–3 metros</strong> de la cámara.","Mantén <strong>todo el cuerpo visible.</strong>","Busca una <strong>iluminación uniforme.</strong>"];
 return '<section class="card capture-tips"><div class="tips-title"><span>'+ic("sparkles",16)+'</span><h3>Una buena captura, un mejor análisis.</h3></div><ol>'+t.map(function(x,i){return '<li><span>'+(i+1)+'</span><p>'+x+'</p></li>';}).join("")+'</ol><button data-act="help">Ver recomendaciones'+ic("arrow",13)+'</button></section>';
}
function features(){
 var f=[["Cada medida, un registro","Documenta cada punto morfo / biométrico.","ruler","mint","biometrics","Explorar registros"],["De la postura al movimiento","Evalúa la técnica durante sus ejercicios.","dumbbell","lavender","routines","Evaluar una rutina"],["Su progreso tiene historia","Compara registros y acompaña su evolución.","chart","peach","history","Ver su historial"]];
 return '<div class="features-heading"><h2>Una evaluación más completa</h2><span>Todo está conectado. Su progreso también.</span></div><div class="feature-grid">'+f.map(function(x){return '<button class="feature-card" data-act="nav" data-section="'+x[4]+'"><span class="feature-icon '+x[3]+'">'+ic(x[2],21)+'</span><div><h3>'+x[0]+'</h3><p>'+x[1]+'</p><span class="feature-link">'+x[5]+ic("arrow",13)+'</span></div></button>';}).join("")+'</div>';
}
function sectionPosture(){
 return '<div class="section-enter"><div class="evaluation-grid">'+cameraPanel(false)+'<aside class="posture-aside">'+postureSummary()+tipsCard()+'</aside></div>'+features()+'</div>';
}
function statCard(label,value,unit,icon,tone,note){
 return '<div class="card stat-card"><div class="flex-between"><span>'+label+'</span><span class="stat-icon '+tone+'">'+ic(icon,19)+'</span></div><div class="stat-value"><span data-count="'+value+'" data-dec="'+(String(value).indexOf(".")>-1?1:0)+'">0</span>'+(unit?'<small>'+unit+'</small>':"")+'</div><p>'+note+'</p></div>';
}
function sectionBiometrics(){
 var ms=meas(),evs=evals();
 var h=latestValue("height")||athlete().height,w=latestValue("weight")||athlete().weight;
 var hr=latestValue("heartRate"),bmi=(w/Math.pow(h/100,2)).toFixed(1);
 var stats='<div class="stats-grid biometric-stats">'+
 statCard("Estatura",h,"cm","ruler","mint","Último valor registrado")+
 statCard("Peso corporal",w,"kg","activity","lavender","Último valor registrado")+
 statCard("Índice de masa corporal",Number(bmi),"kg/m²","focus","peach","Calculado con los últimos valores")+
 statCard("Frecuencia cardíaca",hr==null?"—":hr,"lpm","heart","blue",hr==null?"Sin registro":"Último valor registrado")+'</div>';
 var body="";
 if(recTab==="points")body=pointsTable(evs);
 else body=measureTable(recTab);
 var hist='<section class="card measurement-history" data-reveal><div class="records-heading"><div><h3>Historial de mediciones</h3><p>Cada registro conserva su fecha, valores y método.</p></div><span class="count-label">'+ms.length+' registros</span></div>'+
 (ms.length?'<div class="table-scroll"><table><thead><tr><th>Fecha y hora</th><th>Campos registrados</th><th>Observaciones</th><th>Fuente</th><th></th></tr></thead><tbody>'+ms.map(function(m){return '<tr class="clickable-row" data-act="measurement-detail" data-id="'+m.id+'"><td>'+fmt(m.createdAt,true)+'</td><td>'+Object.keys(m.values).length+' medidas</td><td class="truncate-cell">'+esc(m.notes||"Sin observaciones")+'</td><td>'+(m.demo?'<span class="sample-badge">Muestra</span>':"Manual")+'</td><td>'+ic("chevron",15)+'</td></tr>';}).join("")+'</tbody></table></div>':'<div class="empty-state"><span class="empty-icon">'+ic("ruler",27)+'</span><h3>Aún no hay mediciones</h3><p>Añade la primera medición para comenzar el seguimiento.</p><button class="button" data-act="measurement">'+ic("plus",15)+'Añadir medición</button></div>')+'</section>';
 return '<div class="section-enter"><div class="section-heading"><div><h2>La evolución, en cada medida.</h2><p>Registros detallados para una visión completa del deportista.</p></div><button class="button primary" data-act="measurement">'+ic("plus",16)+'Añadir medición</button></div>'+
 banner("17 CAMPOS · 3 GRUPOS","Morfometría, composición y signos vitales.","Cada valor guarda su unidad, su método, su fecha y la fuente. La cámara nunca estima estos datos.",ringsMotif())+
 stats+'<section class="card records-card" data-reveal><div class="records-heading"><div><h3>Registro morfo / biométrico</h3><p>Una referencia individual para cada punto y medición.</p></div><button class="button compact" data-act="export">'+ic("download",14)+'Exportar CSV</button></div>'+
 '<div class="subtabs"><button class="'+(recTab==="points"?"active":"")+'" data-act="rectab" data-tab="points">Puntos anatómicos<span>33</span></button><button class="'+(recTab==="body"?"active":"")+'" data-act="rectab" data-tab="body">Medidas corporales<span>11</span></button><button class="'+(recTab==="vitals"?"active":"")+'" data-act="rectab" data-tab="vitals">Signos vitales<span>4</span></button></div>'+body+'</section>'+hist+'</div>';
}
function pointsTable(evs){
 var current=evs[0];
 var opts=evs.map(function(e,i){return '<option value="'+e.id+'" '+(i===0?"selected":"")+'>'+fmt(e.createdAt)+' · '+e.view+(e.demo?" · Muestra":"")+'</option>';}).join("");
 var rows=L.map(function(l,i){
  if(pointRegion!=="Todas las regiones"&&l[1]!==pointRegion)return "";
  if(pointSearch&&l[0].toLowerCase().indexOf(pointSearch.toLowerCase())<0)return "";
  var p=(current&&current.points[i])||frame.points[i]||DEMO_POINTS[i];
  return '<tr class="clickable-row" data-act="point" data-point="'+i+'"><td><span class="table-point-id">'+String(i).padStart(2,"0")+'</span></td><td class="point-name">'+l[0]+'</td><td><span class="region-tag">'+l[1]+'</span></td><td class="mono">'+p.x.toFixed(3)+' <span>/</span> '+p.y.toFixed(3)+'</td><td class="mono">'+p.z.toFixed(3)+'</td><td><span class="visibility-chip '+(p.v<.55?"low":"")+'"><i></i>'+Math.round(p.v*100)+'%</span></td><td>'+ic("chevron",16)+'</td></tr>';
 }).join("");
 var regions=["Todas las regiones"].concat(L.map(function(l){return l[1];}).filter(function(v,i,a){return a.indexOf(v)===i;}));
 return '<div class="table-toolbar"><div class="search-input">'+ic("focus",16)+'<input id="point-search" placeholder="Buscar un punto anatómico…" value="'+esc(pointSearch)+'" aria-label="Buscar punto"></div>'+
 '<select id="point-region" aria-label="Filtrar región">'+regions.map(function(r){return '<option '+(r===pointRegion?"selected":"")+'>'+r+'</option>';}).join("")+'</select>'+
 '<select '+(current?"":"disabled")+' aria-label="Seleccionar evaluación">'+(opts||'<option>Sin evaluaciones</option>')+'</select></div>'+
 (current?'<div class="table-scroll landmark-table-scroll"><table><thead><tr><th>ID</th><th>Punto anatómico</th><th>Región</th><th>X / Y</th><th>Z relativa</th><th>Visibilidad</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div><div class="table-footer"><span>33 puntos · Coordenadas normalizadas</span><span>'+(current.demo?'<span class="sample-badge">Muestra</span>':"")+'Vista '+current.view.toLowerCase()+'</span></div>':'<div class="empty-state"><span class="empty-icon">'+ic("scan",27)+'</span><h3>El primer punto de partida</h3><p>Guarda una evaluación postural para consultar los 33 puntos.</p></div>')+
 '<div class="inline-info">'+ic("info",15)+'<p>Los puntos son estimaciones de MediaPipe. La visibilidad indica qué tan visible considera el modelo cada punto, no la precisión clínica. Las coordenadas no son distancias en centímetros.</p></div>';
}
function measureTable(tab){
 var fields=F.filter(function(f){return tab==="vitals"?f[3]==="Signos vitales":f[3]!=="Signos vitales";});
 var ms=meas();
 var rows=fields.map(function(f){
  var hist=ms.filter(function(m){return m.values[f[0]]!==undefined;});
  var last=hist[0],prev=hist[1];
  var diff=(last&&prev)?round(last.values[f[0]]-prev.values[f[0]],1):null;
  var change=diff===null?"—":'<span class="change-value">'+(diff>0?"+":"")+diff+' '+f[2]+'</span>';
  return '<tr class="clickable-row" data-act="field" data-key="'+f[0]+'"><td><strong>'+f[1]+'</strong><small class="table-subtext">'+f[3]+'</small></td><td><strong>'+(last?last.values[f[0]]:"—")+'</strong> <span class="muted">'+f[2]+'</span></td><td>'+change+'</td><td>'+(last?fmt(last.createdAt):"Sin registro")+'</td><td>'+(last?(last.demo?'<span class="sample-badge">Muestra</span>':"Manual"):"—")+'</td><td>'+ic("chevron",15)+'</td></tr>';
 }).join("");
 return '<div class="table-toolbar"><p class="muted">'+(tab==="vitals"?"Valores medidos con instrumentos apropiados, nunca estimados por cámara.":"Perímetros, composición corporal y medidas registradas manualmente.")+'</p></div><div class="table-scroll"><table><thead><tr><th>Medición</th><th>Último valor</th><th>Cambio anterior</th><th>Fecha</th><th>Fuente</th><th></th></tr></thead><tbody>'+rows+'</tbody></table></div>'+
 '<div class="inline-info">'+ic("info",15)+'<p>El cambio solo compara valores registrados; no implica una mejora o deterioro clínico. El IMC se calcula como peso / estatura² y requiere interpretación profesional.</p></div>';
}
function sectionRoutines(){
 var ex=EX.filter(function(e){return e.id===selectedExercise;})[0];
 var cards=EX.map(function(e){return '<button class="exercise-card '+(e.id===selectedExercise?"selected":"")+'" data-act="exercise" data-id="'+e.id+'"><div class="exercise-visual tone-'+e.id+'">'+exerciseArt(e.id)+(e.id===selectedExercise?'<span class="exercise-selected">'+ic("check",12)+'</span>':"")+'</div><div class="exercise-card-info"><span>'+e.cat+'</span><h3>'+e.name+'</h3><p>'+e.desc+'</p></div></button>';}).join("");
 var counters='<div class="routine-counters"><div><span>'+ic("refresh",13)+(ex.id==="plank"?"Sostenimiento":"Repeticiones")+'</span><strong>'+(ex.id==="plank"?String(session.seconds).padStart(2,"0"):String(session.reps).padStart(2,"0"))+'</strong><small>'+(ex.id==="plank"?"segundos de sesión":"ciclos completos")+'</small></div><div><span>'+ic("clock",13)+'Tiempo de sesión</span><strong>'+String(Math.floor(session.seconds/60)).padStart(2,"0")+'<em>:</em>'+String(session.seconds%60).padStart(2,"0")+'</strong><small>minutos : segundos</small></div></div>';
 var ang='<div class="angle-monitor"><span>'+ex.metric+'</span><strong>'+(session.angle==null?"—":session.angle)+'<small>°</small></strong><div class="angle-target"><span></span>'+ex.target+'</div></div>';
 var phase='<div class="movement-phase">'+ic("activity",16)+(session.active?(frame.metrics?session.phase:"Reencuadra el cuerpo completo"):session.started?"En pausa":"Activa la cámara para analizar")+'</div>';
 var aside='<aside class="routine-aside"><section class="card routine-metrics"><div class="flex-between"><h3>Tu sesión en directo</h3><span class="live-mini '+(session.active?"active":"")+'"><i></i>'+(session.active?"En curso":"En espera")+'</span></div>'+counters+ang+phase+'</section>'+
 '<section class="card technique-card"><div class="flex-between"><h3>Claves de la técnica</h3><button class="icon-button small" data-act="help">'+ic("help",16)+'</button></div><p>'+ex.name+' · Vista '+ex.view.toLowerCase()+' recomendada</p><ol>'+ex.cues.map(function(c,i){return '<li><span>'+(i+1)+'</span><p>'+c+'</p></li>';}).join("")+'</ol><div class="technique-note">'+ic("info",15)+'<span>Ángulos 2D orientativos, no prescripción. Adapta el rango a cada persona y detente si hay dolor.</span></div></section></aside>';
 var controls='<div class="card session-controls"><div class="session-status"><span class="status-dot '+(session.active?"pulse":"")+'"></span><div><strong>'+(session.active?(frame.metrics?"Evaluación en curso":"Buscando cuerpo completo"):session.started?"Evaluación en pausa":"Listo para comenzar")+'</strong><span>El conteo utiliza movimiento real, no la demostración.</span></div></div><div class="session-buttons">'+
 (session.active?'<button class="button" data-act="pause-session">'+ic("pause",15)+'Pausar</button>':'<button class="button primary" data-act="start-session">'+ic("play",15)+(session.started?"Continuar":"Iniciar evaluación")+'</button>')+
 (session.started?'<button class="button dark" data-act="finish-session">'+ic("flag",15)+'Finalizar y guardar</button>':"")+'</div></div>';
 return '<div class="section-enter"><div class="section-heading"><div><h2>Una mejor técnica, repetición a repetición.</h2><p>Selecciona un ejercicio y observa su postura durante el movimiento.</p></div><span class="soft-label">'+ic("dumbbell",13)+'4 ejercicios disponibles</span></div>'+
 banner("ANÁLISIS EN MOVIMIENTO","Cada repetición, en tres dimensiones.","Seguimiento de ángulos, fases y simetría a partir de los puntos detectados en cada ciclo.",figureMotif())+
 '<div class="exercise-grid">'+cards+'</div><div class="evaluation-grid routine-evaluation-grid"><div>'+cameraPanel(true)+controls+'</div>'+aside+'</div></div>';
}
function exerciseArt(id){
 var s='<svg viewBox="0 0 120 88" fill="none" class="exercise-art" aria-hidden="true"><ellipse cx="60" cy="78" rx="42" ry="3" fill="currentColor" opacity=".07"/>';
 var d={squat:'<circle cx="62" cy="20" r="7" fill="currentColor" opacity=".75"/><path d="M62,30 56,49 42,63 63,73 76,73M56,49 76,60 63,73M61,34 78,43 92,40" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
 lunge:'<circle cx="64" cy="17" r="7" fill="currentColor" opacity=".75"/><path d="M64,27 60,47 84,54 85,73 97,73M60,47 38,65 21,65M63,32 46,42 36,35" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
 press:'<circle cx="60" cy="22" r="7" fill="currentColor" opacity=".75"/><path d="M60,32 60,51 48,76M60,51 73,76M60,34 41,33 34,15M60,34 79,33 86,15" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>',
 plank:'<circle cx="92" cy="37" r="7" fill="currentColor" opacity=".75"/><path d="M84,43 60,49 28,58 17,70M79,45 91,65 105,65" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/>'};
 return s+(d[id]||d.squat)+'<circle cx="60" cy="49" r="3" fill="white" opacity=".9"/></svg>';
}
function sectionAthletes(){
 var cards=state.athletes.map(function(a,i){
  var count=state.evaluations.filter(function(e){return e.athleteId===a.id;}).length;
  return '<article class="card athlete-card"><div class="flex-between"><span class="athlete-large-avatar tone-'+(i%3)+'">'+initials(a.name)+'</span>'+(a.demo?'<span class="sample-badge">Muestra</span>':'<span class="soft-label">Perfil activo</span>')+'</div><h3>'+esc(a.name)+'</h3><p>'+a.age+' años · '+esc(a.sex)+'</p><span class="sport-tag">'+esc(a.sport)+'</span>'+
  '<div class="athlete-card-stats"><div><span>Estatura</span><strong>'+a.height+'<small> cm</small></strong></div><div><span>Peso</span><strong>'+a.weight+'<small> kg</small></strong></div><div><span>Evaluaciones</span><strong>'+count+'</strong></div></div>'+
  '<button class="button full" data-act="select-athlete" data-id="'+a.id+'">Abrir perfil de evaluación'+ic("arrow",14)+'</button></article>';
 }).join("");
 return '<div class="section-enter">'+banner("TU EQUIPO, EN UN SOLO LUGAR","Personas, objetivos y progreso.","Perfiles individuales que conectan cada evaluación postural, cada medición y cada sesión de ejercicios.",figureMotif())+
 '<div class="athletes-toolbar"><div class="search-input">'+ic("focus",17)+'<input id="athlete-search" placeholder="Buscar deportista o actividad…" aria-label="Buscar deportistas"></div><button class="button primary" data-act="athlete">'+ic("plus",16)+'Añadir deportista</button></div>'+
 '<div class="athletes-grid" id="athletes-grid">'+cards+'</div></div>';
}
function sectionHistory(){
 var rows=[];
 state.evaluations.forEach(function(e){rows.push({kind:e.type,id:e.id,date:e.createdAt,label:e.type==="rutina"?(e.exercise||"Rutina de ejercicios"):"Evaluación postural",detail:e.type==="rutina"?e.reps+" repeticiones · "+e.duration+" s":"Vista "+e.view.toLowerCase()+" · 33 puntos",demo:e.demo,score:e.score,notes:e.notes,ref:e});});
 state.measurements.forEach(function(m){rows.push({kind:"medicion",id:m.id,date:m.createdAt,label:"Medición morfo / biométrica",detail:Object.keys(m.values).length+" campos registrados",demo:m.demo,score:null,notes:m.notes,ref:m});});
 rows.sort(function(a,b){return new Date(b.date)-new Date(a.date);});
 var filtered=rows.filter(function(r){
  if(histTab!=="all"&&r.kind!==histTab)return false;
  if(histSearch&&(r.label+" "+r.notes).toLowerCase().indexOf(histSearch.toLowerCase())<0)return false;
  return true;});
 var body=filtered.map(function(r){
  var icon=r.kind==="rutina"?"dumbbell":r.kind==="medicion"?"ruler":"scan";
  var tone=r.kind==="rutina"?"lavender":r.kind==="medicion"?"peach":"mint";
  var act=r.kind==="medicion"?'data-act="measurement-detail" data-id="'+r.id+'"':'data-act="eval-detail" data-id="'+r.id+'"';
  return '<tr class="clickable-row" '+act+'><td><div class="history-type"><span class="history-type-icon '+tone+'">'+ic(icon,17)+'</span><div><strong>'+esc(r.label)+'</strong><small>'+esc(r.detail)+'</small></div></div></td><td>'+fmt(r.date,true)+'</td><td>'+(r.score!=null?'<span class="score-pill">'+r.score+'<small>/100</small></span>':"—")+'</td><td>'+(r.demo?'<span class="sample-badge">Muestra</span>':"Registrado")+'</td><td><div class="table-row-actions"><button class="icon-button small" aria-label="Ver detalle">'+ic("eye",16)+'</button>'+(r.kind!=="medicion"?'<button class="icon-button small danger-hover" data-act="ask-delete" data-id="'+r.id+'" aria-label="Eliminar evaluación">'+ic("trash",15)+'</button>':"")+'</div></td></tr>';
 }).join("");
 return '<div class="section-enter">'+banner("PROGRESO EN EL TIEMPO","Cada registro, un escalón.","Compara evaluaciones, sesiones y mediciones a lo largo del tiempo, con filtros por tipo y período.",figureMotif())+
 '<section class="card history-card" data-reveal><div class="records-heading"><div><h3>Cada evaluación cuenta una historia.</h3><p>Consulta, compara y exporta los registros del deportista.</p></div><button class="button compact" data-act="export">'+ic("download",14)+'Exportar CSV</button></div>'+
 '<div class="subtabs">'+[["all","Todos los registros"],["postural","Postura"],["rutina","Rutinas"],["medicion","Mediciones"]].map(function(t){return '<button class="'+(histTab===t[0]?"active":"")+'" data-act="histtab" data-tab="'+t[0]+'">'+t[1]+'<span>'+rows.filter(function(r){return t[0]==="all"||r.kind===t[0];}).length+'</span></button>';}).join("")+'</div>'+
 '<div class="table-toolbar"><div class="search-input">'+ic("focus",16)+'<input id="hist-search" placeholder="Buscar en el historial…" value="'+esc(histSearch)+'" aria-label="Buscar en historial"></div><select aria-label="Filtrar período"><option>Todo el período</option><option>Últimos 7 días</option><option>Últimos 30 días</option></select></div>'+
 (filtered.length?'<div class="table-scroll"><table><thead><tr><th>Evaluación / registro</th><th>Fecha</th><th>Resultado</th><th>Fuente</th><th></th></tr></thead><tbody>'+body+'</tbody></table></div>':'<div class="empty-state"><span class="empty-icon">'+ic("history",27)+'</span><h3>Un historial por construir</h3><p>Las evaluaciones y mediciones que guardes aparecerán aquí.</p></div>')+
 '<div class="table-footer"><span>'+filtered.length+' registros encontrados</span><span>Muestras identificadas para tu referencia</span></div></section></div>';
}
function sectionOverview(){
 var stats='<div class="stats-grid">'+
 statCard("Deportistas en tu espacio",state.athletes.length,"","users","mint","Incluye registros identificados como muestra")+
 statCard("Evaluaciones de postura",state.evaluations.filter(function(e){return e.type==="postural";}).length,"","scan","lavender","Incluye registros identificados como muestra")+
 statCard("Sesiones de ejercicios",state.evaluations.filter(function(e){return e.type==="rutina";}).length,"","dumbbell","peach","Incluye registros identificados como muestra")+
 statCard("Registros de mediciones",state.measurements.length,"","ruler","blue","Incluye registros identificados como muestra")+'</div>';
 var recent=state.evaluations.slice().sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);}).slice(0,5).map(function(e){
  var icon=e.type==="rutina"?"dumbbell":"scan",tone=e.type==="rutina"?"lavender":"mint";
  return '<tr class="clickable-row" data-act="eval-detail" data-id="'+e.id+'"><td><div class="history-type"><span class="history-type-icon '+tone+'">'+ic(icon,17)+'</span><div><strong>'+(e.type==="rutina"?esc(e.exercise||"Rutina"):"Evaluación postural")+'</strong><small>Vista '+e.view.toLowerCase()+' · 33 puntos</small></div></div></td><td>'+fmt(e.createdAt,true)+'</td><td>'+(e.score!=null?'<span class="score-pill">'+e.score+'<small>/100</small></span>':"—")+'</td><td>'+(e.demo?'<span class="sample-badge">Muestra</span>':"Registrado")+'</td><td>'+ic("eye",16)+'</td></tr>';}).join("");
 return '<div class="section-enter overview-content"><section class="overview-hero" data-reveal><div><span class="eyebrow">LA CIENCIA AL SERVICIO DEL PROGRESO</span><h2>El movimiento cuenta<br>su propia historia.</h2><p>Conecta postura, medidas y técnica para acompañar<br>a cada deportista con una perspectiva más completa.</p><button class="button primary" data-act="nav" data-section="posture">Comenzar una evaluación'+ic("arrow",15)+'</button></div>'+
 '<div class="overview-art" id="overview-art"><div class="art-orbit one"></div><div class="art-orbit two"></div><div class="art-3d-figure">'+heroArt()+'</div><span class="art-node a"></span><span class="art-node b"></span><span class="art-node c"></span><span class="art-hud-chip chip-one">33 puntos</span><span class="art-hud-chip chip-two">Ángulos en vivo</span></div></section>'+
 stats+'<section class="card history-card" data-reveal><div class="records-heading"><div><h3>Actividad reciente</h3><p>Los últimos pasos en su progreso.</p></div><button class="button compact" data-act="nav" data-section="history">'+ic("arrow",14)+'Ver historial</button></div>'+
 '<div class="table-scroll"><table><thead><tr><th>Evaluación / registro</th><th>Fecha</th><th>Resultado</th><th>Fuente</th><th></th></tr></thead><tbody>'+(recent||'<tr><td colspan="5">Sin registros todavía.</td></tr>')+'</tbody></table></div></section></div>';
}
function heroArt(){
 return '<svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><radialGradient id="hbg" cx=".4" cy=".3" r=".9"><stop stop-color="#eef6ec"/><stop offset="1" stop-color="#cfe3d2"/></radialGradient></defs><circle cx="100" cy="100" r="96" fill="url(#hbg)"/><path d="M20 132c34-14 62-6 88 6s52 12 72-4" stroke="#ffffff" stroke-width="7" stroke-linecap="round" opacity=".75"/><g stroke="#5f9e7f" stroke-width="13" stroke-linecap="round" stroke-linejoin="round" fill="none"><path d="M96 52v42M96 66l-32 14M96 66l34 8M96 94l-26 34M96 94l30 30"/></g><circle cx="96" cy="38" r="16" fill="#4f9070"/><circle cx="64" cy="80" r="7" fill="#ffffff"/><circle cx="130" cy="74" r="7" fill="#ffffff"/><circle cx="70" cy="128" r="7" fill="#ffffff"/><circle cx="126" cy="124" r="7" fill="#ffffff"/><circle cx="34" cy="52" r="5" fill="#9dc4a9"/><circle cx="164" cy="146" r="5" fill="#9dc4a9"/></svg>';
}

/* ─────────────────────────── Render principal ─────────────────────────── */
function sectionHTML(){
 switch(section){case "posture":return sectionPosture();case "biometrics":return sectionBiometrics();case "routines":return sectionRoutines();case "athletes":return sectionAthletes();case "history":return sectionHistory();default:return sectionOverview();}
}
function render(){
 var app=$("#app");
 var showBar=section!=="athletes",showTabs=section!=="athletes"&&section!=="overview";
 app.className="app-shell";
 app.innerHTML=(window.innerWidth<=640&&document.body.dataset.menu==="1"?'<button class="sidebar-scrim" data-act="toggle-menu" aria-label="Cerrar menú"></button>':"")+
 sidebar()+'<div class="main-shell">'+topbar()+'<main class="main-content">'+pageHeading()+(showBar?athleteBar():"")+(showTabs?tabs():"")+sectionHTML()+footer()+'</main></div>';
 afterRender();
}
function afterRender(){
 // revelado al hacer scroll
 var nodes=$$("[data-reveal]");
 if(!("IntersectionObserver" in window))nodes.forEach(function(n){n.classList.add("revealed");});
 else{var io=new IntersectionObserver(function(en){en.forEach(function(e){if(e.isIntersecting){e.target.classList.add("revealed");io.unobserve(e.target);}});},{rootMargin:"0px 0px -6% 0px",threshold:.06});
  nodes.forEach(function(n){io.observe(n);});window.__io&&window.__io.disconnect();window.__io=io;}
 // contadores
 $$("[data-count]").forEach(function(n){countTo(n,Number(n.getAttribute("data-count")),Number(n.getAttribute("data-dec")||0));});
 // esqueleto
 if($("#pose-svg"))drawOverlay(frame.source!=="camera");
 // inclinación 3D
 var art=$("#overview-art");
 if(art){art.addEventListener("mousemove",function(e){var r=art.getBoundingClientRect();var f=art.querySelector(".art-3d-figure");if(f)f.style.transform="rotateX("+(-(e.clientY-r.top)/r.height-.5)*-13+"deg) rotateY("+(((e.clientX-r.left)/r.width-.5)*13)+"deg)";});art.addEventListener("mouseleave",function(){var f=art.querySelector(".art-3d-figure");if(f)f.style.transform="";});}
 // entradas de formulario
 var fs=$("#file-input");if(fs)fs.addEventListener("change",function(){uploadPhoto(fs.files&&fs.files[0]);});
 var ps=$("#point-search");if(ps)ps.addEventListener("input",function(){pointSearch=ps.value;refreshRecords();});
 var pr=$("#point-region");if(pr)pr.addEventListener("change",function(){pointRegion=pr.value;refreshRecords();});
 var hs=$("#hist-search");if(hs)hs.addEventListener("input",function(){histSearch=hs.value;render();});
 var as=$("#athlete-search");if(as)as.addEventListener("input",function(){var q=as.value.toLowerCase();$$("#athletes-grid .athlete-card").forEach(function(c){c.style.display=c.textContent.toLowerCase().indexOf(q)>-1?"":"none";});});
 var cm=$("#cam-mirror");if(cm)cm.addEventListener("change",function(){cam.mirror=cm.checked;render();});
 var ct=$("#cam-timer");if(ct)ct.addEventListener("change",function(){cam.timer=ct.checked;});
 var cq=$("#cam-quality");if(cq)cq.addEventListener("change",function(){cam.quality=cq.value;});
 var cd=$("#cam-device");if(cd)cd.addEventListener("change",function(){cam.deviceId=cd.value;startCamera();});
 if(cam.on)attachStream();
}
function refreshRecords(){var sc=window.scrollY;render();window.scrollTo(0,sc);}
function countTo(node,target,dec){
 if(!isFinite(target)){node.textContent=node.getAttribute("data-count");return;}
 var reduce=window.matchMedia&&window.matchMedia("(prefers-reduced-motion: reduce)").matches;
 if(reduce){node.textContent=target.toFixed(dec);return;}
 var start=performance.now(),from=0,dur=850;
 function tick(now){var t=Math.min(1,(now-start)/dur),e=1-Math.pow(1-t,3);node.textContent=(from+(target-from)*e).toFixed(dec);if(t<1)requestAnimationFrame(tick);else node.textContent=target.toFixed(dec);}
 requestAnimationFrame(tick);
}

/* ─────────────────────────── Acciones de cámara ─────────────────────────── */
function attachStream(){var v=$(".camera-preview video");if(v&&cam.stream&&v.srcObject!==cam.stream){v.srcObject=cam.stream;v.play().catch(function(){});}}
async function startCamera(){
 if(cam.loading)return;
 cam.loading=true;cam.error="";render();
 try{
  if(!navigator.mediaDevices||!navigator.mediaDevices.getUserMedia)throw {name:"NotSupported",message:"La cámara requiere HTTPS y un navegador compatible. También puedes subir una fotografía."};
  stopStream();
  var constraints={audio:false,video:Object.assign(cam.deviceId?{deviceId:{exact:cam.deviceId}}:{facingMode:{ideal:"user"}},{width:{ideal:cam.quality==="1080"?1920:1280},height:{ideal:cam.quality==="1080"?1080:720},frameRate:{ideal:30,max:30}})};
  var stream=await navigator.mediaDevices.getUserMedia(constraints);
  cam.stream=stream;cam.uploaded="";
  var model=await getModel("VIDEO");
  cam.devices=(await navigator.mediaDevices.enumerateDevices()).filter(function(d){return d.kind==="videoinput";});
  var track=stream.getVideoTracks()[0];cam.deviceId=(track.getSettings&&track.getSettings().deviceId)||cam.deviceId;
  cam.on=true;cam.loading=false;cam.prev=[];cam.lastTime=-1;
  setFrame({points:[],metrics:null,source:"camera",snapshot:null,width:0,height:0});
  render();attachStream();
  var video=$(".camera-preview video");
  var token=cam.stream;
  function loop(now){
   if(cam.stream!==token)return;
   if(video&&video.readyState>=2&&video.videoWidth&&now-(cam.lastInfer||0)>=100){
    cam.lastInfer=now;
    try{
     var res=model.detectForVideo(video,performance.now());
     var raw=res.landmarks&&res.landmarks[0]?res.landmarks[0]:[];
     var pts=raw.map(function(p,i){var prev=cam.prev[i],a=.55;return {x:prev?prev.x*(1-a)+p.x*a:p.x,y:prev?prev.y*(1-a)+p.y*a:p.y,y2:0,z:p.z,v:p.visibility==null?0:p.visibility};});
     cam.prev=pts;
     setFrame({points:pts,metrics:pts.length?metrics(pts,video.videoWidth/video.videoHeight):null,source:"camera",snapshot:null,width:video.videoWidth,height:video.videoHeight});
    }catch(err){cam.error="El seguimiento se interrumpió. Reinicia la cámara para volver a intentarlo.";render();return;}
   }
   cam.raf=requestAnimationFrame(loop);
  }
  cam.raf=requestAnimationFrame(loop);
 }catch(e){
  cam.loading=false;cam.on=false;
  var name=e&&e.name,msg;
  if(name==="NotAllowedError")msg="No se ha autorizado la cámara. Permite el acceso en tu navegador o sube una fotografía.";
  else if(name==="NotFoundError")msg="No encontramos una cámara conectada. Conecta un dispositivo o sube una fotografía.";
  else if(name==="NotReadableError")msg="Otra aplicación está usando la cámara. Ciérrala y vuelve a intentarlo.";
  else msg=(e&&e.message)||"No se pudo iniciar la cámara.";
  cam.error=msg;setFrame({points:DEMO_POINTS,metrics:DEMO_METRICS,source:"demo",snapshot:null,width:1568,height:1045});render();toast(msg,true);
 }
}
function stopStream(){cancelAnimationFrame(cam.raf);if(cam.stream){cam.stream.getTracks().forEach(function(t){t.stop();});}cam.stream=null;cam.on=false;cam.prev=[];}
function stopCamera(){stopStream();cam.uploaded="";setFrame({points:DEMO_POINTS,metrics:DEMO_METRICS,source:"demo",snapshot:null,width:1568,height:1045});render();}
async function switchCamera(){
 if(!cam.on){cam.settings=true;render();return;}
 if(cam.devices.length>1){var i=cam.devices.findIndex(function(d){return d.deviceId===cam.deviceId;});cam.deviceId=cam.devices[(i+1)%cam.devices.length].deviceId;await startCamera();}
 else{cam.deviceId="";await startCamera();}
}
async function uploadPhoto(file){
 if(!file)return;
 if(["image/jpeg","image/png","image/webp"].indexOf(file.type)<0||file.size>12*1024*1024){toast("Selecciona una imagen JPG, PNG o WebP de hasta 12 MB.",true);return;}
 stopStream();cam.loading=true;cam.error="";render();
 var url="";
 try{
  url=URL.createObjectURL(file);var img=new Image();img.src=url;await img.decode();
  var canvas=document.createElement("canvas"),sc=Math.min(1,1280/Math.max(img.width,img.height));
  canvas.width=Math.round(img.width*sc);canvas.height=Math.round(img.height*sc);
  canvas.getContext("2d").drawImage(img,0,0,canvas.width,canvas.height);
  var snap=canvas.toDataURL("image/jpeg",.85);
  var model=await getModel("IMAGE");var r=model.detect(canvas);
  var pts=(r.landmarks&&r.landmarks[0]?r.landmarks[0]:[]).map(function(p){return {x:p.x,y:p.y,z:p.z,v:p.visibility==null?0:p.visibility};});
  cam.uploaded=snap;
  setFrame({points:pts,metrics:pts.length?metrics(pts,canvas.width/canvas.height):null,source:"upload",snapshot:snap,width:canvas.width,height:canvas.height});
  if(pts.length!==33)cam.error="No se ha detectado un cuerpo completo. Prueba con una fotografía frontal, nítida y con los pies visibles.";
 }catch(e){cam.error="No se pudo analizar la imagen. Prueba con otra fotografía o activa la cámara.";cam.uploaded="";setFrame({points:DEMO_POINTS,metrics:DEMO_METRICS,source:"demo",snapshot:null,width:1568,height:1045});}
 finally{if(url)URL.revokeObjectURL(url);cam.loading=false;render();}
}
function doCapture(){
 var src=frame.source;
 if(src!=="demo"&&!frame.metrics){cam.error="Todavía no vemos todos los puntos. Aléjate un poco y mantén todo el cuerpo dentro del encuadre.";render();return;}
 var snap=frame.snapshot;
 if(src==="camera"){var v=$(".camera-preview video");if(v&&v.videoWidth){var c=document.createElement("canvas"),s=Math.min(1,1280/v.videoWidth);c.width=Math.round(v.videoWidth*s);c.height=Math.round(v.videoHeight*s);c.getContext("2d").drawImage(v,0,0,c.width,c.height);snap=c.toDataURL("image/jpeg",.82);}}
 openCaptureModal(Object.assign({},frame,{snapshot:snap}));
}
function requestCapture(){
 if(!cam.timer||frame.source!=="camera"){doCapture();return;}
 var n=3;cam.countdown=n;render();
 var t=setInterval(function(){n--;cam.countdown=n;var el=$(".countdown-overlay");if(el)el.textContent=n;if(n<=0){clearInterval(t);cam.countdown=0;doCapture();}},1000);
}

/* ─────────────────────────── Modales de datos ─────────────────────────── */
function openCaptureModal(fr){
 var m=fr.metrics||DEMO_METRICS,demo=fr.source==="demo";
 var img=fr.snapshot||previewSrc();
 var rows;
 if(fr.routine)rows=[["Ejercicio",fr.routine.name],["Repeticiones",fr.routine.reps],["Duración",fr.routine.duration+" s"]];
 else rows=[["Visibilidad media",m.confidence+"%"],["Inclinación de hombros",m.shoulders==null?"—":m.shoulders+"°"],["Inclinación de cadera",m.hips==null?"—":m.hips+"°"]];
 var body=(demo?'<div class="warning-notice">'+ic("info",19)+'<p><strong>Estás guardando una demostración.</strong> La imagen y las medidas son ilustrativas. El registro se identificará como muestra.</p></div>':"")+
 '<div class="capture-review"><div class="capture-review-photo"><img src="'+img+'" alt="Captura de postura para revisar" onerror="this.onerror=null;this.src=\'IMGFRONT\'">'+(demo?'<span class="sample-badge">Muestra</span>':"")+'</div><div class="capture-review-info"><span class="eyebrow">'+(fr.routine?"EVALUACIÓN DE RUTINA":"EVALUACIÓN POSTURAL")+'</span><h3>'+esc(athlete().name)+'</h3><p>Vista '+view.toLowerCase()+' · '+fr.points.length+' puntos</p>'+rows.map(function(r){return '<div class="review-stat"><span>'+r[0]+'</span><strong>'+r[1]+'</strong></div>';}).join("")+'</div></div>'+
 '<label>Observaciones profesionales<textarea id="cap-notes" rows="3" maxlength="4000" placeholder="Describe lo que observas y los aspectos que deseas seguir…"></textarea></label>'+
 (demo?'<label class="checkbox-label"><input type="checkbox" id="cap-ack">Entiendo que este registro es una muestra y no una medición real.</label>':"")+
 '<p class="form-footnote">'+ic("shield",14)+'Se guardarán la captura confirmada y sus puntos estimados. Los resultados no constituyen un diagnóstico.</p>'+
 '<div class="modal-footer"><button class="button primary" data-act="save-capture">'+ic("check",16)+(demo?"Guardar muestra":"Guardar evaluación")+'</button></div>';
 window.__pendingCapture=fr;
 openModal("Revisa antes de guardar","",body,true);
}
function openPointDetail(id,ev){
 var p=(ev?ev.points:frame.points)[id],l=L[id];
 if(!p){toast("Este punto aún no se ha detectado.",true);return;}
 var note=ev&&ev.landmarkNotes?ev.landmarkNotes[id]:"";
 var body='<div class="point-detail-title"><span class="point-number">'+String(id).padStart(2,"0")+'</span><div><span class="eyebrow">'+l[1]+'</span><h3>'+l[0]+'</h3></div>'+(frame.source==="demo"?'<span class="sample-badge">Muestra</span>':"")+'</div>'+
 '<p class="detail-description">'+l[2]+'</p>'+
 '<div class="coordinate-grid">'+["x","y","z"].map(function(a){return '<div><span>Coordenada '+a.toUpperCase()+'</span><strong>'+p[a].toFixed(4)+'</strong><small>'+(a==="z"?"Profundidad relativa":"Normalizada")+'</small></div>';}).join("")+'</div>'+
 '<div class="visibility-detail"><div class="flex-between"><span>Visibilidad estimada</span><strong>'+Math.round(p.v*100)+'%</strong></div><div class="progress-track"><span style="width:'+(p.v*100)+'%"></span></div></div>'+
 '<div class="form-notice">'+ic("info",19)+'<p>X e Y son coordenadas relativas a la imagen (0–1); Z es profundidad relativa al centro de las caderas, no centímetros. Izquierda y derecha se refieren al deportista. Son estimaciones del modelo, no marcas óseas palpadas.</p></div>'+
 (ev?'<p class="muted">Registrado el '+fmt(ev.createdAt,true)+' · Vista '+ev.view.toLowerCase()+'</p><label>Observación individual<textarea id="point-note" rows="3" maxlength="2000" placeholder="Añade una observación específica sobre este punto…">'+esc(note)+'</textarea></label><div class="modal-footer"><button class="button primary" data-act="save-note" data-id="'+ev.id+'" data-point="'+id+'">'+ic("check",16)+'Guardar observación</button></div>':'<p class="form-footnote">'+ic("info",15)+'Captura y guarda la evaluación para añadir observaciones a cada punto.</p>');
 openModal("Detalle del punto anatómico","",body);
}
function openEvaluationDetail(ev){
 var m=ev.metrics;
 var body='<div class="evaluation-detail-overview"><div class="detail-photo"><img src="'+(ev.snapshot||previewSrc())+'" alt="Captura registrada" onerror="this.onerror=null;this.src=\'IMGFRONT\'"></div><div><span class="eyebrow">'+(ev.type==="rutina"?esc(ev.exercise||"Rutina"):"EVALUACIÓN POSTURAL")+'</span><h3>Vista '+ev.view.toLowerCase()+'</h3><p class="muted">'+fmt(ev.createdAt,true)+'</p>'+(ev.demo?'<span class="sample-badge">Muestra</span>':"")+
 (ev.score!=null?'<div class="detail-score"><div class="score-ring" style="width:90px;height:90px"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" class="ring-track"/><circle cx="50" cy="50" r="42" class="ring-progress" stroke-dasharray="264" stroke-dashoffset="'+(264*(1-ev.score/100))+'" transform="rotate(-90 50 50)"/></svg><div><strong>'+ev.score+'</strong><span>de 100</span></div></div><p>Índice experimental<br>de simetría frontal</p></div>':ev.type==="rutina"?'<div class="routine-detail-stats"><strong>'+ev.reps+'<small>repeticiones</small></strong><strong>'+ev.duration+'<small>segundos</small></strong></div>':"")+'</div></div>'+
 (m?'<div class="coordinate-grid">'+[["Hombros",m.shoulders],["Cadera",m.hips],["Eje corporal",m.axis]].map(function(x){return '<div><span>'+x[0]+'</span><strong>'+(x[1]==null?"—":x[1]+"°")+'</strong><small>Estimación 2D</small></div>';}).join("")+'</div>':"")+
 '<div class="detail-note"><h4>Observaciones profesionales</h4><p>'+esc(ev.notes||"Sin observaciones registradas.")+'</p></div>'+
 '<div class="flex-between"><h4>Los 33 puntos anatómicos</h4><button class="button compact" data-act="export-one" data-id="'+ev.id+'">'+ic("download",14)+'Exportar CSV</button></div>'+
 '<div class="table-scroll detail-landmarks"><table><thead><tr><th>Punto</th><th>X / Y / Z</th><th>Visibilidad</th><th></th></tr></thead><tbody>'+ev.points.map(function(p,i){return '<tr class="clickable-row" data-act="point-ev" data-id="'+ev.id+'" data-point="'+i+'"><td>'+L[i][0]+(ev.landmarkNotes&&ev.landmarkNotes[i]?'<span class="note-dot"></span>':"")+'</td><td class="mono">'+p.x.toFixed(3)+' / '+p.y.toFixed(3)+' / '+p.z.toFixed(3)+'</td><td>'+Math.round(p.v*100)+'%</td><td>'+ic("chevron",14)+'</td></tr>';}).join("")+'</tbody></table></div>'+
 '<p class="form-footnote">'+ic("info",14)+'Los ángulos y el índice son orientativos y no equivalen a un diagnóstico ni a una escala clínica validada.</p>';
 openModal("Detalle de la evaluación","",body,true);
}
function openAthleteModal(){
 var body='<form class="form-stack" data-form="athlete"><div class="form-notice">'+ic("user",19)+'<p>Crea un perfil para vincular sus evaluaciones y seguir su progreso.</p></div>'+
 '<label>Nombre completo<input name="name" required minlength="3" maxlength="100" placeholder="Ej. María Fernández"></label>'+
 '<div class="form-grid"><label>Edad <span>(años)</span><input name="age" type="number" required min="5" max="110" placeholder="26"></label><label>Sexo<select name="sex" required><option value="" disabled selected>Selecciona una opción</option><option>Masculino</option><option>Femenino</option><option>Otro / no especificado</option></select></label><label>Estatura <span>(cm)</span><input name="height" type="number" required min="50" max="250" step="0.1" placeholder="170"></label><label>Peso <span>(kg)</span><input name="weight" type="number" required min="10" max="350" step="0.1" placeholder="65"></label></div>'+
 '<label>Deporte o actividad<input name="sport" placeholder="Ej. Atletismo" maxlength="100"></label>'+
 '<p class="form-footnote">'+ic("shield",14)+'Este espacio no incluye autenticación. Evita ingresar información clínica sensible.</p>'+
 '<div class="modal-footer"><button type="submit" class="button primary">'+ic("check",16)+'Crear deportista</button></div></form>';
 openModal("Nuevo deportista","",body);
}
function openMeasurementModal(){
 var a=athlete();
 var groups=["Morfometría","Composición","Signos vitales"];
 var body='<form class="form-stack" data-form="measurement"><div class="form-notice">'+ic("ruler",20)+'<p><strong>'+esc(a.name)+'</strong> · Registro manual. Utiliza instrumentos adecuados; estos valores no se obtienen con la cámara.</p></div>'+
 '<div class="measurement-form-tabs">'+groups.map(function(g,i){return '<button type="button" class="'+(i===0?"active":"")+'" data-act="mgroup" data-group="'+g+'">'+g+'</button>';}).join("")+'</div>'+
 '<div class="form-grid measurement-inputs">'+F.map(function(f){return '<label data-group="'+f[3]+'">'+f[1]+'<span class="unit-input"><input type="number" name="'+f[0]+'" min="'+f[4]+'" max="'+f[5]+'" step="0.1" placeholder="Sin registrar"><span>'+f[2]+'</span></span><small>'+f[6]+'</small></label>';}).join("")+'</div>'+
 '<label>Observaciones y método de medición<textarea name="notes" rows="3" maxlength="4000" placeholder="Anota el equipo utilizado, las condiciones de medición y cualquier observación relevante…"></textarea></label>'+
 '<p class="form-footnote">'+ic("info",14)+'Puedes completar solo los campos que hayas medido. Se guardan juntos en un registro con fecha y hora.</p>'+
 '<div class="modal-footer"><button type="submit" class="button primary">'+ic("check",16)+'Guardar mediciones</button></div></form>';
 openModal("Añadir medición","",body,true);
 setTimeout(function(){var labels=$$('#modal-root .measurement-inputs label');labels.forEach(function(l){l.classList.toggle("visually-hidden-group",l.dataset.group!=="Morfometría");});},0);
}
function openHelp(){
 var steps=[["video","Prepara tu cámara","Permite el acceso en el navegador y elige una cámara HD. Apóyala a la altura de la cadera, sin inclinarla, y limpia la lente."],["focus","Encuadra el cuerpo completo","Mantén una distancia aproximada de 2–3 metros. Cabeza, manos y pies deben permanecer visibles."],["sun","Busca luz frontal y uniforme","Evita contraluces, ropa muy holgada y fondos con otras personas."],["user","Elige el plano correcto","Frontal para simetrías; lateral para flexión y extensión; posterior como apoyo visual."],["check","Revisa antes de guardar","Comprueba los puntos, añade tus observaciones y confirma la captura."]];
 var body='<div class="help-content"><div class="help-intro"><div class="help-3d-band help-3d-standalone">'+heroArt()+'<span>Escaneo visual de referencia</span></div><h3>Una buena captura hace la diferencia.</h3><p>Sigue estas recomendaciones para obtener un seguimiento más estable y reproducible.</p></div>'+
 steps.map(function(s,i){return '<div class="help-step"><span>'+ic(s[0],20)+'</span><div><h4><small>0'+(i+1)+'</small>'+s[1]+'</h4><p>'+s[2]+'</p></div></div>';}).join("")+
 '<div class="warning-notice">'+ic("heart",20)+'<p><strong>Una herramienta de apoyo, no un diagnóstico.</strong> Los ángulos son estimaciones 2D y dependen de la perspectiva, oclusiones y cámara. La puntuación es un indicador experimental de simetría frontal, no una escala clínica validada. Detén cualquier ejercicio si hay dolor y consulta a un profesional.</p></div>'+
 '<p class="form-footnote">'+ic("shield",14)+'El video se procesa localmente. Las capturas confirmadas se guardan en este navegador; no ingreses información clínica sensible.</p></div>';
 openModal("Guía para una evaluación precisa","",body,true);
}
function openSettings(){
 var body='<form class="form-stack" data-form="settings"><div class="form-notice">'+ic("settings",21)+'<p>Personaliza tu perfil profesional. Estas preferencias se guardan únicamente en este navegador.</p></div>'+
 '<label>Nombre profesional<input name="name" value="'+esc(state.profile.name)+'" required minlength="3" maxlength="80"></label><label>Especialidad o cargo<input name="role" value="'+esc(state.profile.role)+'" required maxlength="80"></label>'+
 '<div class="detail-note"><h4>Privacidad y almacenamiento</h4><p>Esta versión de un solo archivo no usa servidor: los registros se guardan en el almacenamiento local del navegador (localStorage). Si borras los datos del navegador, se perderán. Para conservarlos, exporta el CSV.</p></div>'+
 '<div class="modal-footer"><button type="submit" class="button primary">'+ic("check",16)+'Guardar preferencias</button></div></form>';
 openModal("Configuración de tu espacio","",body);
}
function openChooseAthlete(){
 var body='<div class="form-stack"><div class="search-input">'+ic("focus",17)+'<input id="choose-search" placeholder="Buscar deportista…" autofocus></div><div class="athlete-picker" id="choose-list">'+
 state.athletes.map(function(a){return '<button class="'+(a.id===state.athleteId?"selected":"")+'" data-act="select-athlete" data-id="'+a.id+'"><span class="athlete-avatar">'+initials(a.name)+'</span><span><strong>'+esc(a.name)+'</strong><small>'+a.age+' años · '+esc(a.sport)+(a.demo?" · Muestra":"")+'</small></span>'+(a.id===state.athleteId?ic("check",18):ic("chevron",16))+'</button>';}).join("")+
 '</div><button class="button full" data-act="athlete">'+ic("plus",16)+'Añadir nuevo deportista</button></div>';
 openModal("Seleccionar deportista","",body);
 setTimeout(function(){var s=$("#choose-search");if(s)s.addEventListener("input",function(){$$("#choose-list button").forEach(function(b){b.style.display=b.textContent.toLowerCase().indexOf(s.value.toLowerCase())>-1?"":"none";});});},0);
}
function openNewEvaluation(){
 var body='<form class="form-stack" data-form="new-eval"><p class="detail-description">Elige a quién evaluar y qué perspectiva necesitas. Tú decides cuándo activar la cámara.</p>'+
 '<label>Deportista<select name="athlete">'+state.athletes.map(function(a){return '<option value="'+a.id+'" '+(a.id===state.athleteId?"selected":"")+'>'+esc(a.name)+(a.demo?" · Muestra":"")+'</option>';}).join("")+'</select></label>'+
 '<label>Tipo de evaluación</label><div class="evaluation-type-picker"><button type="button" class="selected" data-act="newtype" data-type="postural">'+ic("scan",24)+'<strong>Postura estática</strong><span>Alineación y simetría corporal</span></button><button type="button" data-act="newtype" data-type="rutina">'+ic("dumbbell",24)+'<strong>Rutina de ejercicios</strong><span>Técnica durante el movimiento</span></button></div>'+
 '<label>Plano de evaluación<select name="view"><option>Frontal</option><option>Lateral</option><option>Posterior</option></select></label>'+
 '<div class="modal-footer"><button type="submit" class="button primary">Preparar evaluación'+ic("arrow",15)+'</button></div></form>';
 openModal("Nueva evaluación","",body);
}
function openDelete(id){
 var body='<div class="form-stack"><div class="delete-warning">'+ic("trash",28)+'</div><h3>¿Eliminar este registro?</h3><p class="detail-description">Se eliminarán la evaluación, su captura, los puntos y sus observaciones. Esta acción no se puede deshacer.</p><div class="modal-footer"><button class="button" data-act="close-modal">Cancelar</button><button class="button danger" data-act="delete-eval" data-id="'+id+'">'+ic("trash",16)+'Eliminar evaluación</button></div></div>';
 openModal("Eliminar evaluación","",body);
}
function openMeasurementDetail(id){
 var m=state.measurements.filter(function(x){return x.id===id;})[0];if(!m)return;
 var body='<div class="form-stack"><div class="flex-between"><p class="muted">'+fmt(m.createdAt,true)+'</p>'+(m.demo?'<span class="sample-badge">Muestra</span>':"")+'</div><div class="table-scroll"><table><thead><tr><th>Medición</th><th>Valor</th><th>Grupo</th></tr></thead><tbody>'+F.filter(function(f){return m.values[f[0]]!==undefined;}).map(function(f){return '<tr><td>'+f[1]+'</td><td><strong>'+m.values[f[0]]+' '+f[2]+'</strong></td><td>'+f[3]+'</td></tr>';}).join("")+'</tbody></table></div><div class="detail-note"><h4>Observaciones y método</h4><p>'+esc(m.notes||"Sin observaciones registradas.")+'</p></div></div>';
 openModal("Registro de mediciones","",body,true);
}
function openField(key){
 var f=F.filter(function(x){return x[0]===key;})[0];if(!f)return;
 var rows=meas().filter(function(m){return m.values[key]!==undefined;});
 var body='<div class="form-stack"><div class="form-notice">'+ic("ruler",21)+'<p>'+f[6]+'</p></div>'+(rows.length?'<div class="table-scroll"><table><thead><tr><th>Fecha</th><th>Valor</th><th>Método / observación</th></tr></thead><tbody>'+rows.map(function(r){return '<tr><td>'+fmt(r.createdAt,true)+(r.demo?'<div><span class="sample-badge">Muestra</span></div>':"")+'</td><td><strong>'+r.values[key]+' '+f[2]+'</strong></td><td>'+esc(r.notes||"No se especificó un método.")+'</td></tr>';}).join("")+'</tbody></table></div>':'<div class="empty-state"><span class="empty-icon">'+ic("ruler",27)+'</span><h3>Todavía no se ha medido</h3><p>Registra este valor usando el instrumento y la técnica adecuados.</p></div>')+'<div class="modal-footer"><button class="button primary" data-act="measurement">'+ic("plus",15)+'Nueva medición</button></div></div>';
 openModal(f[1],"",body,true);
}
function openNotifications(){
 var evs=state.evaluations.slice().sort(function(a,b){return new Date(b.createdAt)-new Date(a.createdAt);}).slice(0,3);
 var body='<div class="notifications-popover" style="position:static;width:100%;box-shadow:none;border:0;padding:0"><div class="flex-between"><h3>Tu actividad reciente</h3><span class="tiny-badge">'+evs.length+'</span></div>'+
 (evs.length?evs.map(function(e){return '<button data-act="eval-detail" data-id="'+e.id+'"><span class="activity-notification-icon">'+ic("scan",16)+'</span><span><strong>'+(e.type==="rutina"?esc(e.exercise||"Rutina"):"Evaluación postural")+'</strong><small>'+fmt(e.createdAt)+(e.demo?" · Muestra":"")+'</small></span>'+ic("chevron",14)+'</button>';}).join(""):'<p class="muted">No hay actividad todavía.</p>')+
 '<button class="notifications-all" data-act="nav" data-section="history">Ver todo el historial'+ic("arrow",13)+'</button></div>';
 openModal("Actividad","",body);
}

/* ─────────────────────────── Exportación ─────────────────────────── */
function download(name,rows){
 var csv="﻿"+rows.map(function(r){return r.map(function(c){return '"'+String(c==null?"":c).replace(/"/g,'""')+'"';}).join(";");}).join("\r\n");
 var url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8;"}));
 var a=document.createElement("a");a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(url);},1000);
}
function exportCurrent(){
 if(section==="history"){
  var rows=[["Fecha","Tipo","Detalle","Índice orientativo","Muestra","Observaciones"]];
  state.evaluations.forEach(function(e){rows.push([fmt(e.createdAt,true),e.type==="rutina"?(e.exercise||"Rutina"):"Evaluación postural",e.view+" · "+e.points.length+" puntos",e.score,e.demo?"Sí":"No",e.notes]);});
  state.measurements.forEach(function(m){rows.push([fmt(m.createdAt,true),"Medición morfo/biométrica",Object.keys(m.values).length+" campos","",m.demo?"Sí":"No",m.notes]);});
  download("historial-evaluaciones.csv",rows);return;
 }
 var ev=evals()[0];
 if(!ev){toast("No hay evaluaciones para exportar.",true);return;}
 exportOne(ev.id);
}
function exportOne(id){
 var ev=state.evaluations.filter(function(e){return e.id===id;})[0];if(!ev)return;
 var rows=[["Fecha",fmt(ev.createdAt,true)],["Tipo",ev.type],["Vista",ev.view],["Es muestra",ev.demo?"Sí":"No"],["Observaciones",ev.notes],[],["ID","Punto anatómico","Región","X","Y","Z","Visibilidad","Observación individual"]];
 ev.points.forEach(function(p,i){rows.push([i,L[i][0],L[i][1],p.x,p.y,p.z,p.v,(ev.landmarkNotes&&ev.landmarkNotes[i])||""]);});
 download("evaluacion-"+ev.id+".csv",rows);
}

/* ─────────────────────────── Sesión de rutinas ─────────────────────────── */
function startSession(){
 var ready=frame.metrics||cam.on;
 if(!cam.on){startCamera().then(function(){if(cam.on)runSession();else toast("Activa la cámara para analizar el movimiento.",true);});return;}
 runSession();
}
function runSession(){
 session.active=true;session.started=true;session.phase="Buscando el movimiento…";session.phaseState="up";session.lastCount=0;
 clearInterval(session.tick);
 session.tick=setInterval(function(){if(!session.active)return;session.seconds++;updateSession();},1000);
 render();
}
function pauseSession(){session.active=false;clearInterval(session.tick);session.phase="Evaluación en pausa";render();}
function finishSession(){
 if(!session.lastGood){toast("Todavía no hay una lectura válida. Mantén el cuerpo visible para guardar la sesión.",true);return;}
 var ex=EX.filter(function(e){return e.id===selectedExercise;})[0];
 var fr=session.lastGood;
 session.active=false;clearInterval(session.tick);session.started=false;
 var rec={id:uid(),athleteId:athlete().id,type:"rutina",view:view,demo:fr.source==="demo",score:fr.metrics&&fr.metrics.score,points:fr.points,metrics:fr.metrics,notes:"Sesión guardada desde la pestaña de rutinas.",landmarkNotes:{},snapshot:fr.snapshot||null,exercise:ex.name,reps:session.reps,duration:session.seconds,createdAt:new Date().toISOString()};
 state.evaluations.unshift(rec);persist();
 session.reps=0;session.seconds=0;session.angle=null;session.lastGood=null;
 stopCamera();toast("Sesión guardada: "+ex.name+", "+rec.reps+" repeticiones.");
}
function updateSession(){
 var el=$$(".routine-counters strong");if(el.length)el[1].textContent=String(Math.floor(session.seconds/60)).padStart(2,"0")+":"+String(session.seconds%60).padStart(2,"0");
}
function onRoutineFrame(fr){
 session.lastGood=fr;
 if(!session.active||!fr.metrics)return;
 var ex=selectedExercise,val=null;
 if(ex==="plank"){
  var p=fr.points,side=(p[11]&&p[11].v>p[12]?[11,23,27]:[12,24,28]);
  if(p[side[0]]&&p[side[0]].v>=.55&&p[side[1]]&&p[side[2]])val=angle(p[side[0]],p[side[1]],p[side[2]],fr.width/fr.height);
 }else{
  var m=fr.metrics,vals=[];
  if(ex==="press"){if(m.leftElbow!=null)vals.push(m.leftElbow);if(m.rightElbow!=null)vals.push(m.rightElbow);}
  else{if(m.leftKnee!=null)vals.push(m.leftKnee);if(m.rightKnee!=null)vals.push(m.rightKnee);}
  if(vals.length)val=ex==="lunge"?Math.min.apply(null,vals):vals.reduce(function(a,b){return a+b;},0)/vals.length;
 }
 session.angle=val==null?null:Math.round(val);
 var mon=$(".angle-monitor strong");if(mon)mon.innerHTML=(session.angle==null?"—":session.angle)+'<small>°</small>';
 if(val==null)return;
 if(ex==="plank"){session.phase=val>=160?"Mantén la alineación":"Revisa la altura de tu cadera";}
 else{
  var lower=ex==="press"?105:115;
  if(val<lower){session.phaseState="down";session.phase=ex==="press"?"Posición de inicio":"Fase de descenso";}
  if(val>155&&session.phaseState==="down"&&Date.now()-session.lastCount>700){session.phaseState="up";session.lastCount=Date.now();session.reps++;session.phase="Repetición completada";
   var rc=$$(".routine-counters strong")[0];if(rc&&ex!=="plank")rc.textContent=String(session.reps).padStart(2,"0");}
 }
 var ph=$(".movement-phase");if(ph)ph.innerHTML=ic("activity",16)+(session.active?(frame.metrics?session.phase:"Reencuadra el cuerpo completo"):session.started?"En pausa":"Activa la cámara para analizar");
}

/* ─────────────────────────── Eventos globales ─────────────────────────── */
document.addEventListener("click",function(e){
 var t=e.target.closest("[data-act]");if(!t)return;
 var act=t.getAttribute("data-act");
 if(act==="nav"){section=t.getAttribute("data-section");document.body.dataset.menu="0";closeModal();stopCamera();render();window.scrollTo({top:0,behavior:"smooth"});return;}
 if(act==="toggle-menu"){document.body.dataset.menu=document.body.dataset.menu==="1"?"0":"1";render();return;}
 if(act==="close-modal"){closeModal();return;}
 if(act==="close-toast"){$("#toast-root").innerHTML="";return;}
 if(act==="help"){closeModal();openHelp();return;}
 if(act==="settings"){closeModal();openSettings();return;}
 if(act==="notifications"){openNotifications();return;}
 if(act==="new-eval"){openNewEvaluation();return;}
 if(act==="choose-athlete"){openChooseAthlete();return;}
 if(act==="athlete"){closeModal();openAthleteModal();return;}
 if(act==="measurement"){closeModal();openMeasurementModal();return;}
 if(act==="select-athlete"){state.athleteId=t.getAttribute("data-id");persist();closeModal();section="posture";render();return;}
 if(act==="view"){view=t.getAttribute("data-view");render();return;}
 if(act==="cam-settings"){cam.settings=!cam.settings;render();return;}
 if(act==="start-camera"){startCamera();return;}
 if(act==="stop-camera"){stopCamera();return;}
 if(act==="switch-camera"){switchCamera();return;}
 if(act==="upload"){$("#file-input").click();return;}
 if(act==="capture"){requestCapture();return;}
 if(act==="toggle-points"){cam.pointsVisible=!cam.pointsVisible;render();return;}
 if(act==="toggle-guides"){cam.guides=!cam.guides;render();return;}
 if(act==="fullscreen"){var card=$("#camera-card");if(document.fullscreenElement)document.exitFullscreen();else if(card&&card.requestFullscreen)card.requestFullscreen().catch(function(){toast("La pantalla completa no está disponible en este navegador.",true);});return;}
 if(act==="dismiss-error"){cam.error="";render();return;}
 if(act==="rectab"){recTab=t.getAttribute("data-tab");refreshRecords();return;}
 if(act==="histtab"){histTab=t.getAttribute("data-tab");render();return;}
 if(act==="export"){exportCurrent();return;}
 if(act==="export-one"){exportOne(t.getAttribute("data-id"));return;}
 if(act==="point"){openPointDetail(Number(t.getAttribute("data-point")),evals()[0]);return;}
 if(act==="point-ev"){var ev=state.evaluations.filter(function(x){return x.id===t.getAttribute("data-id");})[0];if(ev)openPointDetail(Number(t.getAttribute("data-point")),ev);return;}
 if(act==="eval-detail"){var ev2=state.evaluations.filter(function(x){return x.id===t.getAttribute("data-id");})[0];if(ev2){closeModal();openEvaluationDetail(ev2);}return;}
 if(act==="measurement-detail"){openMeasurementDetail(t.getAttribute("data-id"));return;}
 if(act==="field"){openField(t.getAttribute("data-key"));return;}
 if(act==="ask-delete"){e.stopPropagation();openDelete(t.getAttribute("data-id"));return;}
 if(act==="delete-eval"){var id=t.getAttribute("data-id");state.evaluations=state.evaluations.filter(function(x){return x.id!==id;});persist();closeModal();render();toast("Evaluación eliminada.");return;}
 if(act==="exercise"){selectedExercise=t.getAttribute("data-id");session.reps=0;session.seconds=0;session.angle=null;render();return;}
 if(act==="start-session"){startSession();return;}
 if(act==="pause-session"){pauseSession();return;}
 if(act==="finish-session"){finishSession();return;}
 if(act==="save-capture"){
  var fr=window.__pendingCapture;if(!fr)return;
  var ack=$("#cap-ack");if(ack&&!ack.checked){toast("Confirma que entiendes que el registro es una muestra.",true);return;}
  var notes=$("#cap-notes")?$("#cap-notes").value:"";
  var demo=fr.source==="demo";
  var rec={id:uid(),athleteId:athlete().id,type:fr.routine?"rutina":"postural",view:view,demo:demo,score:fr.metrics?fr.metrics.score:null,points:fr.points,metrics:fr.metrics,notes:notes,landmarkNotes:{},snapshot:fr.snapshot||null,exercise:fr.routine?fr.routine.name:null,reps:fr.routine?fr.routine.reps:0,duration:fr.routine?fr.routine.duration:0,createdAt:new Date().toISOString()};
  state.evaluations.unshift(rec);persist();closeModal();render();toast(demo?"Muestra guardada correctamente.":"Evaluación guardada correctamente.");return;
 }
 if(act==="save-note"){
  var ev3=state.evaluations.filter(function(x){return x.id===t.getAttribute("data-id");})[0];if(!ev3)return;
  ev3.landmarkNotes=ev3.landmarkNotes||{};ev3.landmarkNotes[t.getAttribute("data-point")]=$("#point-note")?$("#point-note").value:"";
  persist();closeModal();render();toast("Observación del punto guardada.");return;
 }
 if(act==="mgroup"){
  var g=t.getAttribute("data-group");
  $$("#modal-root .measurement-form-tabs button").forEach(function(b){b.classList.toggle("active",b===t);});
  $$("#modal-root .measurement-inputs label").forEach(function(l){l.classList.toggle("visually-hidden-group",l.dataset.group!==g);});
  return;
 }
 if(act==="newtype"){
  $$("#modal-root .evaluation-type-picker button").forEach(function(b){b.classList.toggle("selected",b===t);});
  return;
 }
});
document.addEventListener("submit",function(e){
 var form=e.target.closest("[data-form]");if(!form)return;e.preventDefault();
 var kind=form.getAttribute("data-form"),d=new FormData(form);
 if(kind==="athlete"){
  var name=String(d.get("name")||"").trim();
  if(name.length<3){toast("Introduce un nombre de al menos 3 caracteres.",true);return;}
  var a={id:uid(),name:name,age:Number(d.get("age")),sex:String(d.get("sex")),sport:String(d.get("sport")||"General"),height:Number(d.get("height")),weight:Number(d.get("weight")),demo:false};
  state.athletes.push(a);state.athleteId=a.id;persist();closeModal();section="posture";render();toast("Deportista creado correctamente.");return;
 }
 if(kind==="measurement"){
  var values={},any=false;
  F.forEach(function(f){var v=d.get(f[0]);if(v!==null&&v!==""){var n=Number(v);if(!isFinite(n)||n<f[4]||n>f[5]){toast(f[1]+": introduce un número entre "+f[4]+" y "+f[5]+".",true);throw new Error("valid");}values[f[0]]=n;any=true;}});
  if(!any){toast("Añade al menos una medición.",true);return;}
  if(values.systolic&&values.diastolic&&values.systolic<=values.diastolic){toast("La presión sistólica debe ser mayor que la diastólica.",true);return;}
  state.measurements.unshift({id:uid(),athleteId:athlete().id,demo:false,notes:String(d.get("notes")||""),values:values,createdAt:new Date().toISOString()});
  persist();closeModal();section="biometrics";render();toast("Registro guardado correctamente.");return;
 }
 if(kind==="settings"){
  state.profile={name:String(d.get("name")),role:String(d.get("role"))};persist();closeModal();render();toast("Preferencias guardadas en este navegador.");return;
 }
 if(kind==="new-eval"){
  state.athleteId=String(d.get("athlete"));
  var type=$("#modal-root .evaluation-type-picker button.selected");
  var nt=type?type.getAttribute("data-type"):"postural";
  view=String(d.get("view")||"Frontal");
  persist();closeModal();section=nt==="rutina"?"routines":"posture";render();
  toast("Evaluación preparada. Activa la cámara cuando estés listo.");return;
 }
});
// cierre al pulsar el fondo
document.addEventListener("mousedown",function(e){if(e.target.hasAttribute&&e.target.hasAttribute("data-backdrop"))closeModal();});
// pulsación de puntos con teclado
document.addEventListener("keydown",function(e){if((e.key==="Enter"||e.key===" ")&&e.target.classList&&e.target.classList.contains("skeleton-point")){e.preventDefault();e.target.click();}});

/* ─────────────────────────── Arranque ─────────────────────────── */
var originalSetFrame=setFrame;
setFrame=function(next){
 frame=next;
 if($("#pose-svg"))drawOverlay(frame.source!=="camera");
 updateSummary();updateTracking();
 if(section==="routines")onRoutineFrame(frame);
};
function updateSummary(){
 var host=$(".posture-aside");if(!host)return;
 var sig=view+"|"+JSON.stringify(frame.metrics);
 if(sig===updateSummary._sig)return;
 updateSummary._sig=sig;
 host.innerHTML=postureSummary()+tipsCard();
 $$("[data-count]",host).forEach(function(n){countTo(n,Number(n.getAttribute("data-count")),0);});
}
function updateTracking(){
 var info=$(".tracking-info div");if(!info)return;
 var src=cam.on?"camera":cam.uploaded?"upload":"demo";
 var visible=frame.points.filter(function(p){return p.v>.55;}).length;
 info.innerHTML="<strong>"+(src==="demo"?"33 puntos de referencia":visible+" de 33 puntos visibles")+"</strong><span>"+(src==="demo"?"Explora el análisis con una muestra":frame.metrics?"Seguimiento activo y estabilizado":"Buscando una postura completa")+"</span>";
 var badge=$(".resolution-badge");if(badge&&src==="camera"&&frame.width)badge.firstChild.textContent=frame.width+" × "+frame.height;
}
window.addEventListener("offline",function(){toast("Sin conexión: la cámara analizará cuando vuelvas a tener red.",true);});
render();
})();
