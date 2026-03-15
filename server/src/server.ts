import 'dotenv/config';
import app from './app';
import { checkRequiredTables } from './routes/health';

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.warn(`Server running on http://localhost:${PORT}`);
  // Non-blocking: log a warning if any required DB tables are missing (unapplied migration)
  checkRequiredTables().catch((err: unknown) => {
    console.error('[startup] Migration check failed:', err);
  });
});
