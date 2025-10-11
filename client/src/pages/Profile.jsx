import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  User,
  Mail,
  Phone,
  Shield,
  Lock,
  Save,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const Profile = () => {
  const { user, company } = useAuth();
  const [changingPassword, setChangingPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const response = await api.changePassword(
        passwordData.oldPassword,
        passwordData.newPassword
      );
      // Backend returns: { message }
      setSuccess(response.message || 'Password changed successfully!');
      setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setChangingPassword(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (error) {
      setError(error.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'badge-info';
      case 'ADMIN':
        return 'badge-success';
      case 'GENERAL':
        return 'badge-warning';
      default:
        return 'badge-warning';
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account information and password</p>
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

      {/* Profile Information */}
      <div className="card">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
            <User className="w-10 h-10 text-primary-600" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-gray-600">{company?.companyName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Mail className="w-4 h-4" />
              Email Address
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input bg-gray-50"
            />
          </div>

          {/* Mobile */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Phone className="w-4 h-4" />
              Mobile Number
            </label>
            <input
              type="tel"
              value={user?.mobile || 'Not provided'}
              disabled
              className="input bg-gray-50"
            />
          </div>

          {/* Role */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Shield className="w-4 h-4" />
              Role
            </label>
            <div className="input bg-gray-50 flex items-center">
              <span className={`badge ${getRoleBadgeColor(user?.role)}`}>
                {user?.role?.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Status
            </label>
            <div className="input bg-gray-50 flex items-center">
              <span
                className={`badge ${
                  user?.status === 'ACTIVE' ? 'badge-success' : 'badge-danger'
                }`}
              >
                {user?.status}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Note:</strong> To update your email, mobile, or role, please contact your
            company administrator.
          </p>
        </div>
      </div>

      {/* Change Password */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          </div>
          {!changingPassword && (
            <button
              onClick={() => setChangingPassword(true)}
              className="btn btn-secondary text-sm"
            >
              Change Password
            </button>
          )}
        </div>

        {changingPassword ? (
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwordData.oldPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, oldPassword: e.target.value })
                }
                className="input"
                placeholder="Enter your current password"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password
              </label>
              <input
                type="password"
                required
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, newPassword: e.target.value })
                }
                className="input"
                placeholder="Enter new password (min. 6 characters)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                }
                className="input"
                placeholder="Re-enter new password"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  setChangingPassword(false);
                  setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                  setError('');
                }}
                disabled={loading}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary flex items-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Changing...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-gray-600">
            Keep your account secure by regularly updating your password.
          </p>
        )}
      </div>

      {/* Security Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h4 className="font-semibold text-blue-900 mb-2">Security Tips</h4>
        <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
          <li>Use a strong password with a mix of letters, numbers, and symbols</li>
          <li>Don't share your password with anyone</li>
          <li>Change your password regularly</li>
          <li>Log out when using shared computers</li>
        </ul>
      </div>
    </div>
  );
};

export default Profile;
