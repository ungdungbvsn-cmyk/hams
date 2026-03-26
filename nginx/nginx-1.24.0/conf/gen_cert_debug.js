const selfsigned = require('selfsigned');
const fs = require('fs');

try {
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    const pems = selfsigned.generate(attrs, { days: 365, keySize: 2048 });

    console.log('Type of cert:', typeof pems.cert);
    console.log('Type of private:', typeof pems.private);

    fs.writeFileSync('server.crt', String(pems.cert));
    fs.writeFileSync('server.key', String(pems.private));

    console.log('Certs generated successfully!');
} catch (e) {
    console.error('Error during generation:', e);
}
