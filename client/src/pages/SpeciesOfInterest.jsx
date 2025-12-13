import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Loader2, 
  Plus, 
  X, 
  AlertTriangle, 
  Shield, 
  Search,
  Edit2,
  Trash2,
  Eye,
  EyeOff,
  Power,
  PowerOff
} from 'lucide-react';

const SpeciesOfInterest = () => {
  const { user } = useAuth();
  const [speciesOfInterest, setSpeciesOfInterest] = useState([]);
  const [supportedSpecies, setSupportedSpecies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    specieId: '',
    severityLevel: 'MEDIUM',
  });
  const [submitting, setSubmitting] = useState(false);
  const [togglingId, setTogglingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Check if user has permission to add/edit/delete
  const canManage = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [speciesResponse, supportedResponse] = await Promise.all([
        api.getSpeciesOfInterest(),
        api.getSupportedSpecies(),
      ]);
      setSpeciesOfInterest(speciesResponse.speciesOfInterest || []);
      setSupportedSpecies(supportedResponse.species || []);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load species data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSpecies = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      const response = await api.addSpeciesOfInterest(formData);
      setSuccess(response.message || 'Species added successfully!');
      setShowModal(false);
      setFormData({ specieId: '', severityLevel: 'MEDIUM' });
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add species');
      setSubmitting(false);
    }
  };

  const handleDeleteSpecies = async (id, specieName) => {
    if (!window.confirm(`Are you sure you want to remove "${specieName}" from your interest list?`)) {
      return;
    }

    try {
      const response = await api.deleteSpeciesOfInterest(id);
      setSuccess(response.message || 'Species removed successfully!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to remove species');
    }
  };

  const handleToggleStatus = async (id, specieName, currentStatus) => {
    if (togglingId) return; // Prevent multiple clicks
    
    setError('');
    setSuccess('');
    setTogglingId(id);

    try {
      const response = await api.toggleSpeciesOfInterest(id);
      setSuccess(response.message || 'Species status updated successfully!');
      fetchData();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update species status');
      setTimeout(() => setError(''), 5000);
    } finally {
      setTogglingId(null);
    }
  };

  const getSeverityColor = (level) => {
    switch (level) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'LOW':
        return 'bg-green-100 text-green-800 border-green-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getSeverityIcon = (level) => {
    switch (level) {
      case 'HIGH':
        return '🔴';
      case 'MEDIUM':
        return '🟡';
      case 'LOW':
        return '🟢';
      default:
        return '⚪';
    }
  };

  // Filter supported species to exclude already added ones
  const availableSpecies = supportedSpecies.filter(
    (sp) => !speciesOfInterest.some((soi) => soi.specieId === sp.specieId)
  );

  // Filter supported species by search term
  const filteredAvailableSpecies = availableSpecies.filter((sp) =>
    sp.specieName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Species of Interest</h1>
          <p className="text-gray-600 mt-1">
            Manage species you want to monitor and set alert levels
          </p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary flex items-center gap-2"
            disabled={availableSpecies.length === 0}
          >
            <Plus className="w-5 h-5" />
            Add Species
          </button>
        )}
      </div>

      {/* Alerts */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-start">
          <Shield className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{success}</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {!canManage && (
        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-start">
          <Eye className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
          <p className="text-sm">You have view-only access. Contact your administrator to add or modify species.</p>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Species Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Severity Level
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Added On
                </th>
                {canManage && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {speciesOfInterest.length === 0 ? (
                <tr>
                  <td colSpan={canManage ? 5 : 4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Shield className="w-12 h-12 text-gray-400 mb-3" />
                      <p className="text-lg font-medium mb-1">No species added yet</p>
                      <p className="text-sm">
                        {canManage 
                          ? 'Click "Add Species" button to start monitoring species' 
                          : 'No species have been added to your company\'s interest list'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                speciesOfInterest.map((species) => (
                  <tr key={species.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3">
                          {species.supportedSpecies?.specieId === 'cow' && '🐄'}
                          {species.supportedSpecies?.specieId === 'dog' && '🐕'}
                          {species.supportedSpecies?.specieId === 'cat' && '🐈'}
                          {species.supportedSpecies?.specieId === 'human' && '🧑'}
                        </span>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {species.specieName}
                          </div>
                          <div className="text-xs text-gray-500">
                            ID: {species.specieId}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getSeverityColor(species.severityLevel)}`}>
                        <span>{getSeverityIcon(species.severityLevel)}</span>
                        {species.severityLevel}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {species.active ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-300">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-300">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(species.createdAt).toLocaleDateString()}
                    </td>
                    {canManage && (
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleToggleStatus(species.id, species.specieName, species.active)}
                          disabled={togglingId === species.id}
                          className={`p-1 transition-colors ${
                            species.active
                              ? 'text-orange-600 hover:text-orange-700'
                              : 'text-green-600 hover:text-green-700'
                          } ${togglingId === species.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={species.active ? 'Mark as Inactive' : 'Mark as Active'}
                        >
                          {togglingId === species.id ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                          ) : species.active ? (
                            <PowerOff className="w-4 h-4" />
                          ) : (
                            <Power className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleDeleteSpecies(species.id, species.specieName)}
                          className="text-red-600 hover:text-red-900 transition-colors p-1"
                          title="Remove species"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Species</p>
              <p className="text-2xl font-bold text-gray-900">{speciesOfInterest.length}</p>
            </div>
            <Shield className="w-10 h-10 text-primary-600" />
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-2xl font-bold text-red-600">
                {speciesOfInterest.filter(s => s.severityLevel === 'HIGH').length}
              </p>
            </div>
            <span className="text-4xl">🔴</span>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Available to Add</p>
              <p className="text-2xl font-bold text-gray-900">{availableSpecies.length}</p>
            </div>
            <Plus className="w-10 h-10 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Add Species Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Add Species of Interest</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                disabled={submitting}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleAddSpecies} className="p-6 space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Species Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Species *
                </label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search species..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                  {filteredAvailableSpecies.length === 0 ? (
                    <div className="p-4 text-center text-gray-500 text-sm">
                      {searchTerm ? 'No matching species found' : 'All species have been added'}
                    </div>
                  ) : (
                    filteredAvailableSpecies.map((species) => (
                      <label
                        key={species.specieId}
                        className="flex items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="radio"
                          name="specieId"
                          value={species.specieId}
                          checked={formData.specieId === species.specieId}
                          onChange={(e) => setFormData({ ...formData, specieId: e.target.value })}
                          className="mr-3"
                          required
                        />
                        <span className="text-2xl mr-2">
                          {species.specieId === 'cow' && '🐄'}
                          {species.specieId === 'dog' && '🐕'}
                          {species.specieId === 'cat' && '🐈'}
                          {species.specieId === 'human' && '🧑'}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{species.specieName}</span>
                      </label>
                    ))
                  )}
                </div>
              </div>

              {/* Severity Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Alert Level *
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="severityLevel"
                      value="LOW"
                      checked={formData.severityLevel === 'LOW'}
                      onChange={(e) => setFormData({ ...formData, severityLevel: e.target.value })}
                      className="mr-3"
                    />
                    <span className="text-xl mr-2">🟢</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Low Priority</div>
                      <div className="text-xs text-gray-500">Monitor only, no immediate action needed</div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="severityLevel"
                      value="MEDIUM"
                      checked={formData.severityLevel === 'MEDIUM'}
                      onChange={(e) => setFormData({ ...formData, severityLevel: e.target.value })}
                      className="mr-3"
                    />
                    <span className="text-xl mr-2">🟡</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">Medium Priority</div>
                      <div className="text-xs text-gray-500">Regular monitoring with alerts</div>
                    </div>
                  </label>
                  <label className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                    <input
                      type="radio"
                      name="severityLevel"
                      value="HIGH"
                      checked={formData.severityLevel === 'HIGH'}
                      onChange={(e) => setFormData({ ...formData, severityLevel: e.target.value })}
                      className="mr-3"
                    />
                    <span className="text-xl mr-2">🔴</span>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-gray-900">High Priority</div>
                      <div className="text-xs text-gray-500">Immediate alerts and action required</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn btn-secondary"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 btn btn-primary flex items-center justify-center gap-2"
                  disabled={submitting || !formData.specieId}
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  {submitting ? 'Adding...' : 'Add Species'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpeciesOfInterest;
