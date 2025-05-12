import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export function TrendPreviewModal({ open,onClose,data,tag }:{
  open:boolean; onClose:()=>void; data:number[]; tag:string;
}) {
  const chartData = data.map((v,i)=>({ index:i, score:v }));
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-2xl p-6">
        <h2 className="text-lg font-semibold mb-4">📊 {tag} — Trend Preview</h2>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={chartData}>
            <XAxis dataKey="index" tick={{fontSize:10}}/>
            <YAxis domain={['auto','auto']} tick={{fontSize:10}}/>
            <Tooltip formatter={(v:number)=>v.toFixed(2)}/>
            <Line type="monotone" dataKey="score" stroke="#6366f1" strokeWidth={2} dot={{r:1.5}} activeDot={{r:4}}/>
          </LineChart>
        </ResponsiveContainer>
      </DialogContent>
    </Dialog>
  );
}
