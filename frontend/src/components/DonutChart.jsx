/**
 * components/DonutChart.jsx
 * Recharts donut chart for per-category spending breakdown.
 */

import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '../utils/formatters';

const RADIAN = Math.PI / 180;

function CustomLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
      fontSize={11} fontWeight={600} fontFamily="Inter, sans-serif">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: 'rgba(26,26,46,0.98)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '0.82rem',
    }}>
      <div style={{ fontWeight: 700, marginBottom: '4px', color: d.payload.color }}>
        {d.payload.category_icon} {d.payload.category_name}
      </div>
      <div style={{ color: 'rgba(240,240,255,0.7)' }}>
        Spent: <strong style={{ color: 'white' }}>{formatCurrency(d.value)}</strong>
      </div>
    </div>
  );
}

export default function DonutChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">🍩</div>
        <div className="empty-state-text">No spending data yet</div>
      </div>
    );
  }

  const chartData = data.map(d => ({
    name: `${d.category_icon} ${d.category_name}`,
    value: d.spent,
    color: d.category_color,
    category_name: d.category_name,
    category_icon: d.category_icon,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          innerRadius={70}
          outerRadius={110}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={CustomLabel}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} stroke="rgba(0,0,0,0.2)" strokeWidth={2} />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend
          formatter={(value) => (
            <span style={{ color: 'rgba(240,240,255,0.7)', fontSize: '0.78rem' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
