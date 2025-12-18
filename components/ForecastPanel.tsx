'use client';

import { motion } from 'framer-motion';

interface ForecastDay {
  day: string;
  low: number;
  high: number;
  condition: 'sunny' | 'cloudy' | 'rain' | 'storm';
}

const forecastData: ForecastDay[] = [
    { day: 'TODAY', low: 24, high: 32, condition: 'rain' },
    { day: 'SAT', low: 23, high: 31, condition: 'storm' },
    { day: 'SUN', low: 22, high: 29, condition: 'rain' },
    { day: 'MON', low: 25, high: 33, condition: 'cloudy' },
    { day: 'TUE', low: 26, high: 35, condition: 'sunny' },
];

const icons = {
    sunny: '☀️',
    cloudy: '☁️',
    rain: '🌧',
    storm: '⛈'
};

export default function ForecastPanel() {
  return (
    <div className="glass-card p-4 w-full overflow-x-auto custom-scrollbar">
       <div className="flex justify-between items-center min-w-[300px] gap-2">
            {forecastData.map((day, i) => (
                <div key={i} className="flex flex-col items-center p-2 rounded-lg hover:bg-white/5 transition-colors flex-1 text-center">
                    <span className="text-[10px] font-bold text-gray-400 mb-1">{day.day}</span>
                    <span className="text-2xl mb-1 filter drop-shadow-md">{icons[day.condition]}</span>
                    <div className="flex gap-2 text-xs font-mono">
                         <span className="text-white font-bold">{day.high}°</span>
                         <span className="text-gray-500">{day.low}°</span>
                    </div>
                    {/* Rain Bar if raining */}
                    {(day.condition === 'rain' || day.condition === 'storm') && (
                        <div className="w-8 h-1 mt-2 bg-blue-900/50 rounded-full overflow-hidden">
                            <motion.div 
                                className="h-full bg-blue-500"
                                initial={{ width: 0 }}
                                animate={{ width: '80%' }}
                            />
                        </div>
                    )}
                </div>
            ))}
       </div>
    </div>
  );
}
