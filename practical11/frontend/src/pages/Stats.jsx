import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Stats({ tasks }) {
  // Calculate stats from tasks
  const completed = tasks.filter(t => t.completed).length;
  const pending = tasks.length - completed;
  const highPriority = tasks.filter(t => t.priority === 'high').length;

  const data = [
    { name: 'Total', count: tasks.length },
    { name: 'Completed', count: completed },
    { name: 'Pending', count: pending },
    { name: 'High Priority', count: highPriority },
  ];

  return (
    <div className="stats-container" style={{ padding: '2rem', background: '#fff', borderRadius: '12px', marginTop: '2rem' }}>
      <h2>Task Analytics (Heavy Component)</h2>
      <p style={{ marginBottom: '2rem', color: '#666' }}>This chart library (Recharts) is lazily loaded only when you visit this page.</p>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <XAxis dataKey="name" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#111" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
