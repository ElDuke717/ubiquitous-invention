// addUser.js
// This script adds a new user to the database. It hashes the password using bcrypt before inserting the user into the database.
// It is a one-time script that you can run to add a new user to the database.
// Make sure that you have already created the users table in the database before running this script.
// **IMPORTANT**: Do not run this script without changing the username and password values. You should replace them with the desired username and password.
const bcrypt = require("bcrypt");
const db = require("./database"); // Adjust the path if necessary

const username = "newuser";
const password = "password123";

// Hash the password

const saltRounds = 10;

bcrypt.hash(password, saltRounds, function (err, hash) {
  if (err) {
    console.error("Error hashing password:", err);
  } else {
    // Insert the new user into the database
    const sql = "INSERT INTO users (username, password_hash) VALUES (?, ?)";
    db.run(sql, [username, hash], function (err) {
      if (err) {
        console.error("Error inserting user into database:", err);
      } else {
        console.log("User added successfully");
      }
      // Close the database connection
      db.close();
    });
  }
});
