import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { AnimatePresence, motion } from 'framer-motion';

function extractIntent(c:string){ 
  if(c.startsWith('add tag '))return'add'; 
  if(c.startsWith('remove tag '))return'remove'; 
  if(c.startsWith('preview tag '))return'preview'; 
  return 'unknown';
}
function playSound(type:'match'|'fail'){
  const ctx=new AudioContext(), osc=ctx.createOscillator();
  osc.type='sine'; osc.frequency.value = type==='match'?880:220;
  osc.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+0.1);
}

export function VoiceConsole({ logs }:{logs:{command:string;match:boolean;timestamp:number}[]}){
  const [open,setOpen]=useState(false);
  const [filter,setFilter]=useState<'all'|'match'|'fail'>('all');
  const toggleRef=useRef<HTMLButtonElement>(null);
  const lastCount=useRef(0);
  const filtered = filter==='all'?logs:logs.filter(l=>filter==='match'?l.match:!l.match);

  useEffect(()=>{ if(!open) toggleRef.current?.focus(); },[open]);
  useEffect(()=>{ if(logs.length>lastCount.current){
      const e=logs[logs.length-1]; playSound(e.match?'match':'fail'); lastCount.current=logs.length;
    } },[logs]);

  const exportCSV=()=>{
    const hdr=['Intent','Command','Matched','Timestamp'];
    const rows=filtered.map(e=>[extractIntent(e.command),e.command,e.match?'true':'false',new Date(e.timestamp).toISOString()]);
    const csv=[hdr.join(',')].concat(rows.map(r=>r.join(','))).join('\n');
    const blob=new Blob([csv],{type:'text/csv'}), url=URL.createObjectURL(blob),a=document.createElement('a');
    a.href=url; a.download=`voice_log_${new Date().toISOString().slice(0,10)}.csv`; a.click();
  };

  return (
    <div className="mt-4">
      <div className="flex gap-2 mb-2">
        <Button ref={toggleRef} size="sm" variant="outline" onClick={()=>setOpen(o=>!o)}>
          {open?'Hide Voice Console':'Show Voice Console'}
        </Button>
        {open && (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={exportCSV}>Export CSV</Button>
            <Button size="sm" variant={filter==='all'?'default':'outline'} onClick={()=>setFilter('all')}>All</Button>
            <Button size="sm" variant={filter==='match'?'default':'outline'} onClick={()=>setFilter('match')}>Matched</Button>
            <Button size="sm" variant={filter==='fail'?'default':'outline'} onClick={()=>setFilter('fail')}>Unmatched</Button>
          </div>
        )}
      </div>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} exit={{opacity:0,height:0}} transition={{duration:0.25,ease:'easeInOut'}}>
            <ScrollArea className="max-h-40 border rounded p-2 bg-muted/20 text-sm" role="log" aria-live="polite">
              {filtered.length===0?(
                <p className="italic text-muted-foreground">No voice activity.</p>
              ):filtered.map((e,i)=>(
                <div key={i} className={cn('py-1 border-b flex justify-between gap-4', e.match?'text-green-600':'text-red-500')}>
                  <span className="font-mono w-20 text-xs text-muted-foreground">{extractIntent(e.command)}</span>
                  <span className="flex-1">{e.command}</span>
                  <span className="text-xs text-muted-foreground">{new Date(e.timestamp).toLocaleTimeString()}</span>
                </div>
              ))}
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
