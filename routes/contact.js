const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');
const auth = require('../middleware/auth');
const nodemailer = require('nodemailer');

// Email Transport setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// POST a new contact message (Public route)
router.post('/', async (req, res) => {
    try {
        const { fullname, email, message } = req.body;

        if (!fullname || !email || !message) {
            return res.status(400).json({ msg: 'Please enter all fields' });
        }

        const newContact = new Contact({
            fullname,
            email,
            message
        });

        const contact = await newContact.save();

        // Send Email Notification
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.NOTIFICATION_EMAIL,
            subject: `New Portfolio Contact: ${fullname}`,
            html: `
                <h3>New Contact Message Received</h3>
                <p><strong>Name:</strong> ${fullname}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong> ${message}</p>
            `
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Email send error:', error);
            } else {
                console.log('Email sent:', info.response);
            }
        });

        res.json(contact);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET all contact messages (Admin only)
router.get('/', auth, async (req, res) => {
    try {
        const contacts = await Contact.find().sort({ createdAt: -1 });
        res.json(contacts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
