import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { FrictionProfile } from '../../types';

export const FrictionBarChart: React.FC<{
  profile: FrictionProfile;
  height?: number;
}> = ({ profile, height = 300 }) => {
  if (!profile) return null;

  const data = [
    { name: 'Transport', score: profile.transport.score, level: profile.transport.level },
    { name: 'Travel Dist.', score: profile.travel.score, level: profile.travel.level },
    { name: 'Cost', score: profile.cost.score, level: profile.cost.level },
    { name: 'Family Supp.', score: profile.familySupport.score, level: profile.familySupport.level },
    { name: 'Digital', score: profile.digitalAccess.score, level: profile.digitalAccess.level },
    { name: 'Timing', score: profile.appointmentTiming.score, level: profile.appointmentTiming.level },
    { name: 'Document.', score: profile.documentation.score, level: profile.documentation.level },
    { name: 'Language', score: profile.language.score, level: profile.language.level },
  ].sort((a, b) => b.score - a.score);

  const getBarColor = (score: number) => {
    if (score >= 75) return '#ef4444'; // Critical
    if (score >= 50) return '#f97316'; // High
    if (score >= 25) return '#f59e0b'; // Medium
    return '#10b981'; // Low
  };

  return (
    <div className="w-full bg-white rounded-xl border border-slate-200/80 p-4 shadow-card">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className="text-sm font-bold text-slate-900">Barrier Severity Ranked</h4>
          <p className="text-[11px] text-slate-500">Sorted from highest to lowest operational resistance</p>
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Low
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Medium
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span> High/Crit
          </span>
        </div>
      </div>

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 35, bottom: 5 }}>
            <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#64748b' }} />
            <YAxis
              type="category"
              dataKey="name"
              tick={{ fontSize: 11, fill: '#334155', fontWeight: 500 }}
              width={75}
            />
            <Tooltip
              formatter={(val: any) => [`${val} / 100`, 'Barrier Score']}
              contentStyle={{
                backgroundColor: '#0f172a',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
                border: 'none',
              }}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getBarColor(entry.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
