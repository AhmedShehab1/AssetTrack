import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

/**
 * StatusChart visualization for Asset distribution.
 * Supports dynamic labels and handles empty data states.
 */
const StatusChart = ({ data = [], total = 0, labels = [] }) => {
  // Map status labels to design system colors
  const getStatusColors = (statusLabels) => {
    return statusLabels.map(label => {
      switch (label?.toUpperCase()) {
        case 'AVAILABLE': return '#22c55e'; // Green
        case 'ALLOCATED':
        case 'ASSIGNED': return '#3F51B5'; // Indigo
        case 'UNDER_REPAIR': return '#f59e0b'; // Amber
        case 'DECOMMISSIONED': return '#ef4444'; // Red
        case 'SPARE': return '#6366f1'; // Violet
        default: return '#94a3b8'; // Slate
      }
    });
  };

  const isEmpty = !data || data.length === 0 || data.every(v => v === 0);

  // Unify labels: ASSIGNED -> ALLOCATED
  const unifiedLabels = labels.map(l => l.toUpperCase() === 'ASSIGNED' ? 'Allocated' : l);

  const chartData = {
    labels: unifiedLabels.length > 0 ? unifiedLabels : ['Available', 'Allocated'],
    datasets: [
      {
        data: isEmpty ? [1] : data,
        backgroundColor: isEmpty ? ['#f1f5f9'] : getStatusColors(labels),
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
        enabled: !isEmpty,
      },
    },
    maintainAspectRatio: false,
    cutout: '80%',
  };

  return (
    <div className="relative w-48 h-48 flex items-center justify-center">
      <Doughnut data={chartData} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        {isEmpty ? (
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">No Data</span>
        ) : (
          <>
            <div className="text-3xl font-extrabold text-text-heading leading-none">{total}</div>
            <div className="text-[10px] font-bold text-text-body uppercase tracking-[0.15em] mt-1 opacity-60">Total</div>
          </>
        )}
      </div>
    </div>
  );
};

export default StatusChart;
