import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useTagToaster } from '@/hooks/useTagToaster';

export function ActiveTagBar() {
  const [params, setParams] = useSearchParams();
  const tags = params.getAll('tag');
  const notify = useTagToaster();

  const remove = (tag: string) => {
    const next = new URLSearchParams(params);
    const keep = next.getAll('tag').filter(t => t !== tag);
    next.delete('tag');
    keep.forEach(t => next.append('tag', t));
    setParams(next);
    notify.removed(tag);
  };

  if (!tags.length) return null;
  return (
    <div className="sticky top-0 z-10 bg-background py-2 border-b flex flex-wrap gap-2">
      {tags.map((t,i)=>(
        <Button key={i} size="sm" variant="secondary" className="transition-all duration-300 transform hover:scale-105 shadow-md gap-1 px-2 h-6 text-xs">
          {t}<X size={12} className="ml-1 cursor-pointer" onClick={()=>remove(t)}/>
        </Button>
      ))}
    </div>
  );
}
