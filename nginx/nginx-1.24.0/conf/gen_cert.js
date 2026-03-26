const selfsigned = require('selfsigned');
const fs = require('fs');

const DOMAIN = 'hams.local';
const attrs = [{ name: 'commonName', value: DOMAIN }];
const pems = selfsigned.generate(attrs, { days: 365, keySize: 2048 });

fs.writeFileSync('server.crt', pems.cert);
fs.writeFileSync('server.key', pems.private);

console.log('Certs generated successfully!');
console.log('CRT:', pems.cert.substring(0, 30) + '...');
console.log('KEY:', pems.private.substring(0, 30) + '...');
