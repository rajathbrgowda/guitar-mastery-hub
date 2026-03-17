import 'dotenv/config';
import app from './app';
import { warmUp, checkRequiredTables } from './routes/health';

const PORT = process.env.PORT ?? 4000;

app.listen(PORT, () => {
  console.warn(`Server running on http://localhost:${PORT}`);

  // Eagerly warm the Supabase connection so the first real request is fast.
  // Until warmUp() resolves, GET /api/health returns 503 { status: 'warming' }.
  warmUp()
    .then((warmupMs) => {
      console.warn(
        JSON.stringify({
          event: 'cold_start',
          timestamp: new Date().toISOString(),
          warmup_ms: warmupMs,
        }),
      );
      return checkRequiredTables();
    })
    .catch((err: unknown) => {
      console.error('[startup] Warm-up / migration check failed:', err);
    });
});
