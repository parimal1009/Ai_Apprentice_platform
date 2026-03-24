import { useState } from 'react';
import { Search, Filter, Star, Mail, Phone, Calendar, Download } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_CANDIDATES = [
  { id: 1, name: 'Alex Johnson', role: 'Software Engineering Apprentice', match: 95, status: 'Shortlisted', stage: 'Interview', date: 'Oct 24, 2026', avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=0D8ABC&color=fff' },
  { id: 2, name: 'Maria Garcia', role: 'Data Analyst Apprentice', match: 88, status: 'New', stage: 'Screening', date: 'Oct 23, 2026', avatar: 'https://ui-avatars.com/api/?name=Maria+Garcia&background=10B981&color=fff' },
  { id: 3, name: 'David Kim', role: 'UX Design Apprentice', match: 92, status: 'In Review', stage: 'Assessment', date: 'Oct 22, 2026', avatar: 'https://ui-avatars.com/api/?name=David+Kim&background=F59E0B&color=fff' },
  { id: 4, name: 'Sarah Williams', role: 'Software Engineering Apprentice', match: 75, status: 'Rejected', stage: 'Screening', date: 'Oct 20, 2026', avatar: 'https://ui-avatars.com/api/?name=Sarah+Williams&background=EF4444&color=fff' },
];

export default function Candidates() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Candidate Search</h1>
          <p className="text-gray-500 mt-1">Review, filter and manage applicants for your roles.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition">
          <Download className="-ml-1 mr-2 h-4 w-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1 border border-gray-100 bg-white rounded-xl shadow-sm p-5 space-y-6 h-fit">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Search</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Name or keywords"
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Role</h3>
            <div className="space-y-2">
              {['Software Engineering', 'Data Analyst', 'UX Design'].map(role => (
                <label key={role} className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-600">{role}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-3">Stage</h3>
            <div className="space-y-2">
              {['Screening', 'Assessment', 'Interview', 'Offer'].map(stage => (
                <label key={stage} className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm text-gray-600">{stage}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-sm text-gray-500">Showing <span className="font-medium text-gray-900">{MOCK_CANDIDATES.length}</span> candidates</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Sort by:</span>
              <select className="text-sm border-gray-200 rounded-lg focus:ring-blue-500 focus:border-blue-500 py-1.5 pl-3 pr-8">
                <option>Match Score</option>
                <option>Newest</option>
                <option>Oldest</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4">
            {MOCK_CANDIDATES.map((candidate, index) => (
              <motion.div 
                key={candidate.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="bg-white border border-gray-100 rounded-xl shadow-sm p-5 hover:shadow-md transition-shadow group flex flex-col sm:flex-row gap-5"
              >
                <div className="flex-shrink-0">
                  <img src={candidate.avatar} alt="" className="h-14 w-14 rounded-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-lg font-bold text-gray-900 truncate">{candidate.name}</h3>
                    <div className="flex items-center bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full text-xs font-semibold">
                      <Star className="h-3.5 w-3.5 mr-1 fill-current" />
                      {candidate.match}% Match
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mb-4">{candidate.role}</p>
                  
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Mail className="h-4 w-4 mr-1.5 text-gray-400" />
                      Contact
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                      Applied {candidate.date}
                    </div>
                    <div className="flex items-center ml-auto">
                      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider mr-2">Stage:</span>
                      <span className="text-sm font-medium text-gray-900">{candidate.stage}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
