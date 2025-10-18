const express = require('express');
const router = express.Router();
const User = require('../models/User');

// --- Endpoint to create initial users for testing ---
router.post('/create-users', async (req, res) => {
    try {
        // Clear existing users
        await User.deleteMany({});

        // Create two sample users
        const users = await User.create([
            { name: 'Alice', balance: 1000 },
            { name: 'Bob', balance: 500 }
        ]);

        res.status(201).json({
            message: 'Users created',
            users: users
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating users', error: error.message });
    }
});


// --- Endpoint to transfer money ---
router.post('/transfer', async (req, res) => {
    const { fromId, toId, amount } = req.body;

    // Basic validation
    if (!fromId || !toId || !amount) {
        return res.status(400).json({ message: 'Missing required fields: fromId, toId, amount' });
    }

    if (amount <= 0) {
        return res.status(400).json({ message: 'Transfer amount must be positive' });
    }

    try {
        // 1. Find both accounts
        const sender = await User.findById(fromId);
        const receiver = await User.findById(toId);

        if (!sender || !receiver) {
            return res.status(404).json({ message: 'One or both users not found' });
        }

        // 2. Check for sufficient balance (THE CRITICAL CHECK)
        if (sender.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        // 3. Perform the sequential updates (not atomic)
        // Debit the sender's account
        sender.balance -= amount;
        await sender.save();

        // Credit the receiver's account
        receiver.balance += amount;
        const updatedReceiver = await receiver.save();

        // 4. Send the success response
        res.status(200).json({
            message: `Transferred $${amount} from ${sender.name} to ${receiver.name}`,
            senderBalance: sender.balance,
            receiverBalance: updatedReceiver.balance,
        });

    } catch (error) {
        // This general error handler is a fallback.
        // In a real-world scenario, you'd need a recovery mechanism
        // if the server crashed between the debit and credit operations.
        res.status(500).json({ message: 'Transfer failed', error: error.message });
    }
});

module.exports = router;
