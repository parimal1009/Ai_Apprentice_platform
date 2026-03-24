import { useState } from 'react';
import { Plus, BookOpen, Clock, Users, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

const MOCK_PROGRAMS = [
  { id: 1, title: 'Software Engineering L4', duration: '24 months', apprentices: 150, status: 'Active', category: 'Technology' },
  { id: 2, title: 'Data Analytics L3', duration: '18 months', apprentices: 85, status: 'Active', category: 'Data' },
  { id: 3, title: 'Digital Marketing Support', duration: '12 months', apprentices: 42, status: 'Draft', category: 'Marketing' },
];

export default function Programs() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Apprenticeship Programs</h1>
          <p className="text-gray-500 mt-1">Manage curriculum, track success rates, and update course contents.</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 transition">
          <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Create Program
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_PROGRAMS.map((program, index) => (
          <motion.div
            key={program.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden group"
          >
            <div className="absolute top-0 right-0 p-4">
              <button className="text-gray-400 hover:text-gray-600 transition">
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mb-4">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                program.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
              }`}>
                {program.status}
              </span>
            </div>
            
            <h3 className="text-lg font-bold text-gray-900 mb-2 pr-8">{program.title}</h3>
            
            <div className="mt-auto pt-6 space-y-3">
              <div className="flex items-center text-sm text-gray-500">
                <BookOpen className="h-4 w-4 mr-2 text-indigo-500" />
                Category: <span className="ml-1 font-medium text-gray-900">{program.category}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="h-4 w-4 mr-2 text-indigo-500" />
                Duration: <span className="ml-1 font-medium text-gray-900">{program.duration}</span>
              </div>
              <div className="flex items-center text-sm text-gray-500">
                <Users className="h-4 w-4 mr-2 text-indigo-500" />
                Enrolled: <span className="ml-1 font-medium text-gray-900">{program.apprentices} apprentices</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
