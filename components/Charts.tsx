import React from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Recording } from '../types';
import { CHART_COLORS } from '../constants';

interface ChartsProps {
  data: Recording[];
}

const Charts: React.FC<ChartsProps> = ({ data }) => {
    // Process Data for Charts
    
    // 1. Disposition Counts
    const dispositionCounts = data.reduce((acc, curr) => {
        acc[curr.disposition] = (acc[curr.disposition] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const pieData = Object.keys(dispositionCounts).map(key => ({
        name: key,
        value: dispositionCounts[key]
    }));

    // 2. Calls by Date (Simple aggregation by date string)
    const callsByDate = data.reduce((acc, curr) => {
        const date = new Date(curr.calldate).toLocaleDateString('pt-BR', { month: 'short', day: 'numeric' });
        acc[date] = (acc[date] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Convert to array and take last 7 distinct days (approx logic for dashboard)
    const barData = Object.keys(callsByDate).map(key => ({
        date: key,
        chamadas: callsByDate[key]
    })).slice(0, 10); // Limit bars for cleaner UI

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Disposition Distribution */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Distribuição de Status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36}/>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Volume by Date */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Volume Recente</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={barData}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
              <Tooltip 
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="chamadas" fill="#0ea5e9" radius={[4, 4, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Charts;