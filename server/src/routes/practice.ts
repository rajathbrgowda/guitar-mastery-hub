import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/practice — session log for the logged-in user
router.get('/', async (req: AuthRequest, res) => {
  res.json({ userId: req.user?.id, data: [] }); // placeholder — implemented in CARD-032
});

// POST /api/practice — log a session
router.post('/', async (req: AuthRequest, res) => {
  res.json({ userId: req.user?.id, body: req.body }); // placeholder
});

export default router;
