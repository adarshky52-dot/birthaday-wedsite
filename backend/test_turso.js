const { createClient } = require('@libsql/client');

const url = 'libsql://birthaday-website-adarshky52-dot.aws-ap-south-1.turso.io';
const authToken = 'eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3ODMyNzA3MDgsImlkIjoiMDE5ZjMzMWYtNjAwMS03M2M0LWFhNTYtZmY3ZGRhM2UwNmYxIiwia2lkIjoia1F2T2h0eU9UbkZuTXlqQ1dxaDVFUWR4dGRXOGhWSURxUDlITkR1M3kzayIsInJpZCI6IjRhMDg0NTAzLTY3MDItNGZmMy04ZmI4LTljN2Q3MmFhNjlmNiJ9.7LzNlKY5a7g_G2AnVOWSNCJBC3BN-gY2LCsaEiXtuli-ru3gyOC8Whrx_5a6eIUbAeUBm7Jbcxw63BFL2T7MCQ';

console.log('Testing Turso connection...');
console.log('Using URL:', url);
console.log('Using Token (preview):', authToken.substring(0, 15) + '...');

if (url === 'YOUR_DATABASE_URL_HERE' || authToken === 'YOUR_AUTH_TOKEN_HERE') {
  console.log('\n[ERROR] Please edit this file and paste your actual Turso Database URL and Auth Token!');
  process.exit(1);
}

const client = createClient({ url, authToken });

async function run() {
  try {
    const res = await client.execute('SELECT 1;');
    console.log('\n[SUCCESS] Connected to Turso successfully! Your credentials are correct.');
    console.log('Result:', res.rows);
  } catch (error) {
    console.log('\n[FAILED] Connection failed!');
    console.error('Error message:', error.message);
  }
}

run();
