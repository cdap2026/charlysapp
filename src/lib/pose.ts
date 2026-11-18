import type { PoseMetrics, PosePoint } from "./types";

const definitions: [string, string, string][] = [
  ["Nariz", "Cabeza", "Referencia central del rostro; ayuda a observar la orientación de la cabeza."],
  ["Ojo izquierdo · interno", "Cabeza", "Comisura interna del ojo izquierdo."],
  ["Ojo izquierdo", "Cabeza", "Centro aproximado del ojo izquierdo."],
  ["Ojo izquierdo · externo", "Cabeza", "Comisura externa del ojo izquierdo."],
  ["Ojo derecho · interno", "Cabeza", "Comisura interna del ojo derecho."],
  ["Ojo derecho", "Cabeza", "Centro aproximado del ojo derecho."],
  ["Ojo derecho · externo", "Cabeza", "Comisura externa del ojo derecho."],
  ["Oreja izquierda", "Cabeza", "Referencia lateral izquierda para observar la posición cefálica."],
  ["Oreja derecha", "Cabeza", "Referencia lateral derecha para observar la posición cefálica."],
  ["Comisura labial izquierda", "Cabeza", "Extremo izquierdo de la boca."],
  ["Comisura labial derecha", "Cabeza", "Extremo derecho de la boca."],
  ["Hombro izquierdo", "Tren superior", "Centro articular estimado del hombro izquierdo; referencia de simetría escapular."],
  ["Hombro derecho", "Tren superior", "Centro articular estimado del hombro derecho; referencia de simetría escapular."],
  ["Codo izquierdo", "Tren superior", "Centro articular estimado; permite calcular la flexión del codo izquierdo."],
  ["Codo derecho", "Tren superior", "Centro articular estimado; permite calcular la flexión del codo derecho."],
  ["Muñeca izquierda", "Tren superior", "Referencia distal del antebrazo izquierdo."],
  ["Muñeca derecha", "Tren superior", "Referencia distal del antebrazo derecho."],
  ["Meñique izquierdo", "Manos", "Referencia del quinto dedo de la mano izquierda."],
  ["Meñique derecho", "Manos", "Referencia del quinto dedo de la mano derecha."],
  ["Índice izquierdo", "Manos", "Referencia del segundo dedo de la mano izquierda."],
  ["Índice derecho", "Manos", "Referencia del segundo dedo de la mano derecha."],
  ["Pulgar izquierdo", "Manos", "Referencia del primer dedo de la mano izquierda."],
  ["Pulgar derecho", "Manos", "Referencia del primer dedo de la mano derecha."],
  ["Cadera izquierda", "Tren inferior", "Centro articular estimado de la cadera izquierda; no equivale a una referencia ósea palpada."],
  ["Cadera derecha", "Tren inferior", "Centro articular estimado de la cadera derecha; no equivale a una referencia ósea palpada."],
  ["Rodilla izquierda", "Tren inferior", "Centro estimado de la rodilla izquierda para observar el eje de la extremidad."],
  ["Rodilla derecha", "Tren inferior", "Centro estimado de la rodilla derecha para observar el eje de la extremidad."],
  ["Tobillo izquierdo", "Tren inferior", "Centro aproximado del tobillo izquierdo."],
  ["Tobillo derecho", "Tren inferior", "Centro aproximado del tobillo derecho."],
  ["Talón izquierdo", "Pies", "Referencia posterior del pie izquierdo."],
  ["Talón derecho", "Pies", "Referencia posterior del pie derecho."],
  ["Punta del pie izquierdo", "Pies", "Referencia anterior del pie izquierdo, cerca del segundo metatarsiano."],
  ["Punta del pie derecho", "Pies", "Referencia anterior del pie derecho, cerca del segundo metatarsiano."],
];
export const LANDMARKS = definitions.map(([name, region, description], id) => ({ id, name, region, description }));
export const CONNECTIONS = [[0,7],[0,8],[11,12],[11,13],[13,15],[15,17],[15,19],[15,21],[12,14],[14,16],[16,18],[16,20],[16,22],[11,23],[12,24],[23,24],[23,25],[25,27],[27,29],[29,31],[27,31],[24,26],[26,28],[28,30],[30,32],[28,32]];
const positions = [[.5,.131],[.509,.113],[.517,.113],[.523,.114],[.491,.113],[.483,.113],[.477,.114],[.526,.128],[.474,.128],[.51,.151],[.49,.151],[.561,.256],[.44,.253],[.578,.4],[.422,.397],[.575,.538],[.422,.537],[.566,.566],[.431,.565],[.568,.565],[.431,.564],[.568,.548],[.43,.548],[.538,.533],[.462,.532],[.543,.701],[.459,.7],[.546,.88],[.451,.88],[.543,.928],[.455,.928],[.563,.951],[.436,.951]];
export const DEMO_POINTS: PosePoint[] = positions.map(([x,y], i) => ({ x, y, z: i < 11 ? -.16 : i < 23 ? -.06 : 0.01, visibility: .97 + (i % 3) * .009 }));
export const DEMO_METRICS: PoseMetrics = { shoulders: 1.2, hips: .8, knees: 2.4, axis: .5, leftKnee: 177.6, rightKnee: 178.1, leftElbow: 176.2, rightElbow: 177.3, confidence: 98, score: 92 };
const round = (n: number) => Math.round(n * 10) / 10;
export function jointAngle(a: PosePoint, b: PosePoint, c: PosePoint, aspect: number) {
  const ux = (a.x-b.x)*aspect, uy=a.y-b.y, vx=(c.x-b.x)*aspect, vy=c.y-b.y;
  const denominator = Math.hypot(ux,uy)*Math.hypot(vx,vy);
  return denominator ? round(Math.acos(Math.max(-1,Math.min(1,(ux*vx+uy*vy)/denominator)))*180/Math.PI) : 0;
}
export function calculateMetrics(p: PosePoint[], aspect = 1.5): PoseMetrics | null {
  if(p.length!==33)return null;
  const visible=(...ids:number[])=>ids.every(i=>p[i].visibility>=.55);
  const left=visible(11,23,25,27),right=visible(12,24,26,28);
  if(!left&&!right)return null;
  const tilt=(a:number,b:number)=>visible(a,b)?round(Math.atan2(Math.abs(p[a].y-p[b].y),Math.abs(p[a].x-p[b].x)*aspect)*180/Math.PI):null;
  const shoulders=tilt(11,12),hips=tilt(23,24);
  const top=left&&right?{x:(p[11].x+p[12].x)/2,y:(p[11].y+p[12].y)/2}:p[left?11:12];
  const bottom=left&&right?{x:(p[27].x+p[28].x)/2,y:(p[27].y+p[28].y)/2}:p[left?27:28];
  const axis=round(Math.atan2(Math.abs(top.x-bottom.x)*aspect,Math.abs(top.y-bottom.y))*180/Math.PI);
  const angle=(a:number,b:number,c:number)=>visible(a,b,c)?jointAngle(p[a],p[b],p[c],aspect):null;
  const leftKnee=angle(23,25,27),rightKnee=angle(24,26,28);
  const knees=leftKnee!==null&&rightKnee!==null?round((Math.abs(180-leftKnee)+Math.abs(180-rightKnee))/2):null;
  const confidence=Math.round(p.reduce((sum,point)=>sum+point.visibility,0)/p.length*100);
  const score=shoulders!==null&&hips!==null&&knees!==null?Math.max(0,Math.min(100,Math.round(100-shoulders*1.4-hips*1.4-axis*2-knees*.7))):null;
  return {shoulders,hips,knees,axis,leftKnee,rightKnee,leftElbow:angle(11,13,15),rightElbow:angle(12,14,16),confidence,score};
}

