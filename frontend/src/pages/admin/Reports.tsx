import { Download, BarChart2, TrendingUp, PieChart as PieChartIcon, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Reports() {
  const reports = [
    { title: 'User Growth & Retention', desc: 'Monthly new registrations, active users, and churn rate across all roles.', icon: TrendingUp },
    { title: 'Apprenticeship Outcomes', desc: 'Success rates, dropout metrics, and time-to-hire statistics.', icon: BarChart2 },
    { title: 'Company Engagement', desc: 'Activity levels of employer partners, listing creation rates, and response times.', icon: PieChartIcon },
    { title: 'System Health & Analytics', desc: 'API usage, error rates, and resource utilization reports.', icon: FileText },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Custom Reports</h1>
          <p className="text-gray-500 mt-1">Generate and export detailed platform analytics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {reports.map((report, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex items-start gap-4 hover:border-slate-400 transition"
          >
            <div className="rounded-lg bg-slate-50 p-3 flex-shrink-0">
              <report.icon className="h-6 w-6 text-slate-700" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{report.title}</h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">{report.desc}</p>
              
              <div className="mt-4 flex gap-3">
                <button className="inline-flex items-center text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5 transition">
                  <Download className="h-4 w-4 mr-1.5" />
                  CSV
                </button>
                <button className="inline-flex items-center text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg px-3 py-1.5 transition">
                  <Download className="h-4 w-4 mr-1.5" />
                  PDF
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
