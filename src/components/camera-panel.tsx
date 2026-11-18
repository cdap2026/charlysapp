"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Camera, Check, ChevronDown, CircleHelp, Focus, Grid2X2, ImagePlus, LoaderCircle, Maximize2, ScanLine, Settings2, ShieldCheck, SwitchCamera, Timer, Video, VideoOff, X } from "lucide-react";
import type { PoseLandmarker } from "@mediapipe/tasks-vision";
import { calculateMetrics, CONNECTIONS, DEMO_METRICS, DEMO_POINTS, LANDMARKS } from "@/lib/pose";
import type { PoseFrame, PosePoint, View } from "@/lib/types";

export type CameraHandle = { start: () => Promise<boolean>; stop: () => void };
type Props = { view: View; onViewChange: (view:View)=>void; onFrame:(frame:PoseFrame)=>void; onCapture:(frame:PoseFrame)=>void; onError:(message:string)=>void; onPointClick:(id:number)=>void; exerciseMode?:boolean; captureDisabled?:boolean };
const demoFrame:PoseFrame={points:DEMO_POINTS,metrics:DEMO_METRICS,source:"demo",width:1568,height:1045};

export const CameraPanel=forwardRef<CameraHandle,Props>(function CameraPanel({view,onViewChange,onFrame,onCapture,onError,onPointClick,exerciseMode=false,captureDisabled=false},ref) {
  const [source,setSource]=useState<PoseFrame["source"]>("demo");
  const [frame,setFrame]=useState<PoseFrame>(demoFrame);
  const [loading,setLoading]=useState(false),[cameraOn,setCameraOn]=useState(false),[error,setError]=useState("");
  const [showSettings,setShowSettings]=useState(false),[showPoints,setShowPoints]=useState(true),[showGuides,setShowGuides]=useState(true);
  const [mirrored,setMirrored]=useState(true),[delay,setDelay]=useState(false),[countdown,setCountdown]=useState(0);
  const [devices,setDevices]=useState<MediaDeviceInfo[]>([]),[deviceId,setDeviceId]=useState("");
  const [quality,setQuality]=useState("1080"),[actualQuality,setActualQuality]=useState("");
  const [uploaded,setUploaded]=useState("");
  const videoRef=useRef<HTMLVideoElement>(null),imageRef=useRef<HTMLImageElement>(null),containerRef=useRef<HTMLDivElement>(null),fileRef=useRef<HTMLInputElement>(null);
  const streamRef=useRef<MediaStream|null>(null),modelRef=useRef<PoseLandmarker|null>(null),rafRef=useRef(0),operation=useRef(0),latestRef=useRef<PoseFrame>(demoFrame),previousRef=useRef<PosePoint[]>([]);
  const callbackRef=useRef({onFrame,onCapture,onError});
  const timerRef=useRef<ReturnType<typeof setInterval>|null>(null),loadingRef=useRef(false),facingRef=useRef<"user"|"environment">("user");
  useEffect(()=>{callbackRef.current={onFrame,onCapture,onError};},[onFrame,onCapture,onError]);
  const publish=useCallback((next:PoseFrame)=>{latestRef.current=next;setFrame(next);callbackRef.current.onFrame(next);},[]);
  const stopStream=useCallback(()=>{operation.current++;cancelAnimationFrame(rafRef.current);streamRef.current?.getTracks().forEach(t=>t.stop());streamRef.current=null;previousRef.current=[];if(videoRef.current)videoRef.current.srcObject=null;},[]);
  const stop=useCallback(()=>{stopStream();setCameraOn(false);setLoading(false);loadingRef.current=false;setSource("demo");publish(demoFrame);},[publish,stopStream]);
  useEffect(()=>{callbackRef.current.onFrame(demoFrame);return()=>{stopStream();modelRef.current?.close();if(timerRef.current)clearInterval(timerRef.current);};},[stopStream]);
  async function detector(mode:"VIDEO"|"IMAGE") {
    if(modelRef.current){await modelRef.current.setOptions({runningMode:mode});return modelRef.current;}
    const {FilesetResolver,PoseLandmarker}=await import("@mediapipe/tasks-vision");
    const vision=await FilesetResolver.forVisionTasks("/mediapipe/wasm");
    const options={baseOptions:{modelAssetPath:"/mediapipe/pose_landmarker_lite.task",delegate:"GPU" as const},runningMode:mode,numPoses:1,minPoseDetectionConfidence:.6,minPosePresenceConfidence:.6,minTrackingConfidence:.65};
    try{modelRef.current=await PoseLandmarker.createFromOptions(vision,options);}catch{modelRef.current=await PoseLandmarker.createFromOptions(vision,{...options,baseOptions:{...options.baseOptions,delegate:"CPU"}});}
    return modelRef.current;
  }
  async function startCamera(override?:string):Promise<boolean> {
    if(loadingRef.current)return false;
    stopStream();const token=operation.current;loadingRef.current=true;setLoading(true);setError("");
    let acquired:MediaStream|null=null;
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw new Error("La cámara requiere HTTPS y un navegador compatible. También puedes subir una fotografía.");
      const requestedDevice=override===undefined?deviceId:override;
      acquired=await navigator.mediaDevices.getUserMedia({audio:false,video:{...(requestedDevice?{deviceId:{exact:requestedDevice}}:{facingMode:{ideal:facingRef.current}}),width:{ideal:quality==="1080"?1920:1280},height:{ideal:quality==="1080"?1080:720},frameRate:{ideal:30,max:30}}});
      if(token!==operation.current){acquired.getTracks().forEach(t=>t.stop());return false;}
      streamRef.current=acquired;
      const video=videoRef.current;if(!video)throw new Error("No se pudo abrir la vista de cámara.");
      video.srcObject=acquired;await video.play();
      if(token!==operation.current){acquired.getTracks().forEach(t=>t.stop());return false;}
      setSource("camera");setCameraOn(true);setActualQuality(`${video.videoWidth} × ${video.videoHeight}`);
      publish({points:[],metrics:null,source:"camera",width:video.videoWidth||1280,height:video.videoHeight||720});
      const available=(await navigator.mediaDevices.enumerateDevices()).filter(d=>d.kind==="videoinput");setDevices(available);
      setDeviceId(acquired.getVideoTracks()[0]?.getSettings().deviceId||override||"");
      const model=await detector("VIDEO");
      if(token!==operation.current)return false;
      let lastTime=-1,lastInference=0;
      const tick=(now:number)=>{
        if(token!==operation.current)return;
        if(video.readyState>=2&&video.currentTime!==lastTime&&now-lastInference>=100){
          lastTime=video.currentTime;lastInference=now;
          try{
            const result=model.detectForVideo(video,performance.now());
            const raw=result.landmarks[0]||[];
            const points:PosePoint[]=raw.map((p,i)=>{const prev=previousRef.current[i],alpha=.55;return {x:prev?prev.x*(1-alpha)+p.x*alpha:p.x,y:prev?prev.y*(1-alpha)+p.y*alpha:p.y,z:p.z,visibility:p.visibility??0};});
            previousRef.current=points;
            publish({points,metrics:calculateMetrics(points,video.videoWidth/video.videoHeight),source:"camera",width:video.videoWidth,height:video.videoHeight});
          }catch{setError("El seguimiento se interrumpió. Reinicia la cámara para volver a intentarlo.");cancelAnimationFrame(rafRef.current);return;}
        }
        rafRef.current=requestAnimationFrame(tick);
      };
      rafRef.current=requestAnimationFrame(tick);return true;
    }catch(e){
      acquired?.getTracks().forEach(t=>t.stop());stopStream();setCameraOn(false);setSource("demo");publish(demoFrame);
      const name=e instanceof DOMException?e.name:"";
      const message=name==="NotAllowedError"?"No se ha autorizado la cámara. Permite el acceso en tu navegador o sube una fotografía.":name==="NotFoundError"?"No encontramos una cámara conectada. Conecta un dispositivo o sube una fotografía.":name==="NotReadableError"?"Otra aplicación está usando la cámara. Ciérrala y vuelve a intentarlo.":e instanceof Error?e.message:"No se pudo iniciar la cámara.";
      setError(message);callbackRef.current.onError(message);return false;
    }finally{loadingRef.current=false;setLoading(false);}
  }
  useImperativeHandle(ref,()=>({start:()=>startCamera(),stop}));
  async function switchCamera(){
    if(!cameraOn){setShowSettings(true);return;}
    if(devices.length>1){const index=devices.findIndex(d=>d.deviceId===deviceId);const next=devices[(index+1)%devices.length];setDeviceId(next.deviceId);await startCamera(next.deviceId);}
    else{facingRef.current=facingRef.current==="user"?"environment":"user";setDeviceId("");await startCamera("");}
  }
  function capture(){
    const current=latestRef.current;
    if(current.source!=="demo"&&!current.metrics){callbackRef.current.onError("Todavía no vemos todos los puntos. Aléjate un poco y mantén todo el cuerpo dentro del encuadre.");return;}
    let snapshot=current.snapshot;
    if(current.source==="camera"&&videoRef.current){const canvas=document.createElement("canvas"),scale=Math.min(1,1280/videoRef.current.videoWidth);canvas.width=Math.round(videoRef.current.videoWidth*scale);canvas.height=Math.round(videoRef.current.videoHeight*scale);canvas.getContext("2d")?.drawImage(videoRef.current,0,0,canvas.width,canvas.height);snapshot=canvas.toDataURL("image/jpeg",.82);}
    callbackRef.current.onCapture({...current,snapshot});
  }
  function requestCapture(){
    if(!delay||source!=="camera"){capture();return;}
    let remaining=3;setCountdown(remaining);timerRef.current=setInterval(()=>{remaining--;setCountdown(remaining);if(remaining<=0){if(timerRef.current)clearInterval(timerRef.current);capture();}},1000);
  }
  async function upload(file:File|undefined){
    if(!file)return;
    if(!["image/jpeg","image/png","image/webp"].includes(file.type)||file.size>12*1024*1024){callbackRef.current.onError("Selecciona una imagen JPG, PNG o WebP de hasta 12 MB.");return;}
    stopStream();setCameraOn(false);setLoading(true);loadingRef.current=true;setError("");
    let objectUrl="";
    try{
      objectUrl=URL.createObjectURL(file);const image=new Image();image.src=objectUrl;await image.decode();
      const canvas=document.createElement("canvas"),scale=Math.min(1,1280/Math.max(image.width,image.height));canvas.width=Math.round(image.width*scale);canvas.height=Math.round(image.height*scale);canvas.getContext("2d")?.drawImage(image,0,0,canvas.width,canvas.height);
      const snapshot=canvas.toDataURL("image/jpeg",.85);const model=await detector("IMAGE"),result=model.detect(canvas);
      const points=(result.landmarks[0]||[]).map(p=>({x:p.x,y:p.y,z:p.z,visibility:p.visibility??0}));
      setUploaded(snapshot);setSource("upload");publish({points,metrics:calculateMetrics(points,canvas.width/canvas.height),source:"upload",snapshot,width:canvas.width,height:canvas.height});
      if(points.length!==33)setError("No se ha detectado un cuerpo completo. Prueba con una fotografía frontal, nítida y con los pies visibles.");
    }catch{setError("No se pudo analizar la imagen. Prueba con otra fotografía o activa la cámara.");setSource("demo");publish(demoFrame);}
    finally{if(objectUrl)URL.revokeObjectURL(objectUrl);setLoading(false);loadingRef.current=false;if(fileRef.current)fileRef.current.value="";}
  }
  const previewImage=source==="upload"?uploaded:view==="Lateral"?"/images/posture-lateral.png":view==="Posterior"?"/images/posture-back.png":"/images/posture-studio.png";
  const drawPoints=showPoints&&(source!=="demo"||view==="Frontal");
  return <div className="camera-wrap">
    <section className={`card camera-card ${cameraOn?"is-live":""}`} ref={containerRef}>
      <div className="card-heading camera-heading"><div><h2>{exerciseMode?"Observa la técnica en movimiento":"Análisis en tiempo real"}</h2><p>{exerciseMode?"Cada repetición es una oportunidad para mejorar.":"Más precisión. Una mejor perspectiva de su postura."}</p></div><button className={`icon-button ${showSettings?"selected":""}`} onClick={()=>setShowSettings(!showSettings)} aria-label="Configurar cámara" title="Configurar cámara"><Settings2 size={18}/></button></div>
      <div className="camera-modebar"><div className="segmented" aria-label="Plano de evaluación">{(["Frontal","Lateral","Posterior"] as View[]).map(v=><button key={v} className={v===view?"active":""} onClick={()=>onViewChange(v)}>{v}</button>)}</div><button className="camera-device" onClick={()=>setShowSettings(!showSettings)}><Video size={14}/><span>Cámara HD</span><ChevronDown size={13}/></button></div>
      {showSettings&&<div className="camera-settings"><div className="flex-between"><h3>Ajustes de cámara</h3><button className="icon-button small" onClick={()=>setShowSettings(false)} aria-label="Cerrar ajustes"><X size={16}/></button></div><label>Dispositivo<select value={deviceId} onChange={e=>setDeviceId(e.target.value)}><option value="">Cámara predeterminada</option>{devices.map((d,i)=><option key={d.deviceId} value={d.deviceId}>{d.label||`Cámara ${i+1}`}</option>)}</select></label><label>Resolución preferida<select value={quality} onChange={e=>setQuality(e.target.value)}><option value="1080">Full HD · 1080p</option><option value="720">HD · 720p (mayor fluidez)</option></select></label><label className="setting-toggle"><span>Vista en espejo</span><input type="checkbox" checked={mirrored} onChange={e=>setMirrored(e.target.checked)}/></label><label className="setting-toggle"><span>Temporizador de 3 segundos</span><input type="checkbox" checked={delay} onChange={e=>setDelay(e.target.checked)}/></label><p>La resolución final depende de tu dispositivo. El análisis funciona localmente.</p><button className="button primary full" disabled={loading} onClick={()=>{setShowSettings(false);void startCamera();}}><Video size={15}/>{cameraOn?"Aplicar y reiniciar":"Activar cámara"}</button></div>}
      <div className="camera-preview">
        {source!=="camera"&&<div className="preview-reference-bg" style={{backgroundImage:`url("${previewImage}")`}}/>}
        <div className={`pose-source ${source!=="camera"?"reference-source":""}`} style={source!=="camera"?{aspectRatio:`${frame.width} / ${frame.height}`} : undefined}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={imageRef} src={previewImage} alt={source==="upload"?"Fotografía cargada para evaluación":"Fotografía de referencia de un deportista en posición anatómica"} className={`pose-media ${source==="camera"?"hidden-media":""}`}/>
          <video ref={videoRef} className={`pose-media ${source!=="camera"?"hidden-media":""} ${mirrored?"mirrored":""}`} muted playsInline autoPlay aria-label="Vista de la cámara en directo"/>
          {drawPoints&&<svg className={`pose-overlay ${mirrored&&source==="camera"?"mirrored":""}`} viewBox={`0 0 ${frame.width} ${frame.height}`} preserveAspectRatio="xMidYMid meet" aria-label="Puntos anatómicos detectados">
            {CONNECTIONS.map(([a,b])=>frame.points[a]?.visibility>.5&&frame.points[b]?.visibility>.5?<line key={`${a}-${b}`} pathLength={1} x1={frame.points[a].x*frame.width} y1={frame.points[a].y*frame.height} x2={frame.points[b].x*frame.width} y2={frame.points[b].y*frame.height} className="skeleton-line"/>:null)}
            {frame.points.map((p,i)=>p.visibility>.5?<circle key={i} cx={p.x*frame.width} cy={p.y*frame.height} r={Math.max(frame.width,frame.height)*.0047} className={`skeleton-point ${i===25||i===26?"attention-point":""}`} role="button" tabIndex={0} aria-label={`Ver ${LANDMARKS[i]?.name}`} onClick={()=>onPointClick(i)} onKeyDown={e=>{if(e.key==="Enter")onPointClick(i);}}><title>{`${LANDMARKS[i]?.name} · ${Math.round(p.visibility*100)}% de visibilidad`}</title></circle>:null)}
          </svg>}
        </div>
        <div className="preview-top"><span className={`live-badge ${source==="camera"?"is-live":""}`}><i/>{source==="demo"?"Modo demostración":source==="camera"?"Cámara en directo":"Fotografía cargada"}</span><span className="resolution-badge">{source==="camera"?actualQuality:source==="upload"?"IMAGEN":"HD"}<span className="resolution-icon"><Focus size={12}/></span></span></div>
        {showGuides&&<div className="alignment-guides"><span className="guide vertical"/><span className="guide horizontal shoulders"/><span className="guide horizontal hips"/><span className="guide horizontal floor"/><i className="corner tl"/><i className="corner tr"/><i className="corner bl"/><i className="corner br"/></div>}
        {source==="camera"&&showGuides&&<span className="scan-sweep" aria-hidden="true"/>}
        {source==="camera"&&<span className="scan-corners" aria-hidden="true"><i/><i/><i/><i/></span>}
        {source==="demo"&&view==="Frontal"&&showPoints&&<><div className="anatomy-label shoulder-label"><span>Hombros</span><strong>1.2° <Check size={10}/></strong></div><div className="anatomy-label hip-label"><span>Cadera</span><strong>0.8° <Check size={10}/></strong></div></>}
        {loading&&<div className="preview-loading"><LoaderCircle size={28} className="spin"/><strong>Preparando tu evaluación</strong><span>Iniciando cámara y motor de postura…</span></div>}
        {countdown>0&&<div className="countdown-overlay">{countdown}</div>}
        {source==="demo"&&!loading&&<button className="activate-camera" onClick={()=>void startCamera()}><Video size={16}/><span>Activar mi cámara</span><span className="activate-arrow">↗</span></button>}
        {source==="camera"&&!loading&&!frame.points.length&&<div className="body-hint"><ScanLine size={17}/>Colócate de cuerpo completo frente a la cámara</div>}
        <div className="preview-bottom"><button className={`overlay-tool ${showPoints?"on":""}`} onClick={()=>setShowPoints(!showPoints)} title="Mostrar u ocultar puntos anatómicos"><span className="mini-switch"/><span>Puntos anatómicos</span></button><div className="overlay-tools-right"><button className={`overlay-icon ${showGuides?"on":""}`} onClick={()=>setShowGuides(!showGuides)} aria-label="Mostrar u ocultar guías" title="Guías de alineación"><Grid2X2 size={16}/></button><button className="overlay-icon" onClick={()=>{if(document.fullscreenElement){void document.exitFullscreen();}else void containerRef.current?.requestFullscreen().catch(()=>onError("La pantalla completa no está disponible en este navegador."));}} aria-label="Pantalla completa" title="Pantalla completa"><Maximize2 size={16}/></button></div></div>
      </div>
      {error&&<div className="camera-error" role="alert"><CircleHelp size={16}/><span>{error}</span><button onClick={()=>setError("")} aria-label="Ocultar aviso"><X size={14}/></button></div>}
      <div className="camera-actions"><div className="tracking-info"><span className="tracking-icon"><ScanLine size={17}/></span><div><strong>{source==="demo"?"33 puntos de referencia":`${frame.points.filter(p=>p.visibility>.55).length} de 33 puntos visibles`}</strong><span>{source==="demo"?"Explora el análisis con una muestra":frame.metrics?"Seguimiento activo y estabilizado":"Buscando una postura completa"}</span></div></div><div className="capture-buttons"><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>void upload(e.target.files?.[0])} className="sr-only" aria-label="Subir fotografía"/><button className="button icon-only" onClick={()=>fileRef.current?.click()} disabled={loading} aria-label="Subir fotografía" title="Subir fotografía"><ImagePlus size={17}/></button><button className="button icon-only switch-camera-button" disabled={loading} onClick={()=>void switchCamera()} aria-label="Cambiar cámara" title="Cambiar cámara"><SwitchCamera size={18}/></button><button className="button primary capture-button" onClick={requestCapture} disabled={loading||countdown>0||captureDisabled}>{delay&&source==="camera"?<Timer size={16}/>:<Camera size={16}/>}<span>{exerciseMode?"Capturar postura":"Capturar evaluación"}</span></button></div></div>
      <div className="camera-quality"><span><Check size={12}/>Iluminación uniforme</span><span><Check size={12}/>Cuerpo completo</span><span><Focus size={12}/>Distancia: 2–3 metros</span>{cameraOn&&<button onClick={stop}><VideoOff size={12}/>Apagar</button>}</div>
    </section>
    <p className="camera-privacy"><ShieldCheck size={13}/><span>Tu video se procesa en este dispositivo. Solo se guarda la captura que confirmes.</span></p>
  </div>;
});
