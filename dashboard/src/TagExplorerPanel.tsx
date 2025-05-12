import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '@/components/ui/tooltip';
import { useConfigStats } from '../hooks/useConfigStats';
import { useTagToaster } from '../hooks/useTagToaster';
import { ClearTagsButton } from '../components/ClearTagsButton';
import { ActiveTagBar } from '../components/ActiveTagBar';
import TagSparkline from '../components/TagSparkline';
import { TrendPreviewModal } from '../components/TrendPreviewModal';
import { useVoiceCommands } from '../hooks/useVoiceCommands';
import { VoiceIndicator } from '../components/VoiceIndicator';
import { VoiceConsole } from '../components/VoiceConsole';
import { ThemeToggle } from '../components/ThemeToggle';
import { useTableNavigation } from '../hooks/useTableNavigation';

export default function TagExplorerPanel() {
  const stats = useConfigStats();
  const notify = useTagToaster();
  const [params, setParams] = useSearchParams();
  const selectedTags = params.getAll('tag');
  const [sortBy, setSortBy] = useState<'tag'|'count'|'averageScore'|'deviation'|'delta'>('averageScore');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<number[]>([]);
  const [previewTag, setPreviewTag] = useState('');
  const [voiceLog, setVoiceLog] = useState<{command:string;match:boolean;timestamp:number}[]>([]);

  const logVoice = (cmd:string, m:boolean) => setVoiceLog(p=>[...p.slice(-19),{command:cmd,match:m,timestamp:Date.now()}]);
  const updateSearch = (tags:string[]) => {
    const q = new URLSearchParams(params);
    q.delete('tag'); tags.forEach(t=>q.append('tag',t));
    setParams(q);
  };
  const toggleTag = (tag:string) => {
    const sel = selectedTags.includes(tag);
    updateSearch(sel?selectedTags.filter(t=>t!==tag):[...selectedTags,tag]);
    sel?notify.removed(tag):notify.added(tag);
  };

  useVoiceCommands({
    onAddTag: t=>{ if(!selectedTags.includes(t)){ updateSearch([...selectedTags,t]); notify.added(t); logVoice(\`add tag \${t}\`,true);} },
    onRemoveTag: t=>{ if(selectedTags.includes(t)){ updateSearch(selectedTags.filter(x=>x!==t)); notify.removed(t); logVoice(\`remove tag \${t}\`,true);} },
    onOpenPreview: t=>{
      const f=stats.find(s=>s.tag===t);
      if(f){ setPreviewTag(t); setPreviewData(f.scores); setPreviewOpen(true); logVoice(\`preview tag \${t}\`,true);}
      else logVoice(\`preview tag \${t}\`,false);
    }
  });

  const exportCSV = () => {
    const hdr=['Tag','# Used','Avg Score','Std Dev','Δ Trend','Last'];
    const rows = stats.map(s=>[s.tag,s.scores.length,s.averageScore.toFixed(2),s.deviation.toFixed(2),s.delta.toFixed(2),s.last.toFixed(2)]);
    const csv=[hdr.join(',')].concat(rows.map(r=>r.join(','))).join('\n');
    const blob=new Blob([csv],{type:'text/csv'}), url=URL.createObjectURL(blob), a=document.createElement('a');
    a.href=url; a.download=\`tag_stats_\${new Date().toISOString().slice(0,10)}.csv\`; a.click();
  };

  const sorted = React.useMemo(()=> stats.slice().sort((a,b)=>{
    const d = sortDir==='asc'?1:-1;
    const av = sortBy==='count'?a.scores.length:a[sortBy], bv = sortBy==='count'?b.scores.length:b[sortBy];
    return av<bv?-1*d:av>bv?1*d:0;
  }),[stats,sortBy,sortDir]);

  const best = stats.length?Math.max(...stats.map(s=>s.averageScore)):0;
  const worst= stats.length?Math.min(...stats.map(s=>s.averageScore)):0;
  const arrow = (f:typeof sortBy)=>sortBy===f?(sortDir==='asc'?' ↑':' ↓'): '';

  const tableRef = useTableNavigation(sorted.length,i=>toggleTag(sorted[i].tag));

  return (
    <TooltipProvider>
      <TrendPreviewModal open={previewOpen} onClose={()=>setPreviewOpen(false)} data={previewData} tag={previewTag}/>
      <Card className="p-0 overflow-hidden">
        <ActiveTagBar />
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">📊 Tag Explorer</h2>
              <VoiceIndicator active />
              <ThemeToggle/>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip><TooltipTrigger asChild><Button size="sm" variant="outline" onClick={exportCSV}>⬇️ Export CSV</Button></TooltipTrigger><TooltipContent>Download metrics</TooltipContent></Tooltip>
              <Tooltip><TooltipTrigger asChild><ClearTagsButton/></TooltipTrigger><TooltipContent>Clear filters</TooltipContent></Tooltip>
            </div>
          </div>
          <VoiceConsole logs={voiceLog}/>
          <table ref={tableRef} role="grid" className="w-full text-sm">
            <thead><tr role="row">
              {['tag','# Used','Avg Score','Std Dev','Δ Trend','Scores'].map((h,i)=>(
                <th key={i} role="columnheader" className={\`\${i<5?'cursor-pointer':''} text-left\`} onClick={()=>i<5&&setSortBy((['tag','count','averageScore','deviation','delta'] as const)[i])}>
                  {h}{i<5&&arrow((['tag','count','averageScore','deviation','delta'] as const)[i])}
                </th>
              ))}
            </tr></thead>
            <tbody>{sorted.map((s,i)=>(
              <tr key={i} role="row" className={\`border-t cursor-pointer hover:bg-muted \${selectedTags.includes(s.tag)?'bg-primary/10':''}\`}>
                <td role="gridcell">{s.tag}</td>
                <td role="gridcell" className="text-right">{s.scores.length}</td>
                <td role="gridcell" className={\`text-right \${s.averageScore===best?'text-green-600 font-semibold':s.averageScore===worst?'text-red-500':''}\`}>{s.averageScore.toFixed(2)}</td>
                <td role="gridcell" className={\`text-right bg-opacity-20 \${s.deviation<0.5?'bg-green-200':s.deviation>1.5?'bg-red-200':'bg-yellow-100'}\`}>{s.deviation.toFixed(2)}</td>
                <td role="gridcell" className={\`text-right \${s.delta>0?'text-green-600':s.delta<0?'text-red-500':''}\`}>{s.delta.toFixed(2)}</td>
                <td role="gridcell" className="text-right" onClick={e=>{e.stopPropagation();setPreviewOpen(true);setPreviewTag(s.tag);setPreviewData(s.scores);}}>
                  <TagSparkline data={s.scores} title={\`min:\${Math.min(...s.scores).toFixed(2)}, max:\${Math.max(...s.scores).toFixed(2)}, last:\${s.last.toFixed(2)}\`}/>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
