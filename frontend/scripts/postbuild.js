const fs = require('fs');
const path = require('path');

const outDir = path.join(__dirname, '..', 'out');
const redirectsPath = path.join(outDir, '_redirects');

console.log('Running Netlify post-build optimization script...');

// Read API URL from environment variables
const backendUrl = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL;

let redirectContent = '';

if (backendUrl) {
  const cleanUrl = backendUrl.endsWith('/') ? backendUrl.slice(0, -1) : backendUrl;
  console.log(`Configuring Netlify API proxies to backend: ${cleanUrl}`);
  redirectContent += `/api/*  ${cleanUrl}/api/:splat  200!\n`;
  redirectContent += `/uploads/*  ${cleanUrl}/uploads/:splat  200!\n`;
} else {
  console.log('No BACKEND_API_URL or NEXT_PUBLIC_API_URL environment variable found. Skipping API proxy generation.');
}

// Write the _redirects file
if (redirectContent) {
  try {
    fs.writeFileSync(redirectsPath, redirectContent);
    console.log(`Successfully generated Netlify redirect rules in: ${redirectsPath}`);
  } catch (error) {
    console.error('Error writing Netlify redirects file:', error.message);
  }
}
