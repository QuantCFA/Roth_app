import React from 'react';
import { Typography, Container, Paper, Divider, Box } from '@mui/material';

const AboutTab = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={1} sx={{ p: 4, mb: 4, backgroundColor: '#f5f5f5' }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
          Steven M Cheshire, CFA
        </Typography>

        <Typography variant="body1" sx={{ mb: 2, color: 'text.secondary' }}>
          {/* Placeholder for personal paragraph */}
        </Typography>

        <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mb: 4
        }}>
          <Typography variant="body1">
            cheshireSteven@gmail.com
          </Typography>
          <Typography variant="body1">
            Miami Beach FL 33139
          </Typography>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
          Professional Background
        </Typography>

        <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
          Held Quantitative Equity Analyst and Equity Portfolio Manager positions at Wellington Management Company, Putnam Investments, State Street Global Advisors and United Alpha. Consulted at Gartmore Investments, Affinity Wealth Advisors and Hoover Financial Advisors. Received a B.S. in Finance at Virginia Tech, an MBA from Boston University and is a CFA charterholder.
        </Typography>
      </Paper>

      <Paper elevation={1} sx={{ p: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
          Why I Built This Application
        </Typography>

        <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
        This Application was born a few years after I started doing Roth conversions.  I intuited I was converting correctly, 
        but wanted to know (quantify) exactly what I'll in return for my annual tax payments.  <br /><br />

         I've tested hundreds (more?) of Roth conversion scenarios with this tool and discovered a lot of things.  You can do the same in CONVERSIONS.
         <br /><br />

         A major area of puzzlement for me has been the lack of consensus in the financial community about how Roth conversions work.  To address this,
         I've submitted a research paper for review detailing Roth conversion mathematics and concepts, presented in entirety in the CONCEPTS tab.  <br /><br />

         I encourage anyone to try and disprove any of the theories or formulas I present.  My desire is for truth to prevail, and for Roth conversion knowledge to 
         improve, disseminate and be widely understood.

        </Typography>
      </Paper>

      {/* <Paper elevation={1} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
          Facts
        </Typography>

        <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
          Paying conversion tax from inside the Traditional account or with outside cash generates an equal tax-rate spread profit or loss
          by settling the tax obligation on a specified Traditional amount.<br />
          Paying Roth conversion tax with outside funds simply injects those funds into the Roth account.<br />

        </Typography>
      </Paper> */}

      {/* <Paper elevation={1} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
          Theory
        </Typography>

        <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
          Theories I Believe
        </Typography>
      </Paper> */}

      <Paper elevation={1} sx={{ p: 4, mt: 4, mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
          Support
        </Typography>

        <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
          Considerable effort has gone into developing this application and the underlying theories and formulas. I hope
          these efforts will improve investor understading and lead to profitable Roth conversion decisions for everyone.  Substantial 
          enhancements to this tool are forthcoming which will require additional efforts.  If you find this tool useful, please consider helping to support development.
           <br />
        </Typography>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <img
          src="/cfa_badge.jpeg"
          alt="CFA Badge"
          style={{
            width: '80px',
            height: 'auto'
          }}
        />
      </Box>
    </Container>
  );
};

export default AboutTab;