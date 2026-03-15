import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/analytics/streak — current streak for the logged-in user
router.get('/streak', async (req: AuthRequest, res) => {
  res.json({ userId: req.user?.id, streak: 0 }); // placeholder — implemented in CARD-034
});

// GET /api/analytics/summary — total mins, sessions, phase progress
router.get('/summary', async (req: AuthRequest, res) => {
  res.json({ userId: req.user?.id, totalMins: 0, sessions: 0 }); // placeholder
});

export default router;
