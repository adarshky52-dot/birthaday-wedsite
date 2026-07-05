const fs = require('fs');
const path = require('path');

const pngPath = path.join(__dirname, '..', 'android-app', 'app', 'src', 'main', 'res', 'mipmap-xxxhdpi', 'ic_launcher.png');
const icoPath = path.join(__dirname, 'icon.ico');

try {
  const pngBuffer = fs.readFileSync(pngPath);
  const pngSize = pngBuffer.length;

  const header = Buffer.alloc(22);
  // Header
  header.writeUInt16LE(0, 0);     // Reserved
  header.writeUInt16LE(1, 2);     // Type (1 for ICO)
  header.writeUInt16LE(1, 4);     // Count (1 image)

  // Directory Entry
  header.writeUInt8(192, 6);      // Width (192)
  header.writeUInt8(192, 7);      // Height (192)
  header.writeUInt8(0, 8);        // Color count (0)
  header.writeUInt8(0, 9);        // Reserved
  header.writeUInt16LE(1, 10);    // Color planes
  header.writeUInt16LE(32, 12);   // Bits per pixel (32)
  header.writeUInt32LE(pngSize, 14); // Size of image data
  header.writeUInt32LE(22, 18);   // Offset of image data (header size)

  const icoBuffer = Buffer.concat([header, pngBuffer]);
  fs.writeFileSync(icoPath, icoBuffer);
  console.log('Successfully created icon.ico from PNG');
} catch (e) {
  console.error('Error generating icon.ico:', e.message);
  process.exit(1);
}
