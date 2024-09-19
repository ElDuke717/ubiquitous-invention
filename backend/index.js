require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const session = require("express-session"); // Add this
const bcrypt = require("bcrypt"); // Add this
const app = express();
const PORT = 5001;

app.use(
  cors({
    origin: "http://localhost:3000", // Replace with your React app's URL
    credentials: true,
  })
);

console.log("Session secret:", process.env.SESSION_SECRET);
app.use(bodyParser.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false }, // Set to true if using HTTPS
  })
);

const db = require("./database");

// Initialize the database
db.serialize(() => {
  // Create the expenses table with the corrected schema
  db.run(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      category TEXT NOT NULL,
      subcategory TEXT NOT NULL,
      amount REAL NOT NULL
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

  // Create users table
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL
    )
  `);
  // create accounts table
  db.run(`
    CREATE TABLE IF NOT EXISTS accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      starting_balance REAL NOT NULL,
      current_balance REAL NOT NULL
    )
  `);
  // create transactions table
  db.run(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      vendor TEXT,
      amount REAL NOT NULL,
      description TEXT,
      FOREIGN KEY(account_id) REFERENCES accounts(id) ON DELETE CASCADE
    )
  `);
});

// Middleware to check if the user is authenticated
// Define the isAuthenticated middleware (currently turned off)
function isAuthenticated(req, res, next) {
  if (req.session && req.session.userId) {
    // User is authenticated
    next();
  } else {
    // User is not authenticated
    res.status(401).json({ error: "Unauthorized" });
  }
}

// Register a new user
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  // Check if the user already exists
  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      if (user) {
        return res.status(400).json({ error: "User already exists" });
      }

      try {
        // Hash the password
        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(password, saltRounds);

        // Insert the new user
        db.run(
          "INSERT INTO users (username, password_hash) VALUES (?, ?)",
          [username, passwordHash],
          function (err) {
            if (err) {
              console.error(err);
              return res
                .status(500)
                .json({ error: "Database error during user creation" });
            }
            res.json({ message: "User registered successfully" });
          }
        );
      } catch (hashError) {
        console.error(hashError);
        res.status(500).json({ error: "Error hashing password" });
      }
    }
  );
});

// Login route
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Find the user
  db.get(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (err, user) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      if (!user) {
        return res.status(400).json({ error: "Invalid credentials" });
      }

      // Compare the password
      try {
        const validPassword = await bcrypt.compare(
          password,
          user.password_hash
        );
        if (!validPassword) {
          return res.status(400).json({ error: "Invalid credentials" });
        }

        // Set the user session
        req.session.userId = user.id;
        res.json({ message: "Login successful" });
      } catch (compareError) {
        console.error(compareError);
        res.status(500).json({ error: "Error comparing passwords" });
      }
    }
  );
});

// Logout route
app.post("/logout", (req, res) => {
  req.session.destroy();
  res.json({ message: "Logged out successfully" });
});
// Check if the user is authenticated
app.get("/check-auth", (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ isAuthenticated: true });
  } else {
    res.json({ isAuthenticated: false });
  }
});

// // Apply the isAuthenticated middleware to all routes below this
// app.use(isAuthenticated);

// this is used by App.js budget entry form
// Route to add budgeted expenses
app.post("/expenses", (req, res) => {
  const expenses = req.body; // Expecting an array of expense objects

  db.serialize(() => {
    // Delete existing expenses (since you're overwriting)
    db.run("DELETE FROM expenses", [], function (err) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
        return;
      }

      // Prepare the statement
      const stmt = db.prepare(`
          INSERT INTO expenses (category, subcategory, amount)
          VALUES (?, ?, ?)
        `);

      db.run("BEGIN TRANSACTION");
      expenses.forEach((expense) => {
        stmt.run(expense.category, expense.subcategory, expense.amount);
      });
      db.run("COMMIT");
      stmt.finalize();

      res.json({ message: "Expenses saved successfully" });
    });
  });
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
        console.error(err);
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

