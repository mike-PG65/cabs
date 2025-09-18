const mongoose = require('mongoose') 

const cartItemSchema = new mongoose.Schema({
    carId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Car',
        required: true
    },
    startDate: {
        type: Date,
        // required: true
    },
    endDate: {
        type: Date,
        // required: true
    },
    pricePerDay: {
        type: Number,
        required: false,
    },
    totalPrice: {
        type: Number,
        required: false
    }
});

const cartSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    items: [cartItemSchema]
})

const Cart = mongoose.model("Cart", cartSchema)
module.exports = Cart