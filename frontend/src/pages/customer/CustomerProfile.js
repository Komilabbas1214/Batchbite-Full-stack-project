import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const CustomerProfile = () => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const handleProfileChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoadingProfile(true);

    const res = await updateProfile(formData);
    setLoadingProfile(false);

    if (res.success) {
      toast.success('Profile details updated successfully!');
    } else {
      toast.error(res.message);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long.');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      toast.error('New passwords do not match.');
      return;
    }

    setLoadingPassword(true);

    const res = await updateProfile({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword,
    });

    setLoadingPassword(false);

    if (res.success) {
      toast.success('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="py-5">
      <div className="container">
        <div className="max-w-700 mx-auto mb-4">
          <h1 className="fw-extrabold mb-1">Account Settings</h1>
          <p className="text-muted">Manage your personal contact details and account security.</p>
        </div>

        <div className="row g-4 justify-content-center">
          {/* Profile Form */}
          <div className="col-lg-6">
            <div className="card p-4 p-md-5 border-0 shadow-sm rounded-4 bg-white h-100">
              <h5 className="fw-bold mb-4">Personal Details</h5>
              <form onSubmit={handleProfileSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Full Name</label>
                  <input
                    type="text"
                    className="form-control"
                    name="name"
                    value={formData.name}
                    onChange={handleProfileChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Email Address</label>
                  <input
                    type="email"
                    className="form-control bg-light"
                    value={user?.email || ''}
                    disabled
                  />
                  <small className="text-muted">Email address cannot be changed directly.</small>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">Phone Number</label>
                  <input
                    type="tel"
                    className="form-control"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleProfileChange}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Default Delivery Address</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    name="address"
                    placeholder="Enter street, apartment, city, zip code..."
                    value={formData.address}
                    onChange={handleProfileChange}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-bb-primary"
                  disabled={loadingProfile}
                >
                  {loadingProfile ? 'Saving...' : 'Save Profile Changes'}
                </button>
              </form>
            </div>
          </div>

          {/* Change Password */}
          <div className="col-lg-6">
            <div className="card p-4 p-md-5 border-0 shadow-sm rounded-4 bg-white h-100">
              <h5 className="fw-bold mb-4">Update Password</h5>
              <form onSubmit={handlePasswordSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold small">Current Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label fw-semibold small">New Password (Min 6 chars)</label>
                  <input
                    type="password"
                    className="form-control"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold small">Confirm New Password</label>
                  <input
                    type="password"
                    className="form-control"
                    name="confirmNewPassword"
                    value={passwordData.confirmNewPassword}
                    onChange={handlePasswordChange}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-outline-danger"
                  disabled={loadingPassword}
                >
                  {loadingPassword ? 'Updating...' : 'Change Password'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