// Route to get individual expenses with pagination
// index.js (Backend)
app.get('/individual-expenses-paginated', (req, res) => {
  const { page = 1, limit = 50, search = '' } = req.query;

  const offset = (page - 1) * limit;
  const searchQuery = `%${search}%`;

  const countSql = `
    SELECT COUNT(*) as total FROM individual_expenses
    WHERE date LIKE ? OR vendor LIKE ? OR category LIKE ? OR subcategory LIKE ? OR description LIKE ?
  `;

  const dataSql = `
    SELECT * FROM individual_expenses
    WHERE date LIKE ? OR vendor LIKE ? OR category LIKE ? OR subcategory LIKE ? OR description LIKE ?
    ORDER BY date DESC
    LIMIT ? OFFSET ?
  `;

  const params = [searchQuery, searchQuery, searchQuery, searchQuery, searchQuery];

  db.get(countSql, params, (err, countResult) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      const total = countResult.total;
      const totalPages = Math.ceil(total / limit);

      db.all(dataSql, [...params, limit, offset], (err, expenses) => {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json({ expenses, totalPages });
        }
      });
    }
  });
});

// Create a new account
app.post("/accounts", (req, res) => {
  const { name, starting_balance } = req.body;

  if (!name || starting_balance === undefined) {
    return res.status(400).json({ error: "Name and starting balance are required." });
  }

  const sql = `
    INSERT INTO accounts (name, starting_balance, current_balance)
    VALUES (?, ?, ?)
  `;

  db.run(sql, [name, starting_balance, starting_balance], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "Account created successfully!", id: this.lastID });
    }
  });
});

// Get all accounts
app.get("/accounts", (req, res) => {
  const sql = `SELECT * FROM accounts`;
  db.all(sql, [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Delete an account
app.delete("/accounts/:id", (req, res) => {
  const { id } = req.params;
  const sql = `DELETE FROM accounts WHERE id = ?`;

  db.run(sql, [id], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: "Account deleted successfully!" });
    }
  });
});

// Add a transaction to an account
app.post("/accounts/:accountId/transactions", (req, res) => {
  const { accountId } = req.params;
  const { date, vendor, amount, description } = req.body;

  if (!date || amount === undefined) {
    return res.status(400).json({ error: "Date and amount are required." });
  }

  const sql = `
    INSERT INTO transactions (account_id, date, vendor, amount, description)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.run(sql, [accountId, date, vendor, amount, description], function (err) {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      // Update the current_balance in accounts table
      const updateBalanceSql = `
        UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?
      `;
      db.run(updateBalanceSql, [amount, accountId], function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          res.json({ message: "Transaction added successfully!", id: this.lastID });
        }
      });
    }
  });
});

// Get transactions for an account
app.get("/accounts/:accountId/transactions", (req, res) => {
  const { accountId } = req.params;
  const sql = `
    SELECT * FROM transactions
    WHERE account_id = ?
    ORDER BY date DESC
  `;
  db.all(sql, [accountId], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json(rows);
    }
  });
});

// Edit a transaction
app.put("/transactions/:id", (req, res) => {
  const { id } = req.params;
  const { date, vendor, amount, description } = req.body;

  // Get the old amount to adjust the current balance
  const getOldAmountSql = `SELECT account_id, amount FROM transactions WHERE id = ?`;
  db.get(getOldAmountSql, [id], (err, row) => {
    if (err || !row) {
      res.status(500).json({ error: err ? err.message : "Transaction not found" });
    } else {
      const amountDifference = amount - row.amount;
      const accountId = row.account_id;

      const sql = `
        UPDATE transactions SET date = ?, vendor = ?, amount = ?, description = ?
        WHERE id = ?
      `;
      db.run(sql, [date, vendor, amount, description, id], function (err) {
        if (err) {
          res.status(500).json({ error: err.message });
        } else {
          // Update the account balance
          const updateBalanceSql = `
            UPDATE accounts SET current_balance = current_balance + ? WHERE id = ?
          `;
          db.run(updateBalanceSql, [amountDifference, accountId], function (err) {
            if (err) {
              res.status(500).json({ error: err.message });
            } else {
              res.json({ message: "Transaction updated successfully!" });
            }
          });
        }
      });
    }
  });
});



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
