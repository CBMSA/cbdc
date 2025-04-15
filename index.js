
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Routes
const authRoutes = require('./routes/auth');
const walletRoutes = require('./routes/wallet');
const transactionRoutes = require('./routes/transaction');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/transactions', transactionRoutes);

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error('MongoDB connection error:', err));

// File: models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    phoneNumber: { type: String, unique: true, required: true },
    idNumber: { type: String, required: true }, // National ID or Passport
    nationality: { type: String, required: true },
    isSadcResident: { type: Boolean, default: true },
    walletBalance: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);

// File: routes/auth.js

const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Register user and create wallet with grant
router.post('/register', async (req, res) => {
    const { fullName, phoneNumber, idNumber, nationality } = req.body;
    const isSadcResident = ["South Africa", "Zimbabwe", "Namibia", "Botswana", "Mozambique", "Zambia", "Tanzania", "Malawi", "Angola", "DRC", "Eswatini", "Lesotho", "Mauritius", "Seychelles"].includes(nationality);
    const usdToLocalRate = 18.5; // Example: 1 USD = 18.5 ZAR
    const grantAmount = 100 * usdToLocalRate;

    try {
        const existingUser = await User.findOne({ phoneNumber });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const newUser = new User({
            fullName,
            phoneNumber,
            idNumber,
            nationality,
            isSadcResident,
            walletBalance: grantAmount
        });

        await newUser.save();
        res.status(201).json({ message: 'User registered and wallet created', user: newUser });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
