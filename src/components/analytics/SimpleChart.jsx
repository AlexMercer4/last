import React from 'react';

// Simple bar chart component for data visualization
export const SimpleBarChart = ({ data, title, height = 200 }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No data available
      </div>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <div className="space-y-4">
      {title && <h3 className="font-medium text-gray-900">{title}</h3>}
      <div className="space-y-3">
        {data.map((item, index) => (
          <div key={index} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-gray-700">{item.label}</span>
              <span className="font-medium text-gray-900">{item.value}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(item.value / maxValue) * 100}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple line chart component for trends
export const SimpleTrendChart = ({ data, title }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-500">
        No trend data available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {title && <h3 className="font-medium text-gray-900">{title}</h3>}
      <div className="grid grid-cols-6 gap-2">
        {data.slice(-6).map((item, index) => (
          <div key={index} className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-xs text-gray-500 mb-1">{item.period}</div>
            <div className="text-lg font-bold text-blue-600">{item.value}</div>
            {item.change && (
              <div className={`text-xs ${item.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                {item.change > 0 ? '+' : ''}{item.change}%
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Simple metric card component
export const MetricCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    red: 'bg-red-500',
  };

  return (
    <div className="bg-white p-6 rounded-lg border">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-gray-900 mt-2">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-gray-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`${colorClasses[color]} p-3 rounded-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        )}
      </div>
    </div>
  );
};