import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';

export default function Privacy() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Typography variant="h4" fontWeight={700} sx={{ mb: 4 }}>
        Privacy Policy
      </Typography>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
        What we collect
      </Typography>
      <Box component="ul" sx={{ mb: 4, pl: 3 }}>
        <li>
          <Typography sx={{ mb: 0.5 }}>
            Your email address — used to create your account and send password reset emails.
          </Typography>
        </li>
        <li>
          <Typography>
            Practice sessions you log — date, duration, and any notes you write. This is the core
            data the app exists to store.
          </Typography>
        </li>
      </Box>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
        What we don&apos;t do
      </Typography>
      <Box component="ul" sx={{ mb: 4, pl: 3 }}>
        <li>
          <Typography sx={{ mb: 0.5 }}>We don&apos;t sell your data to anyone.</Typography>
        </li>
        <li>
          <Typography sx={{ mb: 0.5 }}>
            We don&apos;t track your behavior beyond what&apos;s needed to run the app.
          </Typography>
        </li>
        <li>
          <Typography>There are no third-party ads.</Typography>
        </li>
      </Box>

      <Typography variant="h6" fontWeight={600} sx={{ mb: 1.5 }}>
        Contact
      </Typography>
      <Typography sx={{ mb: 4 }}>
        Questions or concerns? Open an issue on{' '}
        <a
          href="https://github.com/rajathbrgowda/guitar-mastery-hub/issues"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
        .
      </Typography>

      <Button component={RouterLink} to="/" variant="text">
        ← Back to home
      </Button>
    </Container>
  );
}
