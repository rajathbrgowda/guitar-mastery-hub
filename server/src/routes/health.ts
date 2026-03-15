import { Router } from 'express';
import { supabase } from '../lib/supabase';

const router = Router();

// GET /api/health — basic liveness (used by Render keep-alive ping)
router.get('/', (_req, res) => {
  res.json({ status: 'ok' });
});

// Required tables per migration — used by /api/health/db and startup guard
const REQUIRED_TABLES: { table: string; migration: string }[] = [
  { table: 'users', migration: '001' },
  { table: 'skill_progress', migration: '001' },
  { table: 'practice_sessions', migration: '001' },
  { table: 'resources', migration: '003' },
  { table: 'resource_completions', migration: '004' },
  { table: 'curriculum_sources', migration: '007' },
  { table: 'skills', migration: '007' },
  { table: 'curriculum_skill_entries', migration: '007' },
  { table: 'daily_practice_plans', migration: '007' },
  { table: 'daily_practice_plan_items', migration: '007' },
];

// Exported so server.ts can call it on startup.
// Probes one representative table per migration group and logs a warning for any that are missing.
export async function checkRequiredTables(): Promise<void> {
  const probes = [
    { table: 'resources', migration: '003' },
    { table: 'curriculum_sources', migration: '007' },
    { table: 'daily_practice_plans', migration: '007' },
  ];
  await Promise.all(
    probes.map(async ({ table, migration }) => {
      const { error } = await supabase
        .from(table as never)
        .select('id')
        .limit(1);
      if (error) {
        console.error(
          `[startup] ⚠️  Table '${table}' not accessible — run migration ${migration}: ${error.message}`,
        );
      }
    }),
  );
}

// GET /api/health/db — verifies Supabase connection + reports migration table status
router.get('/db', async (_req, res) => {
  // Connection probe
  const { data, error } = await supabase
    .from('resources')
    .select('id, title, phase_index')
    .limit(3);

  if (error) {
    res.status(503).json({ status: 'error', message: error.message });
    return;
  }

  // Migration table checks — non-blocking; missing tables reported as warnings
  const tableChecks = await Promise.all(
    REQUIRED_TABLES.map(async ({ table, migration }) => {
      const { error: tErr } = await supabase
        .from(table as never)
        .select('id')
        .limit(1);
      return { table, migration, ok: !tErr };
    }),
  );

  const missing = tableChecks.filter((t) => !t.ok);

  res.json({
    status: missing.length === 0 ? 'ok' : 'degraded',
    sample: data,
    migrations: {
      all_present: missing.length === 0,
      missing: missing.map((t) => ({ table: t.table, migration: t.migration })),
    },
  });
});

export default router;
