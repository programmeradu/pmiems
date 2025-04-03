import React from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface DataPoint {
  name: string;
  count: number;
}

interface EmployeeChartProps {
  data: DataPoint[];
}

const EmployeeChart: React.FC<EmployeeChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#E4E4E7' : '#71717A';
  const gridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  if (!data || data.length === 0) {
    return <div className="flex justify-center items-center h-full">No data available</div>;
  }

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        label: 'Count',
        data: data.map(item => item.count),
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)', // Primary
          'rgba(34, 197, 94, 0.8)',  // Success
          'rgba(236, 72, 153, 0.8)'  // Pink
        ],
        borderColor: [
          'rgb(99, 102, 241)',
          'rgb(34, 197, 94)',
          'rgb(236, 72, 153)'
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            return `${context.parsed.y} items`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: gridColor,
        },
        ticks: {
          color: textColor,
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: textColor,
        }
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default EmployeeChart;