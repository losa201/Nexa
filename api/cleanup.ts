// api/src/cleanup.ts
import cron from 'node-cron';
import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const ARCHIVE_DIR = path.join(__dirname, '..', 'archives');

// Ensure archive directory exists
if (!fs.existsSync(ARCHIVE_DIR)) {
  fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
}

// Schedule daily cleanup at 03:00
cron.schedule('0 3 * * *', async () => {
  try {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    // Purge old metrics
    const deleted = await prisma.metric.deleteMany({
      where: { createdAt: { lt: cutoff } }
    });
    console.log(`Purged ${deleted.count} metrics older than ${cutoff.toISOString()}`);

    // Archive current proposals
    const proposals = await prisma.proposal.findMany();
    const filename = `proposals-${Date.now()}.json`;
    fs.writeFileSync(
      path.join(ARCHIVE_DIR, filename),
      JSON.stringify(proposals, null, 2)
    );
    console.log(`Archived proposals to ${filename}`);
  } catch (err: any) {
    console.error('Cleanup error:', err);
  }
});
