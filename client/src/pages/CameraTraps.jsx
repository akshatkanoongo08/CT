import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  Camera,
  Search,
  Filter,
  MapPin,
  List,
  Eye,
  AlertCircle,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { format } from 'date-fns';

const CameraTraps = () => {
  const navigate = useNavigate();
  const [cameraTraps, setCameraTraps] = useState([]);
  const [filteredTraps, setFilteredTraps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    fetchCameraTraps();
  }, []);

  useEffect(() => {
    filterCameraTraps();
  }, [searchTerm, filterStatus, cameraTraps]);

  const fetchCameraTraps = async () => {
    try {
      const response = await api.getCameraTraps();
      // Backend returns: { message, count, cameraTraps }
      console.log('Camera traps response:', response);
      setCameraTraps(response.cameraTraps || []);
    } catch (error) {
      console.error('Error fetching camera traps:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCameraTraps = () => {
    let filtered = [...cameraTraps];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (trap) =>
          trap.productId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trap.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          trap.imei?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (filterStatus === 'active') {
      filtered = filtered.filter(
        (trap) => trap.validTill && new Date(trap.validTill) > new Date()
      );
    } else if (filterStatus === 'inactive') {
      filtered = filtered.filter(
        (trap) => !trap.validTill || new Date(trap.validTill) <= new Date()
      );
    }

    setFilteredTraps(filtered);
  };

  const isActive = (trap) => trap.validTill && new Date(trap.validTill) > new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Camera Traps</h1>
          <p className="text-gray-600 mt-1">
            Manage and monitor your assigned camera traps
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by Product ID, IMEI, or Location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{filteredTraps.length}</span> of{' '}
          <span className="font-medium">{cameraTraps.length}</span> camera traps
        </p>
      </div>

      {/* Camera Traps Grid */}
      {filteredTraps.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTraps.map((trap) => (
            <div
              key={trap.id}
              className="card hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => navigate(`/camera-traps/${trap.id}`)}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-3 rounded-lg ${
                      isActive(trap) ? 'bg-green-100' : 'bg-gray-100'
                    }`}
                  >
                    <Camera
                      className={`w-6 h-6 ${
                        isActive(trap) ? 'text-green-600' : 'text-gray-400'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                      {trap.productId}
                    </h3>
                    <p className="text-xs text-gray-500">{trap.productType || 'Camera Trap'}</p>
                  </div>
                </div>
                {isActive(trap) ? (
                  <Wifi className="w-5 h-5 text-green-500" />
                ) : (
                  <WifiOff className="w-5 h-5 text-gray-400" />
                )}
              </div>

              {/* Details */}
              <div className="space-y-2 mb-4">
                {trap.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <span className="text-gray-600 truncate">{trap.location}</span>
                  </div>
                )}
                {trap.imei && (
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500 font-mono">{trap.imei}</span>
                  </div>
                )}
                {trap.validTill && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Valid Till:</span>
                    <span className={isActive(trap) ? 'text-green-600' : 'text-red-600'}>
                      {format(new Date(trap.validTill), 'MMM dd, yyyy')}
                    </span>
                  </div>
                )}
              </div>

              {/* Status Badge */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <span
                  className={`badge ${isActive(trap) ? 'badge-success' : 'badge-danger'}`}
                >
                  {isActive(trap) ? 'Active' : 'Inactive'}
                </span>
                <button className="text-primary-600 hover:text-primary-700 flex items-center gap-1 text-sm font-medium">
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center py-12">
          <Camera className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Camera Traps Found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || filterStatus !== 'all'
              ? 'Try adjusting your filters'
              : 'No camera traps have been assigned to your company yet'}
          </p>
        </div>
      )}
    </div>
  );
};

export default CameraTraps;
