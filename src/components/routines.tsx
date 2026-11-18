"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Activity, ArrowRight, Check, ChevronRight, CircleHelp, Dumbbell, Flag, Info, Pause, Play, RotateCcw, ScanLine, Timer } from "lucide-react";
import { CameraPanel, type CameraHandle } from "./camera-panel";
import { EXERCISES, jointAngle } from "@/lib/pose";
import type { ExerciseId, PoseFrame, View } from "@/lib/types";
import { ExerciseIllustration } from "./ui";
export type RoutineResult={name:string;repetitions:number;durationSeconds:number};
export function RoutinesView({onCapture,onPoint,onError,onHelp}:{onCapture:(frame:PoseFrame,view:View,routine:RoutineResult)=>void;onPoint:(id:number,frame:PoseFrame)=>void;onError:(message:string)=>void;onHelp:()=>void}){
  const [selected,setSelected]=useState<ExerciseId>("squat"),[view,setView]=useState<View>("Lateral"),[active,setActive]=useState(false),[started,setStarted]=useState(false),[starting,setStarting]=useState(false),[repetitions,setRepetitions]=useState(0),[elapsed,setElapsed]=useState(0),[angle,setAngle]=useState<number|null>(null),[phase,setPhase]=useState("En posición inicial"),[tracking,setTracking]=useState(false);
  const cameraRef=useRef<CameraHandle>(null),activeRef=useRef(false),phaseRef=useRef("up"),lastCount=useRef(0),lastGood=useRef<PoseFrame|null>(null);
  const exercise=EXERCISES.find(e=>e.id===selected)!;
  useEffect(()=>{if(!active)return;const timer=setInterval(()=>setElapsed(t=>t+1),1000);return()=>clearInterval(timer);},[active]);
  useEffect(()=>()=>{activeRef.current=false;},[]);
  const onFrame=useCallback((frame:PoseFrame)=>{
    const metrics=frame.source==="camera"?frame.metrics:null;setTracking(!!metrics);
    if(!metrics){setAngle(null);return;}
    lastGood.current=frame;
    let value:number|null=null;
    if(selected==="plank"){
      const p=frame.points;const side=p[11].visibility>p[12].visibility?[11,23,27]:[12,24,28];
      if(side.every(i=>p[i].visibility>=.55))value=jointAngle(p[side[0]],p[side[1]],p[side[2]],frame.width/frame.height);
    }else{const values=(selected==="press"?[metrics.leftElbow,metrics.rightElbow]:[metrics.leftKnee,metrics.rightKnee]).filter((v):v is number=>v!==null);if(values.length)value=selected==="lunge"?Math.min(...values):values.reduce((a,b)=>a+b,0)/values.length;}
    setAngle(value===null?null:Math.round(value));
    if(!activeRef.current||value===null)return;
    if(selected==="plank"){setPhase(value>=160?"Mantén la alineación":"Revisa la altura de tu cadera");return;}
    const lower=selected==="press"?105:115;
    if(value<lower){phaseRef.current="down";setPhase(selected==="press"?"Posición de inicio":"Fase de descenso");}
    if(value>155&&phaseRef.current==="down"&&performance.now()-lastCount.current>700){phaseRef.current="up";lastCount.current=performance.now();setRepetitions(r=>r+1);setPhase("Repetición completada");}
  },[selected]);
  function choose(id:ExerciseId){activeRef.current=false;setActive(false);setStarted(false);setRepetitions(0);setElapsed(0);setAngle(null);lastGood.current=null;phaseRef.current="up";setSelected(id);setView(EXERCISES.find(e=>e.id===id)!.view);cameraRef.current?.stop();}
  async function start(){
    if(starting)return;setStarting(true);
    const ready=tracking||await cameraRef.current?.start();setStarting(false);if(!ready)return;
    if(!started){setRepetitions(0);setElapsed(0);phaseRef.current="up";lastCount.current=0;}
    activeRef.current=true;setStarted(true);setActive(true);setPhase("Buscando el movimiento…");
  }
  function pause(){activeRef.current=false;setActive(false);setPhase("Evaluación en pausa");}
  function finish(){if(!lastGood.current){onError("Todavía no hay una lectura válida. Mantén el cuerpo visible para guardar la sesión.");return;}const saved=lastGood.current;activeRef.current=false;setActive(false);setStarted(false);onCapture(saved,view,{name:exercise.name,repetitions,durationSeconds:elapsed});cameraRef.current?.stop();}
  return <div className="section-enter"><div className="section-heading"><div><h2>Una mejor técnica, repetición a repetición.</h2><p>Selecciona un ejercicio y observa su postura durante el movimiento.</p></div><span className="soft-label"><Dumbbell size={13}/>4 ejercicios disponibles</span></div><div className="routine-banner"><div className="routine-banner-copy"><span className="eyebrow">ANÁLISIS EN MOVIMIENTO</span><h3>Cada repetición, en tres dimensiones.</h3><p>Seguimiento de ángulos, fases y simetría a partir de los puntos detectados en cada ciclo.</p></div>{/* eslint-disable-next-line @next/next/no-img-element */}<img src="/images/routine-3d.png" alt="Render 3D de una sentadilla con las referencias articulares"/><span className="routine-banner-glow"/></div><div className="exercise-grid">{EXERCISES.map(e=><button className={`exercise-card ${selected===e.id?"selected":""}`} onClick={()=>choose(e.id)} key={e.id}><div className={`exercise-visual ${e.color}`}><ExerciseIllustration exercise={e.id}/>{selected===e.id&&<span className="exercise-selected"><Check size={12}/></span>}</div><div className="exercise-card-info"><span>{e.category}</span><h3>{e.name}</h3><p>{e.description}</p></div></button>)}</div><div className="evaluation-grid routine-evaluation-grid"><div><CameraPanel ref={cameraRef} view={view} onViewChange={v=>{if(active){onError("Pausa la evaluación antes de cambiar de plano.");return;}setView(v);}} onFrame={onFrame} onCapture={frame=>onCapture(frame,view,{name:exercise.name,repetitions,durationSeconds:elapsed})} onPointClick={id=>{if(lastGood.current)onPoint(id,lastGood.current);else onError("Activa la cámara para inspeccionar los puntos durante el ejercicio.");}} onError={onError} exerciseMode/><div className="card session-controls"><div className="session-status"><span className={`status-dot ${active?"pulse":""}`}/><div><strong>{active?tracking?"Evaluación en curso":"Buscando cuerpo completo":started?"Evaluación en pausa":"Listo para comenzar"}</strong><span>El conteo utiliza movimiento real, no la demostración.</span></div></div><div className="session-buttons">{active?<button className="button" onClick={pause}><Pause size={15}/>Pausar</button>:<button className="button primary" onClick={()=>void start()} disabled={starting}><Play size={15}/>{starting?"Preparando…":started?"Continuar":"Iniciar evaluación"}</button>}{started&&<button className="button dark" onClick={finish}><Flag size={15}/>Finalizar y guardar</button>}</div></div></div><aside className="routine-aside"><section className="card routine-metrics"><div className="flex-between"><h3>Tu sesión en directo</h3><span className={`live-mini ${active?"active":""}`}><i/>{active?"En curso":"En espera"}</span></div><div className="routine-counters"><div><span><RotateCcw size={13}/>{selected==="plank"?"Sostenimiento":"Repeticiones"}</span><strong>{selected==="plank"?elapsed.toString().padStart(2,"0"):repetitions.toString().padStart(2,"0")}</strong><small>{selected==="plank"?"segundos de sesión":"ciclos completos"}</small></div><div><span><Timer size={13}/>Tiempo de sesión</span><strong>{Math.floor(elapsed/60).toString().padStart(2,"0")}<em>:</em>{(elapsed%60).toString().padStart(2,"0")}</strong><small>minutos : segundos</small></div></div><div className="angle-monitor"><span>{exercise.metric}</span><strong>{angle===null?"—":angle}<small>°</small></strong><div className="angle-target"><span/>{exercise.target}</div></div><div className="movement-phase"><Activity size={16}/>{active?tracking?phase:"Reencuadra el cuerpo completo":started?"En pausa":"Activa la cámara para analizar"}</div></section><section className="card technique-card"><div className="flex-between"><h3>Claves de la técnica</h3><button className="icon-button small" onClick={onHelp} aria-label="Ver guía de ejercicios"><CircleHelp size={16}/></button></div><p>{exercise.name} · Vista {exercise.view.toLowerCase()} recomendada</p><ol>{exercise.cues.map((cue,i)=><li key={cue}><span>{i+1}</span><p>{cue}</p></li>)}</ol><div className="technique-note"><Info size={15}/><span>Ángulos 2D orientativos, no prescripción. Adapta el rango a cada persona y detente si hay dolor.</span></div></section></aside></div></div>;
}