export const MEASURE_FIELDS = [
  { key:"height",name:"Estatura",unit:"cm",group:"Morfometría",min:50,max:250,description:"Medir de pie, sin calzado, con estadímetro." },
  { key:"weight",name:"Peso corporal",unit:"kg",group:"Morfometría",min:10,max:350,description:"Medir con báscula calibrada y ropa ligera." },
  { key:"waist",name:"Perímetro de cintura",unit:"cm",group:"Morfometría",min:20,max:250,description:"Cinta horizontal entre la última costilla y la cresta ilíaca, al final de una espiración normal." },
  { key:"hip",name:"Perímetro de cadera",unit:"cm",group:"Morfometría",min:20,max:250,description:"Cinta horizontal sobre la mayor prominencia glútea." },
  { key:"chest",name:"Perímetro torácico",unit:"cm",group:"Morfometría",min:20,max:250,description:"Registrar con cinta horizontal y respiración normal." },
  { key:"armLeft",name:"Brazo izquierdo",unit:"cm",group:"Morfometría",min:5,max:100,description:"Perímetro a nivel medio del brazo relajado." },
  { key:"armRight",name:"Brazo derecho",unit:"cm",group:"Morfometría",min:5,max:100,description:"Perímetro a nivel medio del brazo relajado." },
  { key:"thighLeft",name:"Muslo izquierdo",unit:"cm",group:"Morfometría",min:10,max:150,description:"Perímetro del muslo, anotando un punto de referencia reproducible." },
  { key:"thighRight",name:"Muslo derecho",unit:"cm",group:"Morfometría",min:10,max:150,description:"Perímetro del muslo, anotando un punto de referencia reproducible." },
  { key:"calfLeft",name:"Pantorrilla izquierda",unit:"cm",group:"Morfometría",min:5,max:100,description:"Perímetro máximo de la pantorrilla." },
  { key:"calfRight",name:"Pantorrilla derecha",unit:"cm",group:"Morfometría",min:5,max:100,description:"Perímetro máximo de la pantorrilla." },
  { key:"bodyFat",name:"Grasa corporal",unit:"%",group:"Composición",min:2,max:65,description:"Ingresar el valor de un equipo validado y anotar el método utilizado. No se estima con la cámara." },
  { key:"muscleMass",name:"Masa muscular",unit:"kg",group:"Composición",min:1,max:150,description:"Valor obtenido mediante una evaluación de composición corporal; anotar el método." },
  { key:"heartRate",name:"Frecuencia cardíaca",unit:"lpm",group:"Signos vitales",min:25,max:240,description:"Medir en reposo con dispositivo apropiado o pulso manual durante 60 segundos." },
  { key:"systolic",name:"Presión sistólica",unit:"mmHg",group:"Signos vitales",min:50,max:260,description:"Medir con tensiómetro validado, tras al menos 5 minutos de reposo." },
  { key:"diastolic",name:"Presión diastólica",unit:"mmHg",group:"Signos vitales",min:30,max:180,description:"Componente diastólico de la medición con tensiómetro." },
  { key:"spo2",name:"Saturación de oxígeno",unit:"%",group:"Signos vitales",min:50,max:100,description:"Lectura de pulsioxímetro estable, con la mano tibia y en reposo." },
];
export const EXERCISES = [
  { id:"squat" as const,name:"Sentadilla",category:"Tren inferior",color:"mint",view:"Lateral" as const,description:"Control de rodillas, cadera y tronco.",cues:["Pies firmes, separados al ancho de los hombros.","Flexiona la cadera y las rodillas de forma controlada.","Mantén las rodillas alineadas con los pies.","Vuelve a la posición inicial sin bloquear las rodillas."],metric:"Flexión de rodilla",target:"80–110° en el descenso" },
  { id:"lunge" as const,name:"Zancada",category:"Estabilidad",color:"peach",view:"Lateral" as const,description:"Equilibrio y simetría del movimiento.",cues:["Da un paso amplio y mantén el tronco erguido.","Desciende de forma vertical y controlada.","Evita el colapso de la rodilla hacia dentro.","Vuelve a la posición inicial antes de repetir."],metric:"Flexión de rodilla",target:"80–110° en el descenso" },
  { id:"press" as const,name:"Press de hombros",category:"Tren superior",color:"lavender",view:"Frontal" as const,description:"Rango articular y control de hombros.",cues:["Mantén el abdomen activo y la pelvis estable.","Comienza con los codos flexionados.","Eleva los brazos con un movimiento simétrico.","Baja de forma lenta, sin arquear la espalda."],metric:"Extensión de codo",target:"Más de 155° al elevar" },
  { id:"plank" as const,name:"Plancha",category:"Core",color:"blue",view:"Lateral" as const,description:"Alineación corporal y control del core.",cues:["Apoya los antebrazos bajo los hombros.","Mantén cadera, hombros y tobillos en una línea.","Evita hundir la zona lumbar o elevar la cadera.","Respira con normalidad; detente si hay dolor."],metric:"Ángulo de cadera",target:"160–180° de alineación" },
];
export function formatDate(value: string, withTime=false) { return new Intl.DateTimeFormat("es",{ day:"2-digit",month:"short",year:"numeric",...(withTime?{hour:"2-digit",minute:"2-digit"}:{}) }).format(new Date(value)); }
export function initials(name: string) { return name.split(" ").slice(0,2).map(s=>s[0]).join(""); }
export function downloadCSV(filename: string, rows: (string|number|null)[][]) {
  const text="\uFEFF"+rows.map(row=>row.map(cell=>'"'+String(cell??"").replaceAll('"','""')+'"').join(";")).join("\r\n");
  const url=URL.createObjectURL(new Blob([text],{type:"text/csv;charset=utf-8;"}));const a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url);
}
