import React from 'react';
import { Typography, Container } from '@mui/material';

class ErrorBoundary extends React.Component {
  state = { error: null };

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Container maxWidth="lg" style={{ marginTop: '20px' }}>
          <Typography color="error">
            An error occurred: {this.state.error.message}
          </Typography>
        </Container>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;