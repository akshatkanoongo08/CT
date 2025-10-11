import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Menu, Bell, User } from 'lucide-react';

const Topbar = ({ toggleSidebar }) => {
  const { user, company } = useAuth();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800';
      case 'GENERAL':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div>
            <h1 className="text-xl font-semibold text-gray-900">
              {company?.companyName || 'Dashboard'}
            </h1>
            <p className="text-sm text-gray-500">Welcome back, {user?.name}</p>
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Company Status */}
          {company?.status && (
            <span
              className={`badge ${
                company.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'
              }`}
            >
              {company.status}
            </span>
          )}

          {/* Role Badge */}
          {user?.role && (
            <span className={`badge ${getRoleBadgeColor(user.role)}`}>
              {user.role.replace('_', ' ')}
            </span>
          )}

          {/* Notifications */}
          <button className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5 text-gray-600" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* User Menu */}
          <div className="flex items-center gap-2 pl-4 border-l border-gray-200">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-primary-600" />
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
