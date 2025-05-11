import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import type { Station } from '../types';
import './StationChart.css';

type ChartType = 'bar' | 'line';

// 定義圖表顏色
const CHART_COLORS = {
  bar: {
    fill: '#4CAF50',  // 綠色
    stroke: '#388E3C' // 深綠色
  },
  line: {
    stroke: '#2196F3', // 藍色
    dot: '#1976D2'     // 深藍色
  },
  grid: '#E0E0E0',    // 淺灰色網格
  text: '#424242'     // 深灰色文字
};

const StationChart: React.FC = () => {
  const [stations, setStations] = useState<Station[]>([]);
  const [chartType, setChartType] = useState<ChartType>('bar');

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await fetch('/src/services/userCount.json');
        const data = await response.json();
        setStations(data);
      } catch (err) {
        console.error('獲取站點數據時出錯:', err);
      }
    };

    fetchStations();
  }, []);

  const renderChart = (): React.ReactElement => {
    switch (chartType) {
      case 'bar':
        return (
          <BarChart
            data={stations}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis
              dataKey="time"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              stroke={CHART_COLORS.text}
            />
            <YAxis stroke={CHART_COLORS.text} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="使用次數" 
              fill={CHART_COLORS.bar.fill}
              stroke={CHART_COLORS.bar.stroke}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart
            data={stations}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis
              dataKey="time"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              stroke={CHART_COLORS.text}
            />
            <YAxis stroke={CHART_COLORS.text} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="使用次數" 
              stroke={CHART_COLORS.line.stroke}
              strokeWidth={2}
              dot={{ fill: CHART_COLORS.line.dot, strokeWidth: 2 }}
              activeDot={{ r: 6, fill: CHART_COLORS.line.dot }}
            />
          </LineChart>
        );
      default:
        return (
          <BarChart
            data={stations}
            margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} />
            <XAxis
              dataKey="time"
              angle={-45}
              textAnchor="end"
              height={100}
              interval={0}
              stroke={CHART_COLORS.text}
            />
            <YAxis stroke={CHART_COLORS.text} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Legend />
            <Bar 
              dataKey="使用次數" 
              fill={CHART_COLORS.bar.fill}
              stroke={CHART_COLORS.bar.stroke}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        );
    }
  };

  return (
    <div className="station-chart-container">
      <div className="chart-header">
        <h2>YouBike每月使用量圖表</h2>
        <div className="chart-type-selector">
          <button
            className={chartType === 'bar' ? 'active' : ''}
            onClick={() => setChartType('bar')}
          >
            柱狀圖
          </button>
          <button
            className={chartType === 'line' ? 'active' : ''}
            onClick={() => setChartType('line')}
          >
            折線圖
          </button>
        </div>
      </div>
      <div className="chart-wrapper">
        <ResponsiveContainer width="100%" height={400}>
          {renderChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StationChart; 