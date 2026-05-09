import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatusChart = ({ data, labels = ['Available', 'Allocated'], total }) => {
  const chartData = {
    labels: labels,
    datasets: [
      {
        data: data, // e.g., [210, 980, 50]
        backgroundColor: [
          '#22c55e', // Success/Available (Green)
          '#3F51B5', // Primary/Allocated (Indigo)
          '#f59e0b', // Warning/Maintenance (Orange)
          '#ef4444', // Danger/Decommissioned (Red)
          '#6366f1', // Other (Violet)
        ],
        borderWidth: 0,
        cutout: '80%',
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: true,
      },
    },
    maintainAspectRatio: false,
  };

  return (
    <div style={{ position: 'relative', width: '200px', height: '200px' }}>
      <Doughnut data={chartData} options={options} />
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        pointerEvents: 'none'
      }}>
        <div style={{ fontSize: '28px', fontWeight: '800', color: 'var(--text-primary)' }}>{total}</div>
        <div style={{ fontSize: '10px', fontWeight: '700', color: 'var(--text-secondary)', letterSpacing: '0.1em' }}>TOTAL</div>
      </div>
    </div>
  );
};

export default StatusChart;
