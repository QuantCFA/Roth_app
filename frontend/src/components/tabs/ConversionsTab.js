import React, { useState, useEffect } from 'react';
import {
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Snackbar,
  Alert,
  CircularProgress,
  TablePagination,
  Collapse,
} from '@mui/material';
import { NumericFormat } from 'react-number-format';
import { useFormState } from '../hooks/useAppData';
import PaymentModal from '../common/PaymentModal';
import apiService from '../../services/apiService';

const ConversionsTab = ({
  userId,
  userInfo,
  inputInfo,
  conversions,
  parts,
  retireYearData,
  distributionSchedule,
  loading,
  error,
  onUpdateInputs,
  onRunCalculations,
  onRefetchUser
}) => {
  // UI state for conversions tab
  const [inputDialogOpen, setInputDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);
  const [showIncomeProjections, setShowIncomeProjections] = useState(false);
  const [incomePage, setIncomePage] = useState(0);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [calcCount, setCalcCount] = useState(0);
  const rowsPerPage = 10;

  // Form state for input dialog
  const {
    formData: inputForm,
    updateField: updateInputField,
    setFormData: setInputFormData
  } = useFormState({
    soc_sec_benefit: '',
    salary: '',
    cont_return_assum: '0.08',
    dist_return_assum: '0.05',
    inflation_assum: '0.015',
    soc_sec_grw_assum: '0.015',
    retire_tax_hl: 1,
    contribution_status: 'S',
    distribution_status: 'S',
    life_years: '30',
    trad_savings: '',
    roth_savings: '',
  });

  // Update input form when data loads
  useEffect(() => {
    if (userInfo) {
      setInputFormData({
        soc_sec_benefit: inputInfo?.soc_sec_benefit?.toString() || '',
        salary: inputInfo?.salary?.toString() || '',
        cont_return_assum: inputInfo?.cont_return_assum?.toString() || '0.08',
        dist_return_assum: inputInfo?.dist_return_assum?.toString() || '0.05',
        inflation_assum: inputInfo?.inflation_assum?.toString() || '0.015',
        soc_sec_grw_assum: inputInfo?.soc_sec_grw_assum?.toString() || '0.015',
        retire_tax_hl: inputInfo?.retire_tax_hl || 1,
        contribution_status: inputInfo?.contribution_status || 'S',
        distribution_status: inputInfo?.distribution_status || 'S',
        life_years: inputInfo?.life_years?.toString() || '30',
        trad_savings: userInfo.trad_savings?.toString() || '',
        roth_savings: userInfo.roth_savings?.toString() || '',
      });
    }
  }, [inputInfo, userInfo, setInputFormData]);

  // Auto-open input dialog if no input data exists
  useEffect(() => {
    if (error && error.includes('No inputs found')) {
      setInputDialogOpen(true);
    }
  }, [error]);

  // Handle input form changes
  const handleInputFormChange = (e) => {
    const { name, value } = e.target;
    updateInputField(name, value);
    // Clear error when user starts typing
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  // Handle success messages
  const handleSuccess = (message) => {
    setSuccessMessage(message);
  };


  // Handle input submission
  const handleInputSubmit = () => {
    // Clear previous error
    setErrorMessage(null);

    // Validate required fields
    if (inputForm.trad_savings === '' || parseFloat(inputForm.trad_savings) <= 0) {
      setErrorMessage('Traditional Savings must be greater than 0');
      return;
    }
    if (inputForm.roth_savings === '') return;
    if (!inputForm.soc_sec_benefit && inputForm.soc_sec_benefit !== 0) {
      setErrorMessage('Soc Sec Benefit is required');
      return;
    }

    setConfirmDialogOpen(true);
  };

  // Handle confirmed input submission
  const handleConfirmSubmit = async () => {
    setConfirmDialogOpen(false);
    try {
      await onUpdateInputs(inputForm);
      setInputDialogOpen(false);
      handleSuccess('Inputs updated successfully');

      // Fetch current subscription status from database before checking
      const statusData = await apiService.getSubscriptionStatus(userId);
      setCalcCount(statusData.calc_count);

      // Check if we should show payment modal BEFORE running calculation
      if (statusData.subscription_status !== 'paid' && statusData.calc_count >= 3) {
        setPaymentModalOpen(true);
        return; // Stop here - don't run calculation until they choose payment option
      }

      // Run calculations
      const result = await onRunCalculations(userId);
      handleSuccess('Calculations completed successfully');

      // Update calc count for next time
      setCalcCount(result.calcCount);

      // Refresh user data
      onRefetchUser();
    } catch (err) {
      console.error('Input update error:', err.message);
    }
  };

  // Handle income projections toggle
  const handleToggleIncomeProjections = () => {
    setShowIncomeProjections(!showIncomeProjections);
    if (!showIncomeProjections) {
      setIncomePage(0);
    }
  };

  // Handle income table pagination
  const handleIncomePageChange = (event, newPage) => {
    setIncomePage(newPage);
  };

  // Helper function to get background color for conversions table
  const getConversionsRowColor = (conv) => {
    const correspondingPart = parts.find(part => part.conv_group_num === conv.conv_group_num);
    
    if (correspondingPart && correspondingPart.tax_rate_arb_amt === 0) {
      return 'transparent';
    }
    
    const partIsNegative = correspondingPart && correspondingPart.tax_rate_arb_amt < 0;
    const convIsNegative = conv.tax_rate_arb_amt < 0;
    
    if (partIsNegative && convIsNegative) {
      return '#ffcdd2';
    } else if (partIsNegative) {
      return '#ffebee';
    }
    return '#f1f8e9';
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSuccessMessage(null);
  };

  // Get dynamic group number for table header
  const getDynamicGroupNumber = () => {
    if (!parts || parts.length === 0) return 3;
    
    // Find the first red-highlighted row (where tax_rate_arb_amt < 0)
    const firstRedRowIndex = parts.findIndex(part => part.tax_rate_arb_amt < 0);
    
    if (firstRedRowIndex === -1 || firstRedRowIndex === 0) {
      return 3; // Default fallback
    }
    
    // Return the group number of the row preceding the first red row
    return parts[firstRedRowIndex - 1].conv_group_num;
  };

  // CSV export functionality for both tables in one file
  const exportConversionsToCSV = () => {
    if ((!conversions || conversions.length === 0) && (!parts || parts.length === 0)) {
      alert('No data to export');
      return;
    }

    const afMultiple = distributionSchedule?.annuity_factor_multiple?.toFixed(4) || 'N/A';
    let csvContent = '';

    // Add metadata section at the top
    // Row 1: Traditional Savings, Soc Sec Benefit, Filing Status
    const filingStatus = inputInfo?.distribution_status === 'S' ? 'Single' :
                         inputInfo?.distribution_status === 'M' ? 'MFJ' : 'Head House';
    csvContent += `Traditional Savings:,${userInfo?.trad_savings || ''},Soc Sec Benefit:,${inputInfo?.soc_sec_benefit || ''},Filing Status:,${filingStatus}\n`;

    // Row 2: Return, Inflation, Years Life
    const returnPct = inputInfo?.dist_return_assum ? (inputInfo.dist_return_assum * 100).toFixed(1) + '%' : '';
    const inflationPct = inputInfo?.inflation_assum ? (inputInfo.inflation_assum * 100).toFixed(1) + '%' : '';
    csvContent += `Return:,${returnPct},Inflation:,${inflationPct},Years Life:,${inputInfo?.life_years || ''}\n`;

    // Row 3: Annual Distribution, AF Payout Multiple
    const annualDist = distributionSchedule?.distribution || '';
    csvContent += `Annual Distribution:,${annualDist},AF Payout Multiple:,${afMultiple},,\n`;

    // Add blank line before tables
    csvContent += '\n';

    // First table - Conversions
    if (conversions && conversions.length > 0) {
      csvContent += 'Conversions\n';
      const conversionsHeaders = [
        'Group', 'Tax Bracket', 'Conversion Amount', 'Conv Tax = Investment',
        `Synthetic Roth Cont =Conv Tax x ${afMultiple}`, `Spread GL =(tD - tC) x Conv-Amt x ${afMultiple}`, 'Total Investment After-Tax Payout',
        'Return Multiple', 'IRR', 'Duration',
        'tC Conv Tax Rate', 'tD Dist Tax Rate'
      ].join(',');
      csvContent += conversionsHeaders + '\n';

      conversions.forEach(conv => {
        const row = [
          conv.conv_group_num,
          `${(conv.tax_rate_bucket * 100).toFixed(1)}%`,
          conv.conv_amt,
          conv.conv_tax,
          conv.synthetic_roth_cont,
          conv.tax_rate_arb_amt,
          conv.total_after_tax_dist_chg_amt,
          conv.conv_return_multiple.toFixed(2),
          `${(conv.conv_irr * 100).toFixed(2)}%`,
          conv.conv_duration.toFixed(1),
          `${(conv.conv_tax_rate * 100).toFixed(2)}%`,
          `${(conv.conv_dist_tax_rate * 100).toFixed(2)}%`
        ].join(',');
        csvContent += row + '\n';
      });
    }

    // Add blank line between tables
    csvContent += '\n';

    // Second table - Individual Bracket Conversions
    if (parts && parts.length > 0) {
      csvContent += 'Individual Bracket Conversions - Fill Each Bracket Separately\n';
      const partsHeaders = [
        'Group', 'Tax Bracket', 'Conversion Amount', 'Conv Tax = Investment',
        `Synthetic Roth Cont =Conv Tax x ${afMultiple}`, `spread G/L =(tD - tC) x Conv-Amt x ${afMultiple}`, 'Total Investment After-Tax Payout',
        'Return Multiple', 'IRR', 'Duration',
        'tC Conv Tax Rate', 'tD Dist Tax Rate'
      ].join(',');
      csvContent += partsHeaders + '\n';

      parts.forEach(part => {
        const row = [
          part.conv_group_num,
          `${(part.tax_rate_bucket * 100).toFixed(1)}%`,
          part.conv_amt,
          part.conv_tax,
          part.synthetic_roth_cont,
          part.tax_rate_arb_amt,
          part.total_after_tax_dist_chg_amt,
          part.conv_return_multiple.toFixed(2),
          `${(part.conv_irr * 100).toFixed(2)}%`,
          part.conv_duration.toFixed(1),
          `${(part.conv_tax_rate * 100).toFixed(2)}%`,
          `${(part.conv_dist_tax_rate * 100).toFixed(2)}%`
        ].join(',');
        csvContent += row + '\n';
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'conversions.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const exportIncomeProjectionsToCSV = () => {
    if (!retireYearData || retireYearData.length === 0) {
      alert('No data to export');
      return;
    }

    let csvContent = '';

    // Add metadata section at the top
    const filingStatus = inputInfo?.distribution_status === 'S' ? 'Single' :
                         inputInfo?.distribution_status === 'M' ? 'MFJ' : 'Head House';
    csvContent += `Traditional Savings:,${userInfo?.trad_savings || ''},Soc Sec Benefit:,${inputInfo?.soc_sec_benefit || ''},Filing Status:,${filingStatus}\n`;

    // Row 2: Return, Inflation, Years Life
    const returnPct = inputInfo?.dist_return_assum ? (inputInfo.dist_return_assum * 100).toFixed(1) + '%' : '';
    const inflationPct = inputInfo?.inflation_assum ? (inputInfo.inflation_assum * 100).toFixed(1) + '%' : '';
    csvContent += `Return:,${returnPct},Inflation:,${inflationPct},Years Life:,${inputInfo?.life_years || ''}\n`;

    // Add blank line before table
    csvContent += '\n';

    // Income Projections table
    csvContent += 'Retirement Income Projections - Pre-Conversion\n';
    const headers = [
      'Year', 'Age', 'Soc Sec', 'Trad Dist', 'Roth Dist',
      'Fed Tax', 'ATCF', 'SS Pct Tax',
      'Trad Dist Tax Rate', 'MTR Adj'
    ].join(',');
    csvContent += headers + '\n';

    retireYearData.forEach(row => {
      const csvRow = [
        new Date(row.year).getFullYear(),
        row.age,
        row.ss_benefit,
        row.trad_dist_opt,
        row.roth_dist_opt,
        row.fed_tax_opt,
        row.atcf_opt,
        `${(row.pct_ss_taxed_opt * 100).toFixed(1)}%`,
        `${(row.trad_dist_opt_tax_rate * 100).toFixed(1)}%`,
        `${(row.trad_mtr_adj_opt * 100).toFixed(1)}%`
      ].join(',');
      csvContent += csvRow + '\n';
    });

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'inc-Projections.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <Box style={{ textAlign: 'center', marginTop: '50px' }}>
        <CircularProgress />
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  return (
    <>
      {error && !error.includes('No inputs found') && (
        <Alert severity="error" style={{ marginBottom: '20px' }}>
          {error}
        </Alert>
      )}

      <Box display="flex" justifyContent="space-between" alignItems="flex-start" marginBottom={2}>
        <Box display="flex" gap={4} flex={1}>
          <Box minWidth="250px">
            <Typography variant="h6">User Information</Typography>
            {userInfo ? (
              <>
                <Box display="flex" justifyContent="space-between" gap={2}>
                  <span>Username:</span>
                  <span>{userInfo.username}</span>
                </Box>
                <Box display="flex" justifyContent="space-between" gap={2}>
                  <span>Birth Date:</span>
                  <span>{userInfo.birth_date}</span>
                </Box>
                {userInfo.marital_status === 'M' && userInfo.birth_date_spouse && (
                  <Box display="flex" justifyContent="space-between" gap={2}>
                    <span>Spouse Birth Date:</span>
                    <span>{userInfo.birth_date_spouse}</span>
                  </Box>
                )}
                <Box display="flex" justifyContent="space-between" gap={2}>
                  <span>Soc Sec Benefit:</span>
                  <span>${inputInfo?.soc_sec_benefit?.toLocaleString()}</span>
                </Box>
                <Box display="flex" justifyContent="space-between" gap={2}>
                  <span>Traditional Savings:</span>
                  <span>${userInfo.trad_savings?.toLocaleString()}</span>
                </Box>
                <Box display="flex" justifyContent="space-between" gap={2}>
                  <span>Roth Savings:</span>
                  <span>${userInfo.roth_savings?.toLocaleString()}</span>
                </Box>
              </>
            ) : (
              <Typography>Loading user information...</Typography>
            )}
          </Box>
          <Box minWidth="250px">
            <Typography variant="h6">Assumptions</Typography>
            {inputInfo ? (
              <>
                <Box display="flex" justifyContent="space-between" gap={2}>
                  <span>Distribution Return:</span>
                  <span>{(inputInfo.dist_return_assum * 100).toFixed(1)}%</span>
                </Box>
                <Box display="flex" justifyContent="space-between" gap={2}>
                  <span>Inflation:</span>
                  <span>{(inputInfo.inflation_assum * 100).toFixed(1)}%</span>
                </Box>
                {/* <Box display="flex" justifyContent="space-between" gap={2}>
                  <span>Contribution Status:</span>
                  <span>{inputInfo.contribution_status === 'S' ? 'Single' : inputInfo.contribution_status === 'M' ? 'MFJ' : 'Head House'}</span>
                </Box> */}
                <Box display="flex" justifyContent="space-between" gap={2}>
                  <span>Filing Status:</span>
                  <span>{inputInfo.distribution_status === 'S' ? 'Single' : inputInfo.distribution_status === 'M' ? 'MFJ' : 'Head House'}</span>
                </Box>
                <Box display="flex" justifyContent="space-between" gap={2}>
                  <span>Life Years:</span>
                  <span>{inputInfo.life_years}</span>
                </Box>
              </>
            ) : (
              <Typography>No inputs set</Typography>
            )}
          </Box>
        </Box>
        <Box minWidth="280px" marginLeft={4}>
          <Typography variant="h6">Distribution Schedule Outputs</Typography>
          {distributionSchedule ? (
            <>
              <Box display="flex" justifyContent="space-between" gap={2}>
                <span>Annual Distribution:</span>
                <span>${distributionSchedule.distribution?.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</span>
              </Box>
              <Box display="flex" justifyContent="space-between" gap={2}>
                <span>AF Payout Multiple (M):</span>
                <span>{distributionSchedule.annuity_factor_multiple?.toFixed(2)}</span>
              </Box>
              <Box display="flex" justifyContent="space-between" gap={2}>
                <span>Base Duration (Yrs):</span>
                <span>{distributionSchedule.base_duration?.toFixed(2)}</span>
              </Box>
            </>
          ) : (
            <Typography>No distribution data</Typography>
          )}
        </Box>
      </Box>

      <Button
        variant="contained"
        color="primary"
        onClick={() => setInputDialogOpen(true)}
        style={{ margin: '10px' }}
        disabled={loading}
      >
        Add/Chg Assumptions
      </Button>
      <Button
        variant="outlined"
        color="primary"
        onClick={handleToggleIncomeProjections}
        style={{ margin: '10px' }}
        disabled={loading || retireYearData.length === 0}
      >
        {showIncomeProjections ? 'Hide Income Projections' : 'View the Income Your Savings Will Generate'}
      </Button>

      {/* Income Projections Table */}
      <Collapse in={showIncomeProjections} timeout="auto" unmountOnExit>
        <Box style={{ marginTop: '20px', marginBottom: '20px' }}>
          <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h5" gutterBottom style={{ margin: 0 }}>
              Retirement Income Projections  - Pre-Conversion
            </Typography>
            <Button
              variant="text"
              color="primary"
              onClick={exportIncomeProjectionsToCSV}
              size="small"
              disabled={loading || retireYearData.length === 0}
              style={{ textTransform: 'none', fontSize: '0.875rem' }}
            >
              Export CSV
            </Button>
          </Box>
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Year</TableCell>
                  <TableCell>Age</TableCell>
                  <TableCell>Soc Sec<br />Benefit</TableCell>
                  <TableCell>Traditional<br />Distribution</TableCell>
                  <TableCell>Roth<br />Distribution</TableCell>
                  <TableCell>Federal<br />Tax</TableCell>
                  <TableCell>After Tax<br />Cash Flow</TableCell>
                  <TableCell>Soc Sec<br />Pct Taxed</TableCell>
                  <TableCell>Trad Dist<br />Tax Rate</TableCell>
                  <TableCell>MTR<br />Adj</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {retireYearData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11}>No income projection data available</TableCell>
                  </TableRow>
                ) : (
                  retireYearData
                    .slice(incomePage * rowsPerPage, incomePage * rowsPerPage + rowsPerPage)
                    .map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{new Date(row.year).getFullYear()}</TableCell>
                        <TableCell>{row.age}</TableCell>
                        <TableCell>
                          ${row.ss_benefit.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell>
                          ${row.trad_dist_opt.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell>
                          ${row.roth_dist_opt.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell>
                          ${row.fed_tax_opt.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell>
                          ${row.atcf_opt.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                        </TableCell>
                        <TableCell>{(row.pct_ss_taxed_opt * 100).toFixed(1)}%</TableCell>
                        <TableCell>{(row.trad_dist_opt_tax_rate * 100).toFixed(1)}%</TableCell>
                        <TableCell>{(row.trad_mtr_adj_opt * 100).toFixed(1)}%</TableCell>
                      </TableRow>
                    ))
                )}
              </TableBody>
            </Table>
            {retireYearData.length > 0 && (
              <TablePagination
                component="div"
                count={retireYearData.length}
                page={incomePage}
                onPageChange={handleIncomePageChange}
                rowsPerPage={rowsPerPage}
                rowsPerPageOptions={[rowsPerPage]}
              />
            )}
          </TableContainer>
        </Box>
      </Collapse>

      {/* Input Dialog */}
      <Dialog open={inputDialogOpen} onClose={() => {
        setInputDialogOpen(false);
        setErrorMessage(null);
      }}>
        <DialogTitle>Edit Retirement Data</DialogTitle>
        <DialogContent>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage(null)}>
              {errorMessage}
            </Alert>
          )}
          <NumericFormat
            label="Traditional Savings"
            name="trad_savings"
            value={inputForm.trad_savings}
            onValueChange={(values) => {
              updateInputField('trad_savings', values.floatValue || '');
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
            value={inputForm.roth_savings}
            onValueChange={(values) => {
              updateInputField('roth_savings', values.floatValue !== undefined ? values.floatValue : '');
            }}
            thousandSeparator=","
            prefix="$"
            customInput={TextField}
            fullWidth
            margin="normal"
            required
          />
          <NumericFormat
            label="Soc Sec Benefit"
            name="soc_sec_benefit"
            value={inputForm.soc_sec_benefit}
            onValueChange={(values) => {
              updateInputField('soc_sec_benefit', values.floatValue || '');
              if (errorMessage) {
                setErrorMessage(null);
              }
            }}
            thousandSeparator=","
            prefix="$"
            customInput={TextField}
            fullWidth
            margin="normal"
            required
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
          {/* <TextField
            label="Taxable Income When Converting"
            name="salary"
            type="number"
            value={inputForm.salary}
            onChange={handleInputFormChange}
            fullWidth
            margin="normal"
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          /> */}
          {/* <TextField
            label="Contribution Return Assumption"
            name="cont_return_assum"
            type="number"
            step="0.01"
            value={inputForm.cont_return_assum}
            onChange={handleInputFormChange}
            fullWidth
            margin="normal"
          /> */}
          <NumericFormat
            label="Annual Return - (0.5% to 20%)"
            name="dist_return_assum"
            value={inputForm.dist_return_assum ? (inputForm.dist_return_assum * 100).toFixed(1) : ''}
            onValueChange={(values) => {
              updateInputField('dist_return_assum', values.floatValue ? (values.floatValue / 100).toString() : '');
            }}
            onBlur={(e) => {
              const percentValue = parseFloat(e.target.value);
              if (e.target.value && (percentValue < 0.5 || percentValue > 20)) {
                updateInputField('dist_return_assum', '0.05');
              }
            }}
            suffix="%"
            customInput={TextField}
            fullWidth
            margin="normal"
          />
          <NumericFormat
            label="Inflation - (0.5% to 8%) - grows tax brackets and Std Deduction"
            name="inflation_assum"
            value={inputForm.inflation_assum ? (inputForm.inflation_assum * 100).toFixed(1) : ''}
            onValueChange={(values) => {
              updateInputField('inflation_assum', values.floatValue ? (values.floatValue / 100).toString() : '');
            }}
            onBlur={(e) => {
              const percentValue = parseFloat(e.target.value);
              if (e.target.value && (percentValue < 0.5 || percentValue > 8)) {
                updateInputField('inflation_assum', '0.015');
              }
            }}
            suffix="%"
            customInput={TextField}
            fullWidth
            margin="normal"
          />
          <NumericFormat
            label="Soc Sec Growth - (0.5% to 8%)"
            name="soc_sec_grw_assum"
            value={inputForm.soc_sec_grw_assum ? (inputForm.soc_sec_grw_assum * 100).toFixed(1) : ''}
            onValueChange={(values) => {
              updateInputField('soc_sec_grw_assum', values.floatValue ? (values.floatValue / 100).toString() : '');
            }}
            onBlur={(e) => {
              const percentValue = parseFloat(e.target.value);
              if (e.target.value && (percentValue < 0.5 || percentValue > 8)) {
                updateInputField('soc_sec_grw_assum', '0.015');
              }
            }}
            suffix="%"
            customInput={TextField}
            fullWidth
            margin="normal"
          />
          {/* <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Retirement Tax Level</InputLabel>
            <Select
              name="retire_tax_hl"
              value={inputForm.retire_tax_hl}
              onChange={handleInputFormChange}
              label="Retirement Tax Level"
            >
              <MenuItem value={1}>Low</MenuItem>
              <MenuItem value={2}>High</MenuItem>
            </Select>
          </FormControl> */}
          {/* <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Contribution Status</InputLabel>
            <Select
              name="contribution_status"
              value={inputForm.contribution_status}
              onChange={handleInputFormChange}
              label="Contribution Status"
            >
              <MenuItem value="S">Single</MenuItem>
              <MenuItem value="M">Married Filing Jointly</MenuItem>
              <MenuItem value="H">Head of Household</MenuItem>
            </Select>
          </FormControl> */}
          <FormControl fullWidth margin="normal" variant="outlined">
            <InputLabel>Filing Status</InputLabel>
            <Select
              name="distribution_status"
              value={inputForm.distribution_status}
              onChange={handleInputFormChange}
              label="Filing Status"
            >
              <MenuItem value="S">Single</MenuItem>
              <MenuItem value="M">Married Filing Jointly</MenuItem>
              <MenuItem value="H">Head of Household</MenuItem>
            </Select>
          </FormControl>
          <TextField
            label="Life Years"
            name="life_years"
            type="number"
            value={inputForm.life_years}
            onChange={handleInputFormChange}
            fullWidth
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInputDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleInputSubmit} color="primary">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogTitle>Confirm Submission and Calculations</DialogTitle>
        <DialogContent>
          <Typography>
            Proceeding with Submit will overwrite Inputs AND also create new Roth Conversion tables, Proceed?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmSubmit} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>

      {/* Conversions Table */}
      <Box display="flex" justifyContent="space-between" alignItems="center" style={{ marginBottom: '16px' }}>
        <Typography variant="h5">
          Conversions - Traditional to Roth
        </Typography>
        <Button
          variant="text"
          color="primary"
          onClick={exportConversionsToCSV}
          size="small"
          disabled={loading || (conversions.length === 0 && parts.length === 0)}
          style={{ textTransform: 'none', fontSize: '0.875rem' }}
        >
          Export CSV
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Grp</TableCell>
              <TableCell align="center">Tax Bracket</TableCell>
              <TableCell align="center">Outside<br />Conversion Amount</TableCell>
              <TableCell align="center" style={{ backgroundColor: '#f8a9a4' }}>Conv&nbsp;Tax&nbsp;=<br />Investment</TableCell>
              <TableCell align="center" style={{ backgroundColor: '#fff9c4' }}>Synthetic Roth&nbsp;Cont =Conv&nbsp;Tax<br />x {distributionSchedule?.annuity_factor_multiple?.toFixed(2) || 'N/A'}</TableCell>
              <TableCell align="center" style={{ backgroundColor: '#fff9c4' }}>Spread&nbsp;GL<br />=(<strong>t<sub>D</sub></strong>&nbsp;-&nbsp;<strong>t<sub>C</sub></strong>) x<br />Conv-Amt x {distributionSchedule?.annuity_factor_multiple?.toFixed(2) || 'N/A'}</TableCell>
              <TableCell align="center" style={{ backgroundColor: '#c8e6c9' }}>Investment<br />After-Tax Payout</TableCell>
              <TableCell align="center">Investment<br />Return Multiple</TableCell>
              <TableCell align="center">IRR</TableCell>
              <TableCell align="center">Duration</TableCell>
              {/* <TableCell align="center">Pre-Conv<br />Dist MTR</TableCell> */}
              <TableCell align="center"><strong>t<sub>C</sub></strong>&nbsp;Conv<br />Tax Rate</TableCell>
              <TableCell align="center"><strong>t<sub>D</sub></strong>&nbsp;Dist<br />Tax Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {conversions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12}>No conversions data available</TableCell>
              </TableRow>
            ) : (
              conversions.map((conv) => (
                <TableRow
                  key={conv.conv_group_num}
                  style={{
                    backgroundColor: getConversionsRowColor(conv)
                  }}
                >
                  <TableCell align="right">{conv.conv_group_num}</TableCell>
                  <TableCell align="right">{(conv.tax_rate_bucket * 100).toFixed(1)}%</TableCell>
                  <TableCell align="right">
                    ${conv.conv_amt.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell align="right">
                    ${conv.conv_tax.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell align="right">
                    ${conv.synthetic_roth_cont.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell align="right">
                    ${conv.tax_rate_arb_amt.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell align="right">
                    ${conv.total_after_tax_dist_chg_amt.toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </TableCell>
                  <TableCell align="right">{conv.conv_return_multiple.toFixed(2)}</TableCell>
                  <TableCell align="right">{(conv.conv_irr * 100).toFixed(2)}%</TableCell>
                  <TableCell align="right">{conv.conv_duration.toFixed(1)}</TableCell>
                  {/* <TableCell align="right">{(conv.dist_mtr_pre_conv * 100).toFixed(1)}%</TableCell> */}
                  <TableCell align="right">{(conv.conv_tax_rate * 100).toFixed(1)}%</TableCell>
                  <TableCell align="right">{(conv.conv_dist_tax_rate * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Parts Table */}
      <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
        Individual Bracket Conversions - Groups 1-{getDynamicGroupNumber()} below have positive tax-rate spreads & sum to Group {getDynamicGroupNumber()} above
      </Typography>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">Grp</TableCell>
              <TableCell align="center">Tax Bracket</TableCell>
              <TableCell align="center">Outside<br />Conversion Amount</TableCell>
              <TableCell align="center" style={{ backgroundColor: '#f8a9a4' }}>Conv&nbsp;Tax&nbsp;=<br />Investment</TableCell>
              <TableCell align="center" style={{ backgroundColor: '#fff9c4' }}>Synthetic Roth&nbsp;Cont =Conv&nbsp;Tax<br />x {distributionSchedule?.annuity_factor_multiple?.toFixed(2) || 'N/A'}</TableCell>
              <TableCell align="center" style={{ backgroundColor: '#fff9c4' }}>spread&nbsp;G/L<br />=(<strong>t<sub>D</sub></strong>&nbsp;-&nbsp;<strong>t<sub>C</sub></strong>) x<br />Conv-Amt x {distributionSchedule?.annuity_factor_multiple?.toFixed(2) || 'N/A'}</TableCell>
              <TableCell align="center" style={{ backgroundColor: '#c8e6c9' }}>Investment<br />After-Tax Payout</TableCell>
              <TableCell align="center">Investment<br />Return Multiple</TableCell>
              <TableCell align="center">IRR</TableCell>
              <TableCell align="center">Duration</TableCell>
              {/* <TableCell align="center">Pre-Conv<br />Dist MTR</TableCell> */}
              <TableCell align="center"><strong>t<sub>C</sub></strong>&nbsp;Conv<br />Tax Rate</TableCell>
              <TableCell align="center"><strong>t<sub>D</sub></strong>&nbsp;Dist<br />Tax Rate</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {parts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={12}>No parts data available</TableCell>
              </TableRow>
            ) : (
              parts.map((part) => (
                <TableRow
                  key={part.conv_group_num}
                  style={{
                    backgroundColor: part.tax_rate_arb_amt === 0 ? 'transparent' : (part.tax_rate_arb_amt < 0 ? '#ffebee' : '#f1f8e9')
                  }}
                >
                  <TableCell align="right">{part.conv_group_num}</TableCell>
                  <TableCell align="right">{(part.tax_rate_bucket * 100).toFixed(1)}%</TableCell>
                  <TableCell align="right">
                    ${part.conv_amt.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell align="right">
                    ${part.conv_tax.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell align="right">
                    ${part.synthetic_roth_cont.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell align="right">
                    ${part.tax_rate_arb_amt.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                  </TableCell>
                  <TableCell align="right">
                    ${part.total_after_tax_dist_chg_amt.toLocaleString('en-US', {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </TableCell>
                  <TableCell align="right">{part.conv_return_multiple.toFixed(2)}</TableCell>
                  <TableCell align="right">{(part.conv_irr * 100).toFixed(2)}%</TableCell>
                  <TableCell align="right">{part.conv_duration.toFixed(1)}</TableCell>
                  {/* <TableCell align="right">{(part.dist_mtr_pre_conv * 100).toFixed(1)}%</TableCell> */}
                  <TableCell align="right">{(part.conv_tax_rate * 100).toFixed(1)}%</TableCell>
                  <TableCell align="right">{(part.conv_dist_tax_rate * 100).toFixed(1)}%</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body2" sx={{ fontStyle: 'italic', color: 'text.secondary', mt: 1 }}>
        <strong>Synthetic Roth Contribution</strong> - Paying Roth conversion tax out-of-pocket adds that tax amount to your Roth account, 
        which then earns the portfolio return (1st <strong style={{ color: '#FFC107' }}>yellow</strong> column).<br />
        <strong>Tax-rate spread profit/loss</strong> - Realized regardless of where the tax is paid from,  
        and then also grows at the portfolio return (2nd <strong style={{ color: '#FFC107' }}>yellow</strong> column).  <br /><br />

        Inside-funded conversions (tax paid from inside the Traditional account) - Only receive the tax-rate spread profit/loss<br />
        Outside-funded conversions receive both return sources. - Takeaway: Invest the tax amount (<strong style={{ color: 'red' }}>red</strong> column) & receive after-tax payout (<strong style={{ color: 'green' }}>green</strong> column)<br /><br />

        Return Multiple = After-tax multiple received on your Conversion-Tax Investment<br />
        IRR = annual after-tax return earned on your Conversion-Tax Investment<br />
        Duration = average years payout period on your Conversion-Tax Investment<br /><br />

        <strong>t<sub>C</sub></strong> = Tax rate paid on Traditional dollars converted<br />
        <strong>t<sub>D</sub></strong> = Distribution tax rate you would have paid on Traditional dollars converted<br /><br />
        Note: Future tax brackets, standard deductions and Soc Sec benefit are all inflation adjusted.<br />
            Converted Roth funds are distributed proportionally with Traditional funds during retirement - necessary to minimize distribution tax rate and maximize future after-tax payout.<br />
      </Typography>

      <Snackbar
        open={!!successMessage}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert severity="success" onClose={handleSnackbarClose}>
          {successMessage}
        </Alert>
      </Snackbar>

      {/* Payment Modal */}
      <PaymentModal
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        calcCount={calcCount}
        userId={userId}
        onFreeSelected={async () => {
          // Run the calculation
          const result = await onRunCalculations(userId);
          setCalcCount(result.calcCount);
          onRefetchUser();
        }}
      />
    </>
  );
};

export default ConversionsTab;