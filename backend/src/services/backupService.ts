import { exec } from 'child_process';
import path from 'path';
import fs from 'fs';
import prisma from '../prisma';
import cron, { ScheduledTask } from 'node-cron';

const PG_DUMP_PATH = '"C:\\Program Files\\PostgreSQL\\18\\bin\\pg_dump.exe"';

export const runBackup = async () => {
  const config = await (prisma as any).backupConfig.findFirst();
  if (!config) return { error: 'Backup configuration not found.' };

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `hams_backup_${timestamp}.sql`;
  const storagePath = config.storagePath || path.join(process.cwd(), 'backups');
  
  if (!fs.existsSync(storagePath)) {
    fs.mkdirSync(storagePath, { recursive: true });
  }

  const fullPath = path.join(storagePath, filename);
  
  // Get database connection info from DATABASE_URL
  const dbUrl = process.env.DATABASE_URL || '';
  // Format: postgresql://USER:PASSWORD@HOST:PORT/DATABASE
  const match = dbUrl.match(/postgresql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
  if (!match) return { error: 'Invalid DATABASE_URL for backup.' };

  const [_, user, password, host, port, dbName] = match;

  const command = `SET PGPASSWORD=${password} && ${PG_DUMP_PATH} -h ${host} -p ${port} -U ${user} -f "${fullPath}" ${dbName}`;

  return new Promise((resolve) => {
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.error('Backup failed:', stderr);
        await (prisma as any).backupHistory.create({
          data: { filename, size: 0, status: 'FAILED', error: stderr || error.message }
        });
        resolve({ error: 'Backup failed', details: stderr });
      } else {
        const stats = fs.statSync(fullPath);
        await (prisma as any).backupHistory.create({
          data: { filename, size: BigInt(stats.size), status: 'SUCCESS' }
        });
        await (prisma as any).backupConfig.update({
          where: { id: config.id },
          data: { lastBackupAt: new Date() }
        });
        resolve({ message: 'Backup successful', filename });
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
