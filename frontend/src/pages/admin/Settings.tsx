import { Save, Bell, Shield, Database, Palette, Key } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Settings() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="text-gray-500 mt-1">Configure global application settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-1">
          {[
            { name: 'General', icon: Palette, current: true },
            { name: 'Security', icon: Shield, current: false },
            { name: 'Notifications', icon: Bell, current: false },
            { name: 'Integrations', icon: Database, current: false },
            { name: 'API Keys', icon: Key, current: false },
          ].map((item) => (
            <button
              key={item.name}
              className={`w-full flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                item.current 
                  ? 'bg-slate-900 text-white' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${item.current ? 'text-white' : 'text-gray-400'}`} />
              <span className="truncate">{item.name}</span>
            </button>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:col-span-3 space-y-6"
        >
          <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Brand Configuration</h3>
              <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                <div className="sm:col-span-4">
                  <label htmlFor="platform_name" className="block text-sm font-medium text-gray-700">Platform Name</label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input type="text" name="platform_name" id="platform_name" className="flex-1 focus:ring-slate-900 focus:border-slate-900 block w-full min-w-0 sm:text-sm border-gray-300 rounded-md py-2 px-3 border" defaultValue="ApprenticeAI" />
                  </div>
                </div>

                <div className="sm:col-span-6">
                  <label htmlFor="support_email" className="block text-sm font-medium text-gray-700">Support Email</label>
                  <div className="mt-1">
                    <input id="support_email" name="support_email" type="email" className="shadow-sm focus:ring-slate-900 focus:border-slate-900 block w-full sm:text-sm border-gray-300 rounded-md py-2 px-3 border" defaultValue="support@apprentice.ai" />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-4 py-5 sm:p-6 border-t border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Features Toggle</h3>
              <div className="mt-6 space-y-4">
                {[
                  { title: 'Enable AI Resume Parsing', desc: 'Automatically extract skills and experience from uploaded resumes.' },
                  { title: 'Allow Public Listings', desc: 'Allow companies to share job listings outside the platform.' },
                  { title: 'Require 2FA', desc: 'Enforce two-factor authentication for all Admin and Provider roles.' }
                ].map((feature, i) => (
                  <div key={i} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input id={`feature-${i}`} type="checkbox" defaultChecked className="focus:ring-slate-900 h-4 w-4 text-slate-900 border-gray-300 rounded" />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={`feature-${i}`} className="font-medium text-gray-700">{feature.title}</label>
                      <p className="text-gray-500">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button className="bg-slate-900 border border-transparent rounded-lg shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition">
                <Save className="w-5 h-5 mr-2 -ml-1" />
                Save Changes
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
