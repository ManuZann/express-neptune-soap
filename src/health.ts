import { Router } from 'express';
import { getTraversalSource } from './gremlinClient.js';

export const healthRouter = Router();

healthRouter.get('/health', async (_req, res) => {
  try {
    const g = getTraversalSource();
    await g.V().limit(1).toList();
    res.json({ status: 'ok' });
  } catch (err) {
    res.status(500).json({ status: 'error', error: (err as Error).message });
  }
});

