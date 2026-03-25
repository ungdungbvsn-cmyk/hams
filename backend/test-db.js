const { Client } = require('pg');
const client = new Client({
  connectionString: 'postgresql://postgres:sn123456@localhost:5432/hams_db'
});
client.connect()
  .then(() => { console.log('SUCCESS: Connected natively to default postgres DB.'); process.exit(0); })
  .catch(err => { console.error('FAILURE: Connection failed:', err.message); process.exit(1); });
