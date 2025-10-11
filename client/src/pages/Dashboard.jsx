import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Camera,
  Users,
  Calendar,
  CreditCard,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { format } from 'date-fns';

const Dashboard = () => {
  const { company, user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalTraps: 0,
    activeTraps: 0,
    inactiveTraps: 0,
    recentActivity: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await api.getCameraTraps();
      // Backend returns: { message, count, cameraTraps }
      const traps = response.cameraTraps || [];
      setStats({
        totalTraps: traps.length,
        activeTraps: traps.filter((t) => t.validTill && new Date(t.validTill) > new Date())
          .length,
        inactiveTraps: traps.filter((t) => !t.validTill || new Date(t.validTill) <= new Date())
          .length,
        recentActivity: traps.slice(0, 5),
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ icon: Icon, title, value, color, onClick }) => (
    <div
      className="card hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  );

  const daysUntilExpiry = company?.validTill
    ? Math.ceil((new Date(company.validTill) - new Date()) / (1000 * 60 * 60 * 24))
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Welcome back, {user?.name}!</h1>
        <p className="text-primary-100">Here's what's happening with your camera traps today.</p>
      </div>

      {/* Alerts */}
      {company?.status !== 'ACTIVE' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-900">Company Inactive</h3>
            <p className="text-sm text-red-700">
              Your company account is currently inactive. Please contact your administrator.
            </p>
          </div>
        </div>
      )}

      {daysUntilExpiry <= 30 && daysUntilExpiry > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-yellow-900">Subscription Expiring Soon</h3>
            <p className="text-sm text-yellow-700">
              Your subscription expires in {daysUntilExpiry} days on{' '}
              {format(new Date(company.validTill), 'MMM dd, yyyy')}
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Camera}
          title="Total Camera Traps"
          value={stats.totalTraps}
          color="bg-primary-600"
          onClick={() => navigate('/camera-traps')}
        />
        <StatCard
          icon={CheckCircle2}
          title="Active Devices"
          value={stats.activeTraps}
          color="bg-green-600"
          onClick={() => navigate('/camera-traps')}
        />
        <StatCard
          icon={AlertCircle}
          title="Inactive Devices"
          value={stats.inactiveTraps}
          color="bg-red-600"
          onClick={() => navigate('/camera-traps')}
        />
        <StatCard
          icon={CreditCard}
          title="Credits Remaining"
          value={company?.credits || 0}
          color="bg-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Company Info */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary-600" />
            Company Information
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Company Type</span>
              <span className="font-medium text-gray-900">
                {company?.clientType || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Assigned Products</span>
              <span className="font-medium text-gray-900">
                {company?.numProductsAssigned || 0}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Subscription Valid Till</span>
              <span className="font-medium text-gray-900">
                {company?.validTill
                  ? format(new Date(company.validTill), 'MMM dd, yyyy')
                  : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-gray-600">Status</span>
              <span
                className={`badge ${
                  company?.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'
                }`}
              >
                {company?.status || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary-600" />
              Recent Camera Traps
            </h2>
            <button
              onClick={() => navigate('/camera-traps')}
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-3">
            {stats.recentActivity.length > 0 ? (
              stats.recentActivity.map((trap) => (
                <div
                  key={trap.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => navigate(`/camera-traps/${trap.id}`)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
                      <Camera className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{trap.productId}</p>
                      <p className="text-xs text-gray-500">{trap.location || 'No location'}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Camera className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No camera traps assigned yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
