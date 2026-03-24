import { Building2, Briefcase, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_EMPLOYERS = [
  { id: 1, name: 'Google', logo: 'https://logo.clearbit.com/google.com', activeApprentices: 120, industry: 'Technology', status: 'Partner' },
  { id: 2, name: 'Amazon', logo: 'https://logo.clearbit.com/amazon.com', activeApprentices: 85, industry: 'E-commerce', status: 'Partner' },
  { id: 3, name: 'Stripe', logo: 'https://logo.clearbit.com/stripe.com', activeApprentices: 40, industry: 'Fintech', status: 'Partner' },
];

export default function Employers() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employer Partners</h1>
          <p className="text-gray-500 mt-1">Manage collaborations with companies hosting your apprentices.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 transition">
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Add Employer
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_EMPLOYERS.map((employer, index) => (
          <motion.div
            key={employer.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col items-center text-center"
          >
            <div className="h-16 w-16 mb-4 rounded-xl shadow-sm flex items-center justify-center p-2 bg-white border border-gray-100">
              <img src={employer.logo} alt={employer.name} className="max-h-full max-w-full object-contain" />
            </div>
            
            <h3 className="text-xl font-bold text-gray-900 mb-1">{employer.name}</h3>
            <span className="text-sm font-medium text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full mb-4">
              {employer.industry}
            </span>
            
            <div className="w-full border-t border-gray-100 pt-4 mt-2 flex justify-center space-x-6">
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-900">{employer.activeApprentices}</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Apprentices</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-2xl font-bold text-gray-900">4</span>
                <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Cohorts</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
