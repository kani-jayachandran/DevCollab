import { Router } from 'express';

const router = Router();

// GET /api/health
router.get('/', (_req, res) => {
  res.json({
    status: 'ok',
    message: 'DevCollab API is running',
    timestamp: new Date().toISOString(),
  });
});

export default router;
