const { Client } = require('pg');

const config = {
  host: 'db.cvpzrimpdbputhapanjf.supabase.co',
  port: 5432,
  user: 'postgres',
  password: 'Sannhi123456@#',
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
