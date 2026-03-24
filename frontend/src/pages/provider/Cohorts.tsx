import { useState } from 'react';
import { Users, Search, Calendar, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_COHORTS = [
  { id: 1, name: 'Fall 2026 - Software Engineering', program: 'Software Engineering L4', startDate: 'Sep 1, 2026', status: 'In Progress', students: 45, progress: 15 },
  { id: 2, name: 'Spring 2026 - Data Analysts', program: 'Data Analytics L3', startDate: 'Feb 15, 2026', status: 'In Progress', students: 30, progress: 65 },
  { id: 3, name: 'Winter 2026 - UX Design', program: 'UX Design L4', startDate: 'Dec 1, 2026', status: 'Upcoming', students: 25, progress: 0 },
];

export default function Cohorts() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cohorts Management</h1>
          <p className="text-gray-500 mt-1">Track and manage groups of apprentices progressing together.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition">
          <Users className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Cohort
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Search cohorts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <ul className="divide-y divide-gray-100">
          {MOCK_COHORTS.map((cohort, index) => (
            <motion.li
              key={cohort.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="hover:bg-gray-50 transition-colors"
            >
              <div className="px-6 py-5 flex items-center justify-between cursor-pointer">
                <div className="flex items-center min-w-0 flex-1">
                  <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-2 md:gap-4">
                    <div>
                      <p className="text-sm font-medium text-purple-600 truncate">{cohort.name}</p>
                      <p className="mt-2 flex items-center text-sm text-gray-500">
                        <Calendar className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                        <span className="truncate">Starts {cohort.startDate}</span>
                      </p>
                    </div>
                    <div className="hidden md:block">
                      <div>
                        <p className="text-sm text-gray-900">
                          {cohort.students} Students Enrolled
                        </p>
                        <div className="mt-2 flex items-center gap-3">
                          <div className="w-full bg-gray-200 rounded-full h-1.5 max-w-xs">
                            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${cohort.progress}%` }}></div>
                          </div>
                          <span className="text-xs font-medium text-gray-500">{cohort.progress}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div>
                  <ChevronRight className="h-5 w-5 text-gray-400" />
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}
