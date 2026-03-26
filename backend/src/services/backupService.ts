import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma';
import cron, { ScheduledTask } from 'node-cron';

const PG_DUMP_PATH = 'pg_dump';

export const runBackup = async () => {
  const config = await (prisma as any).backupConfig.findFirst();
  if (!config) return { error: 'Backup configuration not found.' };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `hams_backup_${timestamp}.sql`;
  
  // Use a temporary path if on Render/Linux, otherwise use config
  let storagePath = config.storagePath;
  if (process.platform !== 'win32' || !storagePath || storagePath.includes(':\\')) {
    storagePath = path.join(process.cwd(), 'backups');
  }

  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  const fullPath = path.join(storagePath, filename);
  
  // Use connection string directly with pg_dump (PostgreSQL 10+)
  const dbUrl = process.env.DATABASE_URL || '';
  if (!dbUrl) return { error: 'DATABASE_URL not found.' };

  // pg_dump "postgresql://user:pass@host:port/dbname" -f "path"
  const command = `${PG_DUMP_PATH} "${dbUrl}" -f "${fullPath}"`;

  return new Promise((resolve) => {
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error('Backup failed:', stderr);
        await (prisma as any).backupHistory.create({
          data: { filename, size: 0, status: 'FAILED', error: stderr || error.message }
        });
        resolve({ error: 'Backup failed', details: stderr });
      } else {
        try {
          const stats = fs.statSync(fullPath);
          await (prisma as any).backupHistory.create({
            data: { filename, size: BigInt(stats.size), status: 'SUCCESS' }
          });
          await (prisma as any).backupConfig.update({
            where: { id: config.id },
            data: { lastBackupAt: new Date() }
          });
          resolve({ message: 'Backup successful', filename, path: fullPath });
        } catch (statError: any) {
          resolve({ error: 'Backup file created but could not be stat-ed', details: statError.message });
        }
      }
    });
  });
};

let currentJob: ScheduledTask | null = null;

export const scheduleBackup = async () => {
  const config = await (prisma as any).backupConfig.findFirst();
  if (currentJob) {
    currentJob.stop();
  }

  if (config?.autoBackup && config.schedule) {
    let cronTime = config.schedule;
    
    // Check if it's hh:mm:ss format
    if (/^\d{2}:\d{2}:\d{2}$/.test(config.schedule)) {
      const [hh, mm, ss] = config.schedule.split(':');
      cronTime = `${Number(ss)} ${Number(mm)} ${Number(hh)} * * *`;
    }

    currentJob = cron.schedule(cronTime, async () => {
      console.log('Running automated backup at:', new Date());
      await runBackup();
    });
    console.log(`Backup scheduled with cron: ${cronTime}`);
  }
};
