import React from 'react';
import {
  Typography,
  Box,
  CircularProgress,
  Container,
} from '@mui/material';
import LoginForm from '../auth/LoginForm';

const LandingTab = ({
  isLoggedIn,
  loading,
  onLogin,
  onCreateUser,
  onNavigateToTab
}) => {
  return (
    <Container maxWidth="lg" sx={{ textAlign: 'center' }}>
      {/* Hero Section */}
      <Box sx={{
        backgroundColor: '#e3f2fd',
        padding: '40px 30px',
        marginBottom: '40px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
      }}>
        <Typography variant="h4" gutterBottom>
          Roth Conversion Analysis
        </Typography>
        <Typography variant="h6" gutterBottom >
          Based upon <strong>your</strong> personal financial data.
        </Typography>
        <Box style={{ marginTop: '25px', marginBottom: '0px' }}>
          <Typography variant="body1" paragraph>
            The only tool that shows exactly what your Roth conversions earn, measured in dollars and returns.
            Conversion <strong> profitabilty analyses</strong> are based upon <strong>your</strong> taxable distributions and Social Security benefits.
            <strong> Interactive</strong> scenario analysis - Change asssumptions for: return, inflation, filing status and life expectancy -
            And see your conversion profits/losses and future tax rates change 'on the fly' within each bracket.
          </Typography>
        </Box>
      </Box>

      {/* Show login form if not logged in */}
      {!isLoggedIn && (
        <Box style={{ marginTop: '20px' }}>
          <LoginForm
            onLogin={onLogin}
            onCreateUser={onCreateUser}
          />
        </Box>
      )}

      {/* Show loading spinner if logged in but data is loading */}
      {isLoggedIn && loading && (
        <Box style={{ marginTop: '40px' }}>
          <CircularProgress />
          <Typography>Loading your data...</Typography>
        </Box>
      )}
      
      <Box sx={{ mt: 4, mb: 4 }}>

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', borderTop: 2, borderColor: 'primary.main', pt: 1 }}>
          Roth Conversion Tax Payment
        </Typography>

        <Box sx={{
          backgroundColor: '#ffebee',
          borderLeft: '4px solid #c62828',
          padding: '16px 20px',
          borderRadius: '4px',
          mb: 2
        }}>
          <Typography variant="body1" paragraph sx={{ textAlign: 'left', m: 0 }}>
            <strong>FIRST - </strong>Understanding How You Pay the Roth Conversion Tax is <strong>CRITICAL</strong>
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          {/* INSIDE Funding Card */}
          <Box sx={{
            flex: 1,
            backgroundColor: '#e1f5fe',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #b3e5fc'
          }}>
            <Typography variant="body1" paragraph sx={{ textAlign: 'left' }}>
              <strong>INSIDE</strong> Funding - Pay tax with cash inside your Traditional account.
            </Typography>
            <Box sx={{ ml: 2 }}>
              <Typography variant="body1" paragraph sx={{ textAlign: 'left', fontSize: '0.95rem' }}>
                •  Zero out-of-pocket payment. <br />
                •  Amount converted = Traditional amount you pay tax on minus the tax payment amount.
              </Typography>
            </Box>
          </Box>

          {/* OUTSIDE Funding Card */}
          <Box sx={{
            flex: 1,
            backgroundColor: '#e1f5fe',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #b3e5fc'
          }}>
            <Typography variant="body1" paragraph sx={{ textAlign: 'left' }}>
              <strong>OUTSIDE</strong> Funding - Pay tax with cash outside the Traditional acct.
            </Typography>
            <Box sx={{ ml: 2 }}>
              <Typography variant="body1" paragraph sx={{ textAlign: 'left', fontSize: '0.95rem' }}>
                •  Out-of-pocket payment required. <br />
                •  Amount converted = Traditional amount you pay tax on.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="body1" paragraph sx={{ textAlign: 'left' }}>
          Conversion profits and RMD reductions are identical for<strong> both </strong>methods. The <strong>only</strong> difference: the outside-tax payment is
          added to the Roth account - with no earned-income requirement, a <strong>'Synthetic'</strong> Roth Contribution.<br /><br />
        </Typography>

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', borderTop: 2, borderColor: 'primary.main', pt: 1 }}>
          Application Tabs
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3, mb: 3 }}>
          {/* Left Column - CONVERSIONS */}
          <Box>
            <Typography variant="body1" paragraph sx={{ textAlign: 'left', fontWeight: 'bold', mb: 1 }}>
              CONVERSIONS - Focus is on Outside-Funded Conversions
            </Typography>
            <Typography variant="body1" paragraph style={{ textAlign: 'left', marginLeft: '20px' }}>
              Conversion Tax (<strong style={{ color: 'red' }}>red</strong>) is what you pay and After-Tax Payout (<strong style={{ color: 'green' }}>green</strong>) is what you get in return, from two independent sources (<strong style={{ color: '#FFC107' }}>yellow</strong>).  <br /><br />
              <Box style={{ marginLeft: '20px' }}>
                <Typography variant="body1" paragraph style={{ textAlign: 'left' }}>
                  1)  <u>Synthetic Roth Contribution</u> - The outside-tax payment amount grows at the portfolio return. <br />
                  2)  <u>Tax-rate spread profit/loss</u> - Also grows at the portfolio return. <br />
                </Typography>
              </Box>
              Return multiple and IRR quantify future earnings on the outside-funded tax payment, duration shows average payout period. <br /><br />
              Inside-funded conversions earn the tax-rate spread profit
              and minimize RMDs with no out-of-pocket expense. - A compelling option! <br />
            </Typography>
          </Box>

          {/* Right Column - CONCEPTS, ABOUT, RATINGS */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {/* CONCEPTS */}
            <Box>
              <Typography variant="body1" paragraph sx={{ textAlign: 'left', fontWeight: 'bold', mb: 1 }}>
                CONCEPTS
              </Typography>
              <Typography variant="body1" paragraph style={{ textAlign: 'left', marginLeft: '20px' }}>
                In-depth Roth conversion theory
                and other topic discussions like distribution tax rates.  More topics coming soon.
              </Typography>
            </Box>

            {/* ABOUT */}
            <Box>
              <Typography variant="body1" paragraph sx={{ textAlign: 'left', fontWeight: 'bold', mb: 1 }}>
                ABOUT
              </Typography>
              <Typography variant="body1" paragraph style={{ textAlign: 'left', marginLeft: '20px' }}>
                Learn about this tool's creator and what drove him to develop it.
              </Typography>
            </Box>

            {/* RATINGS */}
            <Box>
              <Typography variant="body1" paragraph sx={{ textAlign: 'left', fontWeight: 'bold', mb: 1 }}>
                RATINGS
              </Typography>
              <Typography variant="body1" paragraph style={{ textAlign: 'left', marginLeft: '20px' }}>
                Ask questions, leave comments or point out problems here.  Your feedback improves this tool and is appreciated!
              </Typography>
            </Box>
          </Box>
        </Box>

        <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', borderTop: 2, borderColor: 'primary.main', pt: 1 }}>
          Enhancements Coming!
        </Typography>

        <Typography variant="body1" paragraph sx={{ textAlign: 'left' }}>
          These and many other enhancements and features will be added quickly over time. Let us know what you want to see!
        </Typography>
        <Box style={{ marginLeft: '20px' }}>
          <Typography variant="body1" paragraph style={{ textAlign: 'left' }}>
            1) Model currently assumes no income in retirement besides distributions and Social Security. - 'Other' retirement income parameter coming soon! <br />
            2) Model currently assumes investor has no income at time of conversion other than the taxable conversion itself - other income coming soon! <br />
            3) Model currently assumes annuity distributions over investor's life expectancy.  Soon to be added - RMDs only until death <br />
          </Typography>
        </Box>

      </Box>
    </Container>
  );
};

export default LandingTab;