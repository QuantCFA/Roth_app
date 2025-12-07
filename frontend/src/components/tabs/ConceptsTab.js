import React, { useState } from 'react';
import {
  Typography,
  Box,
  Container,
  Divider,
  Button,
  Chip,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  ListItemButton,
  Tabs,
  Tab
} from '@mui/material';

const ConceptsTab = () => {
  const [activeSection, setActiveSection] = useState('title');
  const [conceptTab, setConceptTab] = useState(0); // 0=Research Paper, 1=General, 2=Distribution Tax Rate

  const authorInfo = {
    name: "Steven M Cheshire, CFA",
    email: "cheshireSteven@gmail.com",
    phone: "617 372 5406",
    location: "Miami Beach FL 33139",
    bio: "Held Quantitative Equity Analyst and Equity Portfolio Manager positions at Wellington Management Company, Putnam Investments, State Street Global Advisors and United Alpha. Consulted at Gartmore Investments, Affinity Wealth Advisors and Hoover Financial Advisors. Received a B.S. in Finance at Virginia Tech, an MBA from Boston University and is a CFA charterholder."
  };

  const tocItems = [
    { id: 'title', title: 'Title & Author', level: 1 },
    { id: 'introduction', title: 'Introduction', level: 1 },
    { id: 'return-components', title: 'Return Component Properties', level: 1 },
    { id: 'inside-outside', title: 'Inside vs. Outside Conversions – Basic Example', level: 1 },
    { id: 'tax-rate-spread', title: 'Tax-Rate Spread Profit — Based on TSA, not Conversion Amount', level: 2 },
    { id: 'inside-outside-summary', title: 'Summary — Initial vs Inside vs Outside Funding', level: 2 },
    { id: 'synthetic-concepts', title: 'Synthetic Roth Contributions - Concept and Analysis', level: 1 },
    { id: 'practical-investment', title: 'Practical vs. Esoteric Investment Measurement', level: 1 },
    { id: 'conversion-analyses', title: 'Roth Conversion Analyses – Applying the Dual Return Component Framework', level: 1 },
    { id: 'distribution-methods', title: 'Retirement Account Distributions – Methods and Tax-Rate Implications', level: 1 },
    { id: 'summary', title: 'Summary', level: 1 },
    { id: 'planner-takeaways', title: 'Financial Planner Takeaways', level: 1 },
    { id: 'appendix-a', title: 'Appendix A: Conversion Identities and Payoff Proofs', level: 1 }
  ];

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleConceptTabChange = (event, newValue) => {
    setConceptTab(newValue);
  };

  return (
    <Container maxWidth="lg" sx={{ pt: 0, pb: 4 }}>
      {/* Sub-Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: -2, position: 'sticky', top: 48, zIndex: 99, backgroundColor: '#ffffff' }}>
        <Tabs value={conceptTab} onChange={handleConceptTabChange} aria-label="concept tabs">
          <Tab label="Research Paper" />
          <Tab label="| General" />
          <Tab label="| Distribution Tax Rate" />
        </Tabs>
      </Box>

      {/* Conditional Content Based on Selected Tab */}
      {conceptTab === 0 && (
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '300px 1fr' },
          gap: 4
        }}>

        {/* Table of Contents */}
        <Box sx={{
          position: { md: 'sticky' },
          top: { md: 104 },
          alignSelf: 'start',
          height: 'fit-content'
        }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="overline" sx={{ opacity: 0.7, display: 'block', mb: 1 }}>
              Research Paper
            </Typography>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 'bold' }}>
              Roth Conversions as Investments
            </Typography>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              A Dual-Component Framework for Better Decisions
            </Typography>
            <Chip size="small" label="Working Paper" color="primary" variant="outlined" sx={{ mb: 2 }} />

            <Typography variant="body2" sx={{ mb: 3, color: 'text.secondary', fontStyle: 'italic' }}>
              Submitted to the Journal of Financial Planning — decision pending
            </Typography>

            <Divider sx={{ my: 2 }} />

            <List dense>
              {tocItems.map((item) => (
                <ListItemButton
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  selected={activeSection === item.id}
                  sx={{
                    pl: item.level * 1.5,
                    borderRadius: 1,
                    mb: 0.25,
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      '&:hover': {
                        backgroundColor: 'primary.dark',
                      }
                    }
                  }}
                >
                  <ListItemText
                    primary={item.title}
                    primaryTypographyProps={{ variant: 'body2', fontSize: item.level === 1 ? '0.875rem' : '0.8rem' }}
                  />
                </ListItemButton>
              ))}
            </List>

            <Divider sx={{ my: 2 }} />

            <Stack direction="column" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => window.print()}
                fullWidth
              >
                Print Article
              </Button>
              {/* TODO: Add PDF file and uncomment when ready
              <Button
                variant="contained"
                size="small"
                href="/paper-media/roth-conversions-paper.pdf"
                target="_blank"
                fullWidth
              >
                Download PDF
              </Button>
              */}
            </Stack>
          </Paper>
        </Box>

        {/* Main Content */}
        <Box sx={{ minWidth: 0 }}>

          {/* Paper Title */}
          <Box id="title" sx={{ mb: 6 }}>
            <Typography variant="h4" component="h1" sx={{
              fontWeight: 'bold',
              mb: 2,
              textAlign: 'center',
              color: 'primary.main',
              lineHeight: 1.2
            }}>
              Roth Conversions as Investments: A Dual-Component Framework for Better Decisions
            </Typography>
            <Typography variant="subtitle1" component="h2" sx={{
              textAlign: 'center',
              color: 'text.secondary',
              fontStyle: 'italic',
              mb: 1
            }}>
              by {authorInfo.name}
            </Typography>
          </Box>


          {/* Introduction */}
          <Box id="introduction" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
              Introduction
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              A Roth conversion settles the tax obligation on a specified portion of the Traditional account, the <strong>Tax Settlement Amount (TSA)</strong>. At conversion, the profit or loss equals the spread between the distribution and conversion tax rates, multiplied by the TSA.
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              When the tax is paid from outside the Traditional account, that cash asset moves into the Roth as a <strong>Synthetic Roth Contribution</strong>, and 100% of the TSA is converted. When the tax is paid from inside the Traditional account, <em>only</em> the remaining balance converts to Roth (a <strong>Core Roth Conversion</strong>), and the cash asset remains.
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Inside- and outside-funded conversions both settle the deferred tax liability arising from Traditional contributions, capture 100% of the TSA spread profit, and yield identical post-conversion wealth. The <em>only</em> distinction is that outside funding moves taxable cash into the tax-free Roth—making the tax payment an investment rather than a cost.
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Payoffs from this investment separate into two additive and independent return components: (1) the <strong>Synthetic Roth Contribution</strong> <em>t<sub>C</sub> X ⋅ M</em> and (2) the <strong>Core Roth Conversion</strong> tax-rate spread gain or loss, <em>(t<sub>D</sub> − t<sub>C</sub>) X ⋅ M</em>.
            </Typography>
            <Paper elevation={1} sx={{ p: 3, my: 3, backgroundColor: '#bbdefb', textAlign: 'center' }}>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1.1rem' }}><em>Payout = t<sub>C</sub> X ⋅ M + (t<sub>D</sub> − t<sub>C</sub>) X ⋅ M</em></Typography>
            </Paper>
            <Typography paragraph variant="body2" sx={{ lineHeight: 1.7, mb: 3, color: 'text.secondary' }}>
              Where <strong><em>X</em></strong> = Traditional TSA, <strong><em>t<sub>C</sub></em></strong> = conversion tax rate, <strong><em>t<sub>D</sub></em></strong> = distribution tax rate, <strong><em>t<sub>C</sub> X</em></strong> = the TSA tax payment (Investment) and <strong><em>M</em></strong> = the after-tax return multiple. (Appendix A provides the empirical and mathematical proof of this decomposition.)
            </Typography>
          </Box>

          {/* Return Component Properties */}
          <Box id="return-components" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
              Return Component Properties
            </Typography>
            <List>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      <strong><u>Synthetic Roth Contribution</u></strong>: Compounds tax-free at the portfolio's return rate over the distribution horizon, independent of tax-rate effects.
                    </Typography>
                  }
                />
              </ListItem>
              <ListItem sx={{ alignItems: 'flex-start' }}>
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ lineHeight: 1.7 }}>
                      <strong><u>Core Roth Conversion</u></strong>: Realizes the full spread gain or loss at conversion, which then also compounds tax-free at the portfolio return.
                    </Typography>
                  }
                />
              </ListItem>
            </List>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mt: 3 }}>
              To drive home these concepts, we'll first examine inside vs. outside conversions. After this brief examination, we proceed to analyze real world Roth conversion examples based on empirical data that confirm and explain the concepts laid out here.
            </Typography>
          </Box>

          {/* Inside vs Outside Conversions */}
          <Box id="inside-outside" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
              INSIDE vs. OUTSIDE CONVERSIONS – Basic Example
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Traditional TSA = $100,000, Cash asset = $12,000, PV tax obligation = $24,000, <em>t<sub>D</sub></em> = 24%. Converting at <em>t<sub>C</sub></em> = 12%, the investor has two options.
            </Typography>

            <List>
              <ListItem><Typography variant="body1">1. Pay $12,000 tax from inside the IRA/401k.</Typography></ListItem>
              <ListItem><Typography variant="body1">2. Pay $12,000 tax from outside cash asset.</Typography></ListItem>
            </List>

            <Paper elevation={1} sx={{ p: 2, mb: 4, backgroundColor: 'grey.100' }}>
              <Typography sx={{ fontFamily: 'monospace' }}>$100,000	Traditional TSA</Typography>
              <Typography sx={{ fontFamily: 'monospace' }}>-$24,000	TSA tax obligation present value</Typography>
              <Typography sx={{ fontFamily: 'monospace', textDecoration: 'underline' }}>__$12,000__	Cash</Typography>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>$88,000	Pre-conversion wealth</Typography>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              <strong>Option 1</strong> — Inside funding (<strong>Core Roth Conversion</strong>)
            </Typography>
            <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: '#e8f5e9' }}>
              <Typography sx={{ fontFamily: 'monospace', mb: 1 }}>$10,560	tax on $88,000 Roth conversion</Typography>
              <Typography sx={{ fontFamily: 'monospace', textDecoration: 'underline', mb: 2 }}>+$1,440		tax on $12,000 distribution</Typography>
              <Typography sx={{ fontFamily: 'monospace', mb: 2 }}>$12,000	Traditional TSA tax payment</Typography>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', mb: 3 }}>$12,000	Conversion Profit</Typography>
              <Typography sx={{ fontFamily: 'monospace', mb: 1 }}>$88,000	Roth</Typography>
              <Typography sx={{ fontFamily: 'monospace', textDecoration: 'underline', mb: 2 }}>__$12,000__	Cash asset remaining</Typography>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>$100,000	Post-conversion Wealth</Typography>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
              <strong>Option 2</strong> — Pay with outside funds (<strong>Core Conversion + $12k Synthetic Roth Contribution</strong>)
            </Typography>
            <Paper elevation={1} sx={{ p: 2, mb: 4, backgroundColor: '#e3f2fd' }}>
              <Typography sx={{ fontFamily: 'monospace', mb: 2 }}>$12,000	tax on $100,000 Roth conversion = Traditional TSA tax payment</Typography>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', mb: 3 }}>$12,000	Conversion Profit</Typography>
              <Typography sx={{ fontFamily: 'monospace', textDecoration: 'underline', mb: 2 }}>__$100,000__	Roth</Typography>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>$100,000	Post-conversion Wealth</Typography>
            </Paper>

            {/* Tax-Rate Spread Profit */}
            <Box id="tax-rate-spread" sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'secondary.main' }}>
                Tax-Rate Spread Profit — Based on TSA, not Conversion Amount!
              </Typography>
              <Typography paragraph variant="body1" sx={{ lineHeight: 1.7 }}>
                The $12,000 conversion profit from the <em>(t<sub>D</sub> - t<sub>C</sub>)</em> differential should be called the "Tax Settlement Amount" profit to avoid confusion since the profit is based on the $100,000 TSA, not the two different conversion amounts.
              </Typography>
            </Box>

            {/* Summary */}
            <Box id="inside-outside-summary" sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: 'secondary.main' }}>
                Summary — Initial vs Inside vs Outside Funding
              </Typography>
              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>Inside and Outside funded conversions</Typography>
              <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100' }}>
                <Typography sx={{ fontFamily: 'monospace' }}>$12,000	Settle tax obligation on the entire $100,000 Traditional TSA</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>$12,000	Have equal spread profit and wealth increase</Typography>
              </Paper>

              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>Conversion Amount = Roth Balance Increase</Typography>
              <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100' }}>
                <Typography sx={{ fontFamily: 'monospace' }}>$88,000	Inside funding</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>$100,000	Outside funding</Typography>
              </Paper>

              <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 2 }}>Post-Conversion Wealth</Typography>
              <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100' }}>
                <Typography sx={{ fontFamily: 'monospace' }}>$100,000	Inside funding ($88,000 Roth, $12,000 Cash)</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>$100,000	Outside funding ($100,000 Roth)</Typography>
              </Paper>

              <Typography paragraph variant="body1" sx={{ lineHeight: 1.7 }}>
                This confirms that the only difference between inside and outside conversions is cash moving into the Roth asset with outside funding. This '<strong>Synthetic Roth Contribution</strong>' is an accounting journal entry that does not affect investor wealth.
              </Typography>
            </Box>
          </Box>


          {/* Synthetic Roth Contributions */}
          <Box id="synthetic-concepts" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
              SYNTHETIC ROTH CONTRIBUTIONS - CONCEPT and ANALYSIS
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              As we saw, paying the Roth conversion tax with outside funds yields an immediate tax-rate spread gain equal to the inside Roth conversion. When t<sub>C</sub> &lt; t<sub>D</sub>, both conversions created the same $12,000 profit.
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Paying tax with cash re-classified $12,000 more of the $100,000 Traditional TSA to Roth than the inside conversion. This cash to Roth transfer is <em>akin</em> to making a Roth contribution of the same amount. This <strong>Synthetic Roth contribution</strong> is contained in <em>every</em> outside Roth conversion as shown in Appendix A.
            </Typography>
            <Paper elevation={1} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Outside funding: Roth account X grows to:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>X ⋅ M</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Inside funding: (1 - t<sub>C</sub>) X  Roth plus t<sub>C</sub>  X Cash grows to:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>X ⋅ M - t<sub>C</sub> X ⋅ M + t<sub>C</sub> X ⋅ M'</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>Difference</Typography>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}><em>t<sub>C</sub> X ⋅ (M - M')</em></Typography>
              </Box>
            </Paper>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7 }}>
              The tax-drag cash asset earns $12,000⋅<em>M'</em> and the tax-free Roth earns $12,000⋅<em>M</em>. <em>(M - M')</em> is the increase in return the investor will experience by moving cash into the tax-efficient Roth.
            </Typography>
          </Box>

          {/* Practical vs Esoteric Investment Measurement */}
          <Box id="practical-investment" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
              Practical vs. Esoteric Investment Measurement
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              When investing $12,000, it is more useful to know what we get in return (<em>$12,000⋅M</em>) rather than what we get relative to the foregone cash asset, <em>$12,000⋅(M - M')</em>. With multiple <em>M=3</em>, we'd get back $36,000 over time.
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Viewing the outside conversion's tax payment <em>t<sub>C</sub> X</em> as an <em>investment</em>, Appendix A shows that this <strong>cash investment earns <em>t<sub>C</sub> X⋅M + (t<sub>D</sub> - t<sub>C</sub>) X⋅M</em> in return</strong>.
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7 }}>
              Viewing the tax payment this way is simple and powerful. Investors and advisors can evaluate conversions like other investments, by quantifying the <em>return earned on dollars deployed</em> using familiar metrics like return multiple and IRR. This framing leads to the main body of this paper.
            </Typography>
          </Box>

          {/* Roth Conversion Analyses */}
          <Box id="conversion-analyses" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
              ROTH CONVERSION ANALYSES – APPLYING THE DUAL RETURN COMPONENT FRAMEWORK
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              We now look at several real-world examples where the investor's distribution tax rate t<sub>D</sub> is constructed from personal data including Traditional balance, Social Security benefit, tax filing status, life expectancy and return and inflation assumptions.
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              The focus is on outside-funded Roth conversions using 2025 IRS tax tables and how t<sub>D</sub> and tax-rate spreads change through the increasing tax brackets. All numbers presented are calculated from large multi-variant time-series data sets soon available at rothgpt.com and rothconv.com. The theoretical formulas in Appendix A are meant to validate findings in the tables and vice versa.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2 }}>
              <strong>Table 1: Roth Conversions – MFJ</strong> filer (Social Security <strong>$25,000</strong>, Traditional savings <strong>$1,000,000</strong>). Annual distribution = $65,051. Assumes 5% portfolio return, 1.5% inflation, (30-year annuity, M=1.95).
            </Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100', overflowX: 'auto' }}>
              <table style={{ fontFamily: 'monospace', fontSize: '0.7rem', width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ fontWeight: 'bold', borderBottom: '2px solid #999' }}>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Tax Bracket</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Conversion Amount</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Conv Tax = Investment</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Synthetic Roth Cont = Conv Tax x 1.9515</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Spread GL = (t<sub>D</sub>-t<sub>C</sub>) x Conv-Amt x 1.9515</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Total Investment</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>After-Tax Payout</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Return Multiple</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>IRR</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Duration</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>t<sub>C</sub> Conv Tax Rate</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>t<sub>D</sub> Dist Tax Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>0.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$30,000</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$7,026</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$7,026</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>100.00</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>100.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>0.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>0.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.00%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>10.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$53,850</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$2,385</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$4,654</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$7,956</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$2,385</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$12,611</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>5.29</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>17.49%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>10.3</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>4.43%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.00%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>12.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$126,950</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$11,157</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$21,773</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$7,956</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$11,157</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$29,730</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>2.66</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>8.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.7</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>8.79%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.00%</td>
                  </tr>
                  <tr style={{ backgroundColor: '#ffebee' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>22.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$236,700</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$35,302</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$68,893</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>($5,819)</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$35,302</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$63,074</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>1.79</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>4.04%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>14.6</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>14.91%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>13.65%</td>
                  </tr>
                </tbody>
              </table>
            </Paper>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              In all conversion tables, t<sub>D</sub> is the effective distribution tax rate calculated from post-conversion distributions for that bracket over the full distribution horizon.
            </Typography>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              A spouse with a $1M Traditional asset and 12% distribution tax rate <strong>converts $126,950</strong> at 8.79%. The <strong>$11,157 tax payment</strong> earns an <strong>8% IRR</strong> and increases after-tax distributions by <strong>$29,730</strong>. This payout comes from the Synthetic Roth Contribution, and the tax-rate spread profit that both grow at 5% and distribute 1.95 multiples.
            </Typography>

            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontStyle: 'italic', fontSize: '1rem' }}>Payout = t<sub>C</sub> X⋅M + (t<sub>D</sub> − t<sub>C</sub>) X⋅M</Typography>
            </Box>
            <Paper elevation={1} sx={{ p: 3, my: 3, backgroundColor: '#e3f2fd' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Synthetic Roth Contribution</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>($126,950 × .0879) × 1.9515 =  $21,773</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Core Conversion – rate spread G/L</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>(.12 − .0879) × $126,950 × 1.9515 =  +$7,956</Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem' }}>Total Payout</Typography>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem' }}>$29,730</Typography>
              </Box>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Individual Bracket Evaluation</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              The $126,950 conversion above is a sum of the 0%, 10% and 12% conversion below. The 0% and 10% brackets have spread gains while the $73,100 <strong>12% conversion</strong> has <strong>zero</strong> spread gain/loss since <strong><em>t<sub>D</sub></em> = <em>t<sub>C</sub></em> = 12%</strong>. The $8772 Synthetic Roth Contribution grows at 5% to $17,119 as it's distributed over 30 years.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2 }}>
              <strong>Table 2: Isolated Brackets – MFJ</strong> filer (Soc Sec <strong>$25,000</strong>, Traditional savings <strong>$1,000,000</strong>)
            </Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100', overflowX: 'auto' }}>
              <table style={{ fontFamily: 'monospace', fontSize: '0.7rem', width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ fontWeight: 'bold', borderBottom: '2px solid #999' }}>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Tax Bracket</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Conversion Amount</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Conv Tax = Investment</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Synthetic Roth Cont = Conv Tax x 1.9515</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Spread GL = (t<sub>D</sub>-t<sub>C</sub>) x Conv-Amt x 1.9515</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Total Investment</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>After-Tax Payout</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Return Multiple</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>IRR</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Duration</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>t<sub>C</sub> Conv Tax Rate</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>t<sub>D</sub> Dist Tax Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>0.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$30,000</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$7,026</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$7,026</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>100.00</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>100.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>0.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>0.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.00%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>10.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$23,850</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$2,385</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$4,654</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$931</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$2,385</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$5,585</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>2.34</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>6.69%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>10.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>10.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.00%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>12.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$73,100</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$8,772</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$17,119</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$8,772</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$17,119</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>1.95</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>5.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.00%</td>
                  </tr>
                  <tr style={{ backgroundColor: '#ffebee' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>22.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$109,750</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$24,145</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$47,120</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>($13,776)</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$24,145</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$33,344</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>1.38</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>2.05%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>22.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>22.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>15.57%</td>
                  </tr>
                </tbody>
              </table>
            </Paper>

            <Paper elevation={1} sx={{ p: 3, my: 3, backgroundColor: '#e3f2fd' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Synthetic Roth Contribution</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>($73,100 × .12) × 1.9515 =  $17,119</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Core Conversion – rate spread G/L</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>(.12 − .12) × $73,100 × 1.9515 =  <strong>+$0.0</strong></Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem' }}>Total Payout</Typography>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem' }}>$17,119</Typography>
              </Box>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Empirical Confirmation</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Conversion table values are statistics constructed from the full distribution schedule implied by the investor's Traditional balance, Social Security benefit, life expectancy, etc.
            </Typography>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              The <strong>$17,119</strong> payout is a sum of 30 annual after-tax cash flow increases the conversion creates, empirically confirming the Synthetic Roth Contribution component of the outside conversion payout formula. <em>t<sub>C</sub> X⋅M</em> = .12 * $73,100 * 1.95 = $8772 * 1.9515 = <strong>$17,119</strong>.
            </Typography>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              The 12% conversion's 5.0% IRR matches the 5.0% portfolio return when the spread component is zero, a further empirical confirmation that outside tax payments behave like same-sized Roth contributions.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Decision: convert or not?</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Converting $53,850 (10% row, upper table) captures the $126,950 conversion's $7956 spread profit with only a $2385 tax payment, a 17.5% IRR. A high return on investment.
            </Typography>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Converting $73,100 more requires an additional $8772 tax payment that only earns 5.0%. Deciding to convert this extra 12% bracket is the same as deciding to make a $8772 Roth contribution, trading cash liquidity for a tax-free asset.
            </Typography>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Attractive for spouses: When a spouse dies the widow's tax rate can meaningfully increase making prior conversions instantly more valuable, and this Synthetic Roth Contribution can be done without the earned income a direct contribution requires.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Converting when <em>t<sub>D</sub> &lt; t<sub>C</sub></em> — Should we ever do it?</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Our spouse also considers adding the 22% bracket conversion, even though it produces an immediate spread loss of -$7,057. <em>(t<sub>D</sub> − t<sub>C</sub>)X</em> = ((.1557 − .22) * $109,750).
            </Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100', overflowX: 'auto' }}>
              <table style={{ fontFamily: 'monospace', fontSize: '0.7rem', width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ fontWeight: 'bold', borderBottom: '2px solid #999' }}>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Tax Bracket</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Conversion Amount</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Conv Tax = Investment</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Synthetic Roth Cont = Conv Tax x 1.9515</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>spread G/L = (tD - tC) x Conv-Amt x 1.9515</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Total Investment</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Return Multiple</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>IRR</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Duration</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>tC Conv Tax Rate</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>tD Dist Tax Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ backgroundColor: '#ffebee' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>22.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$109,750</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$24,145</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$47,120</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>($13,776)</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$33,344</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>1.38</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>2.05%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>15.9</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>22.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>15.57%</td>
                  </tr>
                </tbody>
              </table>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Direct Contribution – A Better Alternative</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              When an investor has a Traditional balance, the payout on a direct Roth contribution is <strong><em>t<sub>C</sub> X⋅M + (t<sub>C</sub> − t<sub>D</sub>) X⋅M</em></strong> (explanation - Appendix A). This is the outside conversion's payout <em>t<sub>C</sub> X⋅M + (t<sub>D</sub> − t<sub>C</sub>) X⋅M</em> with the opposite sign on the tax-rate spread G/L.
            </Typography>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              The <strong>conversion</strong> requires a $24,145 tax payment and incurs a $13,776 spread <strong>loss</strong> while a $24,145 <strong>contribution</strong> yields a $13,776 spread <strong>gain</strong> (.22−.1557)*$109,750*1.95. Investors with earned income should ALWAYS choose a direct Roth contribution over an outside Roth conversion when t<sub>D</sub>&lt;t<sub>C</sub>!
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Break-even Investment Tax Rate – An Unattractive Alternative</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              The spouse follows "break-even" advocates who say the Roth's tax-free growth eventually overtakes the spread loss relative to what the cash asset would have earned with a tax drag. First, calculate the return (r') that offsets the loss over their 30-year annuity period.
            </Typography>

            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100' }}>
              <Typography sx={{ fontWeight: 'bold', mb: 1 }}>Tax-Drag Required to Offset Spread Loss:</Typography>
              <ul style={{ margin: '8px 0', paddingLeft: '20px' }}>
                <li><Typography sx={{ display: 'inline' }}>Spread loss <em>PV = $109,750 × (0.22 − 0.1557) = $7,057</em>.</Typography></li>
                <li><Typography sx={{ display: 'inline' }}>Spread loss <em>FV = $7,057 × 1.9515 = $13,772</em> (payout reduction).</Typography></li>
                <li><Typography sx={{ display: 'inline' }}>Conversion tax = <em>$109,750 × 0.22 = $24,145</em> (foregone cash asset).</Typography></li>
                <li><Typography sx={{ display: 'inline' }}>To exactly offset, solve <em>$24,145 × (1.9515 – M') = $13,772</em>, gives <em>M' = 1.3812</em>.</Typography></li>
                <li><Typography sx={{ display: 'inline' }}><em>M'= [r'/ (1 − (1 + r')−30)] × 30</em>. Solving for <em>M' = 1.3812</em> gives <em>r' = 2.22%</em>.</Typography></li>
              </ul>
            </Paper>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              $24,145 invested at 2.22% produces the same after-tax cash flows as the outside conversion that earns 5%. This 2.22% return implies a 55.6% annual investment tax break-even rate. 1−(r'/r)=1−(.0222/.05)=55.6%.
            </Typography>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Since the investor's tax drag will always be less than 55.6%, they should not convert the 22% bracket.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Financial Advisor Takeaway:</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              The investor needs the income their annuity provides during their 30-year expected lifetime. Therefore, break-even time scenarios are not helpful. Time isn't a parameter that can be altered once the investor's distribution schedule is decided.
            </Typography>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              It's more correct and useful to look at break-even rates. Say the implied break-even rate was 10% and the investor generally pays 15%, the advisor could then recommend conversion OR restructure the investor's investments to get the investment tax drag below the 10% threshold.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Question For the Reader:</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              In the example just covered, if our spouse had $750,000, not $1,000,000 of Traditional savings, should we expect t<sub>D</sub> to increase or decrease? Profitability?
            </Typography>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Reducing The Traditional balance from $1,000,000 to $750,000 lowers distributions from <strong>$65,051 to $48,789</strong>. In both cases, the 30 distributions are used to calculate t<sub>D</sub> for each conversion in the tables.
            </Typography>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Let's see how the spouse's conversion options look now.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2 }}>
              <strong>Table 3: Roth Conversions – MFJ</strong> filer (Social Security <strong>$25,000</strong>, Traditional savings <strong>$750,000</strong>). Annual distribution = $48,789. Assumes 5% portfolio return, 1.5% inflation, (30-year annuity, M=1.95)
            </Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100', overflowX: 'auto' }}>
              <table style={{ fontFamily: 'monospace', fontSize: '0.7rem', width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ fontWeight: 'bold', borderBottom: '2px solid #999' }}>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Tax Bracket</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Conversion Amount</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Conv Tax = Investment</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Synthetic Roth Cont = Conv Tax x 1.9515</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Spread GL = (t<sub>D</sub>-t<sub>C</sub>) x Conv-Amt x 1.9515</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Total Investment</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>After-Tax Payout</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Return Multiple</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>IRR</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Duration</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>t<sub>C</sub> Conv Tax Rate</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>t<sub>D</sub> Dist Tax Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>0.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$30,000</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$11,857</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$11,857</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>100.00</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>100.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>0.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>0.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>20.25%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>10.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$53,850</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$2,385</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$4,654</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$16,407</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$2,385</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$21,061</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>8.83</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>32.40%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>10.3</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>4.43%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>20.04%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>12.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$126,950</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$11,157</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$21,773</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$26,318</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$11,157</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$48,091</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>4.31</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>15.01%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.7</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>8.79%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>19.41%</td>
                  </tr>
                  <tr style={{ backgroundColor: '#ffebee' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>22.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$236,700</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$35,302</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$68,893</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$17,458</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$35,302</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$86,352</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>2.45</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>7.41%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>14.6</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>14.91%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>18.69%</td>
                  </tr>
                </tbody>
              </table>
            </Paper>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              The $126,950 conversion's $11,157 tax payment generates the same $21,773 Synthetic Roth Contribution payout and the spouse still converts at 8.79% but <em>t<sub>D</sub></em> increased from 12% to 19.41%, increasing spread profit from $7,956 to $26,318 and IRR from 8% to 15%. From <em>t<sub>C</sub> X⋅M + (t<sub>D</sub> − t<sub>C</sub>)X⋅M</em>,
            </Typography>

            <Paper elevation={1} sx={{ p: 3, my: 3, backgroundColor: '#e3f2fd' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Synthetic Roth Contribution</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>($126,950 × .0879) × 1.9515 =  $21,773</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Core Conversion – rate spread G/L</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>(.1941 − .0879) × $126,950 × 1.9515 =  +<strong>$26,318</strong></Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem' }}>Total Payout</Typography>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem' }}>$48,091</Typography>
              </Box>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Table 4: Individual Bracket Conversions - Each bracket in isolation</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
              The 0% & 10% conversions' spread profits increased and the $73,100 12% conversion's spread profit went from $0 to a gain of $9,911 since t<sub>D</sub> increased from 12% to 18.95%. The Synthetic Roth Contribution stayed at $17,119.
            </Typography>

            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100', overflowX: 'auto' }}>
              <table style={{ fontFamily: 'monospace', fontSize: '0.7rem', width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ fontWeight: 'bold', borderBottom: '2px solid #999' }}>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Tax Bracket</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Conversion Amount</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Conv Tax = Investment</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Synthetic Roth Cont = Conv Tax x 1.9515</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Spread GL = (t<sub>D</sub>-t<sub>C</sub>) x Conv-Amt x 1.9515</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Total Investment</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>After-Tax Payout</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Return Multiple</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>IRR</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Duration</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>t<sub>C</sub> Conv Tax Rate</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>t<sub>D</sub> Dist Tax Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>0.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$30,000</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$11,857</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$11,857</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>100.00</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>100.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>0.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>0.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>20.25%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>10.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$23,850</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$2,385</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$4,654</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$4,549</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$2,385</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$9,204</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>3.86</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>13.52%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>10.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>10.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>19.77%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>12.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$73,100</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$8,772</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$17,119</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$9,911</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$8,772</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$27,030</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>3.08</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>10.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>18.95%</td>
                  </tr>
                  <tr style={{ backgroundColor: '#ffebee' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>22.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$109,750</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$24,145</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$47,120</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>($8,859)</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$24,145</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$38,261</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>1.58</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>3.37%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>22.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>22.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>17.86%</td>
                  </tr>
                </tbody>
              </table>
            </Paper>

            <Paper elevation={1} sx={{ p: 3, my: 3, backgroundColor: '#e3f2fd' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Synthetic Roth Contribution</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>($73,100 × .12) × 1.9515 =  $17,119</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Core Conversion – rate spread G/L</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>(<strong>.1895</strong> − .12) × $73,100 × 1.9515 =  +<strong>$9,911</strong></Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem' }}>Total Payout</Typography>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem' }}>$27,030</Typography>
              </Box>
            </Paper>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Reducing Traditional savings from $1M to $750,000 lowers taxable annuity distributions from $65,051 to $48,789, increasing <em>t<sub>D</sub></em> and each conversion's tax-rate spread profit. This counterintuitive result is due to how Social Security is taxed as shown next in the pre-conversion 'Retirement Income Projections' tables.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2 }}>
              <strong>Table 5: Pre-conversion Retirement Income Projections (MFJ,</strong> Soc Sec <strong>$25k,</strong> Traditional Savings <strong>$750k)</strong>
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              With $48,789 of taxable income, marginal dollars distributed trigger an $0.85 SS tax, effectively multiplying the 12% and 10% underlying marginal tax rates (MTR) times 1.85. The 'Adjusted' MTRs are 22.2% and 18.5%.
            </Typography>

            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100', overflowX: 'auto' }}>
              <table style={{ fontFamily: 'monospace', fontSize: '0.7rem', width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ fontWeight: 'bold', borderBottom: '2px solid #999' }}>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Year</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Age</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Soc Sec</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Trad Dist</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Roth Dist</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Fed Tax</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>ATCF</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>SS Pct Tax</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Tax Rate</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>MTR Adj</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2027</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>62</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$25,000</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$48,789</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$4,138</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$69,651</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>62.80%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>8.50%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>22.20%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2034</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>69</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$27,766</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$48,789</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$3,597</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$72,958</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>78.80%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>7.40%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>22.20%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2041</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>76</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$30,794</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$48,789</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$3,216</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$76,366</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>75.20%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>6.60%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>22.20%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2048</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>83</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$34,285</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$48,789</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$2,888</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$80,177</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>72.70%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>5.90%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>18.50%</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2056</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>91</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$38,500</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$48,789</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$2,509</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$84,779</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>68.70%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>5.10%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>18.50%</td>
                  </tr>
                </tbody>
              </table>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2 }}>
              <strong>Table 6: Pre-conversion Retirement Income Projections (MFJ,</strong> Soc Sec <strong>$25k,</strong> Traditional Savings <strong>$1M)</strong>
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              The $65,051 distribution from $1M savings now exceeds the amount needed to max out the tax at 85% of the Social Security benefit, so future marginal tax rates drop back to 12%.
            </Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100', overflowX: 'auto' }}>
              <table style={{ fontFamily: 'monospace', fontSize: '0.7rem', width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ fontWeight: 'bold', borderBottom: '2px solid #999' }}>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Year</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Age</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Soc Sec</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Trad Dist</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Roth Dist</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Fed Tax</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>ATCF</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>SS Pct Tax</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Tax Rate</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>MTR Adj</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2027</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>62</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$25,000</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$65,051</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$6,156</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$83,895</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>85.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>9.50%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.00%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2034</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>69</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$27,766</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$65,051</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$5,755</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$87,062</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>85.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>8.80%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.00%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2041</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>76</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$30,794</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$65,051</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$5,530</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$90,315</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>85.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>8.50%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.00%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2048</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>83</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$34,285</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$65,051</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$5,220</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$93,348</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>85.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>8.10%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.00%</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2056</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>91</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$38,500</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$65,051</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$4,960</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$98,591</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>85.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>7.60%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.00%</td>
                  </tr>
                </tbody>
              </table>
            </Paper>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              These pre-conversion table values are user-input driven and involve many inflation-adjusted tax calculations. As we convert, the Traditional balance and their distributions decrease. Marginal tax rates usually decrease with distribution size, but as we've seen, the opposite happens once distributions fall into the Social Security Taxation Zone.
            </Typography>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Comparing pre-conversion to post-conversion distributions allows the measurement of change in annual after-tax cash flows created by the conversion. These ATCF deltas can then be used to calculate multiples and IRRs.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Advisor Takeaways:</Typography>
            <ul style={{ mb: 3, paddingLeft: '20px' }}>
              <li><Typography sx={{ display: 'inline' }}>Without the investor's distribution schedule, we couldn't find anomalies that affect conversion outcomes like the 'Social Security Taxation Zone'.</Typography></li>
              <li><Typography sx={{ display: 'inline' }}>Conversions with inside-tax payments yield same spread profits, just without the Synthetic Roth Contribution.</Typography></li>
              <li><Typography sx={{ display: 'inline' }}>Applying the presented formulas is quite easy. The more difficult and useful task is modeling future income and taxes resulting from the distribution schedule. Generating robust <em>t<sub>D</sub></em> estimates is not only tractable but should be viewed as compulsory.</Typography></li>
            </ul>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Single-Filer Case</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              We just saw how incomes in the Social Security Taxation Zone increase distribution tax rates <em>t<sub>D</sub></em> and conversion profitability for MFJ filers. Single filers experience even higher <em>t<sub>D</sub></em> values at the same income level because their tax brackets are half the size. The next example shows how these effects combine—and are further amplified— when Social Security benefits are large.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2 }}>
              <strong>Table 7: Isolated Bracket Conversions – Single</strong> filer (SS <strong>$45,000</strong>, Trad <strong>$750,000</strong>). Annual distribution = $48,879. Assume 5% return, 1.5% inflation, 30-yr annuity, M=1.95
            </Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100', overflowX: 'auto' }}>
              <table style={{ fontFamily: 'monospace', fontSize: '0.7rem', width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ fontWeight: 'bold', borderBottom: '2px solid #999' }}>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Tax Bracket</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Conversion Amount</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Conv Tax = Investment</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Synthetic Roth Cont = Conv Tax x 1.9515</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Spread GL = (t<sub>D</sub>-t<sub>C</sub>) x Conv-Amt x 1.9515</th>
                    <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Total Investment</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>After-Tax Payout</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Return Multiple</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>IRR</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Duration</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>t<sub>C</sub> Conv Tax Rate</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>t<sub>D</sub> Dist Tax Rate</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>0.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$15,000</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$10,178</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$10,178</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>100.00</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>100.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>0.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>0.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>34.77%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>10.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$11,925</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$1,193</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$2,327</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$5,509</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$1,193</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$7,837</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>6.57</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>26.31%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>10.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>10.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>33.67%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>12.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$36,550</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$4,386</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$8,559</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$14,085</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$4,386</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$22,644</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>5.16</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>21.52%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>12.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>31.75%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd', backgroundColor: '#c8e6c9' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>22.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$54,875</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$12,073</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$23,560</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$6,187</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$12,073</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$29,747</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>2.46</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>8.97%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>22.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>22.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>27.78%</td>
                  </tr>
                  <tr style={{ backgroundColor: '#ffebee' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>24.0%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$93,950</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$22,548</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$44,003</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>($1,766)</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$22,548</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$42,238</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>1.87</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>4.87%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>24.0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>24.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>23.04%</td>
                  </tr>
                </tbody>
              </table>
            </Paper>

            <Paper elevation={1} sx={{ p: 3, my: 3, backgroundColor: '#e3f2fd' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Synthetic Roth Contribution</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>($36,550 × .12) × 1.9515 =  $8,559</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Core Conversion – rate spread G/L</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}>(<strong>.3175</strong> − .12) × $36,550 × 1.9515 =  +<strong>$14,085</strong></Typography>
              </Box>
              <Divider sx={{ my: 2 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem' }}>Total Payout</Typography>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', fontSize: '1rem' }}>$22,644</Typography>
              </Box>
            </Paper>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              The 12% conversion's instant $7,209 spread profit ((.3175 − .12) * $36,550) is <strong>164%</strong> of the $4,386 outside-tax payment, comparing favorably to the $5080 profit (<strong>58%</strong> of the $8,772 tax payment) seen for MFJ filers in Table 4.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2 }}>
              <strong>Table 8: Pre-conversion Retirement Income Projections (Single,</strong> Soc Sec <strong>$45,000,</strong> Traditional Savings <strong>$750,000)</strong>
            </Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100', overflowX: 'auto' }}>
              <table style={{ fontFamily: 'monospace', fontSize: '0.7rem', width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ fontWeight: 'bold', borderBottom: '2px solid #999' }}>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Year</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Age</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Soc Sec</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Trad Dist</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Roth Dist</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Fed Tax</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>ATCF</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>SS Pct Tax</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>Tax Rate</th>
                    <th style={{ textAlign: 'center', padding: '4px' }}>MTR Adj</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2027</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>62</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$45,000</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$48,789</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$10,057</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$83,732</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>80.40%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>20.60%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>40.70%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2034</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>69</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$49,943</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$48,789</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$9,957</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$88,655</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>76.70%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>18.60%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>40.70%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2041</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>76</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$55,429</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$48,789</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$8,471</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$95,746</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>73.30%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>17.40%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>40.70%</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2048</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>83</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$61,518</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$48,789</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$7,831</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$102,475</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>70.20%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>16.10%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>22.20%</td>
                  </tr>
                  <tr>
                    <td style={{ textAlign: 'center', padding: '4px' }}>2056</td>
                    <td style={{ textAlign: 'center', padding: '4px' }}>91</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$69,299</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$48,789</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$0</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$7,822</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>$110,265</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>67.10%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>16.00%</td>
                    <td style={{ textAlign: 'right', padding: '4px' }}>22.20%</td>
                  </tr>
                </tbody>
              </table>
            </Paper>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              All table numbers are baseline before any conversions. This shows how a $45,000 SS benefit combined with narrow tax brackets creates large t<sub>D</sub> values and tax-rate spread gains in Table 7. Future marginal tax rates of 22% and 12.2% on the $48,879 distributions are multiplied by 1.85x, yielding pre-conversion MTRs of 40.7% and 22.2%. The 40.7% rate exceeds the top 37% statutory rate demonstrating that single retirees can achieve the highest Roth-conversion payoffs of any group.
            </Typography>
          </Box>

          {/* Distribution Methods */}
          <Box id="distribution-methods" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
              RETIREMENT ACCOUNT DISTRIBUTIONS – METHODS and TAX-RATE IMPLICATIONS
            </Typography>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Immutable Facts:</Typography>
            <ul style={{ paddingLeft: '20px' }}>
              <li><Typography variant="body1" sx={{ display: 'inline' }}>All Traditional (taxable) accounts <strong>must</strong> be distributed over a <strong>finite</strong> period of time.</Typography></li>
              <li><Typography variant="body1" sx={{ display: 'inline' }}>How and when the Traditional account is distributed is 100% investor choice.</Typography></li>
              <li><Typography variant="body1" sx={{ display: 'inline' }}>In sum, taxes paid on these distributions define the future distribution tax rate <em>t<sub>D</sub></em>.</Typography></li>
              <li><Typography variant="body1" sx={{ display: 'inline' }}>Every Traditional account will experience exactly one <em>t<sub>D</sub></em>.</Typography></li>
              <li><Typography variant="body1" sx={{ display: 'inline' }}>Any analyst can model <em>t<sub>D</sub></em> with a relatively high degree of accuracy.</Typography></li>
            </ul>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mt: 3, mb: 3 }}>
              Financial planning includes <em>planning</em> how retirement assets will be distributed. A further goal is maximizing total distribution after-tax cash flows. This goal is achieved through profitable Roth conversions that require <em>t<sub>D</sub></em> estimates determined by those distributions. It is therefore <strong>imperative to have a distribution plan</strong> and stick to it.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Distribution Plan for Most People</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              For people needing all the income their retirement assets can generate, an annuity payout over their expected lifetime is best. With <strong>$1,000,000</strong> earning <strong>5%</strong> and a <strong>30-year</strong> life expectancy, you can withdraw $65,051 a year for 30 years before savings deplete
            </Typography>
            <Box sx={{ backgroundColor: '#f5f5f5', p: 2, mb: 3, fontFamily: 'monospace', fontSize: '0.85rem', textAlign: 'center' }}>
              <Typography sx={{ fontFamily: 'monospace', mb: 1 }}>Annuity Factor (<strong>AF</strong>) <strong>=</strong> <strong>r</strong>/(1-(1+<strong>r</strong>)<sup>(-<strong>n</strong>)</sup> ) <strong>=</strong> .05/(1-(1.05)<sup>(-30)</sup> ) <strong>=</strong> 0.065051</Typography>
            </Box>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              and distribute 1.95 times your savings.
            </Typography>
            <Box sx={{ backgroundColor: '#f5f5f5', p: 2, mb: 3, fontFamily: 'monospace', fontSize: '0.85rem', textAlign: 'center' }}>
              <Typography sx={{ fontFamily: 'monospace' }}>Annuity Multiple (<strong>M</strong>) <strong>=</strong> <strong>n</strong>⋅<strong>AF</strong> <strong>=</strong> 30⋅0.65051 <strong>=</strong> 1.9515<strong>X</strong></Typography>
            </Box>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Examples in this paper use M = 1.95 X, where X is savings. FYI, with a 5.2% return M = 2 and at 9.3% M = 3. Investors earning 9.3% distribute 3 times initial savings over 30 years.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>RMDs for Wealthy Investors</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7 }}>
              Wealthy people who don't need the income maximize heirs' inheritance by only taking RMDs until death, allowing extra portfolio growth relative to annuity distributions. It is important to model the RMDs over the expected lifetime and account for heirs reverting to a 10-year (or less) beneficiary annuity with different <em>t<sub>D</sub></em>.
            </Typography>
          </Box>

          {/* Summary */}
          <Box id="summary" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
              SUMMARY
            </Typography>
            <table style={{ fontFamily: 'monospace', fontSize: '0.7rem', width: '100%', borderCollapse: 'collapse', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ fontWeight: 'bold', borderBottom: '2px solid #999' }}>
                  <th style={{ textAlign: 'center', padding: '4px' }}>Tax Bracket</th>
                  <th style={{ textAlign: 'center', padding: '4px' }}>Conversion Amount</th>
                  <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Conv Tax = Investment</th>
                  <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Synthetic Roth Cont = Conv Tax x 1.9515</th>
                  <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>spread G/L = (tD - tC) x Conv-Amt x 1.9515</th>
                  <th style={{ textAlign: 'center', padding: '4px', backgroundColor: '#e3f2fd' }}>Total Investment After-Tax Payout</th>
                  <th style={{ textAlign: 'center', padding: '4px' }}>Return Multiple</th>
                  <th style={{ textAlign: 'center', padding: '4px' }}>IRR</th>
                  <th style={{ textAlign: 'center', padding: '4px' }}>Duration</th>
                  <th style={{ textAlign: 'center', padding: '4px' }}>tC Conv Tax Rate</th>
                  <th style={{ textAlign: 'center', padding: '4px' }}>tD Dist Tax Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ backgroundColor: '#ffffff' }}>
                  <td style={{ textAlign: 'center', padding: '4px' }}>12.0%</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>$73,100</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>$8,772</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>$17,119</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>$0</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>$17,119</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>1.95</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>5.00%</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>13.7</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>12.00%</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>12.00%</td>
                </tr>
                <tr style={{ backgroundColor: '#c8e6c9' }}>
                  <td style={{ textAlign: 'center', padding: '4px' }}>12.0%</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>$73,100</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>$8,772</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>$17,119</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}><strong>$9,911</strong></td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>$27,030</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>3.08</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>10.00%</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>11.8</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>12.00%</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>18.95%</td>
                </tr>
                <tr style={{ backgroundColor: '#c8e6c9' }}>
                  <td style={{ textAlign: 'center', padding: '4px' }}>12.0%</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>$36,550</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>$4,386</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>$8,559</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>$14,085</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>$22,644</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>5.16</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>21.52%</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>8.4</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>12.00%</td>
                  <td style={{ textAlign: 'center', padding: '4px' }}>31.75%</td>
                </tr>
              </tbody>
            </table>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Outside conversions from empirical examples illustrate what investors get in return for their tax payment via <em>Return = (t<sub>C</sub> × X × M) + ((t<sub>D</sub> - t<sub>C</sub>) × X × M)</em>. The tax-rate spread profit component, realized at conversion, compounds with the <em>Synthetic Roth Contribution</em> while distributing until the account is depleted. Inside conversions only get the <em>Core Roth Conversion</em> return.
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              If <em>t<sub>C</sub> &lt; t<sub>D</sub></em>, the profitable conversion increases the retirement account's value by increasing after-tax distributions. If <em>t<sub>C</sub> &gt; t<sub>D</sub></em>, the conversion loss decreases after-tax distributions, reducing account value. Outside-funded conversions increase the account's value by the tax-payment amount, increasing after-tax distributions in either case. Conflating these dual return sources causes some confusion in the literature, especially when <em>t<sub>C</sub> &gt; t<sub>D</sub></em>. Dual components identify the source of conversion returns and combine to offer profitability metrics like multiples and <em>IRR</em>.
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7 }}>
              Analyses showed that Traditional account size, filing status and Social Security benefit greatly affect <em>t<sub>D</sub></em>, and subsequently drive conversion profitability. It is therefore incumbent the advisor to establish the client's distribution plan and calculate the distribution tax rate determined by that plan.
            </Typography>
          </Box>

          {/* Financial Planner Takeaways */}
          <Box id="planner-takeaways" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
              FINANCIAL PLANNER TAKEAWAYS
            </Typography>
            <ul style={{ paddingLeft: '20px' }}>
              <li><Typography variant="body1" sx={{ display: 'inline', lineHeight: 1.7 }}><strong>Inside vs. Outside Conversions:</strong> Inside- and outside-funded Roth conversions (1) reduce the Traditional balance and RMDs <em>equally</em> and (2) capture the <em>same</em> tax-rate spread profit when <em>t<sub>C</sub> &lt; t<sub>D</sub></em>. Inside funding pays the conversion tax from within the Traditional account, a <em>Core Roth Conversion</em> with zero cash outlay.</Typography></li>
              <li><Typography variant="body1" sx={{ display: 'inline', lineHeight: 1.7 }}><strong>Synthetic Roth Contribution:</strong> Paying Roth conversion tax with outside cash does <em>only</em> one extra thing—it injects that cash asset into the tax-free Roth—this <em>Synthetic Roth Contribution</em> is economically equivalent to a Roth contribution and unaffected by tax rates. In lay terms, the out-of-pocket tax payment is a deposit into a tax-free account.</Typography></li>
              <li><Typography variant="body1" sx={{ display: 'inline', lineHeight: 1.7 }}><strong>Neither Conversion Option is "Better":</strong> They both settle the tax obligation on the same Traditional amount (TSA), but 'convert' different amounts by doing so.</Typography></li>
              <li><Typography variant="body1" sx={{ display: 'inline', lineHeight: 1.7 }}><strong>Dual Return Sources:</strong> Outside-funded conversions have two return sources: (1) the injected-cash asset that compounds at the portfolio return and (2) tax-rate spread gain/loss that also compounds at the portfolio return. Inside conversions have only #2.</Typography></li>
              <li><Typography variant="body1" sx={{ display: 'inline', lineHeight: 1.7 }}><strong>Investment Metrics:</strong> Measuring the outside conversions payoffs vs. the cash paid provides profitability metrics like <em>IRR</em> and multiple on deployed cash that improve decision clarity.</Typography></li>
              <li><Typography variant="body1" sx={{ display: 'inline', lineHeight: 1.7 }}><strong>Distribution Planning is Essential:</strong> Payoff formulas that drive conversion decisions require accurate distribution tax rate (<em>t<sub>D</sub></em>) estimates which requires modeling the client's full distribution schedule. Advisors and clients should build this schedule first, since all conversion analysis depends on it.</Typography></li>
            </ul>
          </Box>

          {/* Appendix A */}
          <Box id="appendix-a" sx={{ mb: 4 }}>
            <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold', borderBottom: 2, borderColor: 'primary.main', pb: 1 }}>
              APPENDIX A: Conversion Identities and Payoff Proofs
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Initial Condition</Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Traditional Tax Settlement Amount (TSA):</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>X</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>TSA Tax Obligation – present value:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>−t<sub>D</sub> X</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Cash Asset:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>t<sub>C</sub> X</em></Typography>
              </Box>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>ROTH CONVERSION IDENTITIES: Future values given by multiple <em>M</em> and tax-drag <em>M'</em></Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Base Case — Do nothing, pay tax <em>(t<sub>D</sub> X)</em> when distributing.</Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100' }}>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', mb: 1 }}>Assets</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Cash asset:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>t<sub>C</sub> X⋅M'</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Traditional account <em>X</em> after-tax:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>X ⋅M − t<sub>D</sub> X⋅M</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Traditional account <em>X</em> after-tax + Cash asset:</Typography>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}><em>(1 − t<sub>D</sub>) X⋅M + t<sub>C</sub> X⋅M'</em></Typography>
              </Box>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Core Roth Conversion — Pay conversion tax <em>(t<sub>C</sub> X)</em> from 'Inside' the IRA/401k.</Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Tax Obligation:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>−t<sub>D</sub> X⋅M</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Tax Payment (distributed from Traditional account):</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>t<sub>C</sub> X⋅M</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, fontWeight: 'bold' }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>Tax-Rate Spread Gain/Loss:</Typography>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}><em>(t<sub>D</sub> − t<sub>C</sub>) X⋅M</em></Typography>
              </Box>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', mb: 1 }}>Assets</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Cash asset:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>t<sub>C</sub> X⋅M'</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Roth account <em>(1 − t<sub>C</sub>)X</em>:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>X ⋅M − t<sub>C</sub> X⋅M</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Roth account <em>(1 − t<sub>C</sub>)X</em> + Cash asset:</Typography>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}><em>(1 − t<sub>C</sub>) X⋅M + t<sub>C</sub> X⋅M'</em></Typography>
              </Box>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Synthetic Roth Contribution — Pay conversion tax <em>(t<sub>C</sub> X)</em> from 'Outside.'</Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Tax Obligation:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>−t<sub>D</sub> X⋅M</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Tax Payment (cash amount converts into Roth):</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>t<sub>C</sub> X⋅M</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2, fontWeight: 'bold' }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>Tax-Rate Spread Gain/Loss:</Typography>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}><em>(t<sub>D</sub> − t<sub>C</sub>) X⋅M</em></Typography>
              </Box>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', mb: 1 }}>Assets</Typography>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Roth account <em>X</em>:</Typography>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}><em>X ⋅M</em></Typography>
              </Box>
            </Paper>

            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', borderTop: 1, borderColor: 'divider', pt: 3 }}>PAYOFF PROOFS</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Payoffs use asset values from the prior section.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Tax-rate Spread Gain/Loss</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
              Inside conversions capture the full spread G/L relative to the Base Case.
            </Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>(B) Inside Core Roth Conversion vs.</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>X ⋅M − t<sub>C</sub> X⋅M + t<sub>C</sub> X⋅M'</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>(C) Base Case</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>− (X ⋅M − t<sub>D</sub> X⋅M + t<sub>C</sub> X⋅M')</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}><em>=  (t<sub>D</sub> − t<sub>C</sub>) X⋅M</em></Typography>
              </Box>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Synthetic Roth Contribution</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
              Outside conversion moves taxable cash <em>(t<sub>C</sub> X)</em> into the Roth, changing its tax-drag multiple <em>M'</em> to the tax-free <em>M</em>, relative to inside funding.
            </Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>(A) Outside conversion (w/Synthetic Contribution) vs.</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>X ⋅M</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>(B) Inside Core Roth Conversion</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>− (X ⋅M − t<sub>C</sub> X⋅M + t<sub>C</sub> X⋅M')</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}><em>=  t<sub>C</sub> X ⋅(M − M')</em></Typography>
              </Box>
            </Paper>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Outside-Conversion payout</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
              The sum of the above two payouts.
            </Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>(A) Outside conversion (w/Synthetic Contribution) vs.</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>X ⋅M</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}>(C) Base Case</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>− (X ⋅M − t<sub>D</sub> X⋅M + t<sub>C</sub> X⋅M')</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}><em>= (t<sub>D</sub>⋅M − t<sub>C</sub>⋅M') X</em></Typography>
              </Box>
            </Paper>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 2 }}>
              <em>A−C=(A−B)+(B−C)</em>, so <em>(t<sub>D</sub>⋅M−t<sub>C</sub>⋅M') X</em> can be replaced with the simpler
            </Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100', textAlign: 'right' }}>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#000000' }}><em>= t<sub>C</sub> X ⋅(M − M') + (t<sub>D</sub> − t<sub>C</sub>) X⋅M</em></Typography>
            </Paper>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              The outside-funded conversion replaces the taxable cash payout, <em>t<sub>C</sub> X ⋅M'</em> with the Roth's tax-free <em>t<sub>C</sub> X ⋅M</em>, generating the following after-tax payout on the invested cash.
            </Typography>

            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#bbdefb', textAlign: 'center' }}>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#000000' }}><em>Payout = t<sub>C</sub> X⋅M + (t<sub>D</sub> − t<sub>C</sub>) X⋅M</em></Typography>
            </Paper>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              <strong><em>M</em></strong> is the tax-free multiple of savings, spread profits or contributed amount returned over the distribution schedule using the return assumption. <strong><em>M'</em></strong> uses the same assumptions but includes a tax drag on the taxable cash asset.
            </Typography>

            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', borderTop: 1, borderColor: 'divider', pt: 3 }}>ROTH CONTRIBUTION IDENTITIES</Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Roth Contributions — Contribute <em>t<sub>C</sub> X</em> to Roth.</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              For investors with no Traditional savings, contributing cash <em>t<sub>C</sub> X</em> to a Roth trades the cash's tax-drag multiple <em>M'</em> for the Roth's tax-free multiple <em>M</em>. This is identical to the difference between inside and outside conversions as shown above.
            </Typography>
            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100', textAlign: 'center' }}>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold' }}><em>t<sub>C</sub> X ⋅(M − M')</em></Typography>
            </Paper>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              Therefore, the Synthetic Roth Contribution component of any outside-funded Roth conversion is economically equivalent to a Roth contribution.
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>Roth Contribution with Traditional assets — Contribute <em>t<sub>C</sub> X</em> to Roth.</Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              When Investors have Traditional savings, a Roth contribution <em>t<sub>C</sub> X</em> creates a tax-rate spread gain/loss opposite in sign relative to a Roth conversion with tax payment <em>t<sub>C</sub> X</em>. This occurs because the contribution <em>t<sub>C</sub> X⋅M</em> does not grow enough to offset the Traditional tax obligation <em>t<sub>D</sub> X⋅M</em>.
            </Typography>
            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              When <em>t<sub>D</sub>&gt;t<sub>C</sub></em>, Roth conversions are profitable, <em>(t<sub>D</sub> − t<sub>C</sub>) X⋅M</em>. When <em>t<sub>D</sub>&lt;t<sub>C</sub></em>, Roth conversions lose, and contributions have an equal sized gain, <em>(t<sub>C</sub> − t<sub>D</sub>) X⋅M</em>.
            </Typography>

            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: 'grey.100' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Tax Obligation:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>−t<sub>D</sub> X⋅M</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Roth contribution (cash amount contributed to Roth):</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>t<sub>C</sub> X⋅M</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Tax-Rate Gain/Loss:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>(t<sub>C</sub> − t<sub>D</sub>) X⋅M</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Traditional account after-tax:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>X ⋅M − t<sub>D</sub> X⋅M</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Roth account:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>t<sub>C</sub> X⋅M</em></Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontFamily: 'monospace' }}>Traditional after-tax + Roth:</Typography>
                <Typography sx={{ fontFamily: 'monospace' }}><em>X ⋅M + (t<sub>C</sub> − t<sub>D</sub>) X⋅M</em></Typography>
              </Box>
            </Paper>

            <Typography paragraph variant="body1" sx={{ lineHeight: 1.7, mb: 3 }}>
              The contribution replaces the cash asset payout, <em>t<sub>C</sub> X ⋅M'</em> with the Roth's tax-free <em>t<sub>C</sub> X ⋅M</em>, generating the following after-tax payout.
            </Typography>

            <Paper elevation={0} sx={{ p: 2, mb: 3, backgroundColor: '#bbdefb', textAlign: 'center' }}>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 'bold', color: '#000000' }}><em>Payout = t<sub>C</sub> X⋅M + (t<sub>C</sub> − t<sub>D</sub>) X⋅M</em></Typography>
            </Paper>
          </Box>

          {/* Footer */}
          <Divider sx={{ my: 6 }} />
          <Paper elevation={0} sx={{ p: 3, backgroundColor: 'grey.50', textAlign: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic', mb: 2 }}>
              This research was conducted to improve Roth conversion decision-making for households and financial advisors.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              For questions or comments, contact {authorInfo.email}
            </Typography>
          </Paper>
        </Box>
        </Box>
      )}

      {/* General Tab Content */}
      {conceptTab === 1 && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            General Concepts
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This section will contain general Roth conversion concepts and principles.
          </Typography>
          <Typography variant="body1">
            Content coming soon...
          </Typography>
        </Box>
      )}

      {/* Distribution Tax Rate Tab Content */}
      {conceptTab === 2 && (
        <Box sx={{ p: 3 }}>
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            Distribution Tax Rate
          </Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>
            This section will cover distribution tax rate considerations for Roth conversions.
          </Typography>
          <Typography variant="body1">
            Content coming soon...
          </Typography>
        </Box>
      )}
    </Container>
  );
};

export default ConceptsTab;