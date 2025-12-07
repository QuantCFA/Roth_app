import React from 'react';
import {
  Container,
  Typography,
  Box,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert
} from '@mui/material';
import { NumericFormat } from 'react-number-format';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { useFormState } from '../hooks/useAppData';

const LoginForm = ({ onLogin, onCreateUser }) => {
  // State for dialogs and messages
  const [userDialogOpen, setUserDialogOpen] = React.useState(false);
  const [successMessage, setSuccessMessage] = React.useState(null);
  const [error, setError] = React.useState(null);

  // Login form state using custom hook
  const {
    formData: loginForm,
    updateField: updateLoginField,
    validateForm: validateLoginForm,
    resetForm: resetLoginForm
  } = useFormState(
    { username: '', password: '', showPassword: false },
    {
      username: { required: true },
      password: { required: true }
    }
  );

  // User creation form state using custom hook
  const {
    formData: userForm,
    updateField: updateUserField,
    validateForm: validateUserForm,
    resetForm: resetUserForm
  } = useFormState(
    {
      username: '',
      password: '',
      email: '',
      birth_date: '',
      marital_status: 'S',
      birth_date_spouse: '',
      trad_savings: '',
      roth_savings: '',
    },
    {
      username: { required: true },
      password: { required: true },
      email: { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' },
      birth_date: { required: true },
      trad_savings: { required: true, min: 0 },
      roth_savings: { required: true, min: 0 }
    }
  );

  // Handle form changes
  const handleLoginFormChange = (e) => {
    const { name, value } = e.target;
    updateLoginField(name, value);
    if (error) setError(null); // Clear error when user starts typing
  };

  const handleTogglePassword = () => {
    updateLoginField('showPassword', !loginForm.showPassword);
  };

  const handleUserFormChange = (e) => {
    const { name, value } = e.target;
    updateUserField(name, value);
    if (error) setError(null); // Clear error when user starts typing
  };

  // Handle success messages
  const handleSuccess = (message) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // Handle login submission
  const handleLoginSubmit = async () => {
    if (!validateLoginForm()) {
      setError('Username and password are required');
      return;
    }
    
    try {
      await onLogin(loginForm);
      resetLoginForm();
      handleSuccess('Login successful');
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle user creation submission
  const handleUserSubmit = async () => {
    if (!validateUserForm()) {
      const emptyFields = [];
      if (!userForm.username) emptyFields.push('username');
      if (!userForm.password) emptyFields.push('password');
      if (!userForm.email) emptyFields.push('email');
      if (!userForm.birth_date) emptyFields.push('birth_date');
      if (!userForm.trad_savings && userForm.trad_savings !== 0) emptyFields.push('trad_savings');
      if (!userForm.roth_savings && userForm.roth_savings !== 0) emptyFields.push('roth_savings');
      setError(`Please fill in: ${emptyFields.join(', ')}`);
      return;
    }
    
    try {
      await onCreateUser(userForm);
      setUserDialogOpen(false);
      resetUserForm();
      handleSuccess('Account created successfully');
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSuccessMessage(null);
  };

  return (
    <Container maxWidth="sm" style={{ marginTop: '20px' }}>
      <Typography variant="h5" gutterBottom>
        Login
      </Typography>
      
      <Box component="form" noValidate>
        <TextField
          label="Username"
          name="username"
          value={loginForm.username}
          onChange={handleLoginFormChange}
          fullWidth
          margin="normal"
          required
        />
        <TextField
          label="Password"
          name="password"
          type={loginForm.showPassword ? 'text' : 'password'}
          value={loginForm.password}
          onChange={handleLoginFormChange}
          fullWidth
          margin="normal"
          required
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={handleTogglePassword}>
                  {loginForm.showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <Button
          variant="contained"
          color="primary"
          onClick={handleLoginSubmit}
          style={{ margin: '10px' }}
        >
          Login
        </Button>
        <Button
          variant="outlined"
          color="primary"
          onClick={() => {
            resetUserForm();
            setUserDialogOpen(true);
          }}
          style={{ margin: '10px' }}
        >
          Create Account
        </Button>
      </Box>

      {/* Create Account Dialog */}
      <Dialog open={userDialogOpen} onClose={() => {
        resetUserForm();
        setUserDialogOpen(false);
      }}>
        <DialogTitle>Create Account</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
              {error}
            </Alert>
          )}
          <TextField
            label="Username"
            name="username"
            value={userForm.username}
            onChange={handleUserFormChange}
            fullWidth
            margin="normal"
            required
            autoComplete="off"
            autoFocus
          />
          <TextField
            label="Password"
            name="password"
            type="password"
            value={userForm.password}
            onChange={handleUserFormChange}
            fullWidth
            margin="normal"
            required
            autoComplete="new-password"
          />
          <TextField
            label="Email"
            name="email"
            type="email"
            value={userForm.email}
            onChange={handleUserFormChange}
            fullWidth
            margin="normal"
            required
          />
          <TextField
            label="Birth Date"
            name="birth_date"
            type="date"
            value={userForm.birth_date}
            onChange={handleUserFormChange}
            fullWidth
            margin="normal"
            required
            InputLabelProps={{
              shrink: true,
            }}
          />
          <FormControl fullWidth margin="normal" variant="outlined" required>
            <InputLabel>Marital Status</InputLabel>
            <Select
              name="marital_status"
              value={userForm.marital_status}
              onChange={handleUserFormChange}
              label="Marital Status"
            >
              <MenuItem value="S">Single</MenuItem>
              <MenuItem value="M">Married Filing Jointly</MenuItem>
              <MenuItem value="H">Head of Household</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Spouse Birth Date - adding this feature soon"
            name="birth_date_spouse"
            type="date"
            value={userForm.birth_date_spouse}
            onChange={handleUserFormChange}
            fullWidth
            margin="normal"
            disabled={userForm.marital_status !== 'M'}
            InputLabelProps={{
              shrink: true,
            }}
          />
          <NumericFormat
            label="Traditional Savings"
            name="trad_savings"
            value={userForm.trad_savings}
            onValueChange={(values) => {
              updateUserField('trad_savings', values.floatValue !== undefined ? values.floatValue : '');
            }}
            thousandSeparator=","
            prefix="$"
            customInput={TextField}
            fullWidth
            margin="normal"
            required
          />
          <NumericFormat
            label="Roth Savings"
            name="roth_savings"
            value={userForm.roth_savings}
            onValueChange={(values) => {
              updateUserField('roth_savings', values.floatValue !== undefined ? values.floatValue : '');
            }}
            thousandSeparator=","
            prefix="$"
            customInput={TextField}
            fullWidth
            margin="normal"
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleUserSubmit} color="primary">
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Message */}
      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert severity="success" onClose={handleSnackbarClose}>
          {successMessage}
        </Alert>
      </Snackbar>
      
      {/* Error Message */}
      {error && (
        <Alert severity="error" style={{ marginTop: '20px' }}>
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default LoginForm;