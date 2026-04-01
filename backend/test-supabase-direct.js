const { Client } = require('pg');

const config = {
  host: 'aws-1-ap-southeast-1.pooler.supabase.com',
  port: 6543,
  user: 'postgres.cvpzrimpdbputhapanjf',
  password: 'Sn123456#',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

const client = new Client(config);

client.connect()
  .then(() => {
    console.log('SUCCESS: Connected directly to Supabase!');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILURE: Connection failed:', err.message);
    process.exit(1);
  })
  .finally(() => client.end());
