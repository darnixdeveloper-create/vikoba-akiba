
import React from 'react';
import { AppData } from '../types';
import { T } from '../constants';
import { FileDown, PieChart, BarChart as BarChartIcon, TrendingUp } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface TaarifaProps {
  data: AppData;
  lang: 'sw' | 'en';
  addToast: (msg: string, type?: any) => void;
}

export default function Taarifa({ data, lang, addToast }: TaarifaProps) {
  const i18n = T[lang];

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: '#8a8070',
          font: { family: 'DM Sans', size: 10 }
        }
      },
      tooltip: {
        backgroundColor: '#1a1917',
        titleFont: { family: 'Cormorant Garamond', size: 14 },
        bodyFont: { family: 'DM Sans' },
        borderColor: '#2a2824',
        borderWidth: 1
      }
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#8a8070', font: { size: 10 } }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.04)' },
        ticks: { color: '#8a8070', font: { size: 10 } }
      }
    }
  };

  // 1. Monthly Contributions (Bar)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const monthlyData = months.map((month, index) => {
    // Basic mapping: mapping month names to numeric month (e.g., Jan = 0)
    const monthNum = index + 1; // 1-indexed for matching 2024-01-XX
    const monthStr = monthNum.toString().padStart(2, '0');
    return data.historia
      .filter(tx => tx.type === 'Mchango' && tx.date.includes(`-0${monthNum}-`) || tx.date.includes(`-${monthStr}-`))
      .reduce((acc, tx) => acc + tx.amount, 0);
  });

  const barData = {
    labels: months,
    datasets: [{
      label: i18n.contribution,
      data: monthlyData,
      backgroundColor: 'rgba(201, 168, 76, 0.6)',
      borderColor: '#c9a84c',
      borderWidth: 1,
      borderRadius: 4,
    }]
  };

  // 2. Contributions per Member (Doughnut)
  const doughnutData = {
    labels: data.members.map(m => m.name.split(' ')[0]),
    datasets: [{
      data: data.members.map(m => m.contributions),
      backgroundColor: [
        '#c9a84c',
        '#8a6624',
        '#ae8b34',
        '#5a5a40',
        '#2a2824',
        '#1a1917',
      ],
      hoverOffset: 10,
      borderWidth: 0
    }]
  };

  // 3. Savings Growth (Line)
  const growthData: number[] = [];
  let cumulative = 0;
  monthlyData.forEach(m => {
    cumulative += m;
    growthData.push(cumulative);
  });

  const lineData = {
    labels: months,
    datasets: [{
      fill: true,
      label: i18n.totalSavings,
      data: growthData,
      borderColor: '#c9a84c',
      backgroundColor: 'rgba(201, 168, 76, 0.1)',
      tension: 0.4,
      pointRadius: 4,
      pointBackgroundColor: '#c9a84c'
    }]
  };

  const handleDownload = () => {
    addToast(lang === 'sw' ? "Inapakua PDF..." : "Downloading PDF...", "info");
    const event = new CustomEvent('generate-pdf');
    window.dispatchEvent(event);
  };

  const dashboardStat = {
    total: data.members.reduce((acc, m) => acc + m.contributions, 0),
    avg: data.members.reduce((acc, m) => acc + m.contributions, 0) / data.members.length
  };

  return (
    <div className="space-y-10">
      <div className="flex justify-between items-center bg-luxury-gray p-6 rounded-lg border border-luxury-border">
        <div>
          <h2 className="text-3xl font-serif font-bold text-luxury-text">{i18n.reports}</h2>
          <p className="text-luxury-text-muted">{i18n.savingsGrowth} Statistics</p>
        </div>
        <button 
          onClick={handleDownload}
          className="flex items-center gap-2 bg-luxury-dark border border-luxury-border text-gold px-6 py-3 rounded-md hover:bg-gold/10 transition-all font-bold"
        >
          <FileDown className="w-5 h-5" />
          {i18n.downloadPdf}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Bar Chart */}
        <div className="bg-luxury-gray p-8 rounded-lg border border-luxury-border gold-top-border h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <BarChartIcon className="w-5 h-5 text-gold" />
            <h3 className="text-xl font-serif font-bold text-luxury-text">{i18n.monthlyContributions}</h3>
          </div>
          <div className="flex-1">
            <Bar data={barData} options={commonOptions} />
          </div>
        </div>

        {/* Growth Line Chart */}
        <div className="bg-luxury-gray p-8 rounded-lg border border-luxury-border gold-top-border h-[400px] flex flex-col">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-5 h-5 text-gold" />
            <h3 className="text-xl font-serif font-bold text-luxury-text">{i18n.savingsGrowth}</h3>
          </div>
          <div className="flex-1">
            <Line data={lineData} options={commonOptions} />
          </div>
        </div>

        {/* Member Doughnut Chart */}
        <div className="bg-luxury-gray p-8 rounded-lg border border-luxury-border gold-top-border lg:col-span-2 flex flex-col items-center">
            <div className="w-full flex items-center gap-2 mb-6">
              <PieChart className="w-5 h-5 text-gold" />
              <h3 className="text-xl font-serif font-bold text-luxury-text">{i18n.contributionsByMember}</h3>
            </div>
            <div className="h-[400px] w-full max-w-2xl">
              <Doughnut 
                data={doughnutData} 
                options={{
                  ...commonOptions,
                  plugins: {
                    ...commonOptions.plugins,
                    legend: {
                      position: 'right' as const,
                      labels: { color: '#8a8070', font: { size: 12, family: 'DM Sans' } }
                    }
                  }
                }} 
              />
            </div>
        </div>
      </div>
    </div>
  );
}
