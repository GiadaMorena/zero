"use client";
import {useEffect,useRef,useState} from "react";
import {X,ZoomIn,ZoomOut} from "lucide-react";
export function ReceiptPhotoViewer({src,onClose}:{src:string;onClose:()=>void}){
  const[zoom,setZoom]=useState(1);const close=useRef<HTMLButtonElement>(null);
  useEffect(()=>{const previous=document.activeElement as HTMLElement|null;close.current?.focus();const key=(event:KeyboardEvent)=>{if(event.key==="Escape")onClose();};document.addEventListener("keydown",key);return()=>{document.removeEventListener("keydown",key);previous?.focus();};},[onClose]);
  return <div role="dialog" aria-modal="true" aria-label="Foto dello scontrino ingrandita" data-app-update-block className="fixed inset-0 z-[200] flex flex-col bg-[#0B0B0B] text-white" style={{paddingTop:"env(safe-area-inset-top,0px)",paddingBottom:"env(safe-area-inset-bottom,0px)"}}>
    <header className="flex shrink-0 items-center justify-between gap-3 px-4 py-3"><h2 className="text-sm font-bold">Foto dello scontrino</h2><button ref={close} type="button" onClick={onClose} aria-label="Chiudi foto" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15"><X className="h-5 w-5"/></button></header>
    <div className="min-h-0 flex-1 overflow-auto bg-[#242424] p-3" style={{touchAction:"pan-x pan-y pinch-zoom"}}><img src={src} alt="Scontrino originale da controllare" draggable={false} className="block max-w-none" style={{width:`${zoom*100}%`,height:"auto"}}/></div>
    <footer className="shrink-0 px-4 py-3"><div className="flex items-center justify-center gap-4"><button type="button" aria-label="Riduci foto" disabled={zoom===1} onClick={()=>setZoom(value=>Math.max(1,value-.5))} className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 disabled:opacity-30"><ZoomOut className="h-5 w-5"/></button><span className="w-14 text-center text-xs font-bold">{Math.round(zoom*100)}%</span><button type="button" aria-label="Ingrandisci foto" disabled={zoom===4} onClick={()=>setZoom(value=>Math.min(4,value+.5))} className="flex h-11 w-11 items-center justify-center rounded-full bg-[#FDC909] text-black disabled:opacity-30"><ZoomIn className="h-5 w-5"/></button></div><p className="mt-2 text-center text-xs text-white/70">Scorri la foto per leggere tutte le righe.</p></footer>
  </div>;
}
