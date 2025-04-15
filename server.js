// server.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 3000;

const users = []; // In-memory store (use OracleDB/MySQL in production)

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("public"));

// Register route
app.post("/api/register", (req, res) => {
  const { name, phone, idnumber, country, password } = req.body;
  if (!name || !phone || !idnumber || !country || !password) {
    return res.status(400).json({ message: "Missing fields" });
  }

  const userExists = users.find((u) => u.phone === phone);
  if (userExists) {
    return res.status(400).json({ message: "User already registered" });
  }

  const initialBalance = country.toLowerCase() === "foreign" ? 0 : 100;
  const newUser = { name, phone, idnumber, country, password, balance: initialBalance, transactions: [] };
  users.push(newUser);

  res.status(200).json({ message: "Registered successfully", wallet: newUser });
});

// Login route
app.post("/api/login", (req, res) => {
  const { phone, password } = req.body;
  const user = users.find((u) => u.phone === phone && u.password === password);

  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  res.status(200).json({ message: "Login successful", wallet: user });
});

// Currency conversion mock route
app.get("/api/exchange", (req, res) => {
  const rates = {
    USD: 1,
    ZAR: 18.6,
    BWP: 13.2,
    MZN: 64.4,
    TZS: 2530,
  };
  res.status(200).json(rates);
});

// Start server
app.listen(PORT, () => {
  console.log(`SADC CBDC Backend running at http://localhost:${PORT}`);
});



const express = require('express');
const cors = require('cors');
const oracledb = require('oracledb');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

const initDB = async () => {
  try {
    await oracledb.createPool({
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      connectString: process.env.DB_CONNECT
    });
    console.log("Oracle DB pool created");
  } catch (err) {
    console.error("DB connection failed", err);
    process.exit(1);
  }
};

app.post('/api/auth/register', async (req, res) => {
  const { fullName, phoneNumber, idNumber, nationality } = req.body;
  try {
    const connection = await oracledb.getConnection();
    await connection.execute(
      `INSERT INTO users (full_name, phone_number, id_number, nationality, wallet_balance)
       VALUES (:fullName, :phoneNumber, :idNumber, :nationality, :initialBalance)`,
      { fullName, phoneNumber, idNumber, nationality, initialBalance: 1900 } // Example $100 = ZAR 1900
    );
    await connection.commit();
    await connection.close();
    res.json({ user: { fullName, phoneNumber, walletBalance: 1900 } });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: 'Registration failed' });
  }
});

app.get('/api/wallet/balance', async (req, res) => {
  const { phone } = req.query;
  try {
    const connection = await oracledb.getConnection();
    const result = await connection.execute(
      `SELECT wallet_balance, full_name FROM users WHERE phone_number = :phone`,
      [phone]
    );
    await connection.close();
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    const [walletBalance, fullName] = result.rows[0];
    res.json({ balance: walletBalance, fullName });
  } catch (err) {
    console.error("Balance Fetch Error:", err);
    res.status(500).json({ message: 'Error fetching balance' });
  }
});

initDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});

// File: .env (place this in root, not public)
DB_USER=your_oracle_user
DB_PASSWORD=your_oracle_password
DB_CONNECT=localhost/XEPDB1
PORT=5000
