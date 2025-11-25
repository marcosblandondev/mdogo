import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ResultData } from '../App';
import { useLanguage } from '../contexts/LanguageContext';

interface ProbabilityChartProps {
  results: ResultData[];
}

export function ProbabilityChart({ results }: ProbabilityChartProps) {
  const { t } = useLanguage();
  
  const chartData = results.map((result) => ({
    name: result.region_id,
    probability: result.probability * 100,
  }));

  const COLORS = ['#D97706', '#F59E0B', '#FBBF24', '#FCD34D'];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-amber-900 mb-4">{t('results.chartTitle')}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 120, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
          <YAxis type="category" dataKey="name" width={110} />
          <Tooltip
            formatter={(value: number) => `${value.toFixed(1)}%`}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Bar dataKey="probability" radius={[0, 8, 8, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}