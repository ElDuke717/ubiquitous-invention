const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const PORT = 5001;

app.use(cors());
app.use(bodyParser.json());

const db = require("./database");

// Initialize the database
db.serialize(() => {
    
    // Create the expenses table with the corrected schema
    db.run(`
      CREATE TABLE IF NOT EXISTS expenses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        category TEXT NOT NULL,
        subcategory TEXT NOT NULL,
        amount REAL NOT NULL,
        vendor TEXT NOT NULL,
        date TEXT NOT NULL
      )
    `);
  // Create the individual_expenses table
  db.run(`
    CREATE TABLE IF NOT EXISTS individual_expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      vendor TEXT NOT NULL,
      date TEXT NOT NULL,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      description TEXT
    )
  `);
  // Create the journal_entries table
  db.run(`
    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      content TEXT NOT NULL
    )
  `);
  // Create the credit_cards table
  db.run(`
    CREATE TABLE IF NOT EXISTS credit_cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      lastFourDigits TEXT NOT NULL,
      type TEXT NOT NULL,
      issuer TEXT NOT NULL,
      expirationDate TEXT NOT NULL,
      generalUse TEXT,
      nickname TEXT,
      creditLimit REAL,
      currentBalance REAL,
      minimumPayment REAL,
      paymentDueDate TEXT,
      interestRate REAL,
      rewardsProgram TEXT,
      cardStatus TEXT,
      authorizedUsers TEXT,
      notes TEXT
    )
  `);
});

// backend/index.js
// this is used by ExpenseEntryForm
app.post("/expense", (req, res) => {
  const expenses = req.body; // Expecting an array of expense objects

  const stmt = db.prepare(`
      INSERT INTO expenses (category, subcategory, amount, vendor, date)
      VALUES (?, ?, ?, ?)
    `);

  db.serialize(() => {
    db.run("BEGIN TRANSACTION");
    expenses.forEach((expense) => {
      stmt.run(
        expense.category,
        expense.subcategory,
        expense.amount,
        expense.vendor,
        expense.date || new Date().toISOString()
      );
    });
    db.run("COMMIT");
    stmt.finalize();
  });

  res.json({ message: "Expenses saved successfully" });
});

// Get all expenses - used by MonthlyExpensesPage to get all of the expenses

app.get("/expenses", (req, res) => {
  db.all(`SELECT * FROM expenses`, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

// Route to add a new individual expense
app.post("/individual-expenses", (req, res) => {
  const { amount, vendor, date, category, subcategory, description } = req.body;

  // Validate the input
  if (!amount || !vendor || !date || !category || !subcategory) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields." });
  }

  // Insert the new expense into the database
  const sql = `
        INSERT INTO individual_expenses (amount, vendor, date, category, subcategory, description)
        VALUES (?, ?, ?, ?, ?, ?)
      `;

  db.run(
    sql,
    [amount, vendor, date, category, subcategory, description],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Expense added successfully!", id: this.lastID });
      }
    }
  );
});

// Route to get individual expenses for a specific month and year
app.get("/individual-expenses", (req, res) => {
  const { month, year } = req.query;

  let sql = `SELECT * FROM individual_expenses`;
  const params = [];

  if (month && year) {
    sql += ` WHERE strftime('%Y-%m', date) = ?`;
    params.push(`${year}-${month.padStart(2, "0")}`);
  }

  db.all(sql, params, (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Update individual expenses
app.put("/individual-expenses/:id", (req, res) => {
  const { id } = req.params;
  const { amount, vendor, date, category, subcategory, description } = req.body;

  // Update the expense in the database
  const sql = `
      UPDATE individual_expenses
      SET amount = ?, vendor = ?, date = ?, category = ?, subcategory = ?, description = ?
      WHERE id = ?
    `;

  db.run(
    sql,
    [amount, vendor, date, category, subcategory, description, id],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Expense updated successfully!" });
      }
    }
  );
});

// delete an expense
app.delete("/individual-expenses/:id", (req, res) => {
  const { id } = req.params;

  const sql = `DELETE FROM individual_expenses WHERE id = ?`;

  db.run(sql, id, function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "Expense deleted successfully!" });
    }
  });
});

// Route to add a new journal entry
app.post("/journal", (req, res) => {
  const { title, date, content } = req.body;

  if (!title || !date || !content) {
    return res
      .status(400)
      .json({ error: "Please provide all required fields." });
  }

  const sql = `
      INSERT INTO journal_entries (title, date, content)
      VALUES (?, ?, ?)
    `;

  db.run(sql, [title, date, content], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({
        message: "Journal entry added successfully!",
        id: this.lastID,
      });
    }
  });
});

// Route to get journal entries with pagination
app.get("/journal", (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const sql = `
      SELECT * FROM journal_entries
      ORDER BY date DESC
      LIMIT ? OFFSET ?
    `;

  db.all(sql, [parseInt(limit), parseInt(offset)], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

app.post("/credit-cards", (req, res) => {
  const {
    lastFourDigits,
    type,
    issuer,
    expirationDate,
    generalUse,
    nickname,
    creditLimit,
    currentBalance,
    minimumPayment,
    paymentDueDate,
    interestRate,
    rewardsProgram,
    cardStatus,
    authorizedUsers,
    notes,
  } = req.body;

  const sql = `
      INSERT INTO credit_cards (
        lastFourDigits, type, issuer, expirationDate, generalUse,
        nickname, creditLimit, currentBalance, minimumPayment, paymentDueDate,
        interestRate, rewardsProgram, cardStatus, authorizedUsers, notes
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

  db.run(
    sql,
    [
      lastFourDigits,
      type,
      issuer,
      expirationDate,
      generalUse,
      nickname,
      creditLimit,
      currentBalance,
      minimumPayment,
      paymentDueDate,
      interestRate,
      rewardsProgram,
      cardStatus,
      authorizedUsers,
      notes,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({
          message: "Credit card added successfully!",
          id: this.lastID,
        });
      }
    }
  );
});

// Route to get all credit cards
app.get("/credit-cards", (req, res) => {
  const sql = `SELECT * FROM credit_cards ORDER BY issuer, type`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Route to update a credit card
app.put("/credit-cards/:id", (req, res) => {
  const id = req.params.id;
  const {
    lastFourDigits,
    type,
    issuer,
    expirationDate,
    generalUse,
    nickname,
    creditLimit,
    currentBalance,
    minimumPayment,
    paymentDueDate,
    interestRate,
    rewardsProgram,
    cardStatus,
    authorizedUsers,
    notes,
  } = req.body;

  const sql = `
      UPDATE credit_cards SET
        lastFourDigits = ?,
        type = ?,
        issuer = ?,
        expirationDate = ?,
        generalUse = ?,
        nickname = ?,
        creditLimit = ?,
        currentBalance = ?,
        minimumPayment = ?,
        paymentDueDate = ?,
        interestRate = ?,
        rewardsProgram = ?,
        cardStatus = ?,
        authorizedUsers = ?,
        notes = ?
      WHERE id = ?
    `;

  db.run(
    sql,
    [
      lastFourDigits,
      type,
      issuer,
      expirationDate,
      generalUse,
      nickname,
      creditLimit,
      currentBalance,
      minimumPayment,
      paymentDueDate,
      interestRate,
      rewardsProgram,
      cardStatus,
      authorizedUsers,
      notes,
      id,
    ],
    function (err) {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json({ message: "Credit card updated successfully!" });
      }
    }
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
