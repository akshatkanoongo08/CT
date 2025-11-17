import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  AlertCircle,
  AlertTriangle,
  AlertOctagon,
  Search,
  Calendar,
  Filter,
  Eye,
  ChevronDown,
  Clock,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [filteredIncidents, setFilteredIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(null);
  const [filterPriority, setFilterPriority] = useState('ALL');
  const [filterSpecies, setFilterSpecies] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [searchTrap, setSearchTrap] = useState('');

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [incidents, filterPriority, filterSpecies, dateFrom, dateTo, searchTrap]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await api.getLatestIncidents();
      setIncidents(response.incidents || []);
    } catch (error) {
      console.error('Error fetching incidents:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...incidents];

    // Filter by priority
    if (filterPriority !== 'ALL') {
      filtered = filtered.filter((incident) =>
        incident.species.some((s) => s.priority === filterPriority)
      );
    }

    // Filter by species
    if (filterSpecies !== 'ALL') {
      filtered = filtered.filter((incident) =>
        incident.species.some((s) => s.species.toLowerCase() === filterSpecies.toLowerCase())
      );
    }

    // Filter by trap ID
    if (searchTrap) {
      filtered = filtered.filter((incident) =>
        incident.trapId.toLowerCase().includes(searchTrap.toLowerCase())
      );
    }

    // Filter by date range
    if (dateFrom) {
      const from = new Date(dateFrom);
      from.setHours(0, 0, 0, 0);
      filtered = filtered.filter((incident) => new Date(incident.captureTime) >= from);
    }

    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59, 999);
      filtered = filtered.filter((incident) => new Date(incident.captureTime) <= to);
    }

    setFilteredIncidents(filtered);
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-50 border-red-200 text-red-900';
      case 'MEDIUM':
        return 'bg-yellow-50 border-yellow-200 text-yellow-900';
      case 'LOW':
        return 'bg-green-50 border-green-200 text-green-900';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-900';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'HIGH':
        return <AlertOctagon className="w-5 h-5 text-red-600" />;
      case 'MEDIUM':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'LOW':
        return <AlertCircle className="w-5 h-5 text-green-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-gray-600" />;
    }
  };

  const getHighestPriority = (species) => {
    if (!species || species.length === 0) return 'LOW';
    const priorities = ['HIGH', 'MEDIUM', 'LOW'];
    for (const p of priorities) {
      if (species.some((s) => s.priority === p)) return p;
    }
    return 'LOW';
  };

  const allSpecies = [...new Set(incidents.flatMap((i) => i.species.map((s) => s.species)))];

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
      <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-lg shadow-lg p-6 text-white">
        <h1 className="text-3xl font-bold mb-2">Incident Reports</h1>
        <p className="text-primary-100">Monitor and analyze detected incidents from your camera traps</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card border-l-4 border-red-600">
          <p className="text-sm text-gray-600 mb-1">High Priority</p>
          <p className="text-2xl font-bold text-red-600">
            {incidents.filter((i) => getHighestPriority(i.species) === 'HIGH').length}
          </p>
        </div>
        <div className="card border-l-4 border-yellow-600">
          <p className="text-sm text-gray-600 mb-1">Medium Priority</p>
          <p className="text-2xl font-bold text-yellow-600">
            {incidents.filter((i) => getHighestPriority(i.species) === 'MEDIUM').length}
          </p>
        </div>
        <div className="card border-l-4 border-green-600">
          <p className="text-sm text-gray-600 mb-1">Low Priority</p>
          <p className="text-2xl font-bold text-green-600">
            {incidents.filter((i) => getHighestPriority(i.species) === 'LOW').length}
          </p>
        </div>
        <div className="card border-l-4 border-blue-600">
          <p className="text-sm text-gray-600 mb-1">Total Incidents</p>
          <p className="text-2xl font-bold text-blue-600">{incidents.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {/* Trap ID Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Trap ID</label>
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search trap..."
                value={searchTrap}
                onChange={(e) => setSearchTrap(e.target.value)}
                className="input input-sm pl-9 w-full"
              />
            </div>
          </div>

          {/* Priority Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="input input-sm w-full"
            >
              <option value="ALL">All Priorities</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>

          {/* Species Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Species</label>
            <select
              value={filterSpecies}
              onChange={(e) => setFilterSpecies(e.target.value)}
              className="input input-sm w-full"
            >
              <option value="ALL">All Species</option>
              {allSpecies.map((sp) => (
                <option key={sp} value={sp}>
                  {sp}
                </option>
              ))}
            </select>
          </div>

          {/* Date From */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input input-sm w-full"
            />
          </div>

          {/* Date To */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input input-sm w-full"
            />
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-96 flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Incident Image</h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-auto flex items-center justify-center p-4 bg-gray-100">
              <img
                src={selectedImage}
                alt="Incident"
                className="max-w-full max-h-full object-contain"
                onError={(e) => (e.target.src = '/placeholder.png')}
              />
            </div>
          </div>
        </div>
      )}

      {/* Incidents Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Priority</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Trap ID</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Species Detected</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Capture Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Processing Time</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700">Image</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredIncidents.length > 0 ? (
                filteredIncidents.map((incident) => {
                  const highestPriority = getHighestPriority(incident.species);
                  const priorityColor = getPriorityColor(highestPriority);
                  return (
                    <tr key={incident.id} className={`border-l-4 ${
                      highestPriority === 'HIGH' ? 'border-l-red-600 hover:bg-red-50' :
                      highestPriority === 'MEDIUM' ? 'border-l-yellow-600 hover:bg-yellow-50' :
                      'border-l-green-600 hover:bg-green-50'
                    } transition-colors`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getPriorityIcon(highestPriority)}
                          <span className={`px-2 py-1 rounded text-xs font-semibold border ${priorityColor}`}>
                            {highestPriority}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">{incident.trapId}</td>
                      <td className="px-4 py-3 text-sm">
                        <div className="flex flex-wrap gap-1">
                          {incident.species.slice(0, 3).map((sp, idx) => (
                            <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {sp.species} ({(sp.confidence * 100).toFixed(0)}%)
                            </span>
                          ))}
                          {incident.species.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
                              +{incident.species.length - 3} more
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {format(parseISO(incident.captureTime), 'MMM dd, HH:mm')}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {incident.processingDelaySeconds}s
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <button
                          onClick={() => setSelectedImage(incident.thumbnailUrl || incident.imageUrl)}
                          className="flex items-center gap-1 px-3 py-1 bg-primary-600 text-white rounded hover:bg-primary-700 transition-colors text-xs font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                    No incidents found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
