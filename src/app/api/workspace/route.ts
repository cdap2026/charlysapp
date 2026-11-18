import { db } from "@/db";
import { athletes, evaluations, measurements } from "@/db/schema";
import { ensureSeed, getDashboardData } from "@/lib/store";
import { calculateMetrics, DEMO_METRICS, EXERCISES, MEASURE_FIELDS } from "@/lib/pose";
import type { PosePoint, View } from "@/lib/types";
import { eq } from "drizzle-orm";

export const dynamic="force-dynamic";
class InputError extends Error {}
const text=(v:unknown,max=200)=>typeof v==="string"?v.trim().slice(0,max):"";
const numeric=(v:unknown,min:number,max:number)=>{ const n=Number(v);if(v===null||v===""||!Number.isFinite(n)||n<min||n>max)throw new InputError(`Introduce un número entre ${min} y ${max}.`);return n; };
const validId=(v:unknown)=>{const s=text(v);if(!/^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.test(s))throw new InputError("Identificador no válido.");return s;};

export async function GET() {
  try { return Response.json(await getDashboardData()); }
  catch(e) { console.error("Workspace GET",e);return Response.json({error:"No se pudieron cargar los registros. Intenta de nuevo."},{status:500}); }
}
export async function POST(request:Request) {
  try {
    const raw=await request.text();if(raw.length>4000000)return Response.json({error:"La imagen supera el tamaño permitido."},{status:413});
    const body=JSON.parse(raw) as Record<string,unknown>;
    if(!body||typeof body!=="object")throw new InputError("Solicitud no válida.");
    await ensureSeed();
    if(body.action==="createAthlete") {
      const name=text(body.name,100);if(name.length<3)throw new InputError("Introduce un nombre de al menos 3 caracteres.");
      const sex=text(body.sex);if(!["Masculino","Femenino","Otro / no especificado"].includes(sex))throw new InputError("Selecciona una opción de sexo.");
      const [athlete]=await db.insert(athletes).values({name,age:Math.round(numeric(body.age,5,110)),sex,sport:text(body.sport,100)||"General",height:numeric(body.height,50,250),weight:numeric(body.weight,10,350),demo:false}).returning();
      return Response.json({ok:true,id:athlete.id});
    }
    if(body.action==="deleteEvaluation") {
      await db.delete(evaluations).where(eq(evaluations.id,validId(body.id)));return Response.json({ok:true});
    }
    if(body.action==="updatePointNote") {
      const id=validId(body.id),pointId=Math.round(numeric(body.pointId,0,32));
      const [record]=await db.select().from(evaluations).where(eq(evaluations.id,id));
      if(!record)throw new InputError("No se encontró la evaluación.");
      await db.update(evaluations).set({landmarkNotes:{...record.landmarkNotes,[String(pointId)]:text(body.notes,2000)}}).where(eq(evaluations.id,id));
      return Response.json({ok:true});
    }
    const athleteId=validId(body.athleteId);
    const [athlete]=await db.select({id:athletes.id}).from(athletes).where(eq(athletes.id,athleteId));
    if(!athlete)throw new InputError("El deportista no existe.");
    if(body.action==="saveMeasurement") {
      if(!body.values||typeof body.values!=="object"||Array.isArray(body.values))throw new InputError("Añade al menos una medición.");
      const input=body.values as Record<string,unknown>, values:Record<string,number>={};
      for(const field of MEASURE_FIELDS)if(input[field.key]!==undefined&&input[field.key]!=="")values[field.key]=numeric(input[field.key],field.min,field.max);
      if(!Object.keys(values).length)throw new InputError("Añade al menos una medición.");
      if(values.systolic&&values.diastolic&&values.systolic<=values.diastolic)throw new InputError("La presión sistólica debe ser mayor que la diastólica.");
      const [record]=await db.insert(measurements).values({athleteId,values,notes:text(body.notes,4000),demo:false}).returning({id:measurements.id});
      return Response.json({ok:true,id:record.id});
    }
    if(body.action==="saveEvaluation") {
      if(!Array.isArray(body.landmarks)||body.landmarks.length!==33)throw new InputError("Se requieren los 33 puntos anatómicos. Asegúrate de que todo el cuerpo sea visible.");
      const points:PosePoint[]=body.landmarks.map((v:unknown)=>{if(!v||typeof v!=="object")throw new InputError("Punto no válido.");const p=v as Record<string,unknown>;return {x:numeric(p.x,-5,5),y:numeric(p.y,-5,5),z:numeric(p.z,-10,10),visibility:numeric(p.visibility,0,1)};});
      const view=text(body.view) as View;if(!["Frontal","Lateral","Posterior"].includes(view))throw new InputError("Vista no válida.");
      const type=body.type==="rutina"?"rutina":"postural", demo=body.demo===true;
      const aspect=body.aspect===undefined?1.5:numeric(body.aspect,.2,5);
      const metrics=demo?DEMO_METRICS:calculateMetrics(points,aspect);
      if(!demo&&!metrics)throw new InputError("La visibilidad es insuficiente. Encuadra el cuerpo completo antes de guardar.");
      const snapshot=typeof body.snapshot==="string"&&body.snapshot.startsWith("data:image/")?body.snapshot:null;
      if(snapshot&&(!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(snapshot)||snapshot.length>3000000))throw new InputError("Formato o tamaño de captura no válido.");
      const exercise=type==="rutina"?text(body.exercise):null;
      if(type==="rutina"&&!EXERCISES.some(e=>e.name===exercise))throw new InputError("Ejercicio no válido.");
      const repetitions=Math.round(numeric(body.repetitions??0,0,10000)),durationSeconds=Math.round(numeric(body.durationSeconds??0,0,14400));
      const [record]=await db.insert(evaluations).values({athleteId,type,view,demo,landmarks:points,metrics,score:view==="Frontal"&&type==="postural"?metrics?.score??null:null,notes:text(body.notes,4000),snapshot,exercise,repetitions,durationSeconds}).returning({id:evaluations.id});
      return Response.json({ok:true,id:record.id});
    }
    throw new InputError("Acción no reconocida.");
  } catch(e) {
    if(e instanceof InputError||e instanceof SyntaxError)return Response.json({error:e instanceof SyntaxError?"Solicitud JSON no válida.":e.message},{status:400});
    console.error("Workspace POST",e);return Response.json({error:"No se pudo guardar el registro. Tus cambios no se han guardado. Vuelve a intentarlo."},{status:500});
  }
}
