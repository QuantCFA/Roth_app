import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  ThemeProvider,
  createTheme,
  Box,
  Tabs,
  Tab,
  Button,
  Alert,
} from '@mui/material';
import ErrorBoundary from './components/common/ErrorBoundary';
import AccountMenu from './components/common/AccountMenu';
import ConversionsTab from './components/tabs/ConversionsTab';
import LandingTab from './components/tabs/LandingTab';
import ConceptsTab from './components/tabs/ConceptsTab';
import AboutTab from './components/tabs/AboutTab';
import RatingsTab from './components/tabs/RatingsTab';
import { useAuth, useUserData, useInputData, useConversions } from './components/hooks/useAppData';
import './App.css';

const theme = createTheme();

function App() {
  // Custom hooks for data management
  const { userId, isLoggedIn, login, logout: authLogout, createUser } = useAuth();
  const { userInfo, loading: userLoading, error: userError, refetch: refetchUser } = useUserData(userId);
  const { inputInfo, runId, loading: inputLoading, error: inputError, updateInputs, refetch: refetchInputs } = useInputData(userId);
  const { conversions, parts, retireYearData, distributionSchedule, loading: conversionsLoading, error: conversionsError, runCalculations } = useConversions(runId);

  // Tab state
  const [activeTab, setActiveTab] = useState(0); // Start on Landing tab
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  // Check for payment success on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
      setPaymentSuccess(true);
      setActiveTab(1); // Switch to Conversions tab
      // Refetch user data to get updated subscription status
      refetchUser();
      // Clear the query parameter from URL
      window.history.replaceState({}, document.title, window.location.pathname);
      // Clear success message after 5 seconds
      setTimeout(() => setPaymentSuccess(false), 5000);
    }
  }, [refetchUser]);

  // Logout handler that also switches to Landing tab
  const handleLogout = () => {
    authLogout();
    setActiveTab(0);
  };

  // Determine if loading
  const isLoading = userLoading || inputLoading || conversionsLoading;
  const hasError = userError || inputError || conversionsError;

  // Handle login (passed to LoginForm)
  const handleLogin = async (credentials) => {
    await login(credentials);
  };

  // Handle user creation (passed to LoginForm)
  const handleCreateUser = async (userData) => {
    await createUser(userData);
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  // Wrapper for runCalculations that refreshes inputs afterwards
  const handleRunCalculations = async (userId) => {
    const result = await runCalculations(userId);
    await refetchInputs(); // Refresh inputs to get updated run_id
    return result;
  };

  return (
    <ThemeProvider theme={theme}>
      <ErrorBoundary>
        <Container maxWidth="lg" style={{ marginTop: '20px' }}>
          {/* Header with Title and Account Icon */}
          <Box style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <Typography variant="h4">
              Roth <strong>G</strong>eneral <strong>P</strong>ractice <strong>T</strong>ool - RothGPT
            </Typography>
            {/* Account Menu - top right */}
            {isLoggedIn && (
              <AccountMenu
                userId={userId}
                userInfo={userInfo}
                onProfileUpdate={refetchUser}
                onLogout={handleLogout}
              />
            )}
          </Box>

          {/* Tab Navigation */}
          <Box style={{ marginBottom: '8px', borderBottom: '1px solid #ddd', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, backgroundColor: '#ffffff' }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              variant="standard"
              style={{ backgroundColor: 'transparent' }}
            >
              <Tab label="Home |" sx={{ fontWeight: 'bold' }} />
              <Tab label="Conversions |" disabled={!isLoggedIn} sx={{ fontWeight: isLoggedIn ? 'bold' : 'normal' }} />
              <Tab label="Concepts |" sx={{ fontWeight: 'bold' }} />
              <Tab label="About |" sx={{ fontWeight: 'bold' }} />
              <Tab label="Ratings" disabled={!isLoggedIn} sx={{ fontWeight: isLoggedIn ? 'bold' : 'normal' }} />
            </Tabs>

            {/* Logout Button */}
            {isLoggedIn && (
              <Button
                variant="outlined"
                color="error"
                onClick={handleLogout}
                size="small"
                style={{ marginRight: '10px' }}
              >
                Logout
              </Button>
            )}
          </Box>

          {/* Payment Success Message */}
          {paymentSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              Payment successful! Thank you for your support. You can now run unlimited calculations.
            </Alert>
          )}

          {/* Tab Panels */}
          {activeTab === 0 && (
            <Box className="tab-panel">
              <LandingTab
                isLoggedIn={isLoggedIn}
                loading={isLoggedIn && isLoading}
                onLogin={handleLogin}
                onCreateUser={handleCreateUser}
                onNavigateToTab={setActiveTab}
              />
            </Box>
          )}
          
          {activeTab === 1 && (
            <Box className="tab-panel">
              <ConversionsTab
                userId={userId}
                userInfo={userInfo}
                inputInfo={inputInfo}
                conversions={conversions}
                parts={parts}
                retireYearData={retireYearData}
                distributionSchedule={distributionSchedule}
                loading={isLoading}
                error={hasError}
                onUpdateInputs={updateInputs}
                onRunCalculations={handleRunCalculations}
                onRefetchUser={refetchUser}
              />
            </Box>
          )}
          
          {activeTab === 2 && (
            <Box className="tab-panel">
              <ConceptsTab />
            </Box>
          )}
          
          {activeTab === 3 && (
            <Box className="tab-panel">
              <AboutTab />
            </Box>
          )}
          
          {activeTab === 4 && (
            <Box className="tab-panel">
              <RatingsTab userId={userId} />
            </Box>
          )}
        </Container>
      </ErrorBoundary>
    </ThemeProvider>
  );
}

export default App;