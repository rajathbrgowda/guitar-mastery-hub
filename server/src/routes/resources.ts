import { Router } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(requireAuth);

// GET /api/resources — resource completions for the logged-in user
router.get('/', async (req: AuthRequest, res) => {
  res.json({ userId: req.user?.id, data: [] }); // placeholder — implemented in CARD-033
});

// PATCH /api/resources/:id — update completion %
router.patch('/:id', async (req: AuthRequest, res) => {
  res.json({ userId: req.user?.id, resourceId: req.params.id }); // placeholder
});

export default router;
