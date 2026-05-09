import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const StatusChart = ({ dataValues = [980, 210, 35, 15], total = "1.2k" }) => {
  const data = {
    labels: ['Assigned', 'Available', 'In Repair', 'Retired'],
    datasets: [
      {
        data: dataValues,
        backgroundColor: [
          '#14b8a6', // Assigned - Cyan
          '#22c55e', // Available - Green
          '#eab308', // In Repair - Yellow
          '#6b7280', // Retired - Gray
        ],
        borderWidth: 0,
        hoverOffset: 4,
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
        backgroundColor: '#1e293b',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' },
        bodyFont: { size: 13 },
        cornerRadius: 8,
      },
    },
    maintainAspectRatio: false,
    responsive: true,
  };

  return (
    <div className="relative w-48 h-48">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-2xl font-bold text-gray-900 leading-none">{total}</span>
        <span className="text-[10px] font-bold text-gray-400 tracking-widest uppercase mt-1">TOTAL</span>
      </div>
    </div>
  );
};

export default StatusChart;
