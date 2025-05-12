import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';

export function useVoiceCommands({ onAddTag, onRemoveTag, onOpenPreview }) {
  useEffect(()=>{
    if (!('webkitSpeechRecognition' in window)) {
      toast({ title:'Voice Commands Unsupported', description:'Your browser does not support speech recognition.', variant:'warning' });
      return;
    }
    const rec = new webkitSpeechRecognition();
    rec.continuous = true;
    rec.lang = 'en-US';
    rec.interimResults = false;

    rec.onresult = e => {
      const cmd = e.results[e.results.length-1][0].transcript.trim().toLowerCase();
      if (cmd.startsWith('add tag '))      { onAddTag(cmd.replace('add tag ','')); toast({ title:'Voice Command', description:\`Added tag \${cmd.slice(8)}\`, variant:'success' }); }
      else if (cmd.startsWith('remove tag ')){ onRemoveTag(cmd.replace('remove tag ','')); toast({ title:'Voice Command', description:\`Removed tag \${cmd.slice(11)}\`, variant:'default' }); }
      else if (cmd.startsWith('preview tag ')){ onOpenPreview(cmd.replace('preview tag ','')); toast({ title:'Voice Command', description:\`Previewing tag \${cmd.slice(12)}\`, variant:'info' }); }
    };

    rec.onerror = err=>console.error('Voice recognition error',err);
    rec.start();
    return ()=>rec.stop();
  },[onAddTag,onRemoveTag,onOpenPreview]);
}
