// backend/dummyData.js
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.db');

db.serialize(() => {
  // Create the journal_entries table if it doesn't exist
  db.run(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      content TEXT NOT NULL
    )
  `, (err) => {
    if (err) {
      console.error("Error creating table:", err.message);
    } else {
      insertDummyEntries(); // Proceed to insert data after table is created
    }
  });
});

function insertDummyEntries() {
  const dummyEntries = [];

  for (let i = 0; i < 20; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    dummyEntries.push({
      title: `Journal Entry ${i + 1}`,
      date: date.toISOString().split('T')[0],
      content: `This is dummy content for journal entry number ${i + 1}.`,
    });
  }

  const stmt = db.prepare(`
    INSERT INTO journal_entries (title, date, content)
    VALUES (?, ?, ?)
  `);

  dummyEntries.forEach((entry) => {
    stmt.run([entry.title, entry.date, entry.content], (err) => {
      if (err) {
        console.error("Error inserting entry:", err.message);
      }
    });
  });

  stmt.finalize((err) => {
    if (err) {
      console.error("Error finalizing statement:", err.message);
    } else {
      console.log("Dummy journal entries added successfully!");
    }
    db.close();
  });
}