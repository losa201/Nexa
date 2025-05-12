import { useEffect, useRef } from 'react';

export function useTableNavigation(rowCount:number, onRowSelect:(i:number)=>void) {
  const ref = useRef<HTMLTableElement>(null);
  const focused = useRef(0);

  useEffect(()=>{
    const tbl = ref.current;
    if (!tbl) return;
    const highlight = (i:number)=>{
      const rows=tbl.querySelectorAll('tbody tr');
      rows.forEach(r=>r.classList.remove('ring-2','ring-primary'));
      const row=rows[i] as HTMLElement; row?.classList.add('ring-2','ring-primary'); row?.scrollIntoView({block:'nearest'});
    };
    const handler=(e:KeyboardEvent)=>{
      if (!(e.target instanceof HTMLElement) || !tbl.contains(e.target)) return;
      if (e.key==='ArrowDown'){ e.preventDefault(); focused.current=Math.min(rowCount-1,focused.current+1); highlight(focused.current);}
      if (e.key==='ArrowUp'){ e.preventDefault(); focused.current=Math.max(0,focused.current-1); highlight(focused.current);}
      if (e.key==='Enter'){ e.preventDefault(); onRowSelect(focused.current);}
    };
    document.addEventListener('keydown',handler);
    highlight(0);
    return ()=>document.removeEventListener('keydown',handler);
  },[rowCount,onRowSelect]);

  return ref;
}
