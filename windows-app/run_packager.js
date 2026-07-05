const packager = require('electron-packager');
const path = require('path');

console.log('Starting programmatic packaging...');

// Keep event loop alive to prevent Node v24 from exiting early during async extraction
const keepAlive = setInterval(() => {
  // Just print a tick to show it's working
  process.stdout.write('.');
}, 1000);

packager({
  dir: path.resolve(__dirname),
  name: 'Birthday Scrapbook',
  platform: 'win32',
  arch: 'x64',
  out: path.resolve(__dirname, 'dist'),
  overwrite: true,
  ignore: [/dist/, /node_modules/, /convert_icon.js/, /run_packager.js/, /test_hash.js/, /check_db.js/],
  icon: path.resolve(__dirname, 'icon.ico')
}).then(appPaths => {
  console.log('\nSUCCESS! App packaged successfully to:', appPaths);
  clearInterval(keepAlive);
}).catch(err => {
  console.error('\nERROR! Packaging failed:', err);
  clearInterval(keepAlive);
  process.exit(1);
});
