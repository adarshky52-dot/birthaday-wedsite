const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Root uploads directory
const UPLOADS_ROOT = path.join(__dirname, '..', '..', 'uploads');

// Map field/route names to their upload subdirectories
const folderMap = {
  photos: 'photos',
  memories: 'memories',
  timeline: 'timeline',
  letters: 'letters',
  audio: 'audio',
  music: 'music',
  videos: 'videos'
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Determine the folder based on the request field name or parameter
    let subfolder = 'photos'; // default
    if (file.fieldname && folderMap[file.fieldname]) {
      subfolder = folderMap[file.fieldname];
    } else if (req.body.uploadType && folderMap[req.body.uploadType]) {
      subfolder = folderMap[req.body.uploadType];
    }

    const destDir = path.join(UPLOADS_ROOT, subfolder);

    // Create folder if it doesn't exist
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    cb(null, destDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// File filter (optional safety validation)
const fileFilter = (req, file, cb) => {
  // Allow common file types
  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size limit for videos
  }
});

module.exports = upload;
