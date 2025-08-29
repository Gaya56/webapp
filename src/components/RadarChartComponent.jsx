import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer
} from 'recharts';

// Custom component to render radar charts in markdown
const RadarChartComponent = ({ data, aspects }) => {
  // Parse the data string into an array of objects
  const parseData = (dataStr) => {
    try {
      return JSON.parse(dataStr);
    } catch (error) {
      console.error('Error parsing radar chart data:', error);
      return [];
    }
  };

  const chartData = parseData(data);

  return (
    <div className="w-full h-96 my-4">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart outerRadius="80%" data={chartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="subject" />
          <PolarRadiusAxis angle={30} domain={[0, 100]} />
          {aspects.split(',').map((aspect, index) => (
            <Radar
              key={aspect}
              name={aspect.trim()}
              dataKey={aspect.trim()}
              stroke={`hsl(${index * 60}, 70%, 50%)`}
              fill={`hsl(${index * 60}, 70%, 50%)`}
              fillOpacity={0.3}
            />
          ))}
          <Legend />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RadarChartComponent;