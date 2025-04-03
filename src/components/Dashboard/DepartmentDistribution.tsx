import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

ChartJS.register(ArcElement, Tooltip, Legend);

interface DepartmentDistributionProps {
  data: {
    name: string;
    employee_count: number;
  }[];
}

const DepartmentDistribution: React.FC<DepartmentDistributionProps> = ({ data }) => {
  const { theme } = useTheme();
  const textColor = theme === 'dark' ? '#E4E4E7' : '#71717A';

  if (!data || data.length === 0) {
    return <div className="flex justify-center items-center h-full">No department data available</div>;
  }

  // Generate nice colors for the chart
  const generateColors = (count: number) => {
    const baseColors = [
      '#6366F1', // Primary
      '#22C55E', // Success
      '#F59E0B', // Warning
      '#EC4899', // Pink
      '#8B5CF6', // Purple
      '#10B981', // Emerald
      '#3B82F6', // Blue
      '#F97316', // Orange
    ];

    // If we need more colors than our base set, generate them
    if (count <= baseColors.length) {
      return baseColors.slice(0, count);
    }

    // Generate additional colors by adjusting hue
    const colors = [...baseColors];
    while (colors.length < count) {
      const lastColor = colors[colors.length - 1];
      // Create a new color by shifting the hue
      const r = parseInt(lastColor.slice(1, 3), 16);
      const g = parseInt(lastColor.slice(3, 5), 16);
      const b = parseInt(lastColor.slice(5, 7), 16);
      
      // Shift color slightly
      const newR = (r + 20) % 255;
      const newG = (g + 40) % 255;
      const newB = (b + 60) % 255;
      
      colors.push(`#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`);
    }
    
    return colors;
  };

  const chartData = {
    labels: data.map(item => item.name),
    datasets: [
      {
        data: data.map(item => item.employee_count),
        backgroundColor: generateColors(data.length),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: textColor,
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = Math.round((value * 100) / total);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      }
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default DepartmentDistribution;