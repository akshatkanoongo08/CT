import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ArrowLeft,
  Edit2,
  Save,
  X,
  Camera,
  MapPin,
  Calendar,
  Wifi,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  Power,
  PowerOff,
} from 'lucide-react';
import { format } from 'date-fns';

const CameraTrapDetail = () => {
  const { trapId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cameraTrap, setCameraTrap] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchCameraTrap();
  }, [trapId]);

  const fetchCameraTrap = async () => {
    try {
      const response = await api.getCameraTrap(trapId);
      // Backend returns: { message, cameraTrap }
      if (response.cameraTrap) {
        setCameraTrap(response.cameraTrap);
        setFormData({
          productType: response.cameraTrap.productType || '',
          location: response.cameraTrap.location || '',
          gps: response.cameraTrap.gps || '',
          imei: response.cameraTrap.imei || '',
          sim: response.cameraTrap.sim || '',
          simNumber: response.cameraTrap.simNumber || '',
          validTill: response.cameraTrap.validTill
            ? format(new Date(response.cameraTrap.validTill), 'yyyy-MM-dd')
            : '',
        });
      }
    } catch (error) {
      console.error('Error fetching camera trap:', error);
      setError('Failed to load camera trap details');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await api.updateCameraTrap(trapId, formData);
      // Backend returns: { message, cameraTrap }
      setSuccess(response.message || 'Camera trap updated successfully!');
      if (response.cameraTrap) {
        setCameraTrap(response.cameraTrap);
      }
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to update camera trap');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    // Reset form data to original values
    setFormData({
      productType: cameraTrap.productType || '',
      location: cameraTrap.location || '',
      gps: cameraTrap.gps || '',
      imei: cameraTrap.imei || '',
      sim: cameraTrap.sim || '',
      simNumber: cameraTrap.simNumber || '',
      validTill: cameraTrap.validTill
        ? format(new Date(cameraTrap.validTill), 'yyyy-MM-dd')
        : '',
    });
  };

  const handleToggleStatus = async () => {
    if (toggling) return;
    
    setError('');
    setSuccess('');
    setToggling(true);

    try {
      const response = await api.toggleCameraTrapStatus(trapId);
      setSuccess(response.message || 'Camera trap status updated successfully!');
      if (response.cameraTrap) {
        setCameraTrap(response.cameraTrap);
      }
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update camera trap status');
    } finally {
      setToggling(false);
    }
  };

  const isActive = cameraTrap?.validTill && new Date(cameraTrap.validTill) > new Date();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!cameraTrap) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Camera Trap Not Found</h3>
        <button onClick={() => navigate('/camera-traps')} className="btn btn-primary mt-4">
          Back to Camera Traps
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/camera-traps')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{cameraTrap.productId}</h1>
            <p className="text-gray-600">Camera Trap Details</p>
          </div>
        </div>

        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn btn-primary flex items-center gap-2">
            <Edit2 className="w-4 h-4" />
            Edit Details
          </button>
        )}
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p>{success}</p>
        </div>
      )}

      {/* Editing Info */}
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-700">
              <p className="font-semibold mb-1">Editable Fields:</p>
              <p>You can only edit operational fields: IMEI, SIM Card details, and SIM Phone Number.</p>
              <p className="mt-1">Product Type, Location, GPS Coordinates, and Valid Till are managed by company administrators.</p>
            </div>
          </div>
        </div>
      )}

      {/* Status Card */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <div className={`p-4 rounded-lg ${cameraTrap.status === 'ACTIVE' ? 'bg-green-100' : 'bg-gray-100'}`}>
              <Camera className={`w-8 h-8 ${cameraTrap.status === 'ACTIVE' ? 'text-green-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{cameraTrap.productId}</h2>
              <p className="text-gray-600">{cameraTrap.productType || 'Camera Trap'}</p>
            </div>
          </div>
          <span className={`badge text-lg ${cameraTrap.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'}`}>
            {cameraTrap.status === 'ACTIVE' ? 'Active' : 'Inactive'}
          </span>
        </div>
        
        {/* Toggle Button - Only for ADMIN/SUPER_ADMIN */}
        {(user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN') && (
          <button
            type="button"
            onClick={handleToggleStatus}
            disabled={toggling}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
              cameraTrap.status === 'ACTIVE'
                ? 'bg-red-50 text-red-700 hover:bg-red-100 border-2 border-red-200'
                : 'bg-green-50 text-green-700 hover:bg-green-100 border-2 border-green-200'
            } ${toggling ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {toggling ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent"></div>
                <span>Updating Status...</span>
              </>
            ) : (
              <>
                {cameraTrap.status === 'ACTIVE' ? (
                  <>
                    <PowerOff className="w-5 h-5" />
                    <span>Mark Camera Trap as Inactive</span>
                  </>
                ) : (
                  <>
                    <Power className="w-5 h-5" />
                    <span>Mark Camera Trap as Active</span>
                  </>
                )}
              </>
            )}
          </button>
        )}
      </div>

      {/* Details Form */}
      <form onSubmit={handleSubmit} className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Device Information</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Product ID (Read-only) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product ID
            </label>
            <input
              type="text"
              value={cameraTrap.productId}
              disabled
              className="input bg-gray-50"
            />
          </div>

          {/* Product Type - Read-only for client users */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Type
            </label>
            <input
              type="text"
              name="productType"
              value={formData.productType}
              onChange={handleInputChange}
              disabled={true} // Always disabled - managed by company admin
              className="input bg-gray-50 cursor-not-allowed"
              placeholder="e.g., Motion Sensor Trap"
            />
          </div>

          {/* Location - Read-only for client users */}
          <div className="md:col-span-2">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              disabled={true} // Always disabled - managed by company admin
              className="input bg-gray-50 cursor-not-allowed"
              placeholder="e.g., Forest Reserve A, Section 3"
            />
          </div>

          {/* GPS Coordinates - Read-only for client users */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GPS Coordinates
            </label>
            <input
              type="text"
              name="gps"
              value={formData.gps}
              onChange={handleInputChange}
              disabled={true} // Always disabled - managed by company admin
              className="input bg-gray-50 cursor-not-allowed"
              placeholder="e.g., 40.7128° N, 74.0060° W"
            />
          </div>

          {/* IMEI */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Smartphone className="w-4 h-4" />
              IMEI
            </label>
            <input
              type="text"
              name="imei"
              value={formData.imei}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="input"
              placeholder="15-digit IMEI number"
            />
          </div>

          {/* SIM */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Wifi className="w-4 h-4" />
              SIM Card
            </label>
            <input
              type="text"
              name="sim"
              value={formData.sim}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="input"
              placeholder="SIM card number"
            />
          </div>

          {/* SIM Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SIM Phone Number
            </label>
            <input
              type="text"
              name="simNumber"
              value={formData.simNumber}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="input"
              placeholder="+1234567890"
            />
          </div>

          {/* Valid Till - Read-only for client users */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Valid Till
            </label>
            <input
              type="date"
              name="validTill"
              value={formData.validTill}
              onChange={handleInputChange}
              disabled={true} // Always disabled - managed by company admin
              className="input bg-gray-50 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Assignment Info (Read-only) */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Information</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-blue-700">
                Assignment details can only be changed by company administrators. If you need to
                modify the assignment, please contact your company admin.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assigned To
              </label>
              <input
                type="text"
                value={cameraTrap.assignedTo?.companyName || 'Not Assigned'}
                disabled
                className="input bg-gray-50"
              />
            </div>
            {cameraTrap.assignedAt && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Assigned Date
                </label>
                <input
                  type="text"
                  value={format(new Date(cameraTrap.assignedAt), 'MMM dd, yyyy HH:mm')}
                  disabled
                  className="input bg-gray-50"
                />
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleCancel}
              disabled={saving}
              className="btn btn-secondary flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default CameraTrapDetail;
