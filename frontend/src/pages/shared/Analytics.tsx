import { BarChart3, TrendingUp, Users, Target } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Analytics() {
  const stats = [
    { name: 'Total Viewers', stat: '71,897', icon: Users, change: '12%', changeType: 'increase' },
    { name: 'Avg. Match Rate', stat: '58.16%', icon: Target, change: '2.02%', changeType: 'increase' },
    { name: 'Avg. Retention', stat: '24.57%', icon: TrendingUp, change: '3.2%', changeType: 'decrease' },
    { name: 'Total Activity', stat: '33,024', icon: BarChart3, change: '4%', changeType: 'increase' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Insights</h1>
          <p className="text-gray-500 mt-1">Review your performance metrics and activity history.</p>
        </div>
        <div className="flex items-center space-x-2">
          <select className="border-gray-200 rounded-lg text-sm focus:ring-slate-900 focus:border-slate-900">
            <option>Last 7 days</option>
            <option>Last 30 days</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <div className="rounded-lg bg-indigo-50 p-2.5">
                <item.icon className="h-5 w-5 text-indigo-600" aria-hidden="true" />
              </div>
              <span className={`inline-flex items-baseline px-2 py-0.5 rounded-full text-xs font-semibold ${
                  item.changeType === 'increase' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                {item.changeType === 'increase' ? '+' : '-'}{item.change}
              </span>
            </div>
            
            <p className="mt-4 text-sm font-medium text-gray-500 truncate">{item.name}</p>
            <div className="flex items-baseline">
              <p className="mt-1 text-2xl font-semibold text-gray-900">{item.stat}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-80 flex items-center justify-center">
          <p className="text-gray-400 font-medium">Activity Chart Placeholder</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-80 flex items-center justify-center">
          <p className="text-gray-400 font-medium">Demographics Distribution Placeholder</p>
        </div>
      </div>
    </div>
  );
}
