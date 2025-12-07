import React, { useState } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import apiService from '../../services/apiService';
import { useFormState } from '../hooks/useAppData';

const AccountMenu = ({ userId, userInfo, onProfileUpdate, onLogout }) => {
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // Dialog states
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [deleteAccountOpen, setDeleteAccountOpen] = useState(false);

  // Message states
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Form states
  const { formData: profileForm, updateField: updateProfileField, setFormData: setProfileFormData } = useFormState({
    email: userInfo?.email || '',
    birth_date: userInfo?.birth_date || '',
    marital_status: userInfo?.marital_status || 'S',
    birth_date_spouse: userInfo?.birth_date_spouse || '',
  });

  const { formData: passwordForm, updateField: updatePasswordField, resetForm: resetPasswordForm } = useFormState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Handle menu open
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Open Edit Profile dialog
  const handleOpenEditProfile = () => {
    setProfileFormData({
      email: userInfo?.email || '',
      birth_date: userInfo?.birth_date || '',
      marital_status: userInfo?.marital_status || 'S',
      birth_date_spouse: userInfo?.birth_date_spouse || '',
    });
    setEditProfileOpen(true);
    handleMenuClose();
  };

  // Open Change Password dialog
  const handleOpenChangePassword = () => {
    resetPasswordForm();
    setChangePasswordOpen(true);
    handleMenuClose();
  };

  // Open Delete Account dialog
  const handleOpenDeleteAccount = () => {
    setDeleteAccountOpen(true);
    handleMenuClose();
  };

  // Handle profile form change
  const handleProfileFormChange = (e) => {
    const { name, value } = e.target;
    updateProfileField(name, value);
    setErrorMessage(null);
  };

  // Handle password form change
  const handlePasswordFormChange = (e) => {
    const { name, value } = e.target;
    updatePasswordField(name, value);
    setErrorMessage(null);
  };

  // Submit profile update
  const handleSaveProfile = async () => {
    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const profileData = {
        email: profileForm.email,
        birth_date: profileForm.birth_date,
        marital_status: profileForm.marital_status,
        birth_date_spouse: profileForm.birth_date_spouse || null,
      };

      await apiService.updateUserProfile(userId, profileData);
      setSuccessMessage('Profile updated successfully');
      setEditProfileOpen(false);
      if (onProfileUpdate) {
        onProfileUpdate();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Submit password change
  const handleSavePassword = async () => {
    if (passwordForm.new_password !== passwordForm.confirm_password) {
      setErrorMessage('New passwords do not match');
      return;
    }

    if (passwordForm.new_password.length < 6) {
      setErrorMessage('New password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      await apiService.changePassword(userId, passwordForm.current_password, passwordForm.new_password);
      setSuccessMessage('Password changed successfully');
      setChangePasswordOpen(false);
      resetPasswordForm();
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  // Submit account deletion
  const handleConfirmDelete = async () => {
    setLoading(true);
    setErrorMessage(null);

    try {
      await apiService.deleteAccount(userId);
      setSuccessMessage('Account deleted successfully');
      setDeleteAccountOpen(false);
      // Logout user
      if (onLogout) {
        setTimeout(() => onLogout(), 1000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.detail || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <>
      {/* Account Icon Button */}
      <IconButton
        onClick={handleMenuOpen}
        color="primary"
        size="small"
        sx={{ mr: 1 }}
        title="Account Settings"
      >
        <AccountCircleIcon fontSize="large" />
      </IconButton>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={handleOpenEditProfile}>Edit Profile</MenuItem>
        <MenuItem onClick={handleOpenChangePassword}>Change Password</MenuItem>
        <MenuItem onClick={handleOpenDeleteAccount} sx={{ color: 'error.main' }}>
          Delete Account
        </MenuItem>
      </Menu>

      {/* Edit Profile Dialog */}
      <Dialog open={editProfileOpen} onClose={() => !loading && setEditProfileOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Email"
              name="email"
              type="email"
              value={profileForm.email}
              onChange={handleProfileFormChange}
              fullWidth
              disabled={loading}
            />
            <TextField
              label="Birth Date (YYYY-MM-DD)"
              name="birth_date"
              value={profileForm.birth_date}
              onChange={handleProfileFormChange}
              fullWidth
              disabled={loading}
            />
            <FormControl fullWidth variant="outlined" disabled={loading}>
              <InputLabel>Marital Status</InputLabel>
              <Select
                name="marital_status"
                value={profileForm.marital_status}
                onChange={handleProfileFormChange}
                label="Marital Status"
              >
                <MenuItem value="S">Single</MenuItem>
                <MenuItem value="M">Married Filing Jointly</MenuItem>
                <MenuItem value="H">Head of Household</MenuItem>
              </Select>
            </FormControl>
            {profileForm.marital_status === 'M' && (
              <TextField
                label="Spouse Birth Date (YYYY-MM-DD)"
                name="birth_date_spouse"
                value={profileForm.birth_date_spouse}
                onChange={handleProfileFormChange}
                fullWidth
                disabled={loading}
              />
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditProfileOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSaveProfile} color="primary" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Change Password Dialog */}
      <Dialog open={changePasswordOpen} onClose={() => !loading && setChangePasswordOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Current Password"
              name="current_password"
              type="password"
              value={passwordForm.current_password}
              onChange={handlePasswordFormChange}
              fullWidth
              disabled={loading}
            />
            <TextField
              label="New Password"
              name="new_password"
              type="password"
              value={passwordForm.new_password}
              onChange={handlePasswordFormChange}
              fullWidth
              disabled={loading}
            />
            <TextField
              label="Confirm New Password"
              name="confirm_password"
              type="password"
              value={passwordForm.confirm_password}
              onChange={handlePasswordFormChange}
              fullWidth
              disabled={loading}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setChangePasswordOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSavePassword} color="primary" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteAccountOpen} onClose={() => !loading && setDeleteAccountOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccessMessage(null)}>
              {successMessage}
            </Alert>
          )}
          <Alert severity="warning" sx={{ mt: 2 }}>
            This action cannot be undone. All your data will be permanently deleted. Are you sure?
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteAccountOpen(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleConfirmDelete} color="error" variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Delete Account'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AccountMenu;
