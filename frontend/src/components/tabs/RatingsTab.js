import React, { useState, useEffect } from 'react';
import {
  Typography,
  Box,
  Rating,
  TextField,
  Button,
  Alert,
  Paper,
  CircularProgress,
  Container
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import apiService from '../../services/apiService';

const RatingsTab = ({ userId }) => {
  // State for form
  const [starRating, setStarRating] = useState(0);
  const [comment, setComment] = useState('');

  // State for display
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [userCurrentRating, setUserCurrentRating] = useState(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load ratings summary on component mount
  useEffect(() => {
    if (userId) {
      fetchRatingsSummary();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const fetchRatingsSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      // Get community ratings summary and user's current rating
      const response = await apiService.getRatingsSummary(userId);

      setAverageRating(response.averageRating);
      setTotalRatings(response.totalRatings);
      setUserCurrentRating(response.userCurrentRating);

      // Pre-fill form if user has previous rating
      if (response.userCurrentRating) {
        setStarRating(response.userCurrentRating);
      }
      if (response.userComment) {
        setComment(response.userComment);
      }

    } catch (err) {
      setError('Failed to load ratings summary');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (starRating === 0) {
      setError('Please select a star rating');
      return;
    }

    if (comment.length > 1000) {
      setError('Comment must be 1000 characters or less');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      // Submit rating to API
      await apiService.submitRating({
        user_id: userId,
        star_rating: starRating,
        comment: comment
      });

      setSuccess('Thank you for your feedback!');
      setSubmitted(true);

      // Refresh ratings summary to show updated average
      setTimeout(() => {
        fetchRatingsSummary();
      }, 500);

    } catch (err) {
      setError('Failed to submit rating. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentChange = (e) => {
    const value = e.target.value;
    if (value.length <= 1000) {
      setComment(value);
      setError(null);
    }
  };

  if (loading && !submitted) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Welcome Message */}
      <Typography variant="h4" gutterBottom>
        Your Feedback Matters
      </Typography>

      <Typography variant="body1" paragraph>
        Opinions matter, so please share yours by rating this app: one star
        being poor and five stars as excellent. Leave comments, questions
        and suggestions in the dialog box. I'll try to answer everyone
        and re-post the most relevant questions and comments below, with my response. This 
        is a work in progress - exciting additions are coming soon!
      </Typography>

      {/* Display Average Rating (only after user submits or if data exists) */}
      {(submitted || totalRatings > 0) && (
        <Paper elevation={2} sx={{ padding: 2, marginBottom: 3, backgroundColor: '#f5f5f5' }}>
          <Typography variant="h6" gutterBottom>
            Community Rating
          </Typography>
          <Box display="flex" alignItems="center" gap={2}>
            <Rating
              value={averageRating}
              precision={0.1}
              readOnly
              emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
            />
            <Typography variant="body1">
              {averageRating.toFixed(1)} out of 5 ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
            </Typography>
          </Box>
        </Paper>
      )}

      {/* User's Previous Rating */}
      {userCurrentRating && (
        <Alert severity="info" sx={{ marginBottom: 2 }}>
          Your current rating: {userCurrentRating} star{userCurrentRating !== 1 ? 's' : ''}
        </Alert>
      )}

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ marginBottom: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Success Alert */}
      {success && (
        <Alert severity="success" sx={{ marginBottom: 2 }} onClose={() => setSuccess(null)}>
          {success}
        </Alert>
      )}

      {/* Rating Form */}
      <Paper elevation={1} sx={{ padding: 3 }}>
        <Typography variant="h6" gutterBottom>
          {userCurrentRating ? 'Update Your Rating' : 'Rate This App'}
        </Typography>

        {/* Star Rating */}
        <Box marginBottom={2}>
          <Typography component="legend" marginBottom={1}>
            Star Rating *
          </Typography>
          <Rating
            name="star-rating"
            value={starRating}
            onChange={(event, newValue) => {
              setStarRating(newValue || 0);
              setError(null);
            }}
            emptyIcon={<StarIcon style={{ opacity: 0.55 }} fontSize="inherit" />}
            size="large"
          />
        </Box>

        {/* Comment Box */}
        <Box marginBottom={2}>
          <TextField
            label="Comments, Questions & Suggestions"
            multiline
            rows={4}
            value={comment}
            onChange={handleCommentChange}
            fullWidth
            variant="outlined"
            placeholder="Share your thoughts, ask questions, or suggest improvements..."
            helperText={`${comment.length}/1000 characters`}
            error={comment.length > 1000}
          />
        </Box>

        {/* Submit Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={handleSubmit}
          disabled={loading || starRating === 0}
          size="large"
        >
          {loading ? <CircularProgress size={24} /> : 'ADD/CHG RATING & COMMENT'}
        </Button>
      </Paper>
    </Container>
  );
};

export default RatingsTab;