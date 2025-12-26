// PatientCharts.jsx
import React from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { Pencil } from 'lucide-react'; // Or use your own icon library
import './patientCharts.css';

// MOCK DATA (Replace this with real data passed via props later)
const weekData = [
  { day: 'Sun', sleep: 75, mood: 75, stress: 75 },
  { day: 'Mon', sleep: 30, mood: 30, stress: 30 },
  { day: 'Tue', sleep: 68, mood: 68, stress: 68 },
  { day: 'Wed', sleep: 40, mood: 40, stress: 40 },
  { day: 'Thu', sleep: 50, mood: 50, stress: 50 },
  { day: 'Fri', sleep: 85, mood: 85, stress: 85 },
  { day: 'Sat', sleep: 105, mood: 105, stress: 105 },
];

const taskData = [
  { name: 'Completed', value: 68 },
  { name: 'Remaining', value: 32 },
];

const THEME_COLOR = "#0F9D87"; // The teal color from your image

// Reusable Line Chart Component
const CustomLineChart = ({ title, dataKey, data }) => (
  <div className="chart-card">
    <h3 className="chart-title">{title}</h3>
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#E5E7EB" />
          <XAxis 
            dataKey="day" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#333', fontSize: 12 }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#333', fontSize: 12 }} 
            domain={[0, 100]}
            ticks={[0, 20, 40, 60, 80, 100]}
          />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={THEME_COLOR} 
            strokeWidth={2} 
            dot={{ r: 6, fill: THEME_COLOR, strokeWidth: 0 }} 
            activeDot={{ r: 8 }} 
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

export default function PatientCharts({ patientData }) {
  // You can process `patientData` here to replace `weekData`
  
  return (
    <div className="charts-section">
      <div className="charts-header">
        <h2>Chart</h2>
        <button className="icon-btn">
          <Pencil size={18} />
        </button>
      </div>

      <div className="charts-grid">
        {/* Sleep Quality */}
        <CustomLineChart title="Sleep Quality" dataKey="sleep" data={weekData} />

        {/* Mood Rating */}
        <CustomLineChart title="Mood Rating" dataKey="mood" data={weekData} />

        {/* Stress Level */}
        <CustomLineChart title="Stress Level" dataKey="stress" data={weekData} />

        {/* CTB Task Completion (Donut) */}
        <div className="chart-card">
          <h3 className="chart-title">CTB Task Completion</h3>
          <div className="chart-container donut-container">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  stroke="none"
                >
                  <Cell fill={THEME_COLOR} />
                  <Cell fill="#E5E7EB" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Centered Text */}
            <div className="donut-label">
              <span>{taskData[0].value}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}