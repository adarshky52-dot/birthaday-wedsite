const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const authMiddleware = require('../middleware/auth');
const upload = require('../middleware/upload');
const { query } = require('../config/db');

// Helper to delete a file when database entry is deleted
const deleteFile = (filePath) => {
  if (!filePath) return;
  const localPath = path.join(__dirname, '..', '..', filePath.replace(/^\//, ''));
  fs.unlink(localPath, (err) => {
    if (err) console.error(`Error deleting file ${localPath}:`, err.message);
  });
};

// Helper to map SQLite results to match Mongoose schema output formats expected by React
const mapRow = (row) => {
  if (!row) return null;
  const mapped = {
    ...row,
    _id: row.id // map SQLite integer id to MongoDB style _id
  };
  if (row.order_index !== undefined) {
    mapped.order = row.order_index;
  }
  return mapped;
};

const mapRows = (rows) => rows.map(mapRow);

/* =========================================================================
   1. STATS ENDPOINT
   ========================================================================= */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const photosCount = await query.get('SELECT COUNT(*) as count FROM photos');
    const memoriesCount = await query.get('SELECT COUNT(*) as count FROM memories');
    const lettersCount = await query.get('SELECT COUNT(*) as count FROM letters');
    const videosCount = await query.get('SELECT COUNT(*) as count FROM videos');
    const voicesCount = await query.get('SELECT COUNT(*) as count FROM voicenotes');
    const timelineCount = await query.get('SELECT COUNT(*) as count FROM timeline');

    res.json({
      totalPhotos: photosCount.count,
      totalMemories: memoriesCount.count,
      totalLetters: lettersCount.count,
      totalVideos: videosCount.count,
      totalVoiceNotes: voicesCount.count,
      totalTimeline: timelineCount.count
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching stats.', error: error.message });
  }
});

/* =========================================================================
   2. TIMELINE ENDPOINTS (CRUD)
   ========================================================================= */
router.get('/timeline', async (req, res) => {
  try {
    const items = await query.all('SELECT * FROM timeline ORDER BY order_index ASC, id ASC');
    res.json(mapRows(items));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching timeline.', error: error.message });
  }
});

router.post('/timeline', authMiddleware, upload.single('timeline'), async (req, res) => {
  try {
    const { title, description, date, category, order } = req.body;
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/timeline/${req.file.filename}`;
    }

    const orderIndex = order ? parseInt(order) : 0;
    const result = await query.run(
      'INSERT INTO timeline (title, description, date, imageUrl, category, order_index) VALUES (?, ?, ?, ?, ?, ?)',
      [title, description, date, imageUrl, category, orderIndex]
    );

    const newItem = await query.get('SELECT * FROM timeline WHERE id = ?', [result.lastID]);
    res.status(201).json(mapRow(newItem));
  } catch (error) {
    res.status(500).json({ message: 'Error creating timeline entry.', error: error.message });
  }
});

router.put('/timeline/:id', authMiddleware, upload.single('timeline'), async (req, res) => {
  try {
    const { title, description, date, category, order } = req.body;
    const item = await query.get('SELECT * FROM timeline WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ message: 'Timeline item not found' });

    let imageUrl = item.imageUrl;
    if (req.file) {
      deleteFile(item.imageUrl);
      imageUrl = `/uploads/timeline/${req.file.filename}`;
    }

    const updatedTitle = title !== undefined ? title : item.title;
    const updatedDesc = description !== undefined ? description : item.description;
    const updatedDate = date !== undefined ? date : item.date;
    const updatedCategory = category !== undefined ? category : item.category;
    const updatedOrder = order !== undefined ? parseInt(order) : item.order_index;

    await query.run(
      'UPDATE timeline SET title = ?, description = ?, date = ?, category = ?, order_index = ?, imageUrl = ? WHERE id = ?',
      [updatedTitle, updatedDesc, updatedDate, updatedCategory, updatedOrder, imageUrl, req.params.id]
    );

    const updatedItem = await query.get('SELECT * FROM timeline WHERE id = ?', [req.params.id]);
    res.json(mapRow(updatedItem));
  } catch (error) {
    res.status(500).json({ message: 'Error updating timeline entry.', error: error.message });
  }
});

router.delete('/timeline/:id', authMiddleware, async (req, res) => {
  try {
    const item = await query.get('SELECT * FROM timeline WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ message: 'Timeline item not found' });
    
    await query.run('DELETE FROM timeline WHERE id = ?', [req.params.id]);
    deleteFile(item.imageUrl);
    res.json({ message: 'Timeline item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting timeline entry.', error: error.message });
  }
});

/* =========================================================================
   3. MEMORIES ENDPOINTS (CRUD)
   ========================================================================= */
router.get('/memories', async (req, res) => {
  try {
    const items = await query.all('SELECT * FROM memories ORDER BY id DESC');
    res.json(mapRows(items));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching memories.', error: error.message });
  }
});

router.post('/memories', authMiddleware, upload.single('memories'), async (req, res) => {
  try {
    const { title, caption, category, date } = req.body;
    let imageUrl = '';
    if (req.file) {
      imageUrl = `/uploads/memories/${req.file.filename}`;
    }

    const result = await query.run(
      'INSERT INTO memories (title, caption, category, date, imageUrl) VALUES (?, ?, ?, ?, ?)',
      [title, caption, category, date, imageUrl]
    );

    const newItem = await query.get('SELECT * FROM memories WHERE id = ?', [result.lastID]);
    res.status(201).json(mapRow(newItem));
  } catch (error) {
    res.status(500).json({ message: 'Error creating memory.', error: error.message });
  }
});

router.put('/memories/:id', authMiddleware, upload.single('memories'), async (req, res) => {
  try {
    const { title, caption, category, date } = req.body;
    const item = await query.get('SELECT * FROM memories WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ message: 'Memory item not found' });

    let imageUrl = item.imageUrl;
    if (req.file) {
      deleteFile(item.imageUrl);
      imageUrl = `/uploads/memories/${req.file.filename}`;
    }

    const updatedTitle = title !== undefined ? title : item.title;
    const updatedCaption = caption !== undefined ? caption : item.caption;
    const updatedCategory = category !== undefined ? category : item.category;
    const updatedDate = date !== undefined ? date : item.date;

    await query.run(
      'UPDATE memories SET title = ?, caption = ?, category = ?, date = ?, imageUrl = ? WHERE id = ?',
      [updatedTitle, updatedCaption, updatedCategory, updatedDate, imageUrl, req.params.id]
    );

    const updatedItem = await query.get('SELECT * FROM memories WHERE id = ?', [req.params.id]);
    res.json(mapRow(updatedItem));
  } catch (error) {
    res.status(500).json({ message: 'Error updating memory.', error: error.message });
  }
});

router.delete('/memories/:id', authMiddleware, async (req, res) => {
  try {
    const item = await query.get('SELECT * FROM memories WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ message: 'Memory item not found' });
    
    await query.run('DELETE FROM memories WHERE id = ?', [req.params.id]);
    deleteFile(item.imageUrl);
    res.json({ message: 'Memory item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting memory.', error: error.message });
  }
});

/* =========================================================================
   4. LETTERS ENDPOINTS (CRUD)
   ========================================================================= */
router.get('/letters', async (req, res) => {
  try {
    const items = await query.all('SELECT * FROM letters ORDER BY id DESC');
    res.json(mapRows(items));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching letters.', error: error.message });
  }
});

router.post('/letters', authMiddleware, upload.single('letters'), async (req, res) => {
  try {
    const { title, content, date, signature } = req.body;
    let coverImageUrl = '';
    if (req.file) {
      coverImageUrl = `/uploads/letters/${req.file.filename}`;
    }

    const result = await query.run(
      'INSERT INTO letters (title, content, coverImageUrl, date, signature) VALUES (?, ?, ?, ?, ?)',
      [title, content, coverImageUrl, date, signature]
    );

    const newItem = await query.get('SELECT * FROM letters WHERE id = ?', [result.lastID]);
    res.status(201).json(mapRow(newItem));
  } catch (error) {
    res.status(500).json({ message: 'Error creating letter.', error: error.message });
  }
});

router.put('/letters/:id', authMiddleware, upload.single('letters'), async (req, res) => {
  try {
    const { title, content, date, signature } = req.body;
    const item = await query.get('SELECT * FROM letters WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ message: 'Letter not found' });

    let coverImageUrl = item.coverImageUrl;
    if (req.file) {
      deleteFile(item.coverImageUrl);
      coverImageUrl = `/uploads/letters/${req.file.filename}`;
    }

    const updatedTitle = title !== undefined ? title : item.title;
    const updatedContent = content !== undefined ? content : item.content;
    const updatedDate = date !== undefined ? date : item.date;
    const updatedSig = signature !== undefined ? signature : item.signature;

    await query.run(
      'UPDATE letters SET title = ?, content = ?, date = ?, signature = ?, coverImageUrl = ? WHERE id = ?',
      [updatedTitle, updatedContent, updatedDate, updatedSig, coverImageUrl, req.params.id]
    );

    const updatedItem = await query.get('SELECT * FROM letters WHERE id = ?', [req.params.id]);
    res.json(mapRow(updatedItem));
  } catch (error) {
    res.status(500).json({ message: 'Error updating letter.', error: error.message });
  }
});

router.delete('/letters/:id', authMiddleware, async (req, res) => {
  try {
    const item = await query.get('SELECT * FROM letters WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ message: 'Letter not found' });
    
    await query.run('DELETE FROM letters WHERE id = ?', [req.params.id]);
    deleteFile(item.coverImageUrl);
    res.json({ message: 'Letter deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting letter.', error: error.message });
  }
});

/* =========================================================================
   5. PHOTO GALLERY ENDPOINTS
   ========================================================================= */
router.get('/photos', async (req, res) => {
  try {
    const items = await query.all('SELECT * FROM photos ORDER BY id DESC');
    res.json(mapRows(items));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching photos.', error: error.message });
  }
});

router.post('/photos', authMiddleware, upload.single('photos'), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a photo image.' });
    }
    
    const imageUrl = `/uploads/photos/${req.file.filename}`;
    const uploadDate = new Date().toISOString();

    const result = await query.run(
      'INSERT INTO photos (title, description, imageUrl, uploadDate) VALUES (?, ?, ?, ?)',
      [title || '', description || '', imageUrl, uploadDate]
    );

    const newPhoto = await query.get('SELECT * FROM photos WHERE id = ?', [result.lastID]);
    res.status(201).json(mapRow(newPhoto));
  } catch (error) {
    res.status(500).json({ message: 'Error uploading photo.', error: error.message });
  }
});

router.delete('/photos/:id', authMiddleware, async (req, res) => {
  try {
    const item = await query.get('SELECT * FROM photos WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ message: 'Photo not found' });
    
    await query.run('DELETE FROM photos WHERE id = ?', [req.params.id]);
    deleteFile(item.imageUrl);
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting photo.', error: error.message });
  }
});

/* =========================================================================
   6. VOICE NOTE ENDPOINTS
   ========================================================================= */
router.get('/voicenotes', async (req, res) => {
  try {
    const items = await query.all('SELECT * FROM voicenotes ORDER BY id DESC');
    res.json(mapRows(items));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching voice notes.', error: error.message });
  }
});

router.post('/voicenotes', authMiddleware, upload.single('audio'), async (req, res) => {
  try {
    const { title, duration, date } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload an audio file.' });
    }

    const audioUrl = `/uploads/audio/${req.file.filename}`;
    const noteDate = date || new Date().toLocaleDateString();

    const result = await query.run(
      'INSERT INTO voicenotes (title, audioUrl, duration, date) VALUES (?, ?, ?, ?)',
      [title, audioUrl, duration || '0:00', noteDate]
    );

    const newNote = await query.get('SELECT * FROM voicenotes WHERE id = ?', [result.lastID]);
    res.status(201).json(mapRow(newNote));
  } catch (error) {
    res.status(500).json({ message: 'Error uploading voice note.', error: error.message });
  }
});

router.delete('/voicenotes/:id', authMiddleware, async (req, res) => {
  try {
    const item = await query.get('SELECT * FROM voicenotes WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ message: 'Voice note not found' });
    
    await query.run('DELETE FROM voicenotes WHERE id = ?', [req.params.id]);
    deleteFile(item.audioUrl);
    res.json({ message: 'Voice note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting voice note.', error: error.message });
  }
});

/* =========================================================================
   7. VIDEO ENDPOINTS
   ========================================================================= */
router.get('/videos', async (req, res) => {
  try {
    const items = await query.all('SELECT * FROM videos ORDER BY id DESC');
    res.json(mapRows(items));
  } catch (error) {
    res.status(500).json({ message: 'Error fetching videos.', error: error.message });
  }
});

router.post('/videos', authMiddleware, upload.single('videos'), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a video file.' });
    }

    const videoUrl = `/uploads/videos/${req.file.filename}`;
    const uploadDate = new Date().toISOString();

    const result = await query.run(
      'INSERT INTO videos (title, description, videoUrl, uploadDate) VALUES (?, ?, ?, ?)',
      [title, description || '', videoUrl, uploadDate]
    );

    const newVideo = await query.get('SELECT * FROM videos WHERE id = ?', [result.lastID]);
    res.status(201).json(mapRow(newVideo));
  } catch (error) {
    res.status(500).json({ message: 'Error uploading video.', error: error.message });
  }
});

router.delete('/videos/:id', authMiddleware, async (req, res) => {
  try {
    const item = await query.get('SELECT * FROM videos WHERE id = ?', [req.params.id]);
    if (!item) return res.status(404).json({ message: 'Video not found' });
    
    await query.run('DELETE FROM videos WHERE id = ?', [req.params.id]);
    deleteFile(item.videoUrl);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting video.', error: error.message });
  }
});

/* =========================================================================
   8. SURPRISE SETTINGS ENDPOINTS (GET, PUT)
   ========================================================================= */
router.get('/surprise-settings', async (req, res) => {
  try {
    const settings = await query.get('SELECT * FROM surprise_settings WHERE id = 1');
    if (!settings) {
      return res.json({});
    }
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching surprise settings.', error: error.message });
  }
});

router.put('/surprise-settings', authMiddleware, async (req, res) => {
  try {
    const {
      giftBoxTitle,
      giftBoxDesc,
      step3Title,
      step3Message,
      step5Title,
      step5Message,
      step5Desc
    } = req.body;

    const current = await query.get('SELECT * FROM surprise_settings WHERE id = 1');
    
    const updatedGiftBoxTitle = giftBoxTitle !== undefined ? giftBoxTitle : (current?.giftBoxTitle || '');
    const updatedGiftBoxDesc = giftBoxDesc !== undefined ? giftBoxDesc : (current?.giftBoxDesc || '');
    const updatedStep3Title = step3Title !== undefined ? step3Title : (current?.step3Title || '');
    const updatedStep3Message = step3Message !== undefined ? step3Message : (current?.step3Message || '');
    const updatedStep5Title = step5Title !== undefined ? step5Title : (current?.step5Title || '');
    const updatedStep5Message = step5Message !== undefined ? step5Message : (current?.step5Message || '');
    const updatedStep5Desc = step5Desc !== undefined ? step5Desc : (current?.step5Desc || '');

    if (!current) {
      await query.run(`
        INSERT INTO surprise_settings (id, giftBoxTitle, giftBoxDesc, step3Title, step3Message, step5Title, step5Message, step5Desc)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?)
      `, [updatedGiftBoxTitle, updatedGiftBoxDesc, updatedStep3Title, updatedStep3Message, updatedStep5Title, updatedStep5Message, updatedStep5Desc]);
    } else {
      await query.run(`
        UPDATE surprise_settings
        SET giftBoxTitle = ?, giftBoxDesc = ?, step3Title = ?, step3Message = ?, step5Title = ?, step5Message = ?, step5Desc = ?
        WHERE id = 1
      `, [updatedGiftBoxTitle, updatedGiftBoxDesc, updatedStep3Title, updatedStep3Message, updatedStep5Title, updatedStep5Message, updatedStep5Desc]);
    }

    const updatedSettings = await query.get('SELECT * FROM surprise_settings WHERE id = 1');
    res.json(updatedSettings);
  } catch (error) {
    res.status(500).json({ message: 'Error updating surprise settings.', error: error.message });
  }
});

module.exports = router;
