import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Card,
  CardContent,
  CardActions,
  Grid,
  Divider,
  CircularProgress,
  Chip
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import apiService from '../../services/apiService';

const PaymentModal = ({ open, onClose, calcCount, userId, onFreeSelected }) => {
  const [priceIds, setPriceIds] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (open) {
      fetchPriceIds();
    }
  }, [open]);

  const fetchPriceIds = async () => {
    try {
      const data = await apiService.getPriceIds();
      setPriceIds(data);
    } catch (error) {
      console.error('Failed to fetch price IDs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentClick = async (priceId) => {
    try {
      // Create checkout session with user's email pre-filled
      const data = await apiService.createCheckoutSession(userId, priceId);
      // Redirect to Stripe Checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Failed to create checkout session:', error);
    }
  };

  const handleFreeClick = async () => {
    try {
      const data = await apiService.selectFreePlan(userId);
      if (data.subscription_status === 'paid') {
        onFreeSelected(); // Notify parent component
        onClose();
      }
    } catch (error) {
      console.error('Failed to select free plan:', error);
    }
  };

  const paymentOptions = [
    {
      title: 'Professional',
      price: '$99/year',
      description: 'Required for financial professionals (honor system)',
      priceKey: 'professional',
      buttonText: 'Subscribe Professional',
      buttonColor: 'primary',
      highlight: true
    },
    {
      title: 'Individual',
      price: '$50/year',
      description: 'Support app development - many more features coming!',
      priceKey: 'individual_50',
      buttonText: 'Pay $50',
      buttonColor: 'secondary',
      recommended: false
    },
    {
      title: 'Individual',
      price: '$25/year',
      description: 'Support app development - many more features coming!',
      priceKey: 'individual_25',
      buttonText: 'Pay $25',
      buttonColor: 'secondary',
      recommended: true
    },
    {
      title: 'Individual',
      price: '$10/year',
      description: 'Support app development - many more features coming!',
      priceKey: 'individual_10',
      buttonText: 'Pay $10',
      buttonColor: 'secondary',
      recommended: false
    },
    {
      title: 'Individual',
      price: 'Free',
      description: 'Free for now - no set term',
      priceKey: null,
      buttonText: 'Continue Free',
      buttonColor: 'success',
      recommended: false
    }
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="h5" component="div" gutterBottom>
            Choose Your Plan
          </Typography>
          <Typography variant="body2" color="text.secondary">
            You've completed {calcCount} complimentary Roth conversion calculations
          </Typography>
        </Box>
      </DialogTitle>

      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Professional Option - Full Width */}
            <Box sx={{ mb: 3 }}>
              <Card
                variant="outlined"
                sx={{
                  borderColor: 'primary.main',
                  borderWidth: 2,
                  '&:hover': {
                    boxShadow: 4
                  }
                }}
              >
                <CardContent>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} md={8}>
                      <Typography variant="h6" component="div" color="primary">
                        {paymentOptions[0].title}
                      </Typography>
                      <Typography variant="h5" color="primary" gutterBottom>
                        {paymentOptions[0].price}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {paymentOptions[0].description}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Button
                        fullWidth
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={() => handlePaymentClick(priceIds?.professional)}
                        disabled={!priceIds || !priceIds.professional}
                      >
                        {paymentOptions[0].buttonText}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="body2" color="text.secondary">
                Individual Options
              </Typography>
            </Divider>

            {/* Individual Options - Grid */}
            <Grid container spacing={2}>
              {paymentOptions.slice(1).map((option, idx) => (
                <Grid item xs={6} sm={3} key={idx}>
                  <Card
                    variant="outlined"
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      position: 'relative',
                      borderColor: option.recommended ? 'warning.main' : 'default',
                      borderWidth: option.recommended ? 2 : 1,
                      '&:hover': {
                        boxShadow: 2,
                        borderColor: option.buttonColor + '.main'
                      }
                    }}
                  >
                    <CardContent sx={{ flexGrow: 1, textAlign: 'center', pt: 2 }}>
                      <Typography variant="h6" color={option.buttonColor} gutterBottom>
                        {option.price}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" display="block">
                        {option.price === 'Free' ? 'No set term' : ''}
                      </Typography>
                      {option.recommended && (
                        <Box sx={{ mt: 1 }}>
                          <Chip
                            icon={<StarIcon />}
                            label="Recommended"
                            color="warning"
                            size="small"
                          />
                        </Box>
                      )}
                    </CardContent>
                    <CardActions sx={{ p: 2 }}>
                      <Button
                        fullWidth
                        variant="contained"
                        color={option.buttonColor}
                        size="small"
                        onClick={() =>
                          option.priceKey
                            ? handlePaymentClick(priceIds[option.priceKey])
                            : handleFreeClick()
                        }
                        disabled={option.priceKey && (!priceIds || !priceIds[option.priceKey])}
                      >
                        {option.buttonText}
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ mt: 3, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">
                All plans include full feature set plus unlimited calculations.<br />
                YOUR <strong>SUPPORT REALLY HELPS!</strong>  Choosing a paid plan helps fund ongoing development and maintenance. <strong>Thank you!</strong>
              </Typography>
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default PaymentModal;
