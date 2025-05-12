import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/utils';

export function VoiceIndicator({ active }: { active: boolean }) {
  const [blink, setBlink] = useState(false);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setBlink(b=>!b), 750);
    return ()=>clearInterval(id);
  },[active]);

  return (
    <div className={cn(
      'flex items-center text-xs font-medium gap-1 px-2 py-1 rounded-full border transition-all duration-300',
      active ? 'border-green-500 text-green-600 bg-green-50' : 'border-muted text-muted-foreground'
    )}>
      {active ? <Mic size={14} className={cn(blink && 'animate-ping')} /> : <MicOff size={14}/>}
      <span>{active ? 'Listening…' : 'Voice Off'}</span>
    </div>
  );
}
