const express = require('express');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router()

router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, confirmPassword, phoneNumber, role } = req.body;

        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ error: "User already exists!!" });
        };

        const hashedPassword = await bcrypt.hash(password, 10)

        const user = new User({
            fullName,
            email,
            password: hashedPassword,
            phoneNumber
        })

        const savedUSer = await user.save()

        return res.status(200).json({
            message: "User added sucessefully",
            user: {
                id: savedUSer._id,
                fullName: savedUSer.fullName,
                email: savedUSer.email
            }
        })
    } catch (error) {
        console.error("Register error:", error);
        res.status(500).json({ error: "Server error during registration" });
    }
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body
        const existingUser = await User.findOne({ email }).select("+password");

        if (!existingUser) {
            return res.status(404).json({ error: "User not found!!" })
        }

        const isMatch = await bcrypt.compare(password, existingUser.password)

        if (!isMatch) {
            return res.status(400).json({ error: "Invalid credentials!!" })
        };

        const token = jwt.sign(
            { id: existingUser._id, phone: existingUser.phoneNumber },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        console.log("JWT CREATED:", token);

        return res.json(
            {
                token,
                user: {
                    id: existingUser._id,
                    fullName: existingUser.fullName,
                    email: existingUser.email,
                }
            });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Server error" });
    }
});

module.exports = router;


