/**
 * components/BarChart.jsx
 * Recharts bar chart for monthly spending trend (last 6 months).
 */

import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { formatCurrency, formatMonth } from '../utils/formatters';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'rgba(26,26,46,0.98)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '10px',
      padding: '10px 14px',
      fontSize: '0.82rem',
    }}>
      <div style={{ fontWeight: 600, color: 'rgba(240,240,255,0.6)', marginBottom: '4px' }}>
        {formatMonth(label)}
      </div>
      <div style={{ color: 'var(--primary-light)', fontWeight: 700 }}>
        {formatCurrency(payload[0].value)}
      </div>
    </div>
  );
}

export default function BarChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">📊</div>
        <div className="empty-state-text">No trend data yet</div>
      </div>
    );
  }

  const currentMonth = data[data.length - 1]?.month;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ReBarChart data={data} barSize={32} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" stopOpacity={1} />
            <stop offset="100%" stopColor="#4f1dbf" stopOpacity={0.8} />
          </linearGradient>
          <linearGradient id="barGradCurrent" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06d6a0" stopOpacity={1} />
            <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
        <XAxis
          dataKey="month"
          tick={{ fill: 'rgba(240,240,255,0.4)', fontSize: 11, fontFamily: 'Inter' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => {
            const [y, m] = v.split('-');
            return new Date(y, m - 1).toLocaleString('en', { month: 'short' });
          }}
        />
        <YAxis
          tick={{ fill: 'rgba(240,240,255,0.4)', fontSize: 11, fontFamily: 'Inter' }}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
        <Bar dataKey="spent" radius={[6, 6, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.month === currentMonth ? 'url(#barGradCurrent)' : 'url(#barGrad)'}
            />
          ))}
        </Bar>
      </ReBarChart>
    </ResponsiveContainer>
  );
}
