import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Camera,
  Users,
  Building2,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Dna,
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const { logout, isAdmin } = useAuth();

  const navItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', show: true },
    { path: '/camera-traps', icon: Camera, label: 'Camera Traps', show: true },
    { path: '/species', icon: Dna, label: 'Species of Interest', show: true },
    { path: '/users', icon: Users, label: 'Users', show: isAdmin() },
    { path: '/company', icon: Building2, label: 'Company Info', show: isAdmin() },
    { path: '/profile', icon: User, label: 'Profile', show: true },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-30 h-screen bg-white border-r border-gray-200 transition-all duration-300 ${
          isOpen ? 'w-64' : 'w-20'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            {isOpen && (
              <div className="flex items-center gap-2">
                <Camera className="w-8 h-8 text-primary-600" />
                <span className="text-xl font-bold text-gray-900">CAMERATRAP</span>
              </div>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map(
              (item) =>
                item.show && (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-lg transition-colors ${
                        isActive
                          ? 'bg-primary-50 text-primary-700'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`
                    }
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {isOpen && <span className="font-medium">{item.label}</span>}
                  </NavLink>
                )
            )}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {isOpen && <span className="font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
