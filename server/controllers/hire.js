const express = require("express");
const Cart = require("../models/Cart");
const authMiddlware = require("../middleware/auth");
const Hire = require("../models/Hire")

const router = express.Router()

router.post("", authMiddlware, async(req, res) => {
    try{
        const userId = req.user.id;
        const {items, totalAmount, payment} = req.body

        if(!items || items.length === 0){
            return res.status(400).json({error: "No cars found for hire"})
        }

        if(!payment?.method){
            return res.status(400).json({error: "Payment method is required!"})
        }

        const newHire = new Hire({
            userId,
            items,
            totalAmount,
            status: "pending",
            payment: {
                transactionId: payment.transactionId,
                method: payment.method,
                status: "pending",
                amount: totalAmount
            }
        })

        await newHire.save();

        await Cart.findOneAndUpdate({userId}, {items: []});

        return res.status(200).json({message: "Hire created successfully", hire: newHire})
    }catch(err){
        console.error({error: err.message})
        return res.status(500).json({error: err.mesage})
    }

});

module.exports = router;