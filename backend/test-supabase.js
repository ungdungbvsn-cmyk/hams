const { Client } = require('pg');
require('dotenv').config({ path: 'c:/HAMS/backend/.env' });

const connectionString = process.env.DATABASE_URL;
console.log('Testing connection to:', connectionString.split('@')[1]); // Hide password

const client = new Client({
  connectionString: connectionString
});

client.connect()
  .then(() => {
    console.log('SUCCESS: Connected to Supabase!');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('Current time from DB:', res.rows[0]);
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILURE: Connection failed:', err.message);
    process.exit(1);
  })
  .finally(() => client.end());
