import { db } from "@/db";
import { athletes, evaluations, measurements } from "@/db/schema";
import { desc } from "drizzle-orm";
import { DEMO_METRICS, DEMO_POINTS } from "./pose";
import type { DashboardData } from "./types";

const demoAthletes = [
  {id:"00000000-0000-4000-8000-000000000001",name:"Mateo López",age:26,sex:"Masculino",sport:"Entrenamiento funcional",height:178,weight:74,demo:true},
  {id:"00000000-0000-4000-8000-000000000002",name:"Valentina Torres",age:24,sex:"Femenino",sport:"Atletismo",height:166,weight:58,demo:true},
  {id:"00000000-0000-4000-8000-000000000003",name:"Daniel García",age:31,sex:"Masculino",sport:"Ciclismo",height:182,weight:79,demo:true},
];
let seeded = false;
export async function ensureSeed() {
  if (seeded) return;
  await db.insert(athletes).values(demoAthletes).onConflictDoNothing();
  const day=86400000, now=Date.now();
  await db.insert(evaluations).values([
    {id:"00000000-0000-4000-8000-000000000101",athleteId:demoAthletes[0].id,type:"postural" as const,view:"Frontal" as const,demo:true,score:92,landmarks:DEMO_POINTS,metrics:DEMO_METRICS,notes:"Registro de demostración. Se observa una ligera asimetría de rodillas. Los valores son ilustrativos, no corresponden a una evaluación clínica.",createdAt:new Date(now-day)},
    {id:"00000000-0000-4000-8000-000000000102",athleteId:demoAthletes[0].id,type:"postural" as const,view:"Frontal" as const,demo:true,score:89,landmarks:DEMO_POINTS,metrics:{...DEMO_METRICS,score:89,shoulders:1.8,knees:3.1},notes:"Evaluación inicial de muestra para explorar el historial.",createdAt:new Date(now-8*day)},
    {id:"00000000-0000-4000-8000-000000000103",athleteId:demoAthletes[0].id,type:"rutina" as const,view:"Lateral" as const,demo:true,score:90,landmarks:DEMO_POINTS,metrics:{...DEMO_METRICS,score:90},exercise:"Sentadilla",repetitions:12,durationSeconds:48,notes:"Sesión de ejemplo; no se han analizado movimientos reales.",createdAt:new Date(now-3*day)},
  ]).onConflictDoNothing();
  await db.insert(measurements).values([
    {id:"00000000-0000-4000-8000-000000000201",athleteId:demoAthletes[0].id,demo:true,values:{height:178,weight:74,waist:79,hip:96,chest:98,armLeft:31.5,armRight:32,thighLeft:54,thighRight:54.5,calfLeft:36,calfRight:36,bodyFat:16.5,muscleMass:34.2,heartRate:64,systolic:118,diastolic:76,spo2:98},notes:"Valores de muestra. Composición corporal ilustrativa; no obtenida con la cámara.",createdAt:new Date(now-day)},
    {id:"00000000-0000-4000-8000-000000000202",athleteId:demoAthletes[0].id,demo:true,values:{height:178,weight:74.5,waist:80,hip:96.5,chest:98,armLeft:31,armRight:31.5,thighLeft:54,thighRight:54.5,calfLeft:36,calfRight:36,bodyFat:17,heartRate:66,systolic:120,diastolic:78,spo2:98},notes:"Medición de referencia de muestra.",createdAt:new Date(now-8*day)},
  ]).onConflictDoNothing();
  seeded = true;
}
export async function getDashboardData(): Promise<DashboardData> {
  await ensureSeed();
  const [a,e,m]=await Promise.all([db.select().from(athletes).orderBy(athletes.createdAt),db.select().from(evaluations).orderBy(desc(evaluations.createdAt)),db.select().from(measurements).orderBy(desc(measurements.createdAt))]);
  return { athletes:a.map(({createdAt:_,...athlete})=>athlete),evaluations:e.map(item=>({...item,createdAt:item.createdAt.toISOString()})),measurements:m.map(item=>({...item,createdAt:item.createdAt.toISOString()})) };
}
