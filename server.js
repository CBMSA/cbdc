
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
