import { FileText, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_ASSESSMENTS = [
  { id: 1, title: 'JavaScript Fundamentals', cohort: 'Fall 2026 - SE', dueDate: 'Oct 30, 2026', submitted: 42, total: 45, type: 'Technical' },
  { id: 2, title: 'Data Pipeline Design', cohort: 'Spring 2026 - Data', dueDate: 'Nov 15, 2026', submitted: 10, total: 30, type: 'Project' },
  { id: 3, title: 'Mid-term Review', cohort: 'Fall 2026 - SE', dueDate: 'Dec 01, 2026', submitted: 0, total: 45, type: 'Review' },
];

export default function Assessments() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assessments</h1>
          <p className="text-gray-500 mt-1">Create and track apprentice assessments and assignments.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition">
          <FileText className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Assessment
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ASSESSMENTS.map((assessment, index) => (
          <motion.div
            key={assessment.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:border-indigo-300 transition-colors cursor-pointer group"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-700">
                {assessment.type}
              </span>
              <span className="flex items-center text-xs font-medium text-gray-500 bg-gray-50 px-2 py-1 rounded">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Due: {assessment.dueDate}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-indigo-600 transition-colors">{assessment.title}</h3>
            <p className="text-sm text-gray-500 mb-6">{assessment.cohort}</p>
            
            <div className="mt-auto">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Completion</span>
                <span className="text-gray-500 font-medium">
                  {assessment.submitted} / {assessment.total} submitted
                </span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full transition-all duration-1000" 
                  style={{ width: `${(assessment.submitted / assessment.total) * 100}%` }}
                ></div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
