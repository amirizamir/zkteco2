
import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendType }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-5 rounded-xl hover:border-zinc-700 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
          {icon}
        </div>
        {trend && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            trendType === 'up' ? 'bg-emerald-500/10 text-emerald-500' : 
            trendType === 'down' ? 'bg-rose-500/10 text-rose-500' : 
            'bg-zinc-800 text-zinc-400'
          }`}>
            {trend}
          </span>
        )}
      </div>
      <h3 className="text-zinc-500 text-sm font-medium mb-1">{title}</h3>
      <p className="text-2xl font-bold text-zinc-100">{value}</p>
    </div>
  );
};

export default StatCard;
