import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function TagSparkline({ data, title }: { data:number[]; title?:string }) {
  if (!data.length) return null;
  const chartData = data.map((score,i)=>({ index:i, score }));
  const lastIndex = data.length-1;
  return (
    <div style={{width:80,height:30}} title={title}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="score"
            stroke="#8884d8"
            strokeWidth={1.5}
            dot={props=> props.index===lastIndex?(
              <circle {...props} r={3.5} fill="#6366f1" stroke="white" strokeWidth={0.7}
                style={{filter:'drop-shadow(0 0 2px #6366f1)',animation:'pulse 1.5s infinite'}}/>
            ):null}
          />
        </LineChart>
      </ResponsiveContainer>
      <style>{\`
        @keyframes pulse {
          0%{transform:scale(1);opacity:1;}
          50%{transform:scale(1.3);opacity:0.7;}
          100%{transform:scale(1);opacity:1;}
        }\`}</style>
    </div>
  );
}
