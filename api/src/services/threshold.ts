import * as express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

router.get('/threshold', (_req: Request, res: Response) => {
  res.json({ threshold: 42 });
});

export default router;
