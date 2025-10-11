import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Building2,
  Edit2,
  Save,
  X,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { format } from 'date-fns';

const CompanyInfo = () => {
  const { isAdmin, company: contextCompany } = useAuth();
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!isAdmin()) {
      setError('You do not have permission to access this page');
      setLoading(false);
      return;
    }
    if (contextCompany?.id) {
      fetchCompanyInfo();
    }
  }, [contextCompany]);

  const fetchCompanyInfo = async () => {
    try {
      const response = await api.getCompanyInfo(contextCompany.id);
      // Backend returns: { message, company }
      if (response.company) {
        setCompany(response.company);
        setFormData({
          companyName: response.company.companyName || '',
          email: response.company.email || '',
          phone: response.company.mobile || '', // Note: backend uses 'mobile' not 'phone'
          address: response.company.address || '',
        });
      }
    } catch (error) {
      setError('Failed to load company information');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const response = await api.updateCompanyInfo(contextCompany.id, formData);
      // Backend returns: { message, company }
      setSuccess(response.message || 'Company information updated successfully!');
      if (response.company) {
        setCompany(response.company);
      }
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to update company information');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError('');
    setFormData({
      companyName: company.companyName || '',
      email: company.email || '',
      phone: company.phone || '',
      address: company.address || '',
    });
  };

  if (!isAdmin()) {
    return (
      <div className="card text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">
          Only administrators can access company information.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Company Information</h1>
          <p className="text-gray-600 mt-1">View and manage your company details</p>
        </div>
        {!isEditing && (
          <button onClick={() => setIsEditing(true)} className="btn btn-primary flex items-center gap-2">
            <Edit2 className="w-4 h-4" />
            Edit Info
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

      {/* Company Details */}
      <form onSubmit={handleSubmit} className="card">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="p-4 bg-primary-100 rounded-lg">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">{company?.companyName}</h2>
            <p className="text-gray-600">{company?.clientType} Account</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company Name
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              disabled={!isEditing}
              className="input"
            />
          </div>

          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing}
              className="input"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4" />
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={!isEditing}
              className="input"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              disabled={!isEditing}
              className="input"
            />
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

      {/* Subscription Info (Read-only) */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h3>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <p className="text-sm text-blue-700">
            Subscription details can only be modified by company administrators. Contact support for changes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            <input
              type="text"
              value={company?.clientType || 'N/A'}
              disabled
              className="input bg-gray-50"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Valid Till
            </label>
            <input
              type="text"
              value={company?.validTill ? format(new Date(company.validTill), 'MMM dd, yyyy') : 'N/A'}
              disabled
              className="input bg-gray-50"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <CreditCard className="w-4 h-4" />
              Credits Remaining
            </label>
            <input
              type="text"
              value={company?.credits || '0'}
              disabled
              className="input bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Products Assigned
            </label>
            <input
              type="text"
              value={company?.numProductsAssigned || '0'}
              disabled
              className="input bg-gray-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
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
    </div>
  );
};

export default CompanyInfo;
