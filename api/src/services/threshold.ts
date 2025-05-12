import express from 'express';
export const router = express.Router();
let anomalyThreshold = Number(process.env.ANOMALY_THRESHOLD) || 1000;

router.post('/threshold', (req, res) => {
  const { threshold } = req.body;
  if (typeof threshold !== 'number' || threshold < 0) {
    return res.status(400).send('Invalid threshold');
  }
  anomalyThreshold = threshold;
  res.sendStatus(204);
});

export function getThreshold() {
  return anomalyThreshold;
}
