import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

export default function Terms() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
        Terms of Use
      </Typography>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
        Use it as intended
      </Typography>
      <Typography sx={{ mb: 3 }}>
        This is a guitar practice tracker. Use it to track your guitar practice. That&apos;s what
        it&apos;s for.
      </Typography>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
        Don&apos;t abuse it
      </Typography>
      <Box component="ul" sx={{ mb: 3, pl: 3 }}>
        <li>
          <Typography sx={{ mb: 0.5 }}>No scraping.</Typography>
        </li>
        <li>
          <Typography>No automated bulk data entry.</Typography>
        </li>
      </Box>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
        Free service, as-is
      </Typography>
      <Typography sx={{ mb: 3 }}>
        No warranty. No SLA. This is a free service built and maintained by one person. It can go
        down. It can change. It can shut down. Don&apos;t use it as your only backup of important
        data.
      </Typography>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
        That&apos;s it
      </Typography>
      <Typography sx={{ mb: 4 }}>
        No legal boilerplate. Just: be reasonable, don&apos;t break things.
      </Typography>

      <Button component={RouterLink} to="/" variant="text">
        ← Back to home
      </Button>
    </Container>
  );
}
