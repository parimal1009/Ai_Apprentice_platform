import { User, Mail, Building2, MapPin, Camera } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Profile() {
  const { user } = useAuth();
  
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="relative h-48 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 overflow-hidden shadow-sm">
        <div className="absolute inset-0 bg-black/10"></div>
      </div>
      
      <div className="px-4 sm:px-6 relative -mt-16">
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-5">
          <div className="relative h-32 w-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-md">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user ? `${user.first_name} ${user.last_name}` : 'User')}&background=random&size=200`} 
              alt={user ? `${user.first_name} ${user.last_name}` : 'User'}
              className="h-full w-full object-cover"
            />
            <button className="absolute bottom-0 right-0 left-0 bg-black/50 py-1 flex justify-center hover:bg-black/70 transition">
              <Camera className="h-4 w-4 text-white" />
            </button>
          </div>
          
          <div className="mt-4 sm:mt-0 flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between pb-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 truncate">{user ? `${user.first_name} ${user.last_name}` : 'User'}</h1>
              <p className="text-sm font-medium text-gray-500 capitalize">{user?.role?.replace('_', ' ')} Account</p>
            </div>
            
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Mail className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Email Address</dt>
                  <dd className="mt-1 text-sm text-gray-900 truncate">{user?.email}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Building2 className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Department/Organization</dt>
                  <dd className="mt-1 text-sm text-gray-900 truncate">Not specified</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MapPin className="h-6 w-6 text-gray-400" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900 truncate">Remote</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-8 bg-white overflow-hidden shadow-sm rounded-xl border border-gray-200">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">Personal Information</h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">Personal details and application settings.</p>
        </div>
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Full name</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{user ? `${user.first_name} ${user.last_name}` : 'User'}</dd>
            </div>
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Bio</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                Fugiat ipsum ipsum deserunt culpa aute sint do nostrud anim incididunt cillum culpa consequat. Excepteur qui ipsum aliquip consequat sint. Sit id mollit nulla mollit nostrud in ea officia proident.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
