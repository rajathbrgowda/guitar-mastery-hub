import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/progress — all skill completions for the logged-in user
router.get('/', async (req: AuthRequest, res) => {
  res.json({ userId: req.user?.id, data: [] }); // placeholder — implemented in CARD-031
});

// PATCH /api/progress/:skillId — toggle skill completion
router.patch('/:skillId', async (req: AuthRequest, res) => {
  res.json({ userId: req.user?.id, skillId: req.params.skillId }); // placeholder
});

export default router;
