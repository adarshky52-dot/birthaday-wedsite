const bcrypt = require('bcryptjs');

let query;

if (process.env.TURSO_DATABASE_URL) {
  console.log('Initializing Turso Cloud SQLite Database...');
  const { createClient } = require('@libsql/client');
  const client = createClient({
    url: process.env.TURSO_DATABASE_URL,
    authToken: process.env.TURSO_AUTH_TOKEN || '',
  });

  query = {
    run: async (sql, params = []) => {
      const res = await client.execute({ sql, args: params });
      return { 
        lastID: res.lastInsertRowid !== undefined ? Number(res.lastInsertRowid) : undefined, 
        changes: res.rowsAffected 
      };
    },
    get: async (sql, params = []) => {
      const res = await client.execute({ sql, args: params });
      return res.rows[0] ? { ...res.rows[0] } : null;
    },
    all: async (sql, params = []) => {
      const res = await client.execute({ sql, args: params });
      return res.rows.map(row => ({ ...row }));
    }
  };
} else {
  console.log('Initializing Local SQLite Database...');
  const sqlite3 = require('sqlite3').verbose();
  const path = require('path');
  const dbPath = path.join(__dirname, '..', '..', 'database.sqlite');
  const db = new sqlite3.Database(dbPath);

  // Wrap SQLite callbacks in Promises for elegant async/await support
  query = {
    run: (sql, params = []) => new Promise((resolve, reject) => {
      db.run(sql, params, function(err) {
        if (err) reject(err);
        else resolve({ lastID: this.lastID, changes: this.changes });
      });
    }),
    get: (sql, params = []) => new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    }),
    all: (sql, params = []) => new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    })
  };
}


const connectDB = async () => {
  try {
    // 1. Create Admins Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS admins (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE,
        password TEXT
      )
    `);

    // 2. Create Timeline Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS timeline (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        date TEXT,
        imageUrl TEXT,
        category TEXT,
        order_index INTEGER DEFAULT 0
      )
    `);

    // 3. Create Memories Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS memories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        caption TEXT,
        category TEXT,
        date TEXT,
        imageUrl TEXT
      )
    `);

    // 4. Create Letters Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS letters (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        content TEXT,
        coverImageUrl TEXT,
        date TEXT,
        signature TEXT
      )
    `);

    // 5. Create Photos Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        imageUrl TEXT,
        uploadDate TEXT
      )
    `);

    // 6. Create VoiceNotes Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS voicenotes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        audioUrl TEXT,
        duration TEXT,
        date TEXT
      )
    `);

    // 7. Create Videos Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS videos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT,
        description TEXT,
        videoUrl TEXT,
        uploadDate TEXT
      )
    `);

    // 8. Create SurpriseSettings Table
    await query.run(`
      CREATE TABLE IF NOT EXISTS surprise_settings (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        giftBoxTitle TEXT,
        giftBoxDesc TEXT,
        step3Title TEXT,
        step3Message TEXT,
        step5Title TEXT,
        step5Message TEXT,
        step5Desc TEXT
      )
    `);

    // Seed default SurpriseSettings if empty
    const settingsCount = await query.get('SELECT COUNT(*) as count FROM surprise_settings');
    if (settingsCount.count === 0) {
      await query.run(`
        INSERT INTO surprise_settings (id, giftBoxTitle, giftBoxDesc, step3Title, step3Message, step5Title, step5Message, step5Desc)
        VALUES (1, ?, ?, ?, ?, ?, ?, ?)
      `, [
        "A Surprise For You 🎁",
        "Tap the box below to open your birthday surprise",
        "To My Favorite Human",
        "Today is the day the world was blessed with your laugh, your kind heart, and your beautiful soul. I am so incredibly lucky to walk by your side.",
        "Eternal Love",
        "You are the most beautiful chapter of my life. Happy Birthday, My Love ❤️",
        "May your birthday be filled with the same infinite joy and warmth that you bring to my life every single day."
      ]);
      console.log('Default Surprise settings seeded into SQLite.');
    }

    // 9. Seed default Admin if the table is empty
    const adminCountRow = await query.get('SELECT COUNT(*) as count FROM admins');
    if (adminCountRow.count === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await query.run('INSERT INTO admins (username, password) VALUES (?, ?)', ['admin', hashedPassword]);
      console.log('Default Admin account seeded into SQLite: admin / admin123');
    }

    console.log('SQLite Database Connected and Initialized successfully.');
  } catch (error) {
    console.error('SQLite Initialization Error:', error.message);
    process.exit(1);
  }
};

module.exports = {
  connectDB,
  query
};
