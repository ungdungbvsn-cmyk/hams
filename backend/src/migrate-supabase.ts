import { Client } from 'pg';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

async function testConnection(config: any) {
  const client = new Client({ ...config, ssl: { rejectUnauthorized: false }, connectionTimeoutMillis: 5000 });
  try {
    await client.connect();
    return client;
  } catch (err: any) {
    console.log(`Failed [${config.host}]: ${err.message}`);
    return null;
  }
}

async function migrate() {
  const sqlFile = 'C:\\hams_db.sql';
  const projectID = 'cvpzrimpdbputhapanjf';
  const password = 'Sannhi123456@#';
  
  const regions = ['ap-southeast-1', 'us-east-1', 'eu-central-1', 'ap-northeast-1'];
  const clusters = ['aws-0', 'aws-1'];
  
  let client: Client | null = null;

  for (const cluster of clusters) {
    for (const region of regions) {
      const host = `${cluster}-${region}.pooler.supabase.com`;
      console.log(`Testing ${host}...`);
      
      const config = {
        host,
        port: 6543,
        user: `postgres.${projectID}`,
        password,
        database: 'postgres'
      };
      
      client = await testConnection(config);
      if (client) {
        console.log(`SUCCESSFUL CONNECTION on ${host}!`);
        break;
      }
    }
    if (client) break;
  }

  if (!client) {
    console.error('All pooler attempts failed. Possibly wrong Project ID or Region.');
    return;
  }

  try {
    const sql = fs.readFileSync(sqlFile, 'utf8');
    console.log('SQL file read successfully. Size:', sql.length, 'chars');
    console.log('Executing SQL...');
    await client.query(sql);
    console.log('SQL Executed Successfully!');
  } catch (err: any) {
    console.error('Migration execution failed:', err.message);
  } finally {
    await client.end();
  }
}

migrate();
function pgbouncer(arg0: boolean) {
    throw new Error('Function not implemented.');
}

