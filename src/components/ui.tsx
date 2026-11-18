"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Activity, ArrowUpRight, Check, FileSearch, X } from "lucide-react";

export function useCountUp(target: number, duration = 850) {
  const [value, setValue] = useState(0);
  const current = useRef(0);
  useEffect(() => {
    if (!Number.isFinite(target)) { setValue(0); return; }
    const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { current.current = target; setValue(target); return; }
    const from = current.current, start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = from + (target - from) * eased;
      current.current = next; setValue(next);
      if (t < 1) raf = requestAnimationFrame(tick);
      else { current.current = target; setValue(target); }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return value;
}
export function CountUp({ value, decimals = 0 }: { value: number | string; decimals?: number }) {
  const numeric = typeof value === "number" && Number.isFinite(value);
  const animated = useCountUp(numeric ? value : 0);
  return <>{numeric ? animated.toFixed(decimals) : value}</>;
}

export function Modal({title,subtitle,children,onClose,wide=false}:{title:string;subtitle?:string;children:ReactNode;onClose:()=>void;wide?:boolean}) {
  const ref=useRef<HTMLDivElement>(null);
  useEffect(()=>{
    const before=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;document.body.style.overflow="hidden";
    const timer=setTimeout(()=>ref.current?.querySelector<HTMLElement>("input,textarea,select,button")?.focus(),50);
    const handler=(e:KeyboardEvent)=>{if(e.key==="Escape")onClose();if(e.key==="Tab"){const items=ref.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),textarea,select,a[href],[tabindex="0"]');if(items?.length){const first=items[0],last=items[items.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}}};
    document.addEventListener("keydown",handler);return()=>{clearTimeout(timer);document.body.style.overflow=overflow;document.removeEventListener("keydown",handler);before?.focus();};
  },[onClose]);
  return <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)onClose();}}><div className={`modal ${wide?"modal-wide":""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title" ref={ref}><div className="modal-header"><div><h2 id="modal-title">{title}</h2>{subtitle&&<p>{subtitle}</p>}</div><button className="icon-button" onClick={onClose} aria-label="Cerrar ventana"><X size={20}/></button></div><div className="modal-body">{children}</div></div></div>;
}
export function ScoreRing({score,size=106}:{score:number;size?:number}) {
  const radius=42,c=2*Math.PI*radius;
  const animated=useCountUp(score,700);
  return <div className="score-ring" style={{width:size,height:size}}><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r={radius} className="ring-track"/><circle cx="50" cy="50" r={radius} className="ring-progress" strokeDasharray={c} strokeDashoffset={c*(1-score/100)} transform="rotate(-90 50 50)"/></svg><div><strong>{Math.round(animated)}</strong><span>de 100</span></div></div>;
}
export function EmptyState({title,description,action}:{title:string;description:string;action?:ReactNode}){return <div className="empty-state"><span className="empty-icon"><FileSearch size={27}/></span><h3>{title}</h3><p>{description}</p>{action}</div>;}
export function SampleBadge(){return <span className="sample-badge">Muestra</span>;}
export function StatusBadge({good=true,children}:{good?:boolean;children:ReactNode}){return <span className={`status-badge ${good?"good":"caution"}`}>{good?<Check size={11}/>:<Activity size={11}/>} {children}</span>;}
export function ExerciseIllustration({exercise}:{exercise:string}) {
  const paths:Record<string,{head:[number,number];lines:string[]}>={
    squat:{head:[62,20],lines:["62,30 56,49 42,63 63,73 76,73","56,49 76,60 63,73","61,34 78,43 92,40"]},
    lunge:{head:[64,17],lines:["64,27 60,47 84,54 85,73 97,73","60,47 38,65 21,65","63,32 46,42 36,35"]},
    press:{head:[60,22],lines:["60,32 60,51 48,76","60,51 73,76","60,34 41,33 34,15","60,34 79,33 86,15"]},
    plank:{head:[92,37],lines:["84,43 60,49 28,58 17,70","79,45 91,65 105,65"]},
  };
  const p=paths[exercise]||paths.squat;
  return <svg viewBox="0 0 120 88" className="exercise-art" fill="none" aria-hidden="true"><ellipse cx="60" cy="78" rx="42" ry="3" fill="currentColor" opacity=".07"/><circle cx={p.head[0]} cy={p.head[1]} r="7" fill="currentColor" opacity=".75"/>{p.lines.map((line,i)=><polyline key={i} points={line} stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>)}<circle cx="60" cy="49" r="3" fill="white" opacity=".9"/></svg>;
}
export function FeatureLink({title,description,icon,tone,onClick,action}:{title:string;description:string;icon:ReactNode;tone:string;onClick:()=>void;action:string}){return <button className="feature-card" onClick={onClick}><span className={`feature-icon ${tone}`}>{icon}</span><div><h3>{title}</h3><p>{description}</p><span className="feature-link">{action}<ArrowUpRight size={13}/></span></div></button>;}
