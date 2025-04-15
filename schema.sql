CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(100),
  balance DECIMAL(15,2) DEFAULT 0,
  country VARCHAR(50),
  passport_id VARCHAR(30)
);

CREATE TABLE transactions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  sender_phone VARCHAR(20),
  receiver_phone VARCHAR(20),
  bank_name VARCHAR(100),
  amount DECIMAL(15,2),
  currency VARCHAR(10),
  type VARCHAR(20),
  status VARCHAR(20),
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);