const express = require('express');
const router = express.Router();
const db = require('./db'); // Database pool

router.post('/send', async (req, res) => {
  const { sender_phone, receiver, bank_name, amount, currency, type } = req.body;
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    const [sender] = await conn.execute('SELECT balance FROM users WHERE phone_number = ?', [sender_phone]);
    if (!sender.length || sender[0].balance < amount) {
      return res.status(400).json({ message: 'Insufficient funds or sender not found' });
    }
    await conn.execute('UPDATE users SET balance = balance - ? WHERE phone_number = ?', [amount, sender_phone]);
    if (type === 'wallet') {
      await conn.execute('UPDATE users SET balance = balance + ? WHERE phone_number = ?', [amount, receiver]);
    }
    await conn.execute(
      `INSERT INTO transactions (sender_phone, receiver_phone, amount, currency, type, status, bank_name)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [sender_phone, receiver, amount, currency, type, 'pending', bank_name || null]
    );
    await conn.commit();
    let message = "Transfer successful";
    if (type !== 'wallet') {
      message = "External transfer initiated. It may take time to process.";
    }
    res.json({ message });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ message: 'Transaction failed', error: err.message });
  } finally {
    conn.release();
  }
});

module.exports = router;