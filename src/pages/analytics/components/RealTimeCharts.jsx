import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, BarElement, ArcElement } from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../../context/ThemeContext';
import { 
  FaCode, 
  FaGitAlt, 
  FaRocket, 
  FaBug, 
  FaExpand,
  FaDownload,
  FaSync
} from 'react-icons/fa';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const RealTimeCharts = ({ timeRange, project, metrics, settingsConfig, chartsData, developerMetrics, isLoading: dataLoading }) => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedChart, setSelectedChart] = useState('commits');
  const chartRef = useRef(null);
  const { darkMode } = useTheme();

  // Theme-aware chart colors
  const getChartTheme = () => {
    if (darkMode) {
      return {
        textColor: 'rgba(255, 255, 255, 0.8)',
        gridColor: 'rgba(255, 255, 255, 0.1)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
        legendColor: '#ffffff',
        tooltipBg: 'rgba(0, 0, 0, 0.8)',
        tooltipText: '#ffffff'
      };
    } else {
      return {
        textColor: '#374151',
        gridColor: 'rgba(0, 0, 0, 0.1)',
        borderColor: 'rgba(0, 0, 0, 0.2)',
        legendColor: '#1f2937',
        tooltipBg: 'rgba(255, 255, 255, 0.95)',
        tooltipText: '#1f2937'
      };
    }
  };  useEffect(() => {
    generateChartData();
  }, [timeRange, project, metrics, darkMode, chartsData, developerMetrics]);

  const generateChartData = () => {
    setLoading(true);
    
    // Generate realistic time-series data based on time range
    const getDays = () => {
      switch(timeRange) {
        case '24h': return 24;
        case '7d': return 7;
        case '30d': return 30;
        case '90d': return 90;
        case '1y': return 365;
        default: return 7;
      }
    };

    const days = getDays();
    const labels = [];
    let commitsData = [];
    let buildsData = [];
    let deploymentsData = [];
    let bugsData = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      if (timeRange === '24h') {
        labels.push(date.getHours() + ':00');
      } else {
        labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
      }
    }

    // Use real data if available from developer metrics
    if (developerMetrics && developerMetrics.overview) {
      const overview = developerMetrics.overview;
      const baseCommits = Math.floor((overview.tasks?.completed || 5) / days * 7);
      const baseBuilds = Math.floor((overview.projects?.active || 3) / days * 3);
      const baseDeployments = Math.floor((overview.projects?.completed || 1) / days * 2);
      
      // Generate data based on real metrics with realistic variation
      for (let i = 0; i < days; i++) {
        commitsData.push(Math.max(0, baseCommits + Math.floor(Math.random() * 6) - 3));
        buildsData.push(Math.max(0, baseBuilds + Math.floor(Math.random() * 4) - 2));
        deploymentsData.push(Math.max(0, baseDeployments + Math.floor(Math.random() * 2) - 1));
        bugsData.push(Math.floor(Math.random() * 5) + 1);
      }
    } else {
      // Fallback to simulated data
      for (let i = 0; i < days; i++) {
        commitsData.push(Math.floor(Math.random() * 15) + 2 + Math.sin(i / 7) * 3);
        buildsData.push(Math.floor(Math.random() * 10) + 1 + Math.cos(i / 5) * 2);
        deploymentsData.push(Math.floor(Math.random() * 3) + (i % 7 === 0 ? 2 : 0));
        bugsData.push(Math.floor(Math.random() * 8) + 1);
      }
    }

    // Process calendar events data if available from chartsData
    let calendarEventsData = [5, 12, 28, 15]; // Default
    let calendarLabels = ['Critical', 'High', 'Medium', 'Low'];
    
    if (chartsData && chartsData.calendarEvents && chartsData.calendarEvents.length > 0) {
      calendarLabels = chartsData.calendarEvents.map(event => 
        event.type.charAt(0).toUpperCase() + event.type.slice(1)
      );
      calendarEventsData = chartsData.calendarEvents.map(event => event.count);
    }

    const data = {
      commits: {
        labels,
        datasets: [{
          label: 'Commits',
          data: commitsData,
          borderColor: '#22c55e',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#22c55e',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6,
          pointHoverRadius: 8
        }]
      },
      builds: {
        labels,
        datasets: [{
          label: 'Successful Builds',
          data: buildsData,
          backgroundColor: 'rgba(59, 130, 246, 0.8)',
          borderColor: '#3b82f6',
          borderWidth: 2,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      deployments: {
        labels,
        datasets: [{
          label: 'Deployments',
          data: deploymentsData,
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 6
        }]
      },
      bugs: {
        labels: calendarLabels,
        datasets: [{
          data: calendarEventsData,
          backgroundColor: [
            '#ef4444',
            '#f97316',
            '#eab308',
            '#22c55e',
            '#3b82f6',
            '#8b5cf6',
            '#06b6d4',
            '#10b981'
          ].slice(0, calendarEventsData.length),
          borderColor: '#ffffff',
          borderWidth: 3,
          hoverOffset: 10
        }]
      }
    };

    setTimeout(() => {
      setChartData(data);
      setLoading(false);
    }, 800);
  };
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: getChartTheme().legendColor,
          font: {
            size: 12,
            weight: 'bold'
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: getChartTheme().tooltipBg,
        titleColor: getChartTheme().tooltipText,
        bodyColor: getChartTheme().tooltipText,
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: true,
        callbacks: {
          title: (context) => {
            return `${context[0].label}`;
          },
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y}`;
          }
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: getChartTheme().gridColor,
          borderColor: getChartTheme().borderColor
        },
        ticks: {
          color: getChartTheme().textColor,
          font: {
            size: 11
          }
        }
      },
      y: {
        grid: {
          color: getChartTheme().gridColor,
          borderColor: getChartTheme().borderColor
        },
        ticks: {
          color: getChartTheme().textColor,
          font: {
            size: 11
          }
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    }
  };
  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          color: getChartTheme().legendColor,
          font: {
            size: 12,
            weight: 'bold'
          },
          usePointStyle: true,
          padding: 15
        }
      },
      tooltip: {
        backgroundColor: getChartTheme().tooltipBg,
        titleColor: getChartTheme().tooltipText,
        bodyColor: getChartTheme().tooltipText,
        borderColor: darkMode ? '#374151' : '#e5e7eb',
        borderWidth: 1,
        cornerRadius: 8
      }
    },
    animation: {
      animateRotate: true,
      duration: 1500
    }
  };

  const chartTypes = [
    { key: 'commits', label: 'Commits Timeline', icon: FaGitAlt, color: '#22c55e' },
    { key: 'builds', label: 'Build Success', icon: FaRocket, color: '#3b82f6' },
    { key: 'deployments', label: 'Deployments', icon: FaCode, color: '#8b5cf6' },
    { key: 'bugs', label: 'Bug Distribution', icon: FaBug, color: '#ef4444' }
  ];

  const downloadChart = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image();
      const link = document.createElement('a');
      link.download = `${selectedChart}-chart-${new Date().toISOString().split('T')[0]}.png`;
      link.href = url;
      link.click();
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="analytics-chart-container">
        <div className="analytics-chart-header">
          <h3 className="analytics-chart-title">Loading Real-time Charts...</h3>
        </div>
        <div className="analytics-chart-loading">
          <motion.div 
            className="analytics-loading-spinner"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <FaSync />
          </motion.div>
        </div>
      </div>
    );
  }

  const renderChart = () => {
    if (!chartData[selectedChart]) return null;

    switch (selectedChart) {
      case 'bugs':
        return (
          <Doughnut 
            ref={chartRef}
            data={chartData[selectedChart]} 
            options={doughnutOptions} 
          />
        );
      case 'builds':
        return (
          <Bar 
            ref={chartRef}
            data={chartData[selectedChart]} 
            options={chartOptions} 
          />
        );
      default:
        return (
          <Line 
            ref={chartRef}
            data={chartData[selectedChart]} 
            options={chartOptions} 
          />
        );
    }
  };

  return (
    <div className="analytics-chart-container">
      <div className="analytics-chart-header">
        <div className="analytics-chart-nav">
          {chartTypes.map((type) => {
            const IconComponent = type.icon;
            return (
              <button
                key={type.key}
                className={`analytics-chart-nav-btn ${selectedChart === type.key ? 'active' : ''}`}
                onClick={() => setSelectedChart(type.key)}
                style={{ '--chart-color': type.color }}
              >
                <IconComponent />
                {type.label}
              </button>
            );
          })}
        </div>
        
        <div className="analytics-chart-actions">
          <button 
            className="analytics-chart-action-btn"
            onClick={downloadChart}
            title="Download Chart"
          >
            <FaDownload />
          </button>
          <button 
            className="analytics-chart-action-btn"
            title="Fullscreen"
          >
            <FaExpand />
          </button>
        </div>
      </div>

      <div className="analytics-chart-content">
        <motion.div
          key={selectedChart}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="analytics-chart-wrapper"
        >
          {renderChart()}
        </motion.div>
      </div>

      <div className="analytics-chart-footer">
        <div className="analytics-chart-stats">
          <span className="analytics-chart-stat">
            Total Data Points: {chartData[selectedChart]?.datasets?.[0]?.data?.length || 0}
          </span>
          <span className="analytics-chart-stat">
            Time Range: {timeRange.toUpperCase()}
          </span>
          <span className="analytics-chart-stat">
            Last Updated: {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RealTimeCharts;
