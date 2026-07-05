const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'database.sqlite');
console.log('Database Path:', dbPath);

const db = new sqlite3.Database(dbPath);

db.all('SELECT * FROM admins', [], (err, rows) => {
  if (err) {
    console.error('Error fetching admins:', err);
  } else {
    console.log('Admins in Database:', rows);
  }
  db.close();
});
