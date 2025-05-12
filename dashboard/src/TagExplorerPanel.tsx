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
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedTags = searchParams.getAll('tag');
  const [sortBy, setSortBy] = useState<'tag'|'count'|'averageScore'|'deviation'|'delta'>('averageScore');
  const [sortDir, setSortDir] = useState<'asc'|'desc'>('desc');
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewData, setPreviewData] = useState<number[]>([]);
  const [previewTag, setPreviewTag] = useState('');
  const [voiceActive] = useState(true);
  const [voiceLog, setVoiceLog] = useState<{ command:string; match:boolean; timestamp:number }[]>([]);

  const logVoice = (command: string, match: boolean) => {
    setVoiceLog(prev => [...prev.slice(-19), { command, match, timestamp: Date.now() }]);
  };

  const updateSearch = (tags: string[]) => {
    const next = new URLSearchParams(searchParams);
    next.delete('tag');
    tags.forEach(t => next.append('tag', t));
    setSearchParams(next);
  };

  const toggleTag = (tag: string) => {
    const isSelected = selectedTags.includes(tag);
    const nextTags = isSelected ? selectedTags.filter(t => t !== tag) : [...selectedTags, tag];
    updateSearch(nextTags);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    isSelected ? notify.removed(tag) : notify.added(tag);
  };

  useVoiceCommands({
    onAddTag: tag => {
      if (!selectedTags.includes(tag)) {
        updateSearch([...selectedTags, tag]);
        notify.added(tag);
        logVoice(\`add tag \${tag}\`, true);
      }
    },
    onRemoveTag: tag => {
      if (selectedTags.includes(tag)) {
        updateSearch(selectedTags.filter(t => t !== tag));
        notify.removed(tag);
        logVoice(\`remove tag \${tag}\`, true);
      }
    },
    onOpenPreview: tag => {
      const found = stats.find(s => s.tag === tag);
      if (found) {
        setPreviewTag(tag);
        setPreviewData(found.scores);
        setPreviewOpen(true);
        logVoice(\`preview tag \${tag}\`, true);
      } else {
        logVoice(\`preview tag \${tag}\`, false);
      }
    }
  });

  const exportCSV = () => {
    const header = ['Tag','# Used','Avg Score','Std Dev','Δ Trend','Last'];
    const rows = stats.map(s => [
      s.tag,
      s.scores.length,
      s.averageScore.toFixed(2),
      s.deviation.toFixed(2),
      s.delta.toFixed(2),
      s.last.toFixed(2)
    ]);
    const csv = [header.join(',')].concat(rows.map(r => r.join(','))).join('\\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = \`tag_stats_\${new Date().toISOString().slice(0,10)}.csv\`;
    a.click();
  };

  const sorted = React.useMemo(() =>
    stats.slice().sort((a,b) => {
      const dir = sortDir==='asc'?1:-1;
      const aVal = sortBy==='count'?a.scores.length:a[sortBy];
      const bVal = sortBy==='count'?b.scores.length:b[sortBy];
      return aVal<bVal? -1*dir : aVal>bVal?1*dir:0;
    }),
    [stats,sortBy,sortDir]
  );

  const bestScore  = stats.length?Math.max(...stats.map(s=>s.averageScore)):0;
  const worstScore = stats.length?Math.min(...stats.map(s=>s.averageScore)):0;
  const arrow = (f: typeof sortBy) => sortBy===f?(sortDir==='asc'?' ↑':' ↓'):'';  
  const tableRef = useTableNavigation(sorted.length, i => toggleTag(sorted[i].tag));

  return (
    <TooltipProvider>
      <TrendPreviewModal open={previewOpen} onClose={()=>setPreviewOpen(false)} data={previewData} tag={previewTag}/>
      <Card className="p-0 overflow-hidden">
        <ActiveTagBar/>
        <CardContent className="pt-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold">📊 Tag Explorer</h2>
              <VoiceIndicator active={voiceActive}/>
              <ThemeToggle/>
            </div>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button size="sm" variant="outline" onClick={exportCSV}>⬇️ Export CSV</Button>
                </TooltipTrigger>
                <TooltipContent>Download full tag performance metrics</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <ClearTagsButton/>
                </TooltipTrigger>
                <TooltipContent>Clear selected filters</TooltipContent>
              </Tooltip>
            </div>
          </div>
          <VoiceConsole logs={voiceLog}/>
          <table ref={tableRef} role="grid" className="w-full text-sm">
            <thead>
              <tr role="row">
                {['tag','# Used','Avg Score','Std Dev','Δ Trend','Scores'].map((h,i)=>(
                  <th key={i} role="columnheader" className={\`\${i<5?'cursor-pointer':''} text-left\`} onClick={()=>i<5&&setSortBy((['tag','count','averageScore','deviation','delta'] as const)[i])}>
                    {h}{i<5&&arrow((['tag','count','averageScore','deviation','delta'] as const)[i])}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((s,i)=>(
                <tr key={i} role="row" className={\`border-t cursor-pointer transition-all duration-300 hover:bg-muted hover:shadow-inner \${selectedTags.includes(s.tag)?'bg-primary/10':''}\`}>
                  <td role="gridcell">{s.tag}</td>
                  <td role="gridcell" className="text-right">{s.scores.length}</td>
                  <td role="gridcell" className={\`text-right \${s.averageScore===bestScore?'text-green-600 font-semibold':s.averageScore===worstScore?'text-red-500':''}\`}>
                    {s.averageScore.toFixed(2)}
                  </td>
                  <td role="gridcell" className={\`text-right bg-opacity-20 \${s.deviation<0.5?'bg-green-200':s.deviation>1.5?'bg-red-200':'bg-yellow-100'}\`}>
                    {s.deviation.toFixed(2)}
                  </td>
                  <td role="gridcell" className={\`text-right \${s.delta>0?'text-green-600':s.delta<0?'text-red-500':''}\`}>
                    {s.delta.toFixed(2)}
                  </td>
                  <td role="gridcell" className="text-right" onClick={e=>{e.stopPropagation(); setPreviewTag(s.tag); setPreviewData(s.scores); setPreviewOpen(true);}}>
                    <TagSparkline data={s.scores} title={\`min:\${Math.min(...s.scores).toFixed(2)}, max:\${Math.max(...s.scores).toFixed(2)}, last:\${s.last.toFixed(2)}\`}/>  
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
